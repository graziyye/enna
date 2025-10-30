// Esquema botão e validações — Criação do espaço
const inputs = document.querySelectorAll('#form-criar-espaco input');
const botaoCriar = document.getElementById('btn-criar');
const erroCodigo = document.getElementById('erro-codigo');
const formCriar = document.getElementById('form-criar-espaco');

inputs.forEach(input => {
  input.addEventListener('input', () => {
    const todosPreenchidos = Array.from(inputs).every(i => i.value.trim() !== '');
    botaoCriar.disabled = !todosPreenchidos;
  });
});

formCriar.addEventListener('submit', e => {
  e.preventDefault();
  if (document.getElementById('codigo').value.length !== 8) {
    erroCodigo.textContent = 'O código deve ter exatamente 8 dígitos.';
    return;
  }
  erroCodigo.textContent = '';
  document.getElementById('tela-criar-espaco').classList.remove('ativa');
  document.getElementById('tela-convites').classList.add('ativa');
});

// Esquema botão e lista de convites
const emailConvite = document.getElementById('email-convite');
const btnEnviarConvite = document.getElementById('btn-enviar-convite');
const listaConvites = document.getElementById('convites-lista');

emailConvite.addEventListener('input', () => {
  btnEnviarConvite.disabled = emailConvite.value.trim() === '';
});

btnEnviarConvite.addEventListener('click', () => {
  const email = emailConvite.value.trim();
  if (email === '') return;

  const item = document.createElement('div');
  item.className = 'convite-item';
  item.innerHTML = `
    <div class="convite-info">
      <div class="convite-foto"></div>
      <div>
        <div class="convite-email">${email}</div>
        <div class="convite-status">Aguardando resposta</div>
      </div>
    </div>
    <div class="convite-delete">🗑️</div>
  `;
  listaConvites.appendChild(item);
  emailConvite.value = '';
  btnEnviarConvite.disabled = true;

  // Exclusão com popup
  const popup = document.getElementById('popup');
  const popupText = document.getElementById('popup-text');
  const popupSim = document.getElementById('popup-sim');
  const popupNao = document.getElementById('popup-nao');

  item.querySelector('.convite-delete').addEventListener('click', () => {
    popup.style.display = 'flex';
    popupText.textContent = `Você quer anular o convite para ${email}?`;

    popupSim.onclick = () => {
      item.remove();
      popup.style.display = 'none';
    };

    popupNao.onclick = () => {
      popup.style.display = 'none';
    };
  });
});
