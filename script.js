// =====================
// 다크 모드 관리
// =====================
const themeToggle = document.getElementById('themeToggle');

function loadTheme() {
    const savedTheme = localStorage.getItem('dashboard-theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeIcon(true);
    }
}

function updateThemeIcon(isDarkMode) {
    const icon = themeToggle.querySelector('.theme-icon');
    icon.textContent = isDarkMode ? '☀️' : '🌙';
}

themeToggle.addEventListener('click', () => {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('dashboard-theme', isDarkMode ? 'dark' : 'light');
    updateThemeIcon(isDarkMode);
    updateCharts();
});

// =====================
// 날짜/시간 업데이트
// =====================
function updateDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    document.getElementById('timeDisplay').textContent = `${hours}:${minutes}`;
    document.getElementById('dateDisplay').textContent = `${year}년 ${month}월 ${date}일`;
}

updateDateTime();
setInterval(updateDateTime, 60000);

// =====================
// 달력 생성
// =====================
function generateCalendar(year = 2026, month = 4) {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';

    const days = ['일', '월', '화', '수', '목', '금', '토'];
    days.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day header';
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });

    for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyCell);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        if (i === 9) dayCell.classList.add('today');
        dayCell.textContent = i;
        calendarGrid.appendChild(dayCell);
    }
}

generateCalendar();

// =====================
// To do 항목 관리
// =====================
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

    const todoItem = document.createElement('div');
    todoItem.className = 'todo-item';
    todoItem.innerHTML = `
        <div class="todo-check">
            <span class="todo-check-mark">✓</span>
        </div>
        <span class="todo-text">${text}</span>
        <button class="todo-del">×</button>
    `;

    todoItem.querySelector('.todo-check').addEventListener('click', () => {
        todoItem.classList.toggle('done');
    });

    todoItem.querySelector('.todo-del').addEventListener('click', () => {
        todoItem.remove();
    });

    todoList.insertBefore(todoItem, todoList.firstChild);
    todoInput.value = '';
}

document.querySelectorAll('.todo-item').forEach(item => {
    item.querySelector('.todo-check').addEventListener('click', function() {
        item.classList.toggle('done');
    });

    item.querySelector('.todo-del').addEventListener('click', function() {
        item.remove();
    });
});

// =====================
// 메모 관리
// =====================
const memoTitleInput = document.getElementById('memoTitleInput');
const memoTextarea = document.getElementById('memoTextarea');
const memoSaveBtn = document.getElementById('memoSaveBtn');
const memoList = document.getElementById('memoList');

memoSaveBtn.addEventListener('click', saveMemo);

function saveMemo() {
    const title = memoTitleInput.value.trim();
    const text = memoTextarea.value.trim();

    if (!title || !text) {
        alert('제목과 내용을 입력하세요');
        return;
    }

    const memoItem = document.createElement('div');
    memoItem.className = 'memo-item';
    memoItem.innerHTML = `
        <div class="memo-preview">
            <p class="memo-title">${escapeHtml(title)}</p>
            <p class="memo-text">${escapeHtml(text)}</p>
        </div>
    `;

    memoList.insertBefore(memoItem, memoList.firstChild);
    memoTitleInput.value = '';
    memoTextarea.value = '';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// =====================
// 증시 데이터
// =====================
const marketData = {
    sp500: {
        name: 'S&P 500',
        labels: ['1주', '2주', '3주', '4주'],
        data: [4950, 4900, 4980, 5000],
        color: 'rgba(45, 91, 227, 0.8)'
    },
    nasdaq: {
        name: '나스닥',
        labels: ['1주', '2주', '3주', '4주'],
        data: [14700, 14600, 14900, 15000],
        color: 'rgba(26, 158, 92, 0.8)'
    },
    dow: {
        name: '다우존스',
        labels: ['1주', '2주', '3주', '4주'],
        data: [40200, 40100, 40000, 39950],
        color: 'rgba(217, 64, 64, 0.8)'
    }
};

const financeData = {
    labels: ['2024 Q1', '2024 Q2', '2024 Q3', '2024 Q4', '2025 Q1', '2025 Q2', '2025 Q3', '2025 Q4', '2026 Q1'],
    data: [85000000, 87500000, 90000000, 92000000, 95000000, 96500000, 98000000, 99000000, 100000000]
};

let marketChart = null;
let financeChart = null;

// =====================
// Chart 초기화
// =====================
function getChartTextColor() {
    const isDark = document.body.classList.contains('dark-mode');
    return isDark ? '#f7f6f3' : '#1a1a18';
}

function getChartGridColor() {
    const isDark = document.body.classList.contains('dark-mode');
    return isDark ? '#3a3934' : '#e8e6e0';
}

function initMarketChart(marketKey = 'sp500') {
    const ctx = document.getElementById('marketChart');
    const data = marketData[marketKey];

    if (marketChart) {
        marketChart.destroy();
    }

    const textColor = getChartTextColor();
    const gridColor = getChartGridColor();

    marketChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: data.name + ' (주봉)',
                data: data.data,
                borderColor: data.color,
                backgroundColor: data.color.replace('0.8', '0.1'),
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: data.color,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
                    beginAtZero: false,
                    grid: {
                        color: gridColor,
                        drawBorder: false
                    },
                    ticks: {
                        color: textColor,
                        font: { size: 11 },
                        callback: function(value) {
                            return 'K$' + (value / 1000).toFixed(0);
                        }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: textColor,
                        font: { size: 11 }
                    }
                }
            }
        }
    });
}

function initFinanceChart() {
    const ctx = document.getElementById('financeChart');

    if (financeChart) {
        financeChart.destroy();
    }

    const textColor = getChartTextColor();
    const gridColor = getChartGridColor();

    financeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: financeData.labels,
            datasets: [{
                label: '총자산',
                data: financeData.data,
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
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: textColor,
                        font: { size: 12, weight: '500' },
                        usePointStyle: true,
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
                    beginAtZero: false,
                    grid: {
                        color: gridColor,
                        drawBorder: false
                    },
                    ticks: {
                        color: textColor,
                        font: { size: 11 },
                        callback: function(value) {
                            return '₩' + (value / 1000000).toFixed(0) + 'M';
                        }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: textColor,
                        font: { size: 11 }
                    }
                }
            }
        }
    });
}

// =====================
// 증시 항목 클릭
// =====================
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

function updateCharts() {
    const activeMarket = document.querySelector('.market-item.active');
    const marketKey = activeMarket ? activeMarket.getAttribute('data-market') : 'sp500';
    initMarketChart(marketKey);
    initFinanceChart();
}

// =====================
// 초기화
// =====================
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    initMarketChart();
    initFinanceChart();
});
