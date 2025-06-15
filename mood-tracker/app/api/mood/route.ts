import dbConnect from '@/app/lib/mongodb'
import Mood from '@/app/models/Mood'
import { getUserFromRequest } from '@/app/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const userAuth = getUserFromRequest(request)
    if (!userAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }
    
    const { mood, note } = await request.json()
    const newMood = await Mood.create({ 
      mood, 
      note,
      date: new Date(),
      userId: userAuth.userId
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

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const userAuth = getUserFromRequest(request)
    if (!userAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }
    
    const moods = await Mood.find({ userId: userAuth.userId }).sort({ date: -1 }).limit(50)
    
    return NextResponse.json(moods)
  } catch (error) {
    console.error('Error fetching moods:', error)
    
    // Return empty array when database is not available
    return NextResponse.json([])
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect()
    
    const userAuth = getUserFromRequest(request)
    if (!userAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const moodId = searchParams.get('id')
    
    if (!moodId) {
      return NextResponse.json(
        { error: 'Mood ID is required' }, 
        { status: 400 }
      )
    }
    
    // Find and delete the mood entry, ensuring it belongs to the authenticated user
    const deletedMood = await Mood.findOneAndDelete({ 
      _id: moodId, 
      userId: userAuth.userId 
    })
    
    if (!deletedMood) {
      return NextResponse.json(
        { error: 'Mood entry not found or unauthorized' }, 
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'Mood entry deleted successfully' })
  } catch (error) {
    console.error('Error deleting mood:', error)
    
    return NextResponse.json(
      { 
        error: 'Unable to delete mood entry.',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}
