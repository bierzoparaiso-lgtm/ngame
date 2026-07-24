const OWNER_WALLET = '0xad81d62c6ca1303c3712d96da642ea5de18755a1';
const THRESHOLD = 5000;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const { wallet_address, amount, choice } = req.body;

        if (!wallet_address || !amount || !choice) {
            return res.status(400).json({ success: false, message: 'Missing parameters' });
        }

        if (!['heads', 'tails'].includes(choice)) {
            return res.status(400).json({ success: false, message: 'Invalid choice' });
        }

        if (amount < 100 || amount > 5000) {
            return res.status(400).json({ success: false, message: 'Bet out of range' });
        }

        // Simular consulta de saldo. Reemplazar con tu lógica real.
        let userBalance = 12000;
        let userBlocked = 7000;

        if (amount > userBalance) {
            return res.status(400).json({ success: false, message: 'Insufficient balance' });
        }

        // Descontar apuesta
        userBalance -= amount;

        // Generar resultado aleatorio
        const result = Math.random() < 0.5 ? 'heads' : 'tails';
        const win = result === choice;
        const prize = win ? Math.floor(amount * 1.9) : 0;

        // Calcular comisiones
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
            result,
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
