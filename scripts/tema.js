
const btnTema = document.getElementById("btnTema");

const temaSalvo = localStorage.getItem("tema") || "claro";

// Aplica o tema salvo ao carregar a página
document.documentElement.setAttribute("data-tema", temaSalvo);

// Atualiza o ícone do botão
function atualizarIconeTema(tema) {
    if (!btnTema) return;

    btnTema.innerHTML = tema === "escuro"
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';

    btnTema.setAttribute(
        "aria-label",
        tema === "escuro" ? "Ativar modo claro" : "Ativar modo escuro"
    );
}

// Alterna entre os temas
if (btnTema) {
    atualizarIconeTema(temaSalvo);

    btnTema.addEventListener("click", () => {
        const temaAtual = document.documentElement.getAttribute("data-tema");

        const novoTema = temaAtual === "claro" ? "escuro" : "claro";

        document.documentElement.setAttribute("data-tema", novoTema);

        localStorage.setItem("tema", novoTema);

        atualizarIconeTema(novoTema);
    });
}
