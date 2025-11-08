
import mongoose from 'mongoose'

const SavedSchema = new mongoose.Schema({
  lat: Number,
  lon: Number,
  radius: Number,
  prompt: String,
  label: String,
  createdAt: { type: Date, default: Date.now },
  results: Object
}, { _id: false })

const UserSchema = new mongoose.Schema({
  avatar: String,
  email: { type: String, unique: true, index: true, required: true },
  name: String,
  passwordHash: String,
  saved: [SavedSchema]
}, { timestamps: true })

export default mongoose.model('User', UserSchema)
