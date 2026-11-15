
/* ==========================================
   CHECKOUT - FINALIZAÇÃO DE COMPRA
========================================== */

/* Seletores */
const modalCheckout =
    document.getElementById("modalCheckout");

const btnFecharCheckout =
    document.getElementById("btnFecharCheckout");

const etapaFormulario =
    document.getElementById("etapaFormulario");

const etapaConfirmacao =
    document.getElementById("etapaConfirmacao");

const formCheckout =
    document.getElementById("formCheckout");

const resumoItensCheckout =
    document.getElementById("resumoItensCheckout");

const subtotalCheckout =
    document.getElementById("subtotalCheckout");

const freteCheckout =
    document.getElementById("freteCheckout");

const totalCheckout =
    document.getElementById("totalCheckout");

const nomeCheckout =
    document.getElementById("nomeCheckout");

const emailCheckout =
    document.getElementById("emailCheckout");

const cepCheckout =
    document.getElementById("cepCheckout");

const ruaCheckout =
    document.getElementById("ruaCheckout");

const numeroCheckout =
    document.getElementById("numeroCheckout");

const complementoCheckout =
    document.getElementById("complementoCheckout");

const bairroCheckout =
    document.getElementById("bairroCheckout");

const cidadeCheckout =
    document.getElementById("cidadeCheckout");

const ufCheckout =
    document.getElementById("ufCheckout");

const pagamentoCheckout =
    document.getElementById("pagamentoCheckout");

const statusCep =
    document.getElementById("statusCep");

const feedbackCheckout =
    document.getElementById("feedbackCheckout");

const btnConfirmarPedido =
    document.getElementById("btnConfirmarPedido");

/* Estado */
let ultimoCepConsultado = "";
let subtotalPedido = 0;
let fretePedido = 0;

/* ==========================================
   ABRIR CHECKOUT
========================================== */

function abrirCheckout() {

    if (carrinho.length === 0) return;

    fecharCarrinho();

    reiniciarCheckout();

    atualizarResumoCheckout();

    modalCheckout.classList.remove("oculto");

    modalCheckout.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

}

/* ==========================================
   FECHAR CHECKOUT
========================================== */

function fecharCheckout() {

    modalCheckout.classList.add("oculto");

    modalCheckout.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";

}

/* ==========================================
   RESUMO DO PEDIDO
========================================== */

function atualizarResumoCheckout() {

    resumoItensCheckout.innerHTML = "";

    subtotalPedido = calcularTotalCarrinho();

    /*
       Frete demonstrativo:
       - Grátis para compras a partir de R$ 150.
       - R$ 12,90 para compras abaixo desse valor.
    */

    fretePedido = subtotalPedido >= 150 ? 0 : 12.90;

    carrinho.forEach(item => {

        const livro = obterLivroPorId(item.id);

        if (!livro) return;

        const linha = document.createElement("div");

        linha.classList.add("item-resumo-checkout");

        const nome = document.createElement("span");

        nome.textContent =
            `${livro.titulo} (${item.quantidade}x)`;

        const preco = document.createElement("strong");

        preco.textContent = formatarPreco(
            livro.preco * item.quantidade
        );

        linha.append(nome, preco);

        resumoItensCheckout.appendChild(linha);

    });

    subtotalCheckout.textContent =
        formatarPreco(subtotalPedido);

    freteCheckout.textContent =
        fretePedido === 0
            ? "Grátis"
            : formatarPreco(fretePedido);

    totalCheckout.textContent =
        formatarPreco(subtotalPedido + fretePedido);

}

/* ==========================================
   CONSULTA CEP - VIACEP
========================================== */

function formatarCep(valor) {

    const numeros = valor.replace(/\D/g, "").slice(0, 8);

    return numeros.replace(/^(\d{5})(\d)/, "$1-$2");

}

async function buscarEnderecoPorCep() {

    const cep = cepCheckout.value.replace(/\D/g, "");

    if (cep.length !== 8) return;

    if (cep === ultimoCepConsultado) return;

    ultimoCepConsultado = cep;

    statusCep.textContent = "Consultando CEP...";

    statusCep.className = "status-cep carregando";

    try {

        const resposta = await fetch(
            `https://viacep.com.br/ws/${cep}/json/`
        );

        if (!resposta.ok) {
            throw new Error("Erro ao consultar o CEP.");
        }

        const dados = await resposta.json();

        if (dados.erro) {

            statusCep.textContent = "CEP não encontrado.";

            statusCep.className = "status-cep erro";

            ruaCheckout.value = "";
            bairroCheckout.value = "";
            cidadeCheckout.value = "";
            ufCheckout.value = "";

            return;
        }

        ruaCheckout.value = dados.logradouro || "";

        bairroCheckout.value = dados.bairro || "";

        cidadeCheckout.value = dados.localidade || "";

        ufCheckout.value = dados.uf || "";

        statusCep.textContent = "Endereço encontrado!";

        statusCep.className = "status-cep sucesso";

    } catch (erro) {

        console.error("Erro na consulta ViaCEP:", erro);

        statusCep.textContent =
            "Não foi possível consultar o CEP. Preencha o endereço manualmente.";

        statusCep.className = "status-cep erro";

    }

}

/* ==========================================
   VALIDAÇÃO
========================================== */

function exibirErroCheckout(campo, mensagem) {

    campo.classList.add("campo-invalido");

    let erro = campo.parentElement.querySelector(
        ".mensagem-erro"
    );

    if (!erro) {

        erro = document.createElement("small");

        erro.classList.add("mensagem-erro");

        campo.parentElement.appendChild(erro);

    }

    erro.textContent = mensagem;

}

function removerErroCheckout(campo) {

    campo.classList.remove("campo-invalido");

    const erro = campo.parentElement.querySelector(
        ".mensagem-erro"
    );

    if (erro) erro.remove();

}

function validarFormularioCheckout() {

    const camposObrigatorios = [
        nomeCheckout,
        emailCheckout,
        cepCheckout,
        ruaCheckout,
        numeroCheckout,
        bairroCheckout,
        cidadeCheckout,
        ufCheckout,
        pagamentoCheckout
    ];

    let valido = true;

    camposObrigatorios.forEach(campo => {

        removerErroCheckout(campo);

        if (!campo.value.trim()) {

            exibirErroCheckout(
                campo,
                "Este campo é obrigatório."
            );

            valido = false;

        }

    });

    const nome = nomeCheckout.value.trim();

    if (nome && nome.split(/\s+/).length < 2) {

        exibirErroCheckout(
            nomeCheckout,
            "Informe nome e sobrenome."
        );

        valido = false;

    }

    const email = emailCheckout.value.trim();

    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (email && !formatoEmail.test(email)) {

        exibirErroCheckout(
            emailCheckout,
            "Digite um e-mail válido."
        );

        valido = false;

    }

    const cep = cepCheckout.value.replace(/\D/g, "");

    if (cep.length !== 8) {

        exibirErroCheckout(
            cepCheckout,
            "Digite um CEP válido com 8 números."
        );

        valido = false;

    }

    if (ufCheckout.value.trim().length !== 2) {

        exibirErroCheckout(
            ufCheckout,
            "Informe a sigla do estado."
        );

        valido = false;

    }

    return valido;

}

/* ==========================================
   GERAR PEDIDO
========================================== */

function montarPedido() {

    return {

        numero: `BK${Date.now().toString().slice(-8)}`,

        nome: nomeCheckout.value.trim(),

        email: emailCheckout.value.trim(),

        itens: carrinho.map(item => {

            const livro = obterLivroPorId(item.id);

            return {
                titulo: livro.titulo,
                quantidade: item.quantidade,
                preco: livro.preco
            };

        }),

        endereco: {
            cep: cepCheckout.value,
            rua: ruaCheckout.value,
            numero: numeroCheckout.value,
            complemento: complementoCheckout.value,
            bairro: bairroCheckout.value,
            cidade: cidadeCheckout.value,
            uf: ufCheckout.value
        },

        pagamento: pagamentoCheckout.value,

        subtotal: subtotalPedido,

        frete: fretePedido,

        total: subtotalPedido + fretePedido

    };

}

/* ==========================================
   CONFIRMAÇÃO
========================================== */

function mostrarConfirmacao(pedido) {

    const endereco = pedido.endereco;

    const complemento = endereco.complemento
        ? `, ${escaparHTML(endereco.complemento)}`
        : "";

    etapaConfirmacao.innerHTML = `
        <div class="confirmacao-pedido">

            <i class="fa-solid fa-circle-check"></i>

            <h2 id="tituloConfirmacao" tabindex="-1">
                Pedido realizado!
            </h2>

            <p>
                Obrigado pela sua compra, ${escaparHTML(pedido.nome)}!
            </p>

            <div class="dados-pedido">

                <p>
                    <span>Número do pedido</span>
                    <strong>${escaparHTML(pedido.numero)}</strong>
                </p>

                <p>
                    <span>Endereço de entrega</span>
                    <strong>
                        ${escaparHTML(endereco.rua)},
                        ${escaparHTML(endereco.numero)}${complemento}<br>
                        ${escaparHTML(endereco.bairro)}<br>
                        ${escaparHTML(endereco.cidade)}/${escaparHTML(endereco.uf)}<br>
                        CEP: ${escaparHTML(endereco.cep)}
                    </strong>
                </p>

                <p>
                    <span>Pagamento</span>
                    <strong>${escaparHTML(pedido.pagamento)}</strong>
                </p>

                <p>
                    <span>Subtotal</span>
                    <strong>${formatarPreco(pedido.subtotal)}</strong>
                </p>

                <p>
                    <span>Frete</span>
                    <strong>
                        ${pedido.frete === 0
                            ? "Grátis"
                            : formatarPreco(pedido.frete)}
                    </strong>
                </p>

                <p class="linha-total-checkout">
                    <span>Total</span>
                    <strong>${formatarPreco(pedido.total)}</strong>
                </p>

            </div>

            <p class="aviso-simulacao">
                Esta é uma simulação acadêmica.
                Nenhum pagamento foi processado.
            </p>

            <button type="button" class="btn-enviar"
                id="btnVoltarLoja">
                Continuar comprando
            </button>

        </div>
    `;

    etapaFormulario.classList.add("oculto");

    btnFecharCheckout.classList.add("oculto");

    etapaConfirmacao.classList.remove("oculto");

    document.getElementById("tituloConfirmacao").focus();

    document.getElementById("btnVoltarLoja")
        .addEventListener("click", () => {

            fecharCheckout();

            etapaFormulario.classList.remove("oculto");

            etapaConfirmacao.classList.add("oculto");

            btnFecharCheckout.classList.remove("oculto");

        });

}

/* ==========================================
   REINICIAR CHECKOUT
========================================== */

function reiniciarCheckout() {

    formCheckout.reset();

    ultimoCepConsultado = "";

    statusCep.textContent = "";

    statusCep.className = "status-cep";

    feedbackCheckout.textContent = "";

    feedbackCheckout.className = "feedback-form";

    etapaFormulario.classList.remove("oculto");

    etapaConfirmacao.classList.add("oculto");

    btnFecharCheckout.classList.remove("oculto");

    formCheckout.querySelectorAll("input, select")
        .forEach(removerErroCheckout);

}

/* ==========================================
   EVENTO DE FINALIZAÇÃO
========================================== */

formCheckout.addEventListener("submit", evento => {

    evento.preventDefault();

    feedbackCheckout.textContent = "";

    feedbackCheckout.className = "feedback-form";

    if (!validarFormularioCheckout()) {

        feedbackCheckout.textContent =
            "Verifique os campos destacados.";

        feedbackCheckout.classList.add("erro");

        formCheckout.querySelector(".campo-invalido").focus();

        return;

    }

    const pedido = montarPedido();

    btnConfirmarPedido.disabled = true;

    btnConfirmarPedido.textContent = "Processando pedido...";

    setTimeout(() => {

        limparCarrinho();

        mostrarConfirmacao(pedido);

        btnConfirmarPedido.disabled = false;

        btnConfirmarPedido.textContent = "Confirmar pedido";

    }, 1000);

});

/* ==========================================
   EVENTOS
========================================== */

btnFinalizarCompra.addEventListener(
    "click",
    abrirCheckout
);

btnFecharCheckout.addEventListener("click", () => {

    fecharCheckout();

    abrirCarrinho();

});

modalCheckout.addEventListener("click", evento => {

    if (evento.target === modalCheckout) {

        if (!etapaFormulario.classList.contains("oculto")) {
            fecharCheckout();
        }

    }

});

document.addEventListener("keydown", evento => {

    if (
        evento.key === "Escape" &&
        !modalCheckout.classList.contains("oculto") &&
        !etapaFormulario.classList.contains("oculto")
    ) {
        fecharCheckout();
    }

});

/* ==========================================
   EVENTOS DO CEP
========================================== */

cepCheckout.addEventListener("input", () => {

    cepCheckout.value = formatarCep(cepCheckout.value);

    removerErroCheckout(cepCheckout);

    const cep = cepCheckout.value.replace(/\D/g, "");

    if (cep.length < 8) {

        ultimoCepConsultado = "";

        statusCep.textContent = "";

        statusCep.className = "status-cep";

        return;

    }

    buscarEnderecoPorCep();

});

/* Estado sempre em letras maiúsculas */
ufCheckout.addEventListener("input", () => {

    ufCheckout.value = ufCheckout.value
        .replace(/[^a-zA-Z]/g, "")
        .toUpperCase();

});

/* Limpar erros enquanto digita */
[
    nomeCheckout,
    emailCheckout,
    ruaCheckout,
    numeroCheckout,
    bairroCheckout,
    cidadeCheckout,
    ufCheckout,
    pagamentoCheckout
].forEach(campo => {

    campo.addEventListener("input", () => {

        removerErroCheckout(campo);

        feedbackCheckout.textContent = "";

        feedbackCheckout.className = "feedback-form";

    });

});
