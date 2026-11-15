
/** -- Seletores principais -- **/
const gavetaCarrinho = document.getElementById("gavetaCarrinho");
const listaItensCarrinho = document.getElementById("listaItensCarrinho");
const btnAbrirCarrinho = document.getElementById("btnAbrirCarrinho");
const valorTotalCarrinho = document.getElementById("valorTotalCarrinho");

const btnFecharCarrinho = document.getElementById("btnFecharCarrinho");
const iconeContadorCarrinho = document.getElementById("contadorCarrinho");

/** -- Chave do localStorage -- **/
const CHAVE_CARRINHO = "bookE_carrinho";

/** -- Estado do carrinho -- **/
let carrinho = [];

/** -- Inicializa o localStorage -- **/
function iniciarLocalStorage() {
    const dadosSalvos = localStorage.getItem(CHAVE_CARRINHO);

    if (dadosSalvos === null) {
        localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
    } else {
        try {
            carrinho = JSON.parse(dadosSalvos) || [];
        } catch {
            carrinho = [];
            localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
        }
    }

    renderizarCarrinho();
    contadorCarrinho();
}

/** -- Salva as alterações no localStorage -- **/
function salvarCarrinho() {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));

    renderizarCarrinho();
    contadorCarrinho();
}

/** -- Captura os cliques nos botões -- **/
document.addEventListener("click", (event) => {

    const botaoAdicionar = event.target.closest(".btn-adicionar");

    if (botaoAdicionar) {
        adicionarItemCarrinho(botaoAdicionar.dataset.id);
        return;
    }

    const botaoAumentar = event.target.closest(".btn-aumentar");

    if (botaoAumentar) {
        const id = botaoAumentar.closest(".item-carrinho").dataset.id;
        alterarQuantidade(id, 1);
        return;
    }

    const botaoDiminuir = event.target.closest(".btn-diminuir");

    if (botaoDiminuir) {
        const id = botaoDiminuir.closest(".item-carrinho").dataset.id;
        alterarQuantidade(id, -1);
        return;
    }

    const botaoRemover = event.target.closest(".btn-remover");

    if (botaoRemover) {
        const id = botaoRemover.closest(".item-carrinho").dataset.id;
        removerItemCarrinho(id);
    }
});

/** -- Adiciona um livro ao carrinho -- **/
function adicionarItemCarrinho(idLivro) {
    const livro = listaLivros.find(
        (item) => item.id === Number(idLivro)
    );

    if (!livro) return;

    const itemExistente = carrinho.find(
        (item) => item.id === livro.id
    );

    if (itemExistente) {
        itemExistente.quantidade++;
    } else {
        carrinho.push({
            id: livro.id,
            quantidade: 1
        });
    }

    salvarCarrinho();
}

/** -- Altera a quantidade de um livro -- **/
function alterarQuantidade(idLivro, quantidade) {
    const item = carrinho.find(
        (item) => item.id === Number(idLivro)
    );

    if (!item) return;

    item.quantidade += quantidade;

    // Impede quantidades menores que 1.
    if (item.quantidade < 1) {
        item.quantidade = 1;
    }

    salvarCarrinho();
}

/** -- Remove um livro do carrinho -- **/
function removerItemCarrinho(idLivro) {
    carrinho = carrinho.filter(
        (item) => item.id !== Number(idLivro)
    );

    salvarCarrinho();
}

/** -- Cria o HTML de um item do carrinho -- **/
function criarItemCarrinho(livro, quantidade) {
    const subtotal = livro.preco * quantidade;

    return `
        <article class="item-carrinho" data-id="${livro.id}">

            <img
                src="${livro.capa}"
                alt="Capa do livro ${livro.titulo}"
                class="imagem-item"
            >

            <div class="info-item">

                <h3 class="titulo-item">${livro.titulo}</h3>

                <span class="preco-item">
                    Unitário: ${formatarPreco(livro.preco)}
                </span>

                <span class="subtotal-item">
                    Subtotal: ${formatarPreco(subtotal)}
                </span>

                <div class="controles-quantidade">

                    <button class="btn-diminuir" aria-label="Diminuir quantidade">
                        -
                    </button>

                    <span class="quantidade-item">${quantidade}</span>

                    <button class="btn-aumentar" aria-label="Aumentar quantidade">
                        +
                    </button>

                </div>

            </div>

            <button class="btn-remover" aria-label="Remover ${livro.titulo}">
                <i class="fa-solid fa-trash"></i>
            </button>

        </article>
    `;
}

/** -- Renderiza os itens do carrinho -- **/
function renderizarCarrinho() {
    listaItensCarrinho.innerHTML = "";

    let valorTotal = 0;

    if (carrinho.length === 0) {
        listaItensCarrinho.innerHTML = `
            <p class="mensagem-carrinho-vazio">
                Seu carrinho está vazio.
            </p>
        `;

        valorTotalCarrinho.textContent = formatarPreco(0);
        return;
    }

    carrinho.forEach((item) => {

        const livro = listaLivros.find(
            (livro) => livro.id === item.id
        );

        if (!livro) return;

        listaItensCarrinho.innerHTML += criarItemCarrinho(
            livro,
            item.quantidade
        );

        valorTotal += livro.preco * item.quantidade;
    });

    valorTotalCarrinho.textContent = formatarPreco(valorTotal);
}

/** -- Atualiza o contador do carrinho -- **/
function contadorCarrinho() {
    const quantidadeTotal = carrinho.reduce(
        (total, item) => total + item.quantidade,
        0
    );

    iconeContadorCarrinho.textContent = quantidadeTotal;
}

/** -- Abre o carrinho -- **/
function abrirCarrinho() {
    gavetaCarrinho.classList.remove("oculto");
    gavetaCarrinho.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

/** -- Fecha o carrinho -- **/
function fecharCarrinho() {
    gavetaCarrinho.classList.add("oculto");
    gavetaCarrinho.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

/** -- Eventos de abertura e fechamento -- **/
btnAbrirCarrinho.addEventListener("click", abrirCarrinho);

btnFecharCarrinho.addEventListener("click", fecharCarrinho);

// Fecha ao clicar fora do painel.
gavetaCarrinho.addEventListener("click", (event) => {
    if (event.target === gavetaCarrinho) {
        fecharCarrinho();
    }
});

// Fecha ao pressionar ESC.
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !gavetaCarrinho.classList.contains("oculto")) {
        fecharCarrinho();
    }
});

/** -- Inicialização -- **/
iniciarLocalStorage();
