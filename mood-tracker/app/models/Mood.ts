import mongoose from 'mongoose'

const MoodSchema = new mongoose.Schema({
  mood: { type: String, required: true },
  note: String,
  date: { type: Date, default: Date.now },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
})

export default mongoose.models.Mood || mongoose.model('Mood', MoodSchema)
