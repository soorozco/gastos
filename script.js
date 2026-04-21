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
  { id:'d01', amount:85,   desc:'Tacos de canasta',      cat:'food',    date:'2026-04-01' },
  { id:'d02', amount:35,   desc:'Metro ida y vuelta',    cat:'trans',   date:'2026-04-01' },
  { id:'d03', amount:320,  desc:'Súper semanal',         cat:'food',    date:'2026-04-03' },
  { id:'d04', amount:200,  desc:'Gasolina',              cat:'trans',   date:'2026-04-04' },
  { id:'d05', amount:450,  desc:'Farmacia',              cat:'health',  date:'2026-04-05' },
  { id:'d06', amount:150,  desc:'Cine + palomitas',      cat:'fun',     date:'2026-04-06' },
  { id:'d07', amount:89,   desc:'Spotify + Netflix',     cat:'fun',     date:'2026-04-06' },
  { id:'d08', amount:800,  desc:'Tenis Nike',            cat:'clothes', date:'2026-04-07' },
  { id:'d09', amount:65,   desc:'Comida corrida',        cat:'food',    date:'2026-04-08' },
  { id:'d10', amount:280,  desc:'Uber semanal',          cat:'trans',   date:'2026-04-09' },
  { id:'d11', amount:350,  desc:'Cena restaurante',      cat:'food',    date:'2026-04-10' },
  { id:'d12', amount:180,  desc:'Luz del mes',           cat:'home',    date:'2026-04-11' },
  { id:'d13', amount:120,  desc:'Agua purificada',       cat:'home',    date:'2026-04-12' },
  { id:'d14', amount:75,   desc:'Desayuno café',         cat:'food',    date:'2026-04-14' },
  { id:'d15', amount:350,  desc:'Concierto',             cat:'fun',     date:'2026-04-15' },
  { id:'d16', amount:230,  desc:'Gasolina',              cat:'trans',   date:'2026-04-16' },
  { id:'d17', amount:600,  desc:'Súper quincenal',       cat:'food',    date:'2026-04-17' },
  { id:'d18', amount:45,   desc:'Estacionamiento',       cat:'trans',   date:'2026-04-18' },
  { id:'d19', amount:699,  desc:'Camisa + pantalón',     cat:'clothes', date:'2026-04-19' },
  { id:'d20', amount:800,  desc:'Dentista',              cat:'health',  date:'2026-04-19' },
  { id:'d21', amount:110,  desc:'Sushi',                 cat:'food',    date:'2026-04-20' },
  { id:'d22', amount:399,  desc:'Funda + cable iPhone',  cat:'tech',    date:'2026-04-20' },
];

// ── Estado ──────────────────────────
let expenses   = JSON.parse(localStorage.getItem('gastos') || '[]');
let selectedCat = CATEGORIES[0].id;
let donutChart = null;
let lineChart  = null;

function save() { localStorage.setItem('gastos', JSON.stringify(expenses)); }

function today() { return new Date().toISOString().split('T')[0]; }

function fmt(n) {
  return '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
  const month  = currentMonthExpenses();
  const total  = month.reduce((s, e) => s + e.amount, 0);
  const pct    = Math.min((total / BUDGET) * 100, 100);
  const over   = total > BUDGET;
  const days   = new Date().getDate();
  const avg    = days > 0 ? total / days : 0;
  const max    = month.length ? month.reduce((a, b) => b.amount > a.amount ? b : a) : null;

  document.getElementById('totalAmount').textContent = fmt(total);
  document.getElementById('budgetPct').textContent   = Math.round((total/BUDGET)*100) + '%';
  document.getElementById('countMonth').textContent  = month.length;
  document.getElementById('avgDay').textContent      = fmt(avg);
  document.getElementById('maxExpense').textContent  = max ? fmt(max.amount) : '—';

  const fill = document.getElementById('progressFill');
  fill.style.width = pct + '%';
  fill.classList.toggle('over', over);

  // Mini stats desktop
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
  const month = currentMonthExpenses();
  const catData = CATEGORIES.map(c => ({
    ...c,
    total: month.filter(e => e.cat === c.id).reduce((s, e) => s + e.amount, 0)
  })).filter(c => c.total > 0);

  const chartData = {
    labels:   catData.map(c => c.label),
    datasets: [{
      data:            catData.map(c => c.total),
      backgroundColor: catData.map(c => c.color),
      borderWidth: 2,
      borderColor: '#16161f',
      hoverOffset: 10,
    }]
  };

  if (donutChart) {
    donutChart.data = chartData;
    donutChart.update();
    return;
  }

  donutChart = new Chart(document.getElementById('donutChart'), {
    type: 'doughnut',
    data: chartData,
    options: {
      responsive: true,
      cutout: '68%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: 'rgba(255,255,255,0.6)', font: { size: 11 }, padding: 12 }
        },
        tooltip: {
          callbacks: { label: ctx => ` ${fmt(ctx.parsed)}` }
        }
      }
    }
  });
}

// ── Gráfica acumulada ─────────────────
function renderLine() {
  const month = currentMonthExpenses();
  const todayDay = new Date().getDate();

  const byDay = {};
  month.forEach(e => {
    const day = parseInt(e.date.split('-')[2]);
    byDay[day] = (byDay[day] || 0) + e.amount;
  });

  const maxDay = Math.max(todayDay, ...Object.keys(byDay).map(Number), 1);
  let cumulative = 0;
  const labels   = [];
  const dataAcc  = [];

  for (let d = 1; d <= maxDay; d++) {
    cumulative += byDay[d] || 0;
    labels.push(d);
    dataAcc.push(parseFloat(cumulative.toFixed(2)));
  }

  const budgetLine = labels.map(() => BUDGET);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Gasto acumulado',
        data: dataAcc,
        borderColor: '#7c6af7',
        backgroundColor: 'rgba(124,106,247,0.12)',
        fill: true, tension: 0.4,
        pointRadius: 3, pointBackgroundColor: '#7c6af7',
      },
      {
        label: `Presupuesto (${fmt(BUDGET)})`,
        data: budgetLine,
        borderColor: '#f76ab4',
        borderDash: [6, 4],
        pointRadius: 0, fill: false,
        borderWidth: 1.5,
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
      x: {
        ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 } },
        grid:  { color: 'rgba(255,255,255,0.04)' },
        title: { display: true, text: 'Día del mes', color: 'rgba(255,255,255,0.3)', font: { size: 11 } }
      },
      y: {
        ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 }, callback: v => '$' + v.toLocaleString() },
        grid:  { color: 'rgba(255,255,255,0.04)' },
      }
    }
  };

  if (lineChart) {
    lineChart.data = chartData;
    lineChart.update();
    return;
  }

  lineChart = new Chart(document.getElementById('lineChart'), { type: 'line', data: chartData, options: opts });
}

// ── Categorías ────────────────────────
function renderCategories() {
  const month   = currentMonthExpenses();
  const total   = month.reduce((s, e) => s + e.amount, 0);
  const grid    = document.getElementById('categoriesGrid');
  grid.innerHTML = '';

  const catData = CATEGORIES.map(c => ({
    ...c,
    total: month.filter(e => e.cat === c.id).reduce((s, e) => s + e.amount, 0)
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
        <p class="tx-desc">${e.desc || cat.label}</p>
        <p class="tx-meta">${cat.label} · ${dateStr}</p>
      </div>
      <div class="tx-right">
        <p class="tx-amount" style="color:${cat.color}">${fmt(e.amount)}</p>
        <button class="tx-delete" data-id="${e.id}">×</button>
      </div>`;
    list.appendChild(div);
  });

  list.querySelectorAll('.tx-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      expenses = expenses.filter(e => e.id !== btn.dataset.id);
      save(); render();
    });
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
document.getElementById('btnSave').addEventListener('click', () => {
  const amount = parseFloat(document.getElementById('inputAmount').value);
  const desc   = document.getElementById('inputDesc').value.trim();
  const date   = document.getElementById('inputDate').value;
  if (!amount || amount <= 0) { document.getElementById('inputAmount').focus(); return; }

  expenses.push({ id: Date.now().toString(), amount, desc, cat: selectedCat, date: date || today() });
  save(); render(); closeModal();
});

// ── Borrar todo ───────────────────────
document.getElementById('btnClearAll').addEventListener('click', () => {
  if (!currentMonthExpenses().length) return;
  if (confirm('¿Borrar todos los gastos de este mes?')) {
    const now = new Date();
    expenses = expenses.filter(e => {
      const d = new Date(e.date + 'T12:00:00');
      return !(d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear());
    });
    save(); render();
  }
});

// ── Cargar datos de prueba ────────────
document.getElementById('btnDemo').addEventListener('click', () => {
  const existing = expenses.map(e => e.id);
  const toAdd    = SAMPLE_DATA.filter(e => !existing.includes(e.id));
  if (!toAdd.length) { alert('Los datos de prueba ya están cargados.'); return; }
  expenses.push(...toAdd);
  save(); render();
});

// ── Init ──────────────────────────────
setGreeting();
document.getElementById('btnMonth').textContent = monthLabel();
buildCatPicker();
render();
