export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const { wallet_address } = req.body;

        if (!wallet_address) {
            return res.status(400).json({ success: false, message: 'Missing wallet_address' });
        }

        // Datos simulados. Reemplazar con consulta real a tu backend.
        const history = [
            { game: 'Heads or Tails', amount: 500, result: 'win', prize: 950, date: '2026-07-24' },
            { game: 'Roulette', amount: 200, result: 'loss', prize: 0, date: '2026-07-23' },
            { game: 'Heads or Tails', amount: 1000, result: 'win', prize: 1900, date: '2026-07-22' }
        ];

        return res.status(200).json({ success: true, history });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}
