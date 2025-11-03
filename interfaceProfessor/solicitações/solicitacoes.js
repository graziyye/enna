// função geral p os popups
const popup = document.getElementById("popup-confirmacao");
const textoPopup = document.getElementById("texto-popup");
const botaoSim = document.getElementById("botao-sim");
const botaoNao = document.getElementById("botao-nao");



const hamburger = document.getElementById('hamburger');
const sideMenu = document.getElementById('sideMenu');
const closeMenu = document.getElementById('closeMenu');

let acaoAtual = null;
let cardSelecionado = null;


  // hamburger
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    sideMenu.classList.toggle('visible');
  });
  closeMenu.addEventListener('click', () => {
    hamburger.classList.remove('open');
    sideMenu.classList.remove('visible');
  });


// 1️ cancelar solicitação
document.querySelectorAll(".menu-card").forEach(menu => {
    menu.addEventListener("click", () => {
        textoPopup.textContent = "Deseja cancelar esta solicitação?";
        acaoAtual = "cancelar";
        cardSelecionado = menu.closest(".card-solicitacao");
        popup.style.display = "flex";
    });
});

// 2️ confirmar agendamento
document.querySelectorAll(".btn-confirmar").forEach(btn => {
    btn.addEventListener("click", () => {
        textoPopup.textContent = "Deseja confirmar este agendamento?";
        acaoAtual = "agendar";
        cardSelecionado = btn.closest(".card-solicitacao");
        popup.style.display = "flex";
    });
});

// 3️ excluir recusado
document.querySelectorAll(".btn-excluir").forEach(btn => {
    btn.addEventListener("click", () => {
        cardSelecionado = btn.closest(".card-solicitacao");
        cardSelecionado.remove();
    });
});

// ação do botão do popup
botaoSim.addEventListener("click", () => {
    if (acaoAtual === "cancelar" || acaoAtual === "agendar") {
        cardSelecionado.remove();
    }
    popup.style.display = "none";
});
botaoNao.addEventListener("click", () => {
    popup.style.display = "none";
});

// fechar popup ao clicar fora
popup.addEventListener("click", (e) => {
    if (e.target === popup) popup.style.display = "none";
});
