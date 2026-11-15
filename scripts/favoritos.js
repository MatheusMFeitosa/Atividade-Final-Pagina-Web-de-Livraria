
/* ==========================================
   FAVORITOS - MINHA LISTA
========================================== */

const gradeFavoritos =
    document.getElementById("gradeFavoritos");

const resumoFavoritos =
    document.getElementById("resumoFavoritos");

const CHAVE_FAVORITOS = "bookE_favoritos";

/* Estado dos favoritos */
let favoritos = [];

/* ==========================================
   INICIALIZAÇÃO
========================================== */

function iniciarFavoritos() {

    try {
        const dadosSalvos = JSON.parse(
            localStorage.getItem(CHAVE_FAVORITOS)
        );

        favoritos = Array.isArray(dadosSalvos)
            ? dadosSalvos
            : [];

    } catch (erro) {
        favoritos = [];
        console.error("Erro ao carregar favoritos:", erro);
    }

    renderizarFavoritos();
}

/* ==========================================
   PERSISTÊNCIA
========================================== */

function salvarFavoritos() {

    localStorage.setItem(
        CHAVE_FAVORITOS,
        JSON.stringify(favoritos)
    );

    sincronizarLivrosExternos();

    renderizarFavoritos();
}

/* Verifica se um livro é favorito */
function ehFavorito(idLivro) {

    return favoritos.some(
        id => String(id) === String(idLivro)
    );

}

/* ==========================================
   BOTÃO DE FAVORITO
========================================== */

function criarBotaoFavoritoHTML(livro) {

    const ativo = ehFavorito(livro.id);

    return `
        <button
            type="button"
            class="btn-favorito ${ativo ? "ativo" : ""}"
            data-id="${escaparHTML(livro.id)}"
            aria-pressed="${ativo}"
            aria-label="${ativo ? "Remover dos favoritos" : "Adicionar aos favoritos"}"
        >
            <i class="${ativo ? "fa-solid" : "fa-regular"} fa-heart"></i>
        </button>
    `;
}

/* Atualiza os corações de todos os cards */
function atualizarBotoesFavorito(idLivro) {

    const ativo = ehFavorito(idLivro);

    document.querySelectorAll(".btn-favorito")
        .forEach(botao => {

            if (botao.dataset.id !== String(idLivro)) {
                return;
            }

            botao.classList.toggle("ativo", ativo);

            botao.setAttribute("aria-pressed", ativo);

            const icone = botao.querySelector("i");

            icone.classList.toggle("fa-solid", ativo);

            icone.classList.toggle("fa-regular", !ativo);

        });
}

/* ==========================================
   ADICIONAR E REMOVER
========================================== */

function alternarFavorito(idLivro) {

    const livro = obterLivroPorId(idLivro);

    if (!livro) return;

    if (ehFavorito(idLivro)) {

        favoritos = favoritos.filter(
            id => String(id) !== String(idLivro)
        );

    } else {

        favoritos.push(idLivro);

    }

    salvarFavoritos();

    atualizarBotoesFavorito(idLivro);
}

/* ==========================================
   CONTADOR
========================================== */

function atualizarContadorFavoritos() {

    resumoFavoritos.textContent =
        favoritos.length === 0
            ? "Nenhum livro salvo"
            : `${favoritos.length} ${
                favoritos.length === 1
                    ? "livro salvo"
                    : "livros salvos"
            }`;

}

/* ==========================================
   RENDERIZAÇÃO
========================================== */

function renderizarFavoritos() {

    gradeFavoritos.innerHTML = "";

    const livros = favoritos
        .map(obterLivroPorId)
        .filter(Boolean);

    atualizarContadorFavoritos();

    if (livros.length === 0) {

        gradeFavoritos.innerHTML = `
            <p class="mensagem-vazia favoritos-vazio">
                <i class="fa-regular fa-heart"></i>
                <br>
                Sua lista está vazia.
                Toque no coração de um livro para salvá-lo aqui.
            </p>
        `;

        return;
    }

    livros.forEach(livro => {

        gradeFavoritos.appendChild(
            criarCardLivro(livro)
        );

    });
}

/* ==========================================
   EVENTO GLOBAL DOS CORAÇÕES
========================================== */

document.addEventListener("click", evento => {

    const botao = evento.target.closest(".btn-favorito");

    if (!botao) return;

    evento.stopPropagation();

    alternarFavorito(botao.dataset.id);

});

/* Inicialização */
iniciarFavoritos();
