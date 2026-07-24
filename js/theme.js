const themeStyles = {
    dark: {
        '--bg-main': '#121212',
        '--bg-surface': '#1e1e1e',
        '--text-main': '#eeeeee',
        '--accent': '#FFD700'
    },
    light: {
        '--bg-main': '#f5f5f7',
        '--bg-surface': '#ffffff',
        '--text-main': '#1c1c1e',
        '--accent': '#b8860b'
    }
};

function applyTheme(theme) {
    const root = document.documentElement;
    const styles = themeStyles[theme] || themeStyles.dark;
    
    Object.keys(styles).forEach(property => {
        root.style.setProperty(property, styles[property]);
    });
    
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        toggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', nextTheme);
    applyTheme(nextTheme);
}

(function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.addEventListener('DOMContentLoaded', () => applyTheme(savedTheme));
})();
