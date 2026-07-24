export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const { wallet_address } = req.body;

        if (!wallet_address) {
            return res.status(400).json({ success: false, message: 'Missing wallet_address' });
        }

        // Simulación de saldo. Reemplazar con consulta real a tu backend compartido
        const userData = {
            balance_total: 12000,
            balance_blocked: 7000,
            balance_available: 5000
        };

        return res.status(200).json({
            success: true,
            ...userData
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}
