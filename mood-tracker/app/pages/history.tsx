import { useEffect, useState } from 'react'

export default function HistoryPage() {
  const [moods, setMoods] = useState([])

  useEffect(() => {
    fetch('/api/mood')
      .then((res) => res.json())
      .then(setMoods)
  }, [])

  return (
    <div>
      <h1>Mood History</h1>
      <ul>
        {moods.map((m: any) => (
          <li key={m._id}>
            {new Date(m.date).toLocaleDateString()}: {m.mood} - {m.note}
          </li>
        ))}
      </ul>
    </div>
  )
}

