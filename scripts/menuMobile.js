
const menu = document.querySelector("#menu");
const btnMenuMobile = document.querySelector("#btnMenuMobile");
const linksNavegacao = document.querySelectorAll(".links-navegacao a");

function alternarMenu() {
    const menuAberto = menu.classList.toggle("menu-aberto");

    btnMenuMobile.setAttribute("aria-expanded", menuAberto);
    btnMenuMobile.setAttribute(
        "aria-label",
        menuAberto ? "Fechar menu" : "Abrir menu"
    );

    const icone = btnMenuMobile.querySelector("i");

    icone.classList.toggle("fa-bars", !menuAberto);
    icone.classList.toggle("fa-xmark", menuAberto);
}

function fecharMenu() {
    menu.classList.remove("menu-aberto");

    btnMenuMobile.setAttribute("aria-expanded", "false");
    btnMenuMobile.setAttribute("aria-label", "Abrir menu");

    const icone = btnMenuMobile.querySelector("i");

    icone.classList.remove("fa-xmark");
    icone.classList.add("fa-bars");
}

// Abrir e fechar pelo botão
btnMenuMobile.addEventListener("click", alternarMenu);

// Fechar ao clicar em um link
linksNavegacao.forEach(link => {
    link.addEventListener("click", fecharMenu);
});

// Fechar ao clicar fora do menu
document.addEventListener("click", event => {
    if (
        !menu.contains(event.target) &&
        menu.classList.contains("menu-aberto")
    ) {
        fecharMenu();
    }
});

// Fechar com a tecla Escape
document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        fecharMenu();
    }
});
