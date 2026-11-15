/** ==========================================================
 * Seção "Descobrir": livros da Google Books API
 * ========================================================== **/

const secaoDescobrir = document.getElementById("secaoDescobrir");
const tituloDescobrir = document.getElementById("tituloDescobrir");
const gradeDescobrir = document.getElementById("gradeDescobrir");
const statusDescobrir = document.getElementById("statusDescobrir");
const btnVerMais = document.getElementById("btnVerMais");

const TITULO_PADRAO_DESCOBRIR = "Descobrir Novos Livros";
const ATRASO_BUSCA_MS = 600;
const MINIMO_CARACTERES_BUSCA = 3;

let termoDescobrir = "";
let proximoInicio = 0;
let controladorBusca = null;
let temporizadorBusca = null;
let idsJaExibidos = new Set();

/** Exibe mensagens de carregamento, erro ou ausência de resultados. */
function mostrarStatusDescobrir(tipo, mensagem, comBotaoRepetir = false) {
    if (!statusDescobrir) return;

    statusDescobrir.className = `status-api ${tipo}`;
    statusDescobrir.innerHTML = "";

    if (tipo === "carregando") {
        const spinner = document.createElement("span");

        spinner.className = "spinner";
        spinner.setAttribute("aria-hidden", "true");

        statusDescobrir.appendChild(spinner);
    }

    const texto = document.createElement("span");
    texto.textContent = mensagem;

    statusDescobrir.appendChild(texto);

    if (comBotaoRepetir) {
        const botao = document.createElement("button");

        botao.type = "button";
        botao.className = "btn-secundario";
        botao.id = "btnTentarNovamente";
        botao.textContent = "Tentar novamente";

        statusDescobrir.appendChild(botao);
    }
}

/** Limpa as mensagens de status. */
function limparStatusDescobrir() {
    if (!statusDescobrir) return;

    statusDescobrir.className = "status-api oculto";
    statusDescobrir.innerHTML = "";
}

/** Realiza a busca e exibe os livros encontrados. */
async function carregarLivrosDescobrir({ reiniciar = true } = {}) {
    // Verifica se os elementos necessários existem no HTML.
    if (!gradeDescobrir || !btnVerMais || !statusDescobrir) {
        console.error(
            "Elementos da seção Descobrir não encontrados. Confira os IDs no HTML."
        );
        return;
    }

    // Cancela uma pesquisa anterior, caso ainda esteja em andamento.
    if (controladorBusca) {
        controladorBusca.abort();
    }

    controladorBusca = new AbortController();

    const sinal = controladorBusca.signal;

    if (reiniciar) {
        proximoInicio = 0;
        idsJaExibidos = new Set();
        gradeDescobrir.innerHTML = "";
    }

    btnVerMais.classList.add("oculto");
    btnVerMais.disabled = false;

    mostrarStatusDescobrir(
        "carregando",
        "Buscando livros na Google Books..."
    );

    try {
        const resultado = await buscarLivrosNaAPI({
            termo: termoDescobrir,
            inicio: proximoInicio,
            sinal
        });

        const { livros, retornados } = resultado;

        // Evita exibir livros duplicados.
        const novos = livros.filter(
            (livro) => !idsJaExibidos.has(String(livro.id))
        );

        novos.forEach((livro) => {
            idsJaExibidos.add(String(livro.id));

            const card = criarCardLivro(livro);

            gradeDescobrir.appendChild(card);
        });

        proximoInicio += LIVROS_POR_PAGINA;

        // Nenhum livro foi encontrado.
        if (idsJaExibidos.size === 0) {
            mostrarStatusDescobrir(
                "vazio",
                `Nenhum livro encontrado online para "${termoDescobrir}".`
            );

            return;
        }

        limparStatusDescobrir();

        btnVerMais.disabled = false;
        btnVerMais.textContent = "Ver mais livros";

        // Só mostra o botão se a API retornou uma página completa.
        btnVerMais.classList.toggle(
            "oculto",
            retornados < LIVROS_POR_PAGINA
        );

    } catch (erro) {
        // Uma pesquisa cancelada não deve exibir mensagem de erro.
        if (erro.name === "AbortError") {
            return;
        }

        console.error("Erro detalhado ao consultar a Google Books:", erro);

        btnVerMais.disabled = false;
        btnVerMais.textContent = "Ver mais livros";
        btnVerMais.classList.add("oculto");

        let mensagem = erro.message ||
            "Ocorreu um erro desconhecido ao consultar a API.";

        // Mensagens mais específicas para erros comuns.
        if (mensagem.includes("HTTP 429")) {
            mensagem =
                "A Google Books recebeu muitas requisições. Aguarde um pouco e tente novamente.";
        } else if (mensagem.includes("HTTP 403")) {
            mensagem =
                "A Google Books recusou a requisição. Pode haver uma restrição de acesso ou cota da API.";
        } else if (mensagem.includes("Failed to fetch")) {
            mensagem =
                "O navegador não conseguiu acessar a API. Verifique a conexão, extensões do navegador ou possíveis bloqueios de rede.";
        }

        mostrarStatusDescobrir(
            "erro",
            mensagem,
            true
        );
    }
}

/** Atualiza o título e inicia uma nova pesquisa. */
function pesquisarNaAPI(termo) {
    termoDescobrir = termo.trim();

    if (tituloDescobrir) {
        tituloDescobrir.textContent = termoDescobrir
            ? `Resultados online para "${termoDescobrir}"`
            : TITULO_PADRAO_DESCOBRIR;
    }

    carregarLivrosDescobrir({ reiniciar: true });
}

/** Configura os eventos da seção Descobrir. */
function configurarDescobrir() {
    if (!secaoDescobrir || !gradeDescobrir || !btnVerMais) {
        console.error(
            "Não foi possível configurar Descobrir. Confira os IDs no HTML."
        );
        return;
    }

    // A barra de pesquisa também pesquisa na Google Books.
    if (typeof inputBusca !== "undefined" && inputBusca) {
        inputBusca.addEventListener("input", () => {
            clearTimeout(temporizadorBusca);

            const termo = inputBusca.value.trim();

            const termoCurto =
                termo.length > 0 &&
                termo.length < MINIMO_CARACTERES_BUSCA;

            if (termoCurto || termo === termoDescobrir) {
                return;
            }

            temporizadorBusca = setTimeout(() => {
                pesquisarNaAPI(termo);
            }, ATRASO_BUSCA_MS);
        });

        // Enter realiza a pesquisa imediatamente.
        inputBusca.addEventListener("keydown", (evento) => {
            if (evento.key !== "Enter") return;

            clearTimeout(temporizadorBusca);

            const termo = inputBusca.value.trim();

            if (
                termo.length >= MINIMO_CARACTERES_BUSCA &&
                termo !== termoDescobrir
            ) {
                pesquisarNaAPI(termo);
            }

            secaoDescobrir.scrollIntoView({
                behavior: "smooth"
            });
        });
    } else {
        console.warn(
            "O campo inputBusca não foi encontrado. A pesquisa pela barra principal não será integrada à API."
        );
    }

    // Carrega mais livros.
    btnVerMais.addEventListener("click", () => {
        btnVerMais.disabled = true;
        btnVerMais.textContent = "Carregando...";

        carregarLivrosDescobrir({
            reiniciar: false
        });
    });

    // Botão para tentar novamente após um erro.
    statusDescobrir.addEventListener("click", (evento) => {
        if (evento.target.closest("#btnTentarNovamente")) {
            carregarLivrosDescobrir({
                reiniciar: gradeDescobrir.children.length === 0
            });
        }
    });
}

/** Inicialização da seção. */
document.addEventListener("DOMContentLoaded", () => {
    configurarDescobrir();

    carregarLivrosDescobrir({
        reiniciar: true
    });
});