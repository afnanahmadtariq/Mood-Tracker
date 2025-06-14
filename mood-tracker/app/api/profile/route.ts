import dbConnect from '@/app/lib/mongodb'
import User from '@/app/models/User'
import { getUserFromRequest } from '@/app/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

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

    const user = await User.findById(userAuth.userId).select('-password')
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect()
    
    const userAuth = getUserFromRequest(request)
    if (!userAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }    const { firstName, lastName, dateOfBirth, profilePicture } = await request.json()

    // Validate input
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' }, 
        { status: 400 }
      )
    }

    interface UserUpdateData {
      firstName: string
      lastName: string
      updatedAt: Date
      dateOfBirth?: Date
      profilePicture?: string
    }

    const updateData: UserUpdateData = {
      firstName,
      lastName,
      updatedAt: new Date()
    }

    if (dateOfBirth) {
      updateData.dateOfBirth = new Date(dateOfBirth)
    }

    if (profilePicture !== undefined) {
      updateData.profilePicture = profilePicture
    }

    const user = await User.findByIdAndUpdate(
      userAuth.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
        profilePicture: user.profilePicture,
        updatedAt: user.updatedAt
      }
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
