/* -- Seletores principais -- */
const containerDestaques = document.getElementById("vitrineDestaques");
const containerCatalogo = document.getElementById("catalogoLivros");

/* -- Formatação de moeda -- */
function formatarPreco(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

/* -- Renderiza o livro do mês no banner -- */
function renderizarBanner() {
    const livroDestaque = listaLivros.find((livro) => livro.livroDoMes) || listaLivros[0];

    const tituloBanner = document.querySelector("#conteudoBanner .titulo");
    const textoBanner = document.querySelector("#conteudoBanner .texto-principal");
    const btnAcao = document.getElementById("btnAcao");
    const imgBanner = document.getElementById("imgBanner");

    tituloBanner.textContent = livroDestaque.titulo;
    textoBanner.textContent = `${livroDestaque.sinopse} Por apenas ${formatarPreco(livroDestaque.preco)}.`;
    btnAcao.dataset.id = livroDestaque.id;

    imgBanner.src = livroDestaque.capa;
    imgBanner.alt = `Capa do livro ${livroDestaque.titulo}`;
}

/* -- Cria o HTML de um card de livro -- */
function criarCardLivro(livro) {
    const card = document.createElement("article");
    card.classList.add("card-livro");
    card.dataset.id = livro.id;

    card.innerHTML = `
        <div class="capa-container">
            <img src="${livro.capa}" alt="Capa do livro ${livro.titulo}" class="capa-livro" loading="lazy">
            <span class="badge-categoria">${livro.categoria}</span>
        </div>

        <div class="info-livro">
            <h3 class="titulo-livro">${livro.titulo}</h3>
            <p class="autor-livro">${livro.autor}</p>

            <div class="rodape-card">
                <span class="preco-livro">${formatarPreco(livro.preco)}</span>
                <button class="btn-adicionar" data-id="${livro.id}">
                    <i class="fa-solid fa-bag-shopping"></i> Adicionar ao carrinho
                </button>
            </div>
        </div>
    `;

    return card;
}

/* -- Renderiza a vitrine de 4 destaques -- */
function renderizarDestaques() {
    containerDestaques.innerHTML = "";
    const destaques = listaLivros.filter((livro) => livro.destaque).slice(0, 4);

    destaques.forEach((livro) => {
        const card = criarCardLivro(livro);
        containerDestaques.appendChild(card);
    });
}

/* -- Renderiza os livros no catálogo -- */
function renderizarCatalogo(livrosParaExibir = listaLivros) {
    containerCatalogo.innerHTML = "";

    if (livrosParaExibir.length === 0) {
        containerCatalogo.innerHTML = `<p class="mensagem-vazia">Nenhum livro encontrado para essa busca.</p>`;
        return;
    }

    livrosParaExibir.forEach((livro) => {
        const card = criarCardLivro(livro);
        containerCatalogo.appendChild(card);
    });
}

/* -- Inicialização da página -- */
document.addEventListener("DOMContentLoaded", () => {
    renderizarBanner();
    renderizarDestaques();
    renderizarCatalogo(listaLivros);
});