export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });
    try {
        const { proof } = req.body;
        if (!proof) return res.status(400).json({ success: false, message: 'Missing proof parameter' });
        const worldcoinPayload = {
            app_id: "app_id: "3164421492350725576",
            action: "signin",
            signal: "0",
            proof: proof
        };
        const response = await fetch('https://developer.worldcoin.org/api/v1/verify', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(worldcoinPayload)
        });
        const data = await response.json();
        if (response.ok && data.nullifier_hash) {
            return res.status(200).json({ success: true, nullifier_hash: data.nullifier_hash });
        } else {
            return res.status(400).json({ success: false, error: data });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}
