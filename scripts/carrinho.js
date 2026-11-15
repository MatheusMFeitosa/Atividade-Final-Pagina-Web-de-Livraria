
/* ==========================================
   CARRINHO DE COMPRAS
========================================== */

/* Seletores */
const gavetaCarrinho =
    document.getElementById("gavetaCarrinho");

const listaItensCarrinho =
    document.getElementById("listaItensCarrinho");

const btnAbrirCarrinho =
    document.getElementById("btnAbrirCarrinho");

const btnFecharCarrinho =
    document.getElementById("btnFecharCarrinho");

const btnFinalizarCompra =
    document.getElementById("btnFinalizarCompra");

const valorTotalCarrinho =
    document.getElementById("valorTotalCarrinho");

const iconeContadorCarrinho =
    document.getElementById("contadorCarrinho");

/* LocalStorage */
const CHAVE_CARRINHO = "bookE_carrinho";

/* Estado */
let carrinho = [];

/* ==========================================
   INICIALIZAÇÃO
========================================== */

function iniciarLocalStorage() {

    try {

        const dadosSalvos = JSON.parse(
            localStorage.getItem(CHAVE_CARRINHO)
        );

        carrinho = Array.isArray(dadosSalvos)
            ? dadosSalvos
            : [];

    } catch (erro) {

        console.error("Erro ao recuperar carrinho:", erro);

        carrinho = [];

    }

    renderizarCarrinho();

    contadorCarrinho();

}

/* ==========================================
   PERSISTÊNCIA
========================================== */

function salvarCarrinho() {

    localStorage.setItem(
        CHAVE_CARRINHO,
        JSON.stringify(carrinho)
    );

    sincronizarLivrosExternos();

    renderizarCarrinho();

    contadorCarrinho();

}

/* ==========================================
   ADICIONAR PRODUTO
========================================== */

function adicionarItemCarrinho(idLivro) {

    const livro = obterLivroPorId(idLivro);

    if (!livro) return;

    const itemExistente = carrinho.find(
        item => String(item.id) === String(idLivro)
    );

    if (itemExistente) {

        itemExistente.quantidade++;

    } else {

        carrinho.push({
            id: idLivro,
            quantidade: 1
        });

    }

    salvarCarrinho();

}

/* ==========================================
   ALTERAR QUANTIDADE
========================================== */

function alterarQuantidade(idLivro, quantidade) {

    const item = carrinho.find(
        item => String(item.id) === String(idLivro)
    );

    if (!item) return;

    item.quantidade += quantidade;

    if (item.quantidade < 1) {
        item.quantidade = 1;
    }

    salvarCarrinho();

}

/* ==========================================
   REMOVER PRODUTO
========================================== */

function removerItemCarrinho(idLivro) {

    carrinho = carrinho.filter(
        item => String(item.id) !== String(idLivro)
    );

    salvarCarrinho();

}

/* ==========================================
   CALCULAR TOTAL
========================================== */

function calcularTotalCarrinho() {

    return carrinho.reduce((total, item) => {

        const livro = obterLivroPorId(item.id);

        if (!livro) return total;

        return total + livro.preco * item.quantidade;

    }, 0);

}

/* ==========================================
   LIMPAR CARRINHO
========================================== */

function limparCarrinho() {

    carrinho = [];

    salvarCarrinho();

}

/* ==========================================
   CRIAR ITEM DO CARRINHO
========================================== */

function criarItemCarrinho(livro, quantidade) {

    const subtotal = livro.preco * quantidade;

    return `
        <article class="item-carrinho"
            data-id="${escaparHTML(livro.id)}">

            <img
                src="${escaparHTML(livro.capa)}"
                alt="Capa do livro ${escaparHTML(livro.titulo)}"
                class="imagem-item"
            >

            <div class="info-item">

                <h3 class="titulo-item">
                    ${escaparHTML(livro.titulo)}
                </h3>

                <span class="preco-item">
                    Unitário: ${formatarPreco(livro.preco)}
                </span>

                <span class="subtotal-item">
                    Subtotal: ${formatarPreco(subtotal)}
                </span>

                <div class="controles-quantidade">

                    <button type="button"
                        class="btn-diminuir"
                        aria-label="Diminuir quantidade">
                        -
                    </button>

                    <span class="quantidade-item">
                        ${quantidade}
                    </span>

                    <button type="button"
                        class="btn-aumentar"
                        aria-label="Aumentar quantidade">
                        +
                    </button>

                </div>

            </div>

            <button type="button"
                class="btn-remover"
                aria-label="Remover ${escaparHTML(livro.titulo)}">

                <i class="fa-solid fa-trash"></i>

            </button>

        </article>
    `;

}

/* ==========================================
   RENDERIZAR CARRINHO
========================================== */

function renderizarCarrinho() {

    listaItensCarrinho.innerHTML = "";

    if (carrinho.length === 0) {

        listaItensCarrinho.innerHTML = `
            <p class="mensagem-carrinho-vazio">
                Seu carrinho está vazio.
            </p>
        `;

        valorTotalCarrinho.textContent = formatarPreco(0);

        btnFinalizarCompra.disabled = true;

        return;
    }

    let valorTotal = 0;

    carrinho.forEach(item => {

        const livro = obterLivroPorId(item.id);

        if (!livro) return;

        listaItensCarrinho.innerHTML +=
            criarItemCarrinho(livro, item.quantidade);

        valorTotal += livro.preco * item.quantidade;

    });

    valorTotalCarrinho.textContent =
        formatarPreco(valorTotal);

    btnFinalizarCompra.disabled = false;

}

/* ==========================================
   CONTADOR
========================================== */

function contadorCarrinho() {

    const quantidadeTotal = carrinho.reduce(
        (total, item) => total + item.quantidade,
        0
    );

    iconeContadorCarrinho.textContent = quantidadeTotal;

}

/* ==========================================
   EVENTOS DOS BOTÕES
========================================== */

document.addEventListener("click", evento => {

    const botaoAdicionar =
        evento.target.closest(".btn-adicionar");

    if (botaoAdicionar) {

        adicionarItemCarrinho(botaoAdicionar.dataset.id);

        return;

    }

    const botaoAumentar =
        evento.target.closest(".btn-aumentar");

    if (botaoAumentar) {

        const id = botaoAumentar.closest(".item-carrinho").dataset.id;

        alterarQuantidade(id, 1);

        return;

    }

    const botaoDiminuir =
        evento.target.closest(".btn-diminuir");

    if (botaoDiminuir) {

        const id = botaoDiminuir.closest(".item-carrinho").dataset.id;

        alterarQuantidade(id, -1);

        return;

    }

    const botaoRemover =
        evento.target.closest(".btn-remover");

    if (botaoRemover) {

        const id = botaoRemover.closest(".item-carrinho").dataset.id;

        removerItemCarrinho(id);

    }

});

/* ==========================================
   ABRIR E FECHAR CARRINHO
========================================== */

function abrirCarrinho() {

    gavetaCarrinho.classList.remove("oculto");

    gavetaCarrinho.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

}

function fecharCarrinho() {

    gavetaCarrinho.classList.add("oculto");

    gavetaCarrinho.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";

}

btnAbrirCarrinho.addEventListener("click", abrirCarrinho);

btnFecharCarrinho.addEventListener("click", fecharCarrinho);

gavetaCarrinho.addEventListener("click", evento => {

    if (evento.target === gavetaCarrinho) {
        fecharCarrinho();
    }

});

document.addEventListener("keydown", evento => {

    if (
        evento.key === "Escape" &&
        !gavetaCarrinho.classList.contains("oculto")
    ) {
        fecharCarrinho();
    }

});

/* Inicialização */
iniciarLocalStorage();
