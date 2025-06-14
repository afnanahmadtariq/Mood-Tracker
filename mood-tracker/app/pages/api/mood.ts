import dbConnect from '@/app/lib/mongodb'
import Mood from '@/app/models/Mood'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()

  if (req.method === 'POST') {
    const { mood, note } = req.body
    const newMood = await Mood.create({ mood, note })
    res.status(201).json(newMood)
  } else if (req.method === 'GET') {
    const moods = await Mood.find({}).sort({ date: -1 })
    res.status(200).json(moods)
  } else {
    res.status(405).end()
  }
}
