import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

export interface TokenPayload {
  userId: string
  email: string
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch (error) {
    return null
  }
}

export function getUserFromRequest(request: NextRequest): TokenPayload | null {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                request.cookies.get('token')?.value

  if (!token) return null

  return verifyToken(token)
}
