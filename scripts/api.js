/** ==========================================================
 * Camada de dados: Google Books API
 * ========================================================== **/

const URL_GOOGLE_BOOKS = "https://www.googleapis.com/books/v1/volumes";
const GOOGLE_BOOKS_API_KEY = "";

const LIVROS_POR_PAGINA = 12;
const CONSULTA_PADRAO = "subject:fiction";
const CHAVE_LIVROS_API = "bookE_livros_api";

const CAPA_PADRAO = "data:image/svg+xml;utf8," + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="300">
        <rect width="200" height="300" rx="8" fill="#387966"/>
        <rect x="16" y="16" width="168" height="268" rx="4"
            fill="none" stroke="#F7F5F3" stroke-opacity=".5" stroke-width="2"/>
        <text x="100" y="160" font-family="Arial" font-size="20"
            fill="#F7F5F3" text-anchor="middle">Sem capa</text>
    </svg>
`);

const livrosExternos = new Map();

/** Escapa textos antes de inseri-los no HTML. */
function escaparHTML(valor) {
    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

/** Procura um livro no catálogo local ou nos resultados da API. */
function obterLivroPorId(id) {
    const chave = String(id);

    return (
        listaLivros.find((livro) => String(livro.id) === chave) ||
        livrosExternos.get(chave) ||
        null
    );
}

/** Recupera livros externos salvos no navegador. */
function carregarLivrosExternosSalvos() {
    try {
        const salvos = JSON.parse(
            localStorage.getItem(CHAVE_LIVROS_API)
        ) || [];

        salvos.forEach((livro) => {
            if (livro && livro.id) {
                livrosExternos.set(String(livro.id), livro);
            }
        });
    } catch (erro) {
        console.error("Erro ao recuperar livros salvos:", erro);
        localStorage.removeItem(CHAVE_LIVROS_API);
    }
}

/** Salva os livros externos que estão sendo usados no carrinho ou favoritos. */
function sincronizarLivrosExternos() {
    const idsEmUso = new Set();

    if (typeof carrinho !== "undefined") {
        carrinho.forEach((item) => idsEmUso.add(String(item.id)));
    }

    if (typeof favoritos !== "undefined") {
        favoritos.forEach((id) => idsEmUso.add(String(id)));
    }

    const livrosParaSalvar = [...idsEmUso]
        .map((id) => livrosExternos.get(id))
        .filter(Boolean);

    localStorage.setItem(
        CHAVE_LIVROS_API,
        JSON.stringify(livrosParaSalvar)
    );
}

/** Tradução das categorias mais comuns da Google Books. */
const TRADUCAO_CATEGORIAS = [
    [/science fiction/i, "Ficção Científica"],
    [/fantasy/i, "Fantasia"],
    [/thriller|suspense/i, "Suspense"],
    [/mystery|detective/i, "Mistério"],
    [/romance/i, "Romance"],
    [/juvenile fiction|young adult/i, "Infantojuvenil"],
    [/fiction/i, "Ficção"],
    [/biograph/i, "Biografia"],
    [/histor/i, "História"],
    [/comics|graphic/i, "Quadrinhos"],
    [/self-help/i, "Autoajuda"],
    [/business|economics/i, "Negócios"],
    [/poetry/i, "Poesia"],
    [/philosoph/i, "Filosofia"],
    [/psycholog/i, "Psicologia"],
    [/computers|technology/i, "Tecnologia"],
    [/cooking/i, "Culinária"],
    [/religio/i, "Religião"]
];

function traduzirCategoria(categorias) {
    const primeira = Array.isArray(categorias)
        ? categorias[0]
        : "";

    if (!primeira) return "Livro";

    const encontrada = TRADUCAO_CATEGORIAS.find(
        ([regex]) => regex.test(primeira)
    );

    if (encontrada) return encontrada[1];

    return primeira.split("/")[0].trim().slice(0, 24) || "Livro";
}

/** Remove tags HTML da sinopse. */
function limparTexto(html, limite = 600) {
    if (!html) return "";

    const comEspacos = html.replace(
        /<\/?(br|p|div|li)[^>]*>/gi,
        " "
    );

    const texto = new DOMParser()
        .parseFromString(comEspacos, "text/html")
        .body.textContent
        .replace(/\s+/g, " ")
        .trim();

    return texto.length > limite
        ? `${texto.slice(0, limite).trim()}…`
        : texto;
}

/** Obtém a capa do livro ou utiliza uma imagem padrão. */
function obterCapa(imageLinks) {
    const link = imageLinks &&
        (imageLinks.thumbnail || imageLinks.smallThumbnail);

    if (!link) return CAPA_PADRAO;

    return link
        .replace(/^http:/, "https:")
        .replace("&edge=curl", "");
}

/** Obtém o preço real, quando disponível, ou gera um preço simulado. */
function obterPreco(volume) {
    const venda = volume.saleInfo && volume.saleInfo.listPrice;

    if (
        venda &&
        venda.currencyCode === "BRL" &&
        venda.amount > 0
    ) {
        return {
            valor: Number(venda.amount),
            simulado: false
        };
    }

    const paginas =
        (volume.volumeInfo && volume.volumeInfo.pageCount) || 250;

    const id = String(volume.id || "livro");

    const variacao = [...id].reduce(
        (soma, letra) => soma + letra.charCodeAt(0),
        0
    ) % 10;

    return {
        valor: Math.floor(24 + paginas * 0.09 + variacao) + 0.9,
        simulado: true
    };
}

/** Converte o formato da Google Books para o formato do projeto. */
function mapearVolume(volume) {
    const info = volume.volumeInfo || {};

    if (!info.title || !volume.id) return null;

    const preco = obterPreco(volume);
    const ano = String(info.publishedDate || "").slice(0, 4);

    return {
        id: `gb_${volume.id}`,
        titulo: info.title,
        autor: (info.authors || []).join(", ") || "Autor desconhecido",
        categoria: traduzirCategoria(info.categories),
        preco: preco.valor,
        precoSimulado: preco.simulado,
        capa: obterCapa(info.imageLinks),
        sinopse: limparTexto(info.description) ||
            "Sinopse não disponível para este título.",
        editora: info.publisher || "Não informada",
        ano: ano || "—",
        paginas: info.pageCount || 0,
        origem: "api"
    };
}

/** ==========================================================
 * Busca livros na Google Books API.
 * Retorna sempre: { livros, retornados }
 * ========================================================== **/
async function buscarLivrosNaAPI({
    termo = "",
    inicio = 0,
    sinal
} = {}) {
    const consulta = String(termo).trim() || CONSULTA_PADRAO;

    async function consultar(restringirIdioma) {
        const parametros = new URLSearchParams({
            q: consulta,
            startIndex: String(inicio),
            maxResults: String(LIVROS_POR_PAGINA),
            printType: "books",
            country: "BR"
        });

        if (restringirIdioma) {
            parametros.set("langRestrict", "pt");
        }

        if (GOOGLE_BOOKS_API_KEY) {
            parametros.set("key", GOOGLE_BOOKS_API_KEY);
        }

        const url = `${URL_GOOGLE_BOOKS}?${parametros}`;

        console.log("Consultando Google Books:", url);

        let resposta;

        try {
            resposta = await fetch(url, { signal: sinal });
        } catch (erro) {
            if (erro.name === "AbortError") {
                throw erro;
            }

            throw new Error(
                `Não foi possível conectar à Google Books. Detalhes: ${erro.message}`
            );
        }

        console.log("Status HTTP Google Books:", resposta.status);

        if (!resposta.ok) {
            const detalhe = await resposta.text();

            throw new Error(
                `Google Books retornou HTTP ${resposta.status}. ${detalhe.slice(0, 250)}`
            );
        }

        try {
            return await resposta.json();
        } catch {
            throw new Error(
                "A Google Books respondeu, mas os dados recebidos não são um JSON válido."
            );
        }
    }

    // Primeiro tenta encontrar livros em português.
    let dados = await consultar(true);

    // Se não houver resultados, tenta sem restringir o idioma.
    if (
        (!Array.isArray(dados.items) || dados.items.length === 0) &&
        inicio === 0
    ) {
        dados = await consultar(false);
    }

    const itens = Array.isArray(dados.items) ? dados.items : [];

    const livros = itens
        .map(mapearVolume)
        .filter(Boolean);

    livros.forEach((livro) => {
        livrosExternos.set(String(livro.id), livro);
    });

    return {
        livros,
        retornados: itens.length
    };
}

/** Substitui imagens de capa quebradas pela imagem padrão. */
document.addEventListener("error", (evento) => {
    const img = evento.target;

    if (
        img.tagName === "IMG" &&
        img.matches(".capa-livro, .imagem-item, .detalhes-capa img")
    ) {
        if (img.src !== CAPA_PADRAO) {
            img.src = CAPA_PADRAO;
        }
    }
}, true);

carregarLivrosExternosSalvos();