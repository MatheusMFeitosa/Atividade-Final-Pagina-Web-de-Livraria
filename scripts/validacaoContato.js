
/** -- Seletores do formulário -- **/
const formContato = document.getElementById("formContato");

const nomeContato = document.getElementById("nomeContato");
const emailContato = document.getElementById("emailContato");
const assuntoContato = document.getElementById("assuntoContato");
const mensagemContato = document.getElementById("mensagemContato");

const feedbackFormulario = document.getElementById("feedbackFormulario");

/** -- Exibe erro em um campo -- **/
function exibirErro(campo, mensagem) {
    campo.classList.add("campo-invalido");

    const erroExistente = campo.parentElement.querySelector(".mensagem-erro");

    if (erroExistente) {
        erroExistente.textContent = mensagem;
        return;
    }

    const mensagemErro = document.createElement("small");
    mensagemErro.classList.add("mensagem-erro");
    mensagemErro.textContent = mensagem;

    campo.parentElement.appendChild(mensagemErro);
}

/** -- Remove erro de um campo -- **/
function removerErro(campo) {
    campo.classList.remove("campo-invalido");

    const mensagemErro = campo.parentElement.querySelector(".mensagem-erro");

    if (mensagemErro) {
        mensagemErro.remove();
    }
}

/** -- Validação do nome -- **/
function validarNome() {
    const nome = nomeContato.value.trim();

    if (nome.length < 3) {
        exibirErro(nomeContato, "Digite seu nome completo.");
        return false;
    }

    const partesNome = nome.split(/\s+/);

    if (partesNome.length < 2) {
        exibirErro(nomeContato, "Informe seu nome e sobrenome.");
        return false;
    }

    removerErro(nomeContato);
    return true;
}

/** -- Validação do e-mail -- **/
function validarEmail() {
    const email = emailContato.value.trim();

    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!formatoEmail.test(email)) {
        exibirErro(emailContato, "Digite um endereço de e-mail válido.");
        return false;
    }

    removerErro(emailContato);
    return true;
}

/** -- Validação do assunto -- **/
function validarAssunto() {
    const assunto = assuntoContato.value.trim();

    if (assunto.length < 3) {
        exibirErro(assuntoContato, "O assunto precisa ter pelo menos 3 caracteres.");
        return false;
    }

    removerErro(assuntoContato);
    return true;
}

/** -- Validação da mensagem -- **/
function validarMensagem() {
    const mensagem = mensagemContato.value.trim();

    if (mensagem.length < 10) {
        exibirErro(mensagemContato, "A mensagem precisa ter pelo menos 10 caracteres.");
        return false;
    }

    removerErro(mensagemContato);
    return true;
}

/** -- Validação geral do formulário -- **/
function validarFormulario() {
    const nomeValido = validarNome();
    const emailValido = validarEmail();
    const assuntoValido = validarAssunto();
    const mensagemValida = validarMensagem();

    return nomeValido && emailValido && assuntoValido && mensagemValida;
}

/** -- Evento de envio do formulário -- **/
formContato.addEventListener("submit", (event) => {
    event.preventDefault();

    feedbackFormulario.textContent = "";
    feedbackFormulario.classList.remove("sucesso");

    if (!validarFormulario()) {
        feedbackFormulario.textContent = "Verifique os campos destacados.";
        feedbackFormulario.classList.add("erro");

        const primeiroCampoInvalido = formContato.querySelector(".campo-invalido");
        primeiroCampoInvalido.focus();

        return;
    }

    feedbackFormulario.textContent = "Formulário enviado!";
    feedbackFormulario.classList.add("sucesso");

    formContato.reset();
});

/** -- Validação enquanto o usuário digita -- **/
[nomeContato, emailContato, assuntoContato, mensagemContato].forEach((campo) => {
    campo.addEventListener("input", () => {
        removerErro(campo);

        feedbackFormulario.textContent = "";
        feedbackFormulario.classList.remove("erro", "sucesso");
    });
});
