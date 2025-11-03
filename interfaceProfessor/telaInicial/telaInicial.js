/* ---------- Dados iniciais (substituir pela integração com DB) ---------- */
/* professor info (normalmente viria da autenticação / convite) */
const professor = { name: "Nome do Professor", email: "prof1@escola.pr.gov.br" };

/* dados de amostra:
   bookings = agendamentos aprovados 
   requests = solicitações enviadas 
   Ambos são persistidos no localStorage para teste.
*/
const SAMPLE_BOOKINGS = [
  { id: genId(), date: mkDateKey(8), time: "Manhã", lab: "Laboratório 3", order: 2, turma: "2º Téc ADS", professor: professor.name },
  { id: genId(), date: mkDateKey(23), time: "Manhã", lab: "Laboratório 1", order: 1, turma: "1º Ano C", professor: "Outro Prof" }
];

/* opções para selects (vêm do coordenador) */
const OPTIONS = {
  turmas: ["2º Ano Técnico ADS", "6º Ano Turma B", "7º Ano Turma A", "7º Ano Turma B", "8º Ano Turma A"],
  materias: ["Programação Mobile", "Língua Portuguesa", "Banco de Dados", "Matemática", "Física"],
  horarios: ["1º Horário", "2º Horário", "3º Horário", "4º Horário", "5º Horário", "6º Horário"]
};

/* ---------- Storage helpers ---------- */
function getStorage(key) { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null } }
function setStorage(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

/* initialise storage for demo */
if (!getStorage('bookings')) setStorage('bookings', SAMPLE_BOOKINGS);
if (!getStorage('requests')) setStorage('requests', []);

/* utilities */
function genId() { return 'id' + Math.random().toString(36).slice(2, 9); }
function mkDateKey(day) { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; }

/* ---------- referencias UI ---------- */
const profNameEl = document.getElementById('profName');
const hamburger = document.getElementById('hamburger');
const sideMenu = document.getElementById('sideMenu');
const closeMenu = document.getElementById('closeMenu');

const cardsWrap = document.getElementById('cardsWrap');
const calendarEl = document.getElementById('calendar');
const monthTitle = document.getElementById('monthTitle');

const scheduler = document.getElementById('scheduler');
const selectedDateLabel = document.getElementById('selectedDateLabel');
const schedulerBody = document.getElementById('schedulerBody');

const selectTurma = document.getElementById('selectTurma');
const selectMateria = document.getElementById('selectMateria');
const selectHorario = document.getElementById('selectHorario');
const listTurma = document.getElementById('listTurma');
const listMateria = document.getElementById('listMateria');
const listHorario = document.getElementById('listHorario');

const requestBtn = document.getElementById('requestBtn');
const requestMsg = document.getElementById('requestMsg');

const confirmPopup = document.getElementById('confirmPopup');
const confirmText = document.getElementById('confirmText');
const confirmCancel = document.getElementById('confirmCancel');
const confirmOk = document.getElementById('confirmOk');

let selectedDay = null;
let selectedLab = null;
let selectedTurma = null;
let selectedMateria = null;
let selectedHorario = null;
let bookingToDelete = null;


document.addEventListener('DOMContentLoaded', () => {
  profNameEl.textContent = professor.name;

  // hamburger
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    sideMenu.classList.toggle('visible');
  });
  closeMenu.addEventListener('click', () => {
    hamburger.classList.remove('open');
    sideMenu.classList.remove('visible');
  });

  // render initial lists
  renderBookings();
  renderCalendar();

  // populate selects lists
  populateList(listTurma, OPTIONS.turmas, (v) => selectOption('turma', v));
  populateList(listMateria, OPTIONS.materias, (v) => selectOption('materia', v));
  populateList(listHorario, OPTIONS.horarios, (v) => selectOption('horario', v));

  // select head toggles
  selectTurma.querySelector('.select-head').addEventListener('click', () => toggleSelect(selectTurma));
  selectMateria.querySelector('.select-head').addEventListener('click', () => toggleSelect(selectMateria));
  selectHorario.querySelector('.select-head').addEventListener('click', () => toggleSelect(selectHorario));

  // mudança radio laboratorio
  document.querySelectorAll('input[name="lab"]').forEach(r => r.addEventListener('change', (e) => { selectedLab = e.target.value; tryEnableRequest(); }));



  // solicitar
  requestBtn.addEventListener('click', handleRequest);

  // popup
  confirmCancel.addEventListener('click', () => { confirmPopup.classList.add('hidden'); bookingToDelete = null; });
  confirmOk.addEventListener('click', () => {
    if (bookingToDelete) {
      deleteBookingById(bookingToDelete);
      bookingToDelete = null;
      confirmPopup.classList.add('hidden');
    }
  });

  // fechar popup clicando fora
  confirmPopup.addEventListener('click', (e) => { if (e.target === confirmPopup) { confirmPopup.classList.add('hidden'); bookingToDelete = null; } });

  // clicking outside select closes them
  document.addEventListener('click', (e) => {
    if (!selectTurma.contains(e.target)) selectTurma.classList.remove('open');
    if (!selectMateria.contains(e.target)) selectMateria.classList.remove('open');
    if (!selectHorario.contains(e.target)) selectHorario.classList.remove('open');
  });
});

/* ---------- Render bookings (cards area) ---------- */
function renderBookings() {
  const bookings = getStorage('bookings') || [];
  cardsWrap.innerHTML = '';
  if (!bookings.length) { cardsWrap.innerHTML = '<p style="color:var(--muted)">Nenhum agendamento aprovado.</p>'; return; }

  bookings.forEach(b => {
    const card = document.createElement('div'); card.className = 'card';
    card.innerHTML = `
      <button class="menu-btn">⋮</button>
      <div class="date">${formatDateFromKey(b.date)} - ${b.time}</div>
      <div class="title">${b.lab}</div>
      <div class="meta"><span style="color:var(--primary)">${b.order}º Horário</span> &nbsp;&nbsp; ${b.turma}</div>`;
    cardsWrap.appendChild(card);

    const menuBtn = card.querySelector('.menu-btn');
    menuBtn.addEventListener('click', (ev) => {
      // build menu (simple)
      const menu = document.createElement('div'); menu.className = 'mini-menu';
      menu.style.position = 'absolute'; menu.style.right = '10px'; menu.style.top = '36px';
      menu.style.background = '#15171b'; menu.style.border = '1px solid rgba(255,255,255,0.04)'; menu.style.padding = '8px'; menu.style.borderRadius = '8px';
      menu.innerHTML = `<div style="color:#fff;cursor:pointer;padding:8px" class="menu-cancel">Cancelar agendamento</div>`;
      // remove previous menus
      document.querySelectorAll('.mini-menu').forEach(m => m.remove());
      card.appendChild(menu);

      // click handler
      menu.querySelector('.menu-cancel').addEventListener('click', () => {
        bookingToDelete = b.id;
        confirmText.textContent = `Deseja excluir seu agendamento para ${formatDateFromKey(b.date)}?`;
        confirmPopup.classList.remove('hidden');
        menu.remove();
      });
      ev.stopPropagation();
      // clicar em qualquer lugar fecha o menu
      document.addEventListener('click', function onDoc() {
        menu.remove(); document.removeEventListener('click', onDoc);
      });
    });
  });
}

/* ---------- calendario ---------- */
function renderCalendar() {
  calendarEl.innerHTML = '';
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-index
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  monthTitle.textContent = `${monthNames[month]} ${year}`;

  // index primeiro dia (0=sun)
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // criar 6 linhas x 7 colunas
  let day = 1;
  for (let r = 0; r < 6; r++) {
    const tr = document.createElement('tr');
    for (let c = 0; c < 7; c++) {
      const td = document.createElement('td');
      if ((r === 0 && c < firstDayIndex) || day > daysInMonth) { td.textContent = ''; }
      else {
        td.textContent = day;
        td.className = 'day';

        // não pode selecionar final de semana
        const weekday = new Date(year, month, day).getDay();
        if (weekday === 0 || weekday === 6) { td.classList.add('disabled'); }
        // dia em destaque
        if (day === now.getDate()) td.classList.add('selected');
        // mark days that have bookings (any booking for that day)
        const bookings = getStorage('bookings') || [];
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (bookings.some(b => b.date === dateKey)) td.classList.add('marked');

        // click handler for allowed days

        td.addEventListener('click', ()=>{      
          if (td.classList.contains('disabled')) return;
          selectedDay = day;
          const dd = String(day).padStart(2,'0');
          const mm = String(month+1).padStart(2,'0');
          selectedDateLabel.textContent = `${dd}/${mm}`;
          scheduler.classList.remove('hidden');
          schedulerBody.classList.remove('hidden');     





        // reset selections on day change
        resetSelections();
        // scroll to scheduler on mobile
        setTimeout(() => document.querySelector('.scheduler').scrollIntoView({ behavior: 'smooth' }), 100);
      }); 
      day++;
    }
    tr.appendChild(td);
  }
  calendarEl.appendChild(tr);
}
}

/* mudar formato da data YYYY-MM-DD -> DD/MM */
function formatDateFromKey(key) {
  const parts = key.split('-'); return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/* ---------- Custom selects helpers ---------- */
function populateList(container, items, onClick) {
  container.innerHTML = '';
  items.forEach(it => {
    const div = document.createElement('div'); div.className = 'item'; div.textContent = it;
    div.addEventListener('click', () => onClick(it));
    container.appendChild(div);
  });
}
function toggleSelect(wrapper) {
  wrapper.classList.toggle('open');
}
function selectOption(type, value) {
  if (type === 'turma') { selectedTurma = value; selectTurma.querySelector('.select-head').firstChild.textContent = value; selectTurma.classList.remove('open'); }
  if (type === 'materia') { selectedMateria = value; selectMateria.querySelector('.select-head').firstChild.textContent = value; selectMateria.classList.remove('open'); }
  if (type === 'horario') { selectedHorario = value; selectHorario.querySelector('.select-head').firstChild.textContent = value; selectHorario.classList.remove('open'); }
  tryEnableRequest();
}

/* set initial heads text nodes for selects */
selectTurma.querySelector('.select-head').insertAdjacentHTML('afterbegin', '<span>Selecionar Turma</span>');
selectMateria.querySelector('.select-head').insertAdjacentHTML('afterbegin', '<span>Selecionar Matéria</span>');
selectHorario.querySelector('.select-head').insertAdjacentHTML('afterbegin', '<span>Selecionar Horário</span>');

/* ---------- Request logic (validations) ---------- */
function tryEnableRequest() {
  requestMsg.textContent = '';
  // must have date, lab, turma, materia, horario
  if (!selectedDay || !selectedLab || !selectedTurma || !selectedMateria || !selectedHorario) {
    requestBtn.disabled = true; return;
  }

  const now = new Date(); const mm = String(now.getMonth() + 1).padStart(2, '0'); const yyyy = now.getFullYear();
  const dateKey = `${yyyy}-${mm}-${String(selectedDay).padStart(2, '0')}`;

  const bookings = getStorage('bookings') || [];

  // vwndo se há condlitos
  // 1) mesmo laboratorio + data + horario
  if (bookings.some(b => b.date === dateKey && b.lab === selectedLab && b.order === horarioOrder(selectedHorario))) {
    requestMsg.textContent = 'laboratório indisponível para este horário';
    requestBtn.disabled = true; return;
  }
  // 2) mesmmoa turma + data + horario 
  if (bookings.some(b => b.date === dateKey && b.turma === selectedTurma && b.order === horarioOrder(selectedHorario))) {
    requestMsg.textContent = 'turma indisponível para este horário';
    requestBtn.disabled = true; return;
  }
  // 3) um só professor ter dois agendamentos no mesmo horario
  if (bookings.some(b => b.date === dateKey && b.professor === professor.name && b.order === horarioOrder(selectedHorario))) {
    requestMsg.textContent = 'você já tem agendamento para este horário';
    requestBtn.disabled = true; return;
  }

  
  requestMsg.textContent = '';
  requestBtn.disabled = false;
}

/* map horario string to numeric order (loosely) */
function horarioOrder(hstr) {
  const map = { "1º Horário": 1, "2º Horário": 2, "3º Horário": 3, "4º Horário": 4, "5º Horário": 5, "6º Horário": 6 };
  return map[hstr] || 0;
}

/* handle request submission */
function handleRequest() {
  if (!selectedDay || !selectedLab || !selectedTurma || !selectedMateria || !selectedHorario) return;
  const now = new Date(); const mm = String(now.getMonth() + 1).padStart(2, '0'); const yyyy = now.getFullYear();
  const dateKey = `${yyyy}-${mm}-${String(selectedDay).padStart(2, '0')}`;

  // push to requests
  const requests = getStorage('requests') || [];
  const req = {
    id: genId(), date: dateKey, lab: selectedLab, order: horarioOrder(selectedHorario),
    time: selectedHorario, turma: selectedTurma, materia: selectedMateria, professor: professor.name, status: 'pending'
  };
  requests.push(req);
  setStorage('requests', requests);

  // limpar campos
  resetSelections();

  // mensagem de sucesso
  requestMsg.style.color = '#8fd48f';
  requestMsg.textContent = 'Solicitação enviada. Aguarde aprovação do coordenador.';
  setTimeout(() => { requestMsg.textContent = ''; requestMsg.style.color = ''; }, 3000);

  // TODO: aqui você enviaria a solicitação ao servidor / Firebase para que o coordenador aprove
}

/* reset selection UI */
function resetSelections() {
  selectedLab = null; selectedTurma = null; selectedMateria = null; selectedHorario = null;
  // reset radios
  document.querySelectorAll('input[name="lab"]').forEach(r => r.checked = false);
  // reset heads
  selectTurma.querySelector('.select-head span').textContent = 'Selecionar Turma';
  selectMateria.querySelector('.select-head span').textContent = 'Selecionar Matéria';
  selectHorario.querySelector('.select-head span').textContent = 'Selecionar Horário';
  requestBtn.disabled = true;
}

/* ---------- Delete booking ---------- */
function deleteBookingById(id) {
  let bookings = getStorage('bookings') || [];
  bookings = bookings.filter(b => b.id !== id);
  setStorage('bookings', bookings);
  renderBookings();
  renderCalendar();
}

/* ---------- Utility for external testing ----------
If you want to simulate approval of a request (so it becomes an approved booking),
you can run in console:
let reqs = JSON.parse(localStorage.getItem('requests')||'[]');
let r = reqs[0];
let bks = JSON.parse(localStorage.getItem('bookings')||'[]'); bks.push({...r,id:'bk'+Date.now(),professor:r.professor}); localStorage.setItem('bookings',JSON.stringify(bks));
*/
