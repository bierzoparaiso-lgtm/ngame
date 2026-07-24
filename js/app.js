function renderLanguageSelector() {
    const langSelect = document.getElementById('lang-select');
    if (!langSelect) return;
    langSelect.innerHTML = '';
    const currentLang = localStorage.getItem('lang') || 'ES';
    availableLanguages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang;
        option.textContent = lang;
        option.selected = (lang === currentLang);
        langSelect.appendChild(option);
    });
}

function changeLanguage(lang) {
    const targetLang = lang.toUpperCase();
    localStorage.setItem('lang', targetLang);
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = getText(key, targetLang);
    });
}

function initNavigation() {
    document.querySelectorAll('.nav-bar .nav-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const targetTab = item.getAttribute('data-tab');
            document.querySelectorAll('.tab-view').forEach(view => view.classList.remove('active'));
            document.getElementById(`tab-${targetTab}`).classList.add('active');
            document.getElementById('game-screen').style.display = 'none';
        });
    });
    document.querySelectorAll('.subtabs .subtab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadLeaderboard(btn.getAttribute('data-top'));
        });
    });
}

function initAuth() {
    const nullifierHash = sessionStorage.getItem('nullifier_hash');
    const walletAddress = sessionStorage.getItem('wallet_address');
    if (nullifierHash && walletAddress) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('player-id-value').textContent = nullifierHash.substring(0, 8) + '...';
        document.getElementById('wallet-address-value').textContent = walletAddress.substring(0, 6) + '...' + walletAddress.substring(walletAddress.length - 4);
        loadBalance();
        renderGames();
        loadLeaderboard('winners');
    } else {
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('btn-worldid').style.display = 'block';
        document.getElementById('btn-wallet').style.display = 'none';
        document.getElementById('auth-status').style.display = 'none';
    }
}

async function handleWorldIDProof(proof) {
    const statusMsg = document.getElementById('auth-status');
    const currentLang = localStorage.getItem('lang') || 'ES';
    statusMsg.textContent = getText('verifying', currentLang);
    statusMsg.style.display = 'block';
    document.getElementById('btn-worldid').style.display = 'none';
    try {
        const response = await fetch('/api/verify', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ proof })
        });
        const data = await response.json();
        if (data.success && data.nullifier_hash) {
            sessionStorage.setItem('nullifier_hash', data.nullifier_hash);
            statusMsg.textContent = "World ID ✅";
            document.getElementById('btn-wallet').style.display = 'block';
        } else { throw new Error('Verification failed'); }
    } catch (error) {
        statusMsg.textContent = "Error World ID";
        document.getElementById('btn-worldid').style.display = 'block';
    }
}

function handleWalletConnect() {
    const statusMsg = document.getElementById('auth-status');
    const currentLang = localStorage.getItem('lang') || 'ES';
    if (!window.MiniKit?.commands?.walletAddress) {
        statusMsg.textContent = getText('wallet_error', currentLang); return;
    }
    window.MiniKit.commands.walletAddress().then(response => {
        if (response?.address) {
            sessionStorage.setItem('wallet_address', response.address);
            statusMsg.textContent = getText('wallet_connected', currentLang);
            setTimeout(() => initAuth(), 800);
        } else { statusMsg.textContent = getText('wallet_error', currentLang); }
    }).catch(() => { statusMsg.textContent = getText('wallet_error', currentLang); });
}

function logout() {
    sessionStorage.removeItem('nullifier_hash');
    sessionStorage.removeItem('wallet_address');
    window.location.reload();
}

async function loadBalance() {
    const wallet = sessionStorage.getItem('wallet_address');
    if (!wallet) return;
    try {
        const response = await fetch('/api/balance', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ wallet_address: wallet })
        });
        const data = await response.json();
        if (data.success) {
            document.getElementById('balance-total').textContent = data.balance_total + ' Ñ';
            document.getElementById('balance-available').textContent = data.balance_available + ' Ñ';
            document.getElementById('balance-blocked').textContent = data.balance_blocked + ' Ñ';
        }
    } catch (error) { console.error('Error loading balance:', error); }
}

function renderGames() {
    const grid = document.getElementById('games-grid');
    grid.innerHTML = '';
    const currentLang = localStorage.getItem('lang') || 'ES';
    GAMES.filter(g => g.enabled).forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `<div class="game-icon">${game.icon}</div><h3 data-i18n="${game.nameKey}">${getText(game.nameKey, currentLang)}</h3>`;
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.textContent = getText('btn_play', currentLang);
        btn.addEventListener('click', () => openGame(game));
        card.appendChild(btn);
        grid.appendChild(card);
    });
}

function openGame(game) {
    document.getElementById('game-screen').style.display = 'block';
    document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active'));
    const content = document.getElementById('game-content');
    const currentLang = localStorage.getItem('lang') || 'ES';

    if (game.id === 'coinflip') {
        content.innerHTML = `
            <h3 data-i18n="game_heads_tails">${getText('game_heads_tails', currentLang)}</h3>
            <label data-i18n="bet_amount">${getText('bet_amount', currentLang)}</label>
            <input type="number" id="bet-amount" min="${game.minBet}" max="${game.maxBet}" value="${game.minBet}" step="100">
            <button class="btn btn-primary" id="btn-choose-heads">${getText('btn_bet_heads', currentLang)}</button>
            <button class="btn btn-primary" id="btn-choose-tails">${getText('btn_bet_tails', currentLang)}</button>
            <div id="game-result"></div>
        `;
        document.getElementById('btn-choose-heads').addEventListener('click', () => playGame(game, 'heads'));
        document.getElementById('btn-choose-tails').addEventListener('click', () => playGame(game, 'tails'));
    } else if (game.id === 'roulette') {
        content.innerHTML = `
            <h3 data-i18n="game_roulette">${getText('game_roulette', currentLang)}</h3>
            <label data-i18n="bet_amount">${getText('bet_amount', currentLang)}</label>
            <input type="number" id="bet-amount" min="${game.minBet}" max="${game.maxBet}" value="${game.minBet}" step="100">
            <button class="btn btn-primary" id="btn-bet-red">${getText('bet_color_red', currentLang)}</button>
            <button class="btn btn-primary" id="btn-bet-black">${getText('bet_color_black', currentLang)}</button>
            <input type="number" id="bet-number" min="0" max="36" placeholder="${getText('bet_number', currentLang)}" style="margin-top:8px;">
            <button class="btn btn-primary" id="btn-bet-number">${getText('bet_number', currentLang)}</button>
            <div id="game-result"></div>
        `;
        document.getElementById('btn-bet-red').addEventListener('click', () => playGame(game, 'color', 'red'));
        document.getElementById('btn-bet-black').addEventListener('click', () => playGame(game, 'color', 'black'));
        document.getElementById('btn-bet-number').addEventListener('click', () => {
            const num = document.getElementById('bet-number').value;
            if (num !== '') playGame(game, 'number', num);
        });
    }
}

async function playGame(game, choice, betValue = null) {
    const wallet = sessionStorage.getItem('wallet_address');
    const amount = parseInt(document.getElementById('bet-amount').value);
    const currentLang = localStorage.getItem('lang') || 'ES';

    if (amount < game.minBet || amount > game.maxBet) {
        alert('Bet out of range'); return;
    }

    const body = { wallet_address: wallet, amount, choice };
    if (betValue) body.bet_type = choice; else body.choice = choice;
    if (betValue) body.bet_value = betValue;

    try {
        const response = await fetch(game.endpoint, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
        });
        const data = await response.json();
        const resultDiv = document.getElementById('game-result');
        if (data.success) {
            resultDiv.innerHTML = `
                <p><strong>${data.win ? getText('result_win', currentLang) : getText('result_lose', currentLang)}</strong></p>
                ${data.win ? `<p>${getText('prize_label', currentLang)}: ${data.prize} Ñ</p>` : ''}
                <p>${getText('balance_available', currentLang)}: ${data.new_balance} Ñ</p>
                <p>${getText('balance_locked', currentLang)}: ${data.new_blocked} Ñ</p>
            `;
            loadBalance();
        } else {
            resultDiv.innerHTML = `<p>Error: ${data.message}</p>`;
        }
    } catch (error) {
        document.getElementById('game-result').innerHTML = `<p>Connection error</p>`;
    }
}

async function loadLeaderboard(type) {
    try {
        const response = await fetch('/api/leaderboard');
        const data = await response.json();
        if (data.success) {
            const tbody = document.getElementById('leaderboard-body');
            tbody.innerHTML = '';
            const list = data[type] || [];
            if (list.length === 0) {
                tbody.innerHTML = `<tr><td colspan="3" class="table-empty-cell" data-i18n="table_empty">No data yet</td></tr>`;
            } else {
                list.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `<td>${item.rank}</td><td>${item.player}</td><td>${item.amount || item.streak} Ñ</td>`;
                    tbody.appendChild(row);
                });
            }
        }
    } catch (error) { console.error('Error loading leaderboard:', error); }
}

async function loadHistory() {
    const wallet = sessionStorage.getItem('wallet_address');
    if (!wallet) return;
    try {
        const response = await fetch('/api/history', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ wallet_address: wallet })
        });
        const data = await response.json();
        const list = document.getElementById('history-list');
        list.innerHTML = '';
        if (data.success && data.history.length > 0) {
            data.history.forEach(h => {
                const div = document.createElement('div');
                div.textContent = `${h.date} - ${h.game}: ${h.result} (${h.amount} Ñ → ${h.prize} Ñ)`;
                list.appendChild(div);
            });
        } else {
            list.innerHTML = `<p data-i18n="no_history">No transactions yet</p>`;
        }
        document.getElementById('history-panel').style.display = 'block';
    } catch (error) { console.error('Error loading history:', error); }
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.IDKit) {
        window.IDKit.init({
            app_id: "app_XXXXXXXXXXXXXXXX",
            action: "signin",
            onSuccess: (result) => handleWorldIDProof(result)
        });
    }
    const defaultLang = localStorage.getItem('lang') || 'ES';
    renderLanguageSelector();
    changeLanguage(defaultLang);
    initNavigation();
    initAuth();

    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('lang-select').addEventListener('change', (e) => changeLanguage(e.target.value));

    document.getElementById('btn-worldid').addEventListener('click', () => {
        if (window.IDKit) { window.IDKit.open(); }
        else { document.getElementById('auth-status').textContent = getText('wallet_error', localStorage.getItem('lang') || 'ES'); }
    });
    document.getElementById('btn-wallet').addEventListener('click', handleWalletConnect);
    document.getElementById('btn-logout').addEventListener('click', logout);
    document.getElementById('btn-history').addEventListener('click', loadHistory);
    document.getElementById('btn-back-games').addEventListener('click', () => {
        document.getElementById('game-screen').style.display = 'none';
        document.getElementById('tab-games').classList.add('active');
    });
});

window.addEventListener('languagesUpdated', () => {
    renderLanguageSelector();
    changeLanguage(localStorage.getItem('lang') || 'ES');
});
