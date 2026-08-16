import { connectDB, Vehicle } from '../../lib/db.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(204).end()

  await connectDB()

  if (req.method === 'GET') return res.json(await Vehicle.find().sort({ licensePlate: 1 }))

  if (req.method === 'POST') {
    const body = req.body || {}
    if (!body.licensePlate || !body.ownerName)
      return res.status(400).json({ error: 'licensePlate and ownerName are required' })
    const plate = String(body.licensePlate).toUpperCase().trim()
    const saved = await Vehicle.findOneAndUpdate(
      { licensePlate: plate },
      { ...body, licensePlate: plate },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    return res.status(201).json(saved)
  }

  res.status(405).json({ error: 'Method not allowed' })
}