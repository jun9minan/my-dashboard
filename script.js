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

    // Empty cells before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day empty';
        calendarDays.appendChild(emptyCell);
    }

    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.textContent = i;
        if (i === 9) dayCell.classList.add('today'); // Today is April 9
        calendarDays.appendChild(dayCell);
    }
}

generateCalendar();

// ===== TODO MANAGEMENT =====
const todoInput = document.getElementById('todoInput');
const todoAddBtn = document.getElementById('todoAddBtn');
const todoList = document.getElementById('todoList');

todoAddBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;

    const item = document.createElement('div');
    item.className = 'todo-item';
    item.innerHTML = `
        <input type="checkbox" class="todo-check">
        <span class="todo-text">${escapeHtml(text)}</span>
        <button class="todo-delete" aria-label="삭제">×</button>
    `;

    item.querySelector('.todo-check').addEventListener('change', function() {
        item.classList.toggle('completed');
    });

    item.querySelector('.todo-delete').addEventListener('click', function() {
        item.remove();
    });

    todoList.appendChild(item);
    todoInput.value = '';
}

// Attach handlers to existing todos
document.querySelectorAll('.todo-item .todo-check').forEach(check => {
    check.addEventListener('change', function() {
        this.closest('.todo-item').classList.toggle('completed');
    });
});

document.querySelectorAll('.todo-item .todo-delete').forEach(btn => {
    btn.addEventListener('click', function() {
        this.closest('.todo-item').remove();
    });
});

// ===== MEMO MANAGEMENT =====
const memoTitleInput = document.getElementById('memoTitle');
const memoTextInput = document.getElementById('memoText');
const memoSaveBtn = document.getElementById('memoSaveBtn');
const memoList = document.getElementById('memoList');

memoSaveBtn.addEventListener('click', saveMemo);

function saveMemo() {
    const title = memoTitleInput.value.trim();
    const text = memoTextInput.value.trim();

    if (!title || !text) {
        alert('제목과 내용을 모두 입력하세요');
        return;
    }

    const item = document.createElement('div');
    item.className = 'memo-item';
    item.innerHTML = `
        <div class="memo-item-title">${escapeHtml(title)}</div>
        <div class="memo-item-text">${escapeHtml(text)}</div>
    `;

    memoList.insertBefore(item, memoList.firstChild);
    memoTitleInput.value = '';
    memoTextInput.value = '';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== MARKET DATA =====
const marketData = {
    sp500: {
        name: 'S&P 500',
        labels: ['1주', '2주', '3주', '4주'],
        prices: [4950, 4900, 4980, 5000],
        color: 'rgba(45, 91, 227, 0.8)'
    },
    nasdaq: {
        name: '나스닥',
        labels: ['1주', '2주', '3주', '4주'],
        prices: [14700, 14600, 14900, 15000],
        color: 'rgba(26, 158, 92, 0.8)'
    },
    dow: {
        name: '다우존스',
        labels: ['1주', '2주', '3주', '4주'],
        prices: [40200, 40100, 40000, 39950],
        color: 'rgba(217, 64, 64, 0.8)'
    }
};

const financeData = {
    labels: ['2024 Q1', '2024 Q2', '2024 Q3', '2024 Q4', '2025 Q1', '2025 Q2', '2025 Q3', '2025 Q4', '2026 Q1'],
    values: [85000000, 87500000, 90000000, 92000000, 95000000, 96500000, 98000000, 99000000, 100000000]
};

let marketChart = null;
let financeChart = null;

// ===== CHART UTILITIES =====
function getChartColors() {
    const isDark = document.body.classList.contains('dark-mode');
    return {
        text: isDark ? '#f7f6f3' : '#1a1a18',
        grid: isDark ? '#3a3934' : '#e8e6e0',
        tooltip: 'rgba(0, 0, 0, 0.85)'
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
                label: data.name,
                data: data.prices,
                borderColor: data.color,
                backgroundColor: data.color.replace('0.8', '0.1'),
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: data.color,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 7
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
                tooltip: {
                    backgroundColor: colors.tooltip,
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: data.color,
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return 'K$' + (context.parsed.y / 1000).toFixed(1);
                        }
                    }
                }
            },
            scales: {
                y: {
                    grid: {
                        color: colors.grid,
                        drawBorder: false
                    },
                    ticks: {
                        color: colors.text,
                        font: { size: 11, family: "'DM Mono', monospace" },
                        callback: function(value) {
                            return 'K$' + (value / 1000).toFixed(0);
                        }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: colors.text,
                        font: { size: 11 }
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
                label: '총자산',
                data: financeData.values,
                borderColor: 'rgba(45, 91, 227, 0.8)',
                backgroundColor: 'rgba(45, 91, 227, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: 'rgba(45, 91, 227, 0.8)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 6
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
                        font: { size: 12, weight: '500' },
                        usePointStyle: true,
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: colors.tooltip,
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(45, 91, 227, 0.8)',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            return '₩' + (value / 1000000).toFixed(1) + 'M';
                        }
                    }
                }
            },
            scales: {
                y: {
                    grid: {
                        color: colors.grid,
                        drawBorder: false
                    },
                    ticks: {
                        color: colors.text,
                        font: { size: 11, family: "'DM Mono', monospace" },
                        callback: function(value) {
                            return '₩' + (value / 1000000).toFixed(0) + 'M';
                        }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: colors.text,
                        font: { size: 11 }
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

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    initMarketChart();
    initFinanceChart();
});
