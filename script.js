const BUDGET = 5000;

const CATEGORIES = [
  { id: 'food',    label: 'Comida',        icon: '🍔', color: '#ff6b6b', bg: 'rgba(255,107,107,0.15)' },
  { id: 'trans',   label: 'Transporte',    icon: '🚗', color: '#ffd93d', bg: 'rgba(255,217,61,0.15)'  },
  { id: 'fun',     label: 'Entretenimiento',icon:'🎮', color: '#6bcb77', bg: 'rgba(107,203,119,0.15)' },
  { id: 'home',    label: 'Hogar',         icon: '🏠', color: '#4d96ff', bg: 'rgba(77,150,255,0.15)'  },
  { id: 'health',  label: 'Salud',         icon: '💊', color: '#ff6ef7', bg: 'rgba(255,110,247,0.15)' },
  { id: 'clothes', label: 'Ropa',          icon: '👕', color: '#f9a825', bg: 'rgba(249,168,37,0.15)'  },
  { id: 'tech',    label: 'Tecnología',    icon: '📱', color: '#7c6af7', bg: 'rgba(124,106,247,0.15)' },
  { id: 'other',   label: 'Otros',         icon: '📦', color: '#90a4ae', bg: 'rgba(144,164,174,0.15)' },
];

// ── Estado ──────────────────────────────
let expenses = JSON.parse(localStorage.getItem('gastos') || '[]');
let selectedCat = CATEGORIES[0].id;

// ── Guardar ──────────────────────────────
function save() {
  localStorage.setItem('gastos', JSON.stringify(expenses));
}

// ── Fecha actual en formato YYYY-MM-DD ──
function today() {
  return new Date().toISOString().split('T')[0];
}

// ── Saludo según hora ──────────────────
function setGreeting() {
  const h = new Date().getHours();
  const g = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
  document.getElementById('greeting').textContent = g;
}

// ── Mes actual legible ─────────────────
function monthLabel() {
  return new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase());
}

// ── Filtrar gastos del mes actual ──────
function currentMonthExpenses() {
  const now = new Date();
  return expenses.filter(e => {
    const d = new Date(e.date + 'T12:00:00');
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
}

// ── Formatear moneda ───────────────────
function fmt(n) {
  return '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Render tarjeta principal ───────────
function renderCard() {
  const month = currentMonthExpenses();
  const total = month.reduce((s, e) => s + e.amount, 0);
  const pct   = Math.min((total / BUDGET) * 100, 100);
  const max   = month.length ? month.reduce((a, b) => b.amount > a.amount ? b : a) : null;

  document.getElementById('totalAmount').textContent = fmt(total);
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('budgetPct').textContent = Math.round(pct) + '%';
  document.getElementById('countMonth').textContent = month.length + (month.length === 1 ? ' gasto' : ' gastos');
  document.getElementById('maxExpense').textContent = max ? fmt(max.amount) : '—';
}

// ── Render categorías ──────────────────
function renderCategories() {
  const month = currentMonthExpenses();
  const grid  = document.getElementById('categoriesGrid');
  grid.innerHTML = '';

  CATEGORIES.forEach(cat => {
    const total = month.filter(e => e.cat === cat.id).reduce((s, e) => s + e.amount, 0);
    if (total === 0) return;
    const div = document.createElement('div');
    div.className = 'cat-card';
    div.innerHTML = `
      <div class="cat-icon-wrap" style="background:${cat.bg}">
        <span>${cat.icon}</span>
      </div>
      <div class="cat-info">
        <p class="cat-name">${cat.label}</p>
        <p class="cat-total" style="color:${cat.color}">${fmt(total)}</p>
      </div>`;
    grid.appendChild(div);
  });

  if (!grid.children.length) {
    grid.innerHTML = '<p style="color:rgba(255,255,255,0.3);font-size:13px;padding:8px 0">Sin datos este mes</p>';
  }
}

// ── Render transacciones ───────────────
function renderTransactions() {
  const list = document.getElementById('transactionsList');
  const month = currentMonthExpenses().slice().reverse();

  if (!month.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">💸</div>
        <p>Aún no hay gastos</p>
        <p class="empty-sub">Toca + para agregar uno</p>
      </div>`;
    return;
  }

  list.innerHTML = '';
  month.forEach(e => {
    const cat = CATEGORIES.find(c => c.id === e.cat) || CATEGORIES[7];
    const d   = new Date(e.date + 'T12:00:00');
    const dateStr = d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });

    const div = document.createElement('div');
    div.className = 'tx-item';
    div.innerHTML = `
      <div class="tx-icon" style="background:${cat.bg}; font-size:22px">${cat.icon}</div>
      <div class="tx-info">
        <p class="tx-desc">${e.desc || cat.label}</p>
        <p class="tx-meta">${cat.label} · ${dateStr}</p>
      </div>
      <div class="tx-right">
        <p class="tx-amount" style="color:${cat.color}">${fmt(e.amount)}</p>
        <button class="tx-delete" data-id="${e.id}" title="Eliminar">×</button>
      </div>`;
    list.appendChild(div);
  });

  list.querySelectorAll('.tx-delete').forEach(btn => {
    btn.addEventListener('click', () => deleteExpense(btn.dataset.id));
  });
}

// ── Render completo ────────────────────
function render() {
  renderCard();
  renderCategories();
  renderTransactions();
}

// ── Eliminar gasto ─────────────────────
function deleteExpense(id) {
  expenses = expenses.filter(e => e.id !== id);
  save();
  render();
}

// ── Modal ──────────────────────────────
const overlay = document.getElementById('modalOverlay');
const fab     = document.getElementById('fabBtn');

function openModal() {
  overlay.classList.add('active');
  fab.classList.add('open');
  document.getElementById('inputDate').value = today();
  document.getElementById('inputAmount').focus();
}

function closeModal() {
  overlay.classList.remove('active');
  fab.classList.remove('open');
  document.getElementById('inputAmount').value = '';
  document.getElementById('inputDesc').value   = '';
}

fab.addEventListener('click', () =>
  overlay.classList.contains('active') ? closeModal() : openModal()
);

document.getElementById('btnCancel').addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

// ── Picker de categorías ───────────────
function buildCatPicker() {
  const picker = document.getElementById('catPicker');
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-chip' + (cat.id === selectedCat ? ' selected' : '');
    btn.dataset.id = cat.id;
    btn.innerHTML  = `${cat.icon} ${cat.label}`;
    btn.addEventListener('click', () => {
      selectedCat = cat.id;
      picker.querySelectorAll('.cat-chip').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
    picker.appendChild(btn);
  });
}

// ── Guardar nuevo gasto ────────────────
document.getElementById('btnSave').addEventListener('click', () => {
  const amount = parseFloat(document.getElementById('inputAmount').value);
  const desc   = document.getElementById('inputDesc').value.trim();
  const date   = document.getElementById('inputDate').value;

  if (!amount || amount <= 0) {
    document.getElementById('inputAmount').focus();
    return;
  }

  expenses.push({
    id:     Date.now().toString(),
    amount,
    desc:   desc || '',
    cat:    selectedCat,
    date:   date || today(),
  });

  save();
  render();
  closeModal();
});

// ── Borrar todo ────────────────────────
document.getElementById('btnClearAll').addEventListener('click', () => {
  if (!currentMonthExpenses().length) return;
  if (confirm('¿Borrar todos los gastos de este mes?')) {
    const now = new Date();
    expenses = expenses.filter(e => {
      const d = new Date(e.date + 'T12:00:00');
      return !(d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear());
    });
    save();
    render();
  }
});

// ── Init ───────────────────────────────
setGreeting();
document.getElementById('btnMonth').textContent = monthLabel();
buildCatPicker();
render();
