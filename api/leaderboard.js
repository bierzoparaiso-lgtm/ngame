export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        // Datos simulados. Reemplazar con consulta real a tu backend.
        const leaderboard = {
            winners: [
                { rank: 1, player: '0xa1b2...c3d4', amount: 50000 },
                { rank: 2, player: '0xe5f6...a7b8', amount: 35000 },
                { rank: 3, player: '0xc9d0...e1f2', amount: 20000 }
            ],
            risky: [
                { rank: 1, player: '0xa1b2...c3d4', amount: 120000 },
                { rank: 2, player: '0xe5f6...a7b8', amount: 90000 },
                { rank: 3, player: '0xc9d0...e1f2', amount: 75000 }
            ],
            streaks: [
                { rank: 1, player: '0xc9d0...e1f2', streak: 12 },
                { rank: 2, player: '0xa1b2...c3d4', streak: 8 },
                { rank: 3, player: '0xe5f6...a7b8', streak: 5 }
            ]
        };

        return res.status(200).json({ success: true, ...leaderboard });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}
