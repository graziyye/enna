// ===== ESQUEMA BOTÃO =====
const emailInput = document.getElementById("email");
const codigoInput = document.getElementById("codigo");
const entrarBtn = document.getElementById("entrarBtn");

if (emailInput && codigoInput && entrarBtn) {
  function verificarCampos() {
    if (emailInput.value.trim() !== "" && codigoInput.value.trim() !== "") {
      entrarBtn.classList.add("ativo");
      entrarBtn.disabled = false;
    } else {
      entrarBtn.classList.remove("ativo");
      entrarBtn.disabled = true;
    }
  }

  emailInput.addEventListener("input", verificarCampos);
  codigoInput.addEventListener("input", verificarCampos);
}
