
/* ==========================================
   SELETORES PRINCIPAIS
========================================== */

const corpoSite = document.getElementById("corpoSite");

const containerDestaques =
    document.getElementById("vitrineDestaques");

const containerCatalogo =
    document.getElementById("catalogoLivros");

const inputBusca =
    document.getElementById("barraPesquisa");

const botoesFiltro =
    document.querySelectorAll("#filtros .filtro");

/* Modal de detalhes */
const modalDetalhes =
    document.getElementById("modalDetalhes");

const corpoDetalhes =
    document.getElementById("corpoDetalhes");

const btnFecharDetalhes =
    document.getElementById("btnFecharDetalhes");

/* Estado dos filtros */
let categoriaAtual = "todos";

/* ==========================================
   FUNÇÕES AUXILIARES
========================================== */

function formatarPreco(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

/* ==========================================
   BANNER
========================================== */

function renderizarBanner() {
    const livroDestaque =
        listaLivros.find(livro => livro.livroDoMes) ||
        listaLivros[0];

    const tituloBanner =
        document.querySelector("#conteudoBanner .titulo");

    const textoBanner =
        document.querySelector("#conteudoBanner .texto-principal");

    const btnAcao =
        document.getElementById("btnAcao");

    const imgBanner =
        document.getElementById("imgBanner");

    tituloBanner.textContent = livroDestaque.titulo;

    textoBanner.textContent =
        `${livroDestaque.sinopse} Por apenas ${formatarPreco(livroDestaque.preco)}.`;

    btnAcao.dataset.id = livroDestaque.id;

    imgBanner.src = livroDestaque.capa;
    imgBanner.alt = `Capa do livro ${livroDestaque.titulo}`;
}

/* ==========================================
   CRIAÇÃO DOS CARDS
========================================== */

function criarCardLivro(livro) {
    const card = document.createElement("article");

    card.classList.add("card-livro");
    card.dataset.id = livro.id;

    const titulo = escaparHTML(livro.titulo);
    const autor = escaparHTML(livro.autor);
    const categoria = escaparHTML(livro.categoria);
    const capa = escaparHTML(livro.capa);

    card.innerHTML = `
        <div class="capa-container">

            <img
                src="${capa}"
                alt="Capa do livro ${titulo}"
                class="capa-livro"
                loading="lazy"
            >

            <span class="badge-categoria">
                ${categoria}
            </span>

            ${criarBotaoFavoritoHTML(livro)}

        </div>

        <div class="info-livro">

            <h3 class="titulo-livro">${titulo}</h3>

            <p class="autor-livro">${autor}</p>

            <div class="rodape-card">

                <span class="preco-livro">
                    ${formatarPreco(livro.preco)}
                </span>

                <button
                    type="button"
                    class="btn-adicionar"
                    data-id="${escaparHTML(livro.id)}"
                >
                    <i class="fa-solid fa-bag-shopping"></i>
                    Adicionar ao carrinho
                </button>

            </div>

        </div>
    `;

    return card;
}

/* ==========================================
   DESTAQUES
========================================== */

function renderizarDestaques() {
    containerDestaques.innerHTML = "";

    const destaques = listaLivros
        .filter(livro => livro.destaque)
        .slice(0, 4);

    destaques.forEach(livro => {
        containerDestaques.appendChild(
            criarCardLivro(livro)
        );
    });
}

/* ==========================================
   CATÁLOGO
========================================== */

function renderizarCatalogo(livrosParaExibir = listaLivros) {
    containerCatalogo.innerHTML = "";

    if (livrosParaExibir.length === 0) {
        containerCatalogo.innerHTML = `
            <p class="mensagem-vazia">
                Nenhum livro encontrado para essa busca.
            </p>
        `;
        return;
    }

    livrosParaExibir.forEach(livro => {
        containerCatalogo.appendChild(
            criarCardLivro(livro)
        );
    });
}

/* ==========================================
   BUSCA E FILTROS
========================================== */

function filtrarLivros() {
    const termoBusca =
        normalizarTexto(inputBusca.value.trim());

    const livrosFiltrados = listaLivros.filter(livro => {

        const bateCategoria =
            categoriaAtual === "todos" ||
            livro.categoria === categoriaAtual;

        const titulo =
            normalizarTexto(livro.titulo);

        const autor =
            normalizarTexto(livro.autor);

        const bateBusca =
            titulo.includes(termoBusca) ||
            autor.includes(termoBusca);

        return bateCategoria && bateBusca;
    });

    renderizarCatalogo(livrosFiltrados);
}

function configurarFiltros() {

    inputBusca.addEventListener("input", () => {

        filtrarLivros();

        if (inputBusca.value.trim().length === 1) {
            document.getElementById("secaoCatalogo")
                .scrollIntoView({ behavior: "smooth" });
        }

    });

    botoesFiltro.forEach(botao => {

        botao.addEventListener("click", () => {

            botoesFiltro.forEach(item => {
                item.classList.remove("ativo");
            });

            botao.classList.add("ativo");

            categoriaAtual = botao.dataset.categoria;

            filtrarLivros();
        });

    });
}

/* ==========================================
   MODAL DE DETALHES
========================================== */

function abrirModalDetalhes(idLivro) {

    const livro = obterLivroPorId(idLivro);

    if (!livro) return;

    corpoDetalhes.innerHTML = `
        <article class="detalhes-livro">

            <div class="detalhes-capa">
                <img
                    src="${escaparHTML(livro.capa)}"
                    alt="Capa ampliada do livro ${escaparHTML(livro.titulo)}"
                >
            </div>

            <div class="detalhes-info">

                <span class="detalhes-categoria">
                    ${escaparHTML(livro.categoria)}
                </span>

                <h2 class="detalhes-titulo">
                    ${escaparHTML(livro.titulo)}
                </h2>

                <p class="detalhes-autor">
                    Por <strong>${escaparHTML(livro.autor)}</strong>
                </p>

                <p class="detalhes-sinopse">
                    ${escaparHTML(livro.sinopse)}
                </p>

                <div class="ficha-tecnica">

                    <div class="item-ficha">
                        <span>Editora</span>
                        <strong>${escaparHTML(livro.editora)}</strong>
                    </div>

                    <div class="item-ficha">
                        <span>Ano</span>
                        <strong>${escaparHTML(livro.ano)}</strong>
                    </div>

                    <div class="item-ficha">
                        <span>Páginas</span>
                        <strong>${livro.paginas || "Não informado"} págs.</strong>
                    </div>

                </div>

                ${livro.precoSimulado
                    ? `<p class="aviso-preco">
                        Preço demonstrativo, não fornecido pela API.
                       </p>`
                    : ""
                }

                <div class="detalhes-acoes">

                    <span class="detalhes-preco">
                        ${formatarPreco(livro.preco)}
                    </span>

                    ${criarBotaoFavoritoHTML(livro)}

                    <button
                        type="button"
                        class="btn-adicionar"
                        data-id="${escaparHTML(livro.id)}"
                    >
                        <i class="fa-solid fa-bag-shopping"></i>
                        Adicionar ao carrinho
                    </button>

                </div>

            </div>

        </article>
    `;

    modalDetalhes.classList.remove("oculto");

    modalDetalhes.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";
}

/* Fecha o modal */
function fecharModalDetalhes() {

    modalDetalhes.classList.add("oculto");

    modalDetalhes.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";
}

/* ==========================================
   EVENTOS DO MODAL
========================================== */

function configurarModalDetalhes() {

    corpoSite.addEventListener("click", evento => {

        if (
            evento.target.closest(".btn-adicionar") ||
            evento.target.closest(".btn-favorito")
        ) {
            return;
        }

        const btnBanner =
            evento.target.closest("#btnAcao");

        if (btnBanner) {
            abrirModalDetalhes(btnBanner.dataset.id);
            return;
        }

        const cardClicado =
            evento.target.closest(".card-livro");

        if (cardClicado) {
            abrirModalDetalhes(cardClicado.dataset.id);
        }

    });

    btnFecharDetalhes.addEventListener(
        "click",
        fecharModalDetalhes
    );

    modalDetalhes.addEventListener("click", evento => {

        if (evento.target === modalDetalhes) {
            fecharModalDetalhes();
        }

    });

    document.addEventListener("keydown", evento => {

        if (
            evento.key === "Escape" &&
            !modalDetalhes.classList.contains("oculto")
        ) {
            fecharModalDetalhes();
        }

    });
}

/* ==========================================
   INICIALIZAÇÃO
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    renderizarBanner();

    renderizarDestaques();

    renderizarCatalogo();

    configurarFiltros();

    configurarModalDetalhes();

});
