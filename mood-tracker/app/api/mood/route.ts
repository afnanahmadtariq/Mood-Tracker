import dbConnect from '@/app/lib/mongodb'
import Mood from '@/app/models/Mood'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const { mood, note } = await request.json()
    const newMood = await Mood.create({ 
      mood, 
      note,
      date: new Date()
    })
    
    return NextResponse.json(newMood, { status: 201 })
  } catch (error) {
    console.error('Error creating mood:', error)
    return NextResponse.json(
      { error: 'Failed to create mood' }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    await dbConnect()
    
    const moods = await Mood.find({}).sort({ date: -1 }).limit(50)
    
    return NextResponse.json(moods)
  } catch (error) {
    console.error('Error fetching moods:', error)
    return NextResponse.json(
      { error: 'Failed to fetch moods' }, 
      { status: 500 }
    )
  }
}
