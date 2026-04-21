// ── Supabase config ──────────────────
const SUPABASE_URL = 'https://euikuzrzsvlabkaqkopd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aWt1enJ6c3ZsYWJrYXFrb3BkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NDQ3MjgsImV4cCI6MjA5MjMyMDcyOH0.QEJSWZnvkhq7VTr8dBRMIkKdCz6bhX3Hk795zMtrKDU';
const DB       = `${SUPABASE_URL}/rest/v1/gastos`;
const AUTH_URL = `${SUPABASE_URL}/auth/v1`;

// Token se guarda en sessionStorage (se borra al cerrar el navegador)
let accessToken = sessionStorage.getItem('sb_token') || null;

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${accessToken || SUPABASE_KEY}`,
  };
}

// ── Autenticación ─────────────────────
async function login(email, password) {
  const btn   = document.getElementById('btnLogin');
  const error = document.getElementById('loginError');
  btn.disabled    = true;
  btn.textContent = 'Entrando...';
  error.textContent = '';

  try {
    const res  = await fetch(`${AUTH_URL}/token?grant_type=password`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
      body:    JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (data.access_token) {
      accessToken = data.access_token;
      sessionStorage.setItem('sb_token', accessToken);
      showApp();
    } else {
      error.textContent = 'Correo o contraseña incorrectos.';
    }
  } catch (e) {
    error.textContent = 'Error de conexión. Intenta de nuevo.';
  }

  btn.disabled    = false;
  btn.textContent = 'Entrar';
}

function logout() {
  accessToken = null;
  sessionStorage.removeItem('sb_token');
  document.getElementById('appContent').style.display  = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('loginEmail').value    = '';
  document.getElementById('loginPassword').value = '';
}

function showApp() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('appContent').style.display  = 'block';
  setGreeting();
  document.getElementById('btnMonth').textContent = monthLabel();
  buildCatPicker();
  loadExpenses();
}

// ── Eventos de login ──────────────────
document.getElementById('btnLogin').addEventListener('click', () => {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  if (!email || !password) {
    document.getElementById('loginError').textContent = 'Ingresa tu correo y contraseña.';
    return;
  }
  login(email, password);
});

// Login con Enter
document.getElementById('loginPassword').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btnLogin').click();
});

document.getElementById('btnLogout').addEventListener('click', logout);

const BUDGET = 8000;

const CATEGORIES = [
  { id: 'food',    label: 'Comida',          icon: '🍔', color: '#ff6b6b', bg: 'rgba(255,107,107,0.15)' },
  { id: 'trans',   label: 'Transporte',      icon: '🚗', color: '#ffd93d', bg: 'rgba(255,217,61,0.15)'  },
  { id: 'fun',     label: 'Entretenimiento', icon: '🎮', color: '#6bcb77', bg: 'rgba(107,203,119,0.15)' },
  { id: 'home',    label: 'Hogar',           icon: '🏠', color: '#4d96ff', bg: 'rgba(77,150,255,0.15)'  },
  { id: 'health',  label: 'Salud',           icon: '💊', color: '#ff6ef7', bg: 'rgba(255,110,247,0.15)' },
  { id: 'clothes', label: 'Ropa',            icon: '👕', color: '#f9a825', bg: 'rgba(249,168,37,0.15)'  },
  { id: 'tech',    label: 'Tecnología',      icon: '📱', color: '#7c6af7', bg: 'rgba(124,106,247,0.15)' },
  { id: 'other',   label: 'Otros',           icon: '📦', color: '#90a4ae', bg: 'rgba(144,164,174,0.15)' },
];

const SAMPLE_DATA = [
  { id:'d01', amount:85,   description:'Tacos de canasta',      cat:'food',    date:'2026-04-01' },
  { id:'d02', amount:35,   description:'Metro ida y vuelta',    cat:'trans',   date:'2026-04-01' },
  { id:'d03', amount:320,  description:'Súper semanal',         cat:'food',    date:'2026-04-03' },
  { id:'d04', amount:200,  description:'Gasolina',              cat:'trans',   date:'2026-04-04' },
  { id:'d05', amount:450,  description:'Farmacia',              cat:'health',  date:'2026-04-05' },
  { id:'d06', amount:150,  description:'Cine + palomitas',      cat:'fun',     date:'2026-04-06' },
  { id:'d07', amount:89,   description:'Spotify + Netflix',     cat:'fun',     date:'2026-04-06' },
  { id:'d08', amount:800,  description:'Tenis Nike',            cat:'clothes', date:'2026-04-07' },
  { id:'d09', amount:65,   description:'Comida corrida',        cat:'food',    date:'2026-04-08' },
  { id:'d10', amount:280,  description:'Uber semanal',          cat:'trans',   date:'2026-04-09' },
  { id:'d11', amount:350,  description:'Cena restaurante',      cat:'food',    date:'2026-04-10' },
  { id:'d12', amount:180,  description:'Luz del mes',           cat:'home',    date:'2026-04-11' },
  { id:'d13', amount:120,  description:'Agua purificada',       cat:'home',    date:'2026-04-12' },
  { id:'d14', amount:75,   description:'Desayuno café',         cat:'food',    date:'2026-04-14' },
  { id:'d15', amount:350,  description:'Concierto',             cat:'fun',     date:'2026-04-15' },
  { id:'d16', amount:230,  description:'Gasolina',              cat:'trans',   date:'2026-04-16' },
  { id:'d17', amount:600,  description:'Súper quincenal',       cat:'food',    date:'2026-04-17' },
  { id:'d18', amount:45,   description:'Estacionamiento',       cat:'trans',   date:'2026-04-18' },
  { id:'d19', amount:699,  description:'Camisa + pantalón',     cat:'clothes', date:'2026-04-19' },
  { id:'d20', amount:800,  description:'Dentista',              cat:'health',  date:'2026-04-19' },
  { id:'d21', amount:110,  description:'Sushi',                 cat:'food',    date:'2026-04-20' },
  { id:'d22', amount:399,  description:'Funda + cable iPhone',  cat:'tech',    date:'2026-04-20' },
];

// ── Estado ──────────────────────────
let expenses    = [];
let selectedCat = CATEGORIES[0].id;
let donutChart  = null;
let lineChart   = null;

// ── Supabase: cargar todos los gastos ─
async function loadExpenses() {
  showLoading(true);
  try {
    const res  = await fetch(`${DB}?order=date.asc`, { headers: getHeaders() });
    expenses   = await res.json();
    if (!Array.isArray(expenses)) expenses = [];
  } catch (e) {
    console.error('Error cargando datos:', e);
    expenses = [];
  }
  showLoading(false);
  render();
}

// ── Supabase: guardar un gasto ────────
async function saveExpense(expense) {
  await fetch(DB, {
    method:  'POST',
    headers: { ...getHeaders(), 'Prefer': 'return=minimal' },
    body:    JSON.stringify(expense),
  });
}

// ── Supabase: eliminar un gasto ───────
async function deleteExpense(id) {
  await fetch(`${DB}?id=eq.${id}`, { method: 'DELETE', headers: getHeaders() });
  expenses = expenses.filter(e => e.id !== id);
  render();
}

// ── Loading state ─────────────────────
function showLoading(on) {
  document.getElementById('transactionsList').innerHTML = on
    ? `<div class="empty-state"><div class="empty-icon">⏳</div><p>Cargando datos...</p></div>`
    : '';
}

// ── Helpers ───────────────────────────
function today() { return new Date().toISOString().split('T')[0]; }

function fmt(n) {
  return '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function setGreeting() {
  const h = new Date().getHours();
  document.getElementById('greeting').textContent =
    h < 12 ? 'Buenos días 👋' : h < 19 ? 'Buenas tardes 👋' : 'Buenas noches 👋';
}

function monthLabel() {
  return new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase());
}

function currentMonthExpenses() {
  const now = new Date();
  return expenses.filter(e => {
    const d = new Date(e.date + 'T12:00:00');
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
}

// ── Tarjeta principal ────────────────
function renderCard() {
  const month = currentMonthExpenses();
  const total = month.reduce((s, e) => s + Number(e.amount), 0);
  const pct   = Math.min((total / BUDGET) * 100, 100);
  const over  = total > BUDGET;
  const days  = new Date().getDate();
  const avg   = days > 0 ? total / days : 0;
  const max   = month.length ? month.reduce((a, b) => Number(b.amount) > Number(a.amount) ? b : a) : null;

  document.getElementById('totalAmount').textContent = fmt(total);
  document.getElementById('budgetPct').textContent   = Math.round((total / BUDGET) * 100) + '%';
  document.getElementById('countMonth').textContent  = month.length;
  document.getElementById('avgDay').textContent      = fmt(avg);
  document.getElementById('maxExpense').textContent  = max ? fmt(max.amount) : '—';

  const fill = document.getElementById('progressFill');
  fill.style.width = pct + '%';
  fill.classList.toggle('over', over);

  const remaining = BUDGET - total;
  document.getElementById('miniStats').innerHTML = `
    <div class="mini-card">
      <div class="label">Restante</div>
      <div class="value" style="color:${remaining >= 0 ? '#6bcb77' : '#ff6b6b'}">${fmt(Math.abs(remaining))}</div>
    </div>
    <div class="mini-card">
      <div class="label">Promedio/día</div>
      <div class="value">${fmt(avg)}</div>
    </div>
    <div class="mini-card">
      <div class="label">Transacciones</div>
      <div class="value">${month.length}</div>
    </div>`;
}

// ── Gráfica dona ─────────────────────
function renderDonut() {
  const month   = currentMonthExpenses();
  const catData = CATEGORIES.map(c => ({
    ...c,
    total: month.filter(e => e.cat === c.id).reduce((s, e) => s + Number(e.amount), 0)
  })).filter(c => c.total > 0);

  const chartData = {
    labels:   catData.map(c => c.label),
    datasets: [{
      data:            catData.map(c => c.total),
      backgroundColor: catData.map(c => c.color),
      borderWidth: 2, borderColor: '#16161f', hoverOffset: 10,
    }]
  };

  if (donutChart) { donutChart.data = chartData; donutChart.update(); return; }
  donutChart = new Chart(document.getElementById('donutChart'), {
    type: 'doughnut', data: chartData,
    options: {
      responsive: true, cutout: '68%',
      plugins: {
        legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.6)', font: { size: 11 }, padding: 12 } },
        tooltip: { callbacks: { label: ctx => ` ${fmt(ctx.parsed)}` } }
      }
    }
  });
}

// ── Gráfica acumulada ─────────────────
function renderLine() {
  const month    = currentMonthExpenses();
  const todayDay = new Date().getDate();
  const byDay    = {};
  month.forEach(e => {
    const day = parseInt(e.date.split('-')[2]);
    byDay[day] = (byDay[day] || 0) + Number(e.amount);
  });

  const maxDay = Math.max(todayDay, ...Object.keys(byDay).map(Number), 1);
  let cumulative = 0;
  const labels = [], dataAcc = [];
  for (let d = 1; d <= maxDay; d++) {
    cumulative += byDay[d] || 0;
    labels.push(d);
    dataAcc.push(parseFloat(cumulative.toFixed(2)));
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Gasto acumulado', data: dataAcc,
        borderColor: '#7c6af7', backgroundColor: 'rgba(124,106,247,0.12)',
        fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#7c6af7',
      },
      {
        label: `Presupuesto (${fmt(BUDGET)})`, data: labels.map(() => BUDGET),
        borderColor: '#f76ab4', borderDash: [6, 4],
        pointRadius: 0, fill: false, borderWidth: 1.5,
      }
    ]
  };

  const opts = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { labels: { color: 'rgba(255,255,255,0.6)', font: { size: 11 } } },
      tooltip: { callbacks: { label: ctx => ` ${fmt(ctx.parsed.y)}` } }
    },
    scales: {
      x: { ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 }, callback: v => '$' + v.toLocaleString() }, grid: { color: 'rgba(255,255,255,0.04)' } }
    }
  };

  if (lineChart) { lineChart.data = chartData; lineChart.update(); return; }
  lineChart = new Chart(document.getElementById('lineChart'), { type: 'line', data: chartData, options: opts });
}

// ── Categorías ────────────────────────
function renderCategories() {
  const month = currentMonthExpenses();
  const total = month.reduce((s, e) => s + Number(e.amount), 0);
  const grid  = document.getElementById('categoriesGrid');
  grid.innerHTML = '';

  const catData = CATEGORIES.map(c => ({
    ...c,
    total: month.filter(e => e.cat === c.id).reduce((s, e) => s + Number(e.amount), 0)
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  if (!catData.length) {
    grid.innerHTML = '<p style="color:rgba(255,255,255,0.3);font-size:13px;padding:4px 0;grid-column:1/-1">Sin datos este mes</p>';
    return;
  }

  catData.forEach(cat => {
    const pct = total > 0 ? (cat.total / total) * 100 : 0;
    const div = document.createElement('div');
    div.className = 'cat-card';
    div.innerHTML = `
      <div class="cat-icon-wrap" style="background:${cat.bg}">${cat.icon}</div>
      <div class="cat-info" style="flex:1;overflow:hidden">
        <p class="cat-name">${cat.label}</p>
        <p class="cat-total" style="color:${cat.color}">${fmt(cat.total)}</p>
        <div class="cat-bar-wrap">
          <div class="cat-bar-fill" style="width:${pct}%;background:${cat.color}"></div>
        </div>
      </div>`;
    grid.appendChild(div);
  });
}

// ── Transacciones ─────────────────────
function renderTransactions() {
  const list  = document.getElementById('transactionsList');
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
    const cat     = CATEGORIES.find(c => c.id === e.cat) || CATEGORIES[7];
    const dateStr = new Date(e.date + 'T12:00:00')
      .toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });

    const div = document.createElement('div');
    div.className = 'tx-item';
    div.innerHTML = `
      <div class="tx-icon" style="background:${cat.bg}">${cat.icon}</div>
      <div class="tx-info">
        <p class="tx-desc">${e.description || cat.label}</p>
        <p class="tx-meta">${cat.label} · ${dateStr}</p>
      </div>
      <div class="tx-right">
        <p class="tx-amount" style="color:${cat.color}">${fmt(e.amount)}</p>
        <button class="tx-delete" data-id="${e.id}">×</button>
      </div>`;
    list.appendChild(div);
  });

  list.querySelectorAll('.tx-delete').forEach(btn => {
    btn.addEventListener('click', () => deleteExpense(btn.dataset.id));
  });
}

// ── Render completo ───────────────────
function render() {
  renderCard();
  renderDonut();
  renderLine();
  renderCategories();
  renderTransactions();
}

// ── Modal ─────────────────────────────
const overlay = document.getElementById('modalOverlay');
const fab     = document.getElementById('fabBtn');

function openModal() {
  overlay.classList.add('active');
  fab.classList.add('open');
  document.getElementById('inputDate').value = today();
  setTimeout(() => document.getElementById('inputAmount').focus(), 350);
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

// ── Picker categorías ─────────────────
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

// ── Guardar gasto ─────────────────────
document.getElementById('btnSave').addEventListener('click', async () => {
  const amount = parseFloat(document.getElementById('inputAmount').value);
  const desc   = document.getElementById('inputDesc').value.trim();
  const date   = document.getElementById('inputDate').value;
  if (!amount || amount <= 0) { document.getElementById('inputAmount').focus(); return; }

  const expense = {
    id:          Date.now().toString(),
    amount,
    description: desc,
    cat:         selectedCat,
    date:        date || today(),
  };

  closeModal();
  await saveExpense(expense);
  await loadExpenses();
});

// ── Cargar datos de prueba ────────────
document.getElementById('btnDemo').addEventListener('click', async () => {
  const existingIds = expenses.map(e => e.id);
  const toAdd       = SAMPLE_DATA.filter(e => !existingIds.includes(e.id));
  if (!toAdd.length) { alert('Los datos de prueba ya están cargados.'); return; }

  await Promise.all(toAdd.map(e => saveExpense(e)));
  await loadExpenses();
});

// ── Borrar todo ───────────────────────
document.getElementById('btnClearAll').addEventListener('click', async () => {
  if (!currentMonthExpenses().length) return;
  if (!confirm('¿Borrar todos los gastos de este mes?')) return;

  const now   = new Date();
  const toDelete = currentMonthExpenses();
  await Promise.all(toDelete.map(e =>
    fetch(`${DB}?id=eq.${e.id}`, { method: 'DELETE', headers: HEADERS })
  ));
  await loadExpenses();
});

// ── Init ──────────────────────────────
if (accessToken) {
  showApp();
} else {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('appContent').style.display  = 'none';
}
