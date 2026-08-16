import { connectDB, Vehicle } from '../../lib/db.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(204).end()

  await connectDB()
  const plate = String(req.query.plate).toUpperCase().trim()

  if (req.method === 'GET') {
    const v = await Vehicle.findOne({ licensePlate: plate })
    if (!v) return res.status(404).json({ error: 'Vehicle not found' })
    return res.json(v)
  }

  if (req.method === 'DELETE') {
    const v = await Vehicle.findOneAndDelete({ licensePlate: plate })
    if (!v) return res.status(404).json({ error: 'Vehicle not found' })
    return res.json({ message: 'Deleted ' + plate })
  }

  res.status(405).json({ error: 'Method not allowed' })
}