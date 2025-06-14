import mongoose from 'mongoose'

const MoodSchema = new mongoose.Schema({
  mood: { type: String, required: true },
  note: String,
  date: { type: Date, default: Date.now },
})

export default mongoose.models.Mood || mongoose.model('Mood', MoodSchema)
