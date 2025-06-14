import { useState } from 'react'

export default function MoodForm() {
  const [mood, setMood] = useState('')
  const [note, setNote] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/mood', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood, note }),
    })
    setMood('')
    setNote('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <select value={mood} onChange={(e) => setMood(e.target.value)} required>
        <option value="">Select mood</option>
        <option>Happy</option>
        <option>Sad</option>
        <option>Angry</option>
        <option>Excited</option>
        <option>Anxious</option>
      </select>
      <textarea
        placeholder="Optional note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <button type="submit">Save Mood</button>
    </form>
  )
}
