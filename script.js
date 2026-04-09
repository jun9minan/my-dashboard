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
});

// =====================
// 날짜/시간 업데이트
// =====================
function updateDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const day = dayNames[now.getDay()];

    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? '오후' : '오전';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;

    const dateTimeStr = `${year}년 ${month}월 ${date}일 (${day}) ${period} ${displayHours}:${minutes}`;
    document.getElementById('datetime').textContent = dateTimeStr;
}

updateDateTime();
setInterval(updateDateTime, 60000); // 1분마다 업데이트

// =====================
// 증시 데이터
// =====================
const marketData = {
    sp500: {
        name: 'S&P 500',
        labels: ['1주', '2주', '3주', '4주'],
        data: [4950, 4900, 4980, 5000],
        color: 'rgba(0, 113, 227, 0.8)'
    },
    nasdaq: {
        name: '나스닥',
        labels: ['1주', '2주', '3주', '4주'],
        data: [14700, 14600, 14900, 15000],
        color: 'rgba(52, 199, 89, 0.8)'
    },
    dow: {
        name: '다우존스',
        labels: ['1주', '2주', '3주', '4주'],
        data: [40200, 40100, 40000, 39950],
        color: 'rgba(255, 59, 48, 0.8)'
    }
};

// =====================
// Chart.js 초기화
// =====================
let marketChart = null;
let financeChart = null;

function initMarketChart(marketKey = 'sp500') {
    const ctx = document.getElementById('marketChart');
    const data = marketData[marketKey];

    if (marketChart) {
        marketChart.destroy();
    }

    const isDarkMode = document.body.classList.contains('dark-mode');
    const textColor = isDarkMode ? '#f5f5f7' : '#1d1d1f';
    const gridColor = isDarkMode ? '#424245' : '#e5e5e7';

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
                pointRadius: 6,
                pointBackgroundColor: data.color,
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
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
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: textColor,
                        font: {
                            size: 12
                        }
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

    const isDarkMode = document.body.classList.contains('dark-mode');
    const textColor = isDarkMode ? '#f5f5f7' : '#1d1d1f';
    const gridColor = isDarkMode ? '#424245' : '#e5e5e7';

    financeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['1월', '2월', '3월', '4월'],
            datasets: [{
                label: '총자산',
                data: [95000000, 96500000, 98000000, 100000000],
                borderColor: 'rgba(0, 113, 227, 0.8)',
                backgroundColor: 'rgba(0, 113, 227, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: 'rgba(0, 113, 227, 0.8)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
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
                        font: {
                            size: 12,
                            weight: '600'
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
                        font: {
                            size: 12
                        },
                        callback: function(value) {
                            return (value / 1000000) + 'M';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: textColor,
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

// =====================
// 증시 항목 클릭 이벤트
// =====================
document.querySelectorAll('.market-item').forEach(item => {
    item.addEventListener('click', function() {
        // 활성화 상태 변경
        document.querySelectorAll('.market-item').forEach(el => {
            el.classList.remove('active');
        });
        this.classList.add('active');

        // 그래프 업데이트
        const marketKey = this.getAttribute('data-market');
        initMarketChart(marketKey);
    });
});

// =====================
// 초기화
// =====================
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    initMarketChart();
    initFinanceChart();

    // 다크모드 토글 시 그래프도 다시 그리기
    themeToggle.addEventListener('click', function() {
        setTimeout(() => {
            initMarketChart(document.querySelector('.market-item.active').getAttribute('data-market'));
            initFinanceChart();
        }, 300);
    });
});
