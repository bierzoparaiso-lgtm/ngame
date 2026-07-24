const OWNER_WALLET = '0xad81d62c6ca1303c3712d96da642ea5de18755a1';
const THRESHOLD = 5000;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const { wallet_address, amount, bet_type, bet_value } = req.body;

        if (!wallet_address || !amount || !bet_type) {
            return res.status(400).json({ success: false, message: 'Missing parameters' });
        }

        // Simular saldo
        let userBalance = 12000;
        let userBlocked = 7000;

        if (amount > userBalance) {
            return res.status(400).json({ success: false, message: 'Insufficient balance' });
        }

        userBalance -= amount;

        // Ruleta: 0-36
        const resultNumber = Math.floor(Math.random() * 37);
        const color = resultNumber === 0 ? 'green' : (resultNumber % 2 === 0 ? 'black' : 'red');
        let win = false;
        let multiplier = 0;

        switch (bet_type) {
            case 'number':
                win = parseInt(bet_value) === resultNumber;
                multiplier = 36;
                break;
            case 'color':
                win = bet_value === color;
                multiplier = 2;
                break;
            case 'parity':
                if (resultNumber === 0) { win = false; }
                else { win = (bet_value === 'even' && resultNumber % 2 === 0) || (bet_value === 'odd' && resultNumber % 2 !== 0); }
                multiplier = 2;
                break;
        }

        const prize = win ? Math.floor(amount * multiplier) : 0;

        const burnFee = Math.floor(amount * 0.02);
        const gasFee = Math.floor(amount * 0.01);
        const maintenanceFee = Math.floor(amount * 0.02);

        if (win) {
            userBlocked += prize;
            if (userBlocked > THRESHOLD) {
                userBalance += userBlocked - THRESHOLD;
                userBlocked = THRESHOLD;
            }
        }

        return res.status(200).json({
            success: true,
            result_number: resultNumber,
            result_color: color,
            win,
            prize,
            new_balance: userBalance,
            new_blocked: userBlocked,
            fees: {
                burn: burnFee,
                gas: gasFee,
                maintenance: maintenanceFee,
                maintenance_wallet: OWNER_WALLET
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}
