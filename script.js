// ===== PLUGIN REGISTRATION =====
Chart.register(ChartDataLabels);

// ===== THEME MANAGEMENT =====
const themeBtn = document.getElementById('themeBtn');

function loadTheme() {
    const saved = localStorage.getItem('dashboard-theme') || 'light';
    if (saved === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeIcon();
    }
}

function updateThemeIcon() {
    const isDark = document.body.classList.contains('dark-mode');
    themeBtn.querySelector('.theme-icon').textContent = isDark ? '☀️' : '🌙';
}

themeBtn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('dashboard-theme', isDark ? 'dark' : 'light');
    updateThemeIcon();
    if (marketChart) updateCharts();
});

// ===== TIME & DATE =====
function updateDateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();

    document.getElementById('currentTime').textContent = `${hours}:${minutes}`;
    document.getElementById('currentDate').textContent = `${year}년 ${month}월 ${date}일`;
}

updateDateTime();
setInterval(updateDateTime, 60000);

// ===== CALENDAR =====
function generateCalendar(year = 2026, month = 4) {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';

    for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day empty';
        calendarDays.appendChild(emptyCell);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.textContent = i;
        if (i === 9) dayCell.classList.add('today');
        calendarDays.appendChild(dayCell);
    }
}

generateCalendar();

// ===== TODO MANAGEMENT =====
const todoInput = document.getElementById('todoInput');
const todoAddBtn = document.getElementById('todoAddBtn');
const todoList = document.getElementById('todoList');

// Todo item data storage
let todoHistory = {
    '1': { title: '아침 산책 30분', entries: [{ time: '2026-04-09 06:30', completed: true }] },
    '2': { title: '프로젝트 기획서 작성', entries: [{ time: '2026-04-09 09:00', completed: false }] },
    '3': { title: '팀 회의 참석', entries: [{ time: '2026-04-09 10:30', completed: false }] }
};

let nextTodoId = 4;

function setupTodoItemHandlers(item, id) {
    item.querySelector('.todo-check').addEventListener('change', function() {
        item.classList.toggle('completed');
    });

    item.querySelector('.todo-delete').addEventListener('click', function(e) {
        e.stopPropagation();
        delete todoHistory[id];
        item.remove();
    });

    item.style.cursor = 'pointer';
    item.addEventListener('click', function(e) {
        if (!e.target.closest('.todo-check') && !e.target.closest('.todo-delete')) {
            openTodoModal(id);
        }
    });
}

function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;

    const id = String(nextTodoId++);
    const item = document.createElement('div');
    item.className = 'todo-item';
    item.setAttribute('data-id', id);
    item.innerHTML = `
        <input type="checkbox" class="todo-check">
        <span class="todo-text">${escapeHtml(text)}</span>
        <button class="todo-delete" aria-label="삭제">×</button>
    `;

    setupTodoItemHandlers(item, id);

    // Add to history
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    todoHistory[id] = { title: text, entries: [{ time: timeStr, completed: false }] };

    todoList.insertBefore(item, todoList.firstChild);
    todoInput.value = '';
    todoInput.focus();
}

todoAddBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

// Setup existing todo items
document.querySelectorAll('.todo-item').forEach(item => {
    const id = item.getAttribute('data-id');
    setupTodoItemHandlers(item, id);
});

// ===== MEMO MANAGEMENT =====
const memoTitleInput = document.getElementById('memoTitle');
const memoTextInput = document.getElementById('memoText');
const memoSaveBtn = document.getElementById('memoSaveBtn');
const memoList = document.getElementById('memoList');

// Memo item data storage
let memoHistory = {
    '1': { title: '📌 프로젝트 아이디어', entries: [{ time: '2026-04-08 14:20', content: '새로운 대시보드 기능 개선 계획. 사용자 경험을 고려한 UI/UX 업그레이드 필요.' }] }
};

let nextMemoId = 2;

function setupMemoItemHandlers(item, id) {
    item.style.cursor = 'pointer';
    item.addEventListener('click', function() {
        openMemoModal(id);
    });
}

function saveMemo() {
    const title = memoTitleInput.value.trim();
    const text = memoTextInput.value.trim();

    if (!title || !text) {
        alert('제목과 내용을 모두 입력하세요');
        return;
    }

    const id = String(nextMemoId++);
    const item = document.createElement('div');
    item.className = 'memo-item';
    item.setAttribute('data-id', id);
    item.innerHTML = `
        <div class="memo-item-title">📝 ${escapeHtml(title)}</div>
        <div class="memo-item-text">${escapeHtml(text)}</div>
    `;

    setupMemoItemHandlers(item, id);

    // Add to history
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    memoHistory[id] = {
        title: `📝 ${title}`,
        entries: [{ time: timeStr, content: text }]
    };

    memoList.insertBefore(item, memoList.firstChild);
    memoTitleInput.value = '';
    memoTextInput.value = '';
    memoTitleInput.focus();
}

memoSaveBtn.addEventListener('click', saveMemo);
memoTextInput.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') saveMemo();
});

// Setup existing memo items
document.querySelectorAll('.memo-item').forEach(item => {
    const id = item.getAttribute('data-id');
    setupMemoItemHandlers(item, id);
});

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== MARKET DATA =====
const marketData = {
    sp500: {
        name: 'S&P 500',
        labels: ['52주전', '48주전', '44주전', '40주전', '36주전', '32주전', '28주전', '24주전', '20주전', '16주전', '12주전', '8주전', '4주전', '오늘'],
        prices: [4800, 4850, 4920, 4980, 5050, 5100, 5150, 5200, 5250, 5300, 5350, 5380, 5400, 5421],
        color: '#2d5be3'
    },
    nasdaq: {
        name: '나스닥 100',
        labels: ['52주전', '48주전', '44주전', '40주전', '36주전', '32주전', '28주전', '24주전', '20주전', '16주전', '12주전', '8주전', '4주전', '오늘'],
        prices: [17200, 17400, 17650, 17900, 18150, 18350, 18500, 18600, 18700, 18750, 18800, 18850, 18750, 18750.50],
        color: '#16a34a'
    },
    dow: {
        name: '다우존스 지수',
        labels: ['52주전', '48주전', '44주전', '40주전', '36주전', '32주전', '28주전', '24주전', '20주전', '16주전', '12주전', '8주전', '4주전', '오늘'],
        prices: [41500, 41800, 42100, 42400, 42700, 43000, 43200, 43300, 43350, 43400, 43450, 43300, 43200, 43125.75],
        color: '#dc2626'
    }
};

const financeData = {
    labels: ['2024 Q1', '2024 Q2', '2024 Q3', '2024 Q4', '2025 Q1', '2025 Q2', '2025 Q3', '2025 Q4', '2026 Q1'],
    values: [320000000, 335000000, 355000000, 380000000, 395000000, 405000000, 415000000, 420000000, 425000000]
};

let marketChart = null;
let financeChart = null;

// ===== CHART UTILITIES =====
function getChartColors() {
    const isDark = document.body.classList.contains('dark-mode');
    return {
        text: isDark ? '#fafaf8' : '#0f0f0d',
        grid: isDark ? '#2a2926' : '#ede8e2',
        tooltip: isDark ? 'rgba(31, 31, 29, 0.95)' : 'rgba(15, 15, 13, 0.95)'
    };
}

// ===== MARKET CHART =====
function initMarketChart(marketKey = 'sp500') {
    const ctx = document.getElementById('marketChart');
    if (!ctx) return;

    const data = marketData[marketKey];
    const colors = getChartColors();

    if (marketChart) marketChart.destroy();

    marketChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: `${data.name} (주봉)`,
                data: data.prices,
                borderColor: data.color,
                backgroundColor: data.color + '10',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: data.color,
                pointBorderColor: '#fff',
                pointBorderWidth: 2.5,
                pointHoverRadius: 7,
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: { display: false },
                datalabels: {
                    display: true,
                    anchor: 'end',
                    align: 'top',
                    offset: 8,
                    color: data.color,
                    font: { size: 11, weight: '600', family: "'DM Mono', monospace" },
                    formatter: function(value) {
                        return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                    }
                },
                tooltip: {
                    backgroundColor: colors.tooltip,
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: data.color,
                    borderWidth: 2,
                    padding: 12,
                    titleFont: { size: 13, weight: 'bold' },
                    bodyFont: { size: 12 },
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: colors.grid,
                        drawBorder: false,
                        drawTicks: false
                    },
                    ticks: {
                        color: colors.text,
                        font: { size: 12, family: "'DM Mono', monospace", weight: '500' },
                        padding: 12,
                        callback: function(value) {
                            return '$' + (value / 1000).toFixed(0) + 'K';
                        }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: colors.text,
                        font: { size: 11 },
                        padding: 8
                    }
                }
            }
        }
    });
}

// ===== FINANCE CHART =====
function initFinanceChart() {
    const ctx = document.getElementById('financeChart');
    if (!ctx) return;

    const colors = getChartColors();

    if (financeChart) financeChart.destroy();

    financeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: financeData.labels,
            datasets: [{
                label: '총 자산',
                data: financeData.values,
                borderColor: '#2d5be3',
                backgroundColor: '#2d5be310',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#2d5be3',
                pointBorderColor: '#fff',
                pointBorderWidth: 2.5,
                pointHoverRadius: 7,
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: colors.text,
                        font: { size: 13, weight: '600' },
                        usePointStyle: true,
                        padding: 20,
                        boxWidth: 8,
                        boxHeight: 8
                    }
                },
                tooltip: {
                    backgroundColor: colors.tooltip,
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#2d5be3',
                    borderWidth: 2,
                    padding: 12,
                    titleFont: { size: 13, weight: 'bold' },
                    bodyFont: { size: 12 },
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            return '₩' + (value / 1000000).toFixed(1) + '백만';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: colors.grid,
                        drawBorder: false,
                        drawTicks: false
                    },
                    ticks: {
                        color: colors.text,
                        font: { size: 12, family: "'DM Mono', monospace", weight: '500' },
                        padding: 12,
                        callback: function(value) {
                            return '₩' + (value / 1000000).toFixed(0) + '백만';
                        }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: colors.text,
                        font: { size: 11 },
                        padding: 8
                    }
                }
            }
        }
    });
}

function updateCharts() {
    const activeMarket = document.querySelector('.market-item.active');
    const marketKey = activeMarket ? activeMarket.getAttribute('data-market') : 'sp500';
    initMarketChart(marketKey);
    initFinanceChart();
}

// ===== MARKET ITEM CLICK =====
document.querySelectorAll('.market-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.market-item').forEach(el => {
            el.classList.remove('active');
        });
        this.classList.add('active');
        const marketKey = this.getAttribute('data-market');
        initMarketChart(marketKey);
    });
});

// ===== MODAL MANAGEMENT =====
const todoModal = document.getElementById('todoModal');
const memoModal = document.getElementById('memoModal');
const todoModalBody = document.getElementById('todoModalBody');
const memoModalBody = document.getElementById('memoModalBody');

// Open todo modal
function openTodoModal(id) {
    const data = todoHistory[id] || {};
    let html = `<div class="modal-detail"><h3>${data.title || '제목 없음'}</h3>`;

    if (data.entries && data.entries.length > 0) {
        html += '<div class="modal-entries">';
        data.entries.forEach(entry => {
            const status = entry.completed ? '✓ 완료' : '○ 미완료';
            html += `<div class="modal-entry">
                <div class="entry-time">${entry.time}</div>
                <div class="entry-status">${status}</div>
            </div>`;
        });
        html += '</div>';
    }
    html += '</div>';

    todoModalBody.innerHTML = html;
    todoModal.classList.add('active');
}

// Open memo modal
function openMemoModal(id) {
    const data = memoHistory[id] || {};
    let html = `<div class="modal-detail"><h3>${data.title || '제목 없음'}</h3>`;

    if (data.entries && data.entries.length > 0) {
        html += '<div class="modal-entries">';
        data.entries.forEach(entry => {
            html += `<div class="modal-entry">
                <div class="entry-time">${entry.time}</div>
                <div class="entry-content">${entry.content}</div>
            </div>`;
        });
        html += '</div>';
    }
    html += '</div>';

    memoModalBody.innerHTML = html;
    memoModal.classList.add('active');
}

// Close modal on background click
todoModal.addEventListener('click', function(e) {
    if (e.target === todoModal) todoModal.classList.remove('active');
});

memoModal.addEventListener('click', function(e) {
    if (e.target === memoModal) memoModal.classList.remove('active');
});

// Close button handlers
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', function() {
        const modal = this.closest('.modal');
        modal.classList.remove('active');
    });
});

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    initMarketChart();
    initFinanceChart();
});
