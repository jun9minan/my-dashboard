// 다크 모드 토글
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

// 저장된 테마 설정 불러오기
function loadTheme() {
    const savedTheme = localStorage.getItem('dashboard-theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeIcon(true);
    }
}

// 테마 아이콘 업데이트
function updateThemeIcon(isDarkMode) {
    const icon = themeToggle.querySelector('.theme-icon');
    icon.textContent = isDarkMode ? '☀️' : '🌙';
}

// 테마 토글
themeToggle.addEventListener('click', () => {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('dashboard-theme', isDarkMode ? 'dark' : 'light');
    updateThemeIcon(isDarkMode);
});

// 페이지 로드 시 테마 설정
document.addEventListener('DOMContentLoaded', loadTheme);
