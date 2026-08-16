import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  licensePlate: { type: String, required: true, unique: true, uppercase: true, trim: true },
  ownerName:    { type: String, required: true, trim: true },
  vehicleType:  { type: String, default: 'Rickshaw' },
  image:        { type: String, default: '' },        // base64 data URL
  payment:      { type: Number, default: 0 },
  registrationDate: { type: Date, default: Date.now }
})

export const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', schema)

export async function connectDB() {
  // 👇 CHANGED HERE from MONGO_URI to MONGODB_URI
  if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_URI)
}