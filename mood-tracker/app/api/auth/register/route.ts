import dbConnect from '@/app/lib/mongodb'
import User from '@/app/models/User'
import { generateToken } from '@/app/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

interface UserRegistrationData {
  email: string
  password: string
  firstName: string
  lastName: string
  dateOfBirth?: Date
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const { email, password, firstName, lastName, dateOfBirth } = await request.json()

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, password, first name, and last name are required' }, 
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' }, 
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' }, 
        { status: 400 }
      )
    }    // Create user
    const userData: UserRegistrationData = {
      email,
      password,
      firstName,
      lastName
    }

    if (dateOfBirth) {
      userData.dateOfBirth = new Date(dateOfBirth)
    }

    const user = await User.create(userData)

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email
    })

    // Create response
    const response = NextResponse.json({
      message: 'Registration successful',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
        profilePicture: user.profilePicture
      }
    }, { status: 201 })

    // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
