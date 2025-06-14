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
    
    // Return a more user-friendly error message
    return NextResponse.json(
      { 
        error: 'Unable to save mood. Please check if MongoDB is running.',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
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
    
    // Return empty array when database is not available
    return NextResponse.json([])
  }
}
