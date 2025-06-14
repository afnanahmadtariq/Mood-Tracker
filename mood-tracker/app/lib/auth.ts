import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

// Use a consistent fallback secret to prevent JWT verification errors
const JWT_SECRET_FALLBACK = process.env.JWT_SECRET_FALLBACK
const JWT_SECRET = process.env.JWT_SECRET || JWT_SECRET_FALLBACK

// Log a warning if using fallback secret
if (!process.env.JWT_SECRET && typeof window === 'undefined') {
  console.warn('Warning: No JWT_SECRET environment variable found. Using development fallback secret.')
}

export interface TokenPayload {
  userId: string
  email: string
}

export function generateToken(payload: TokenPayload): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  if (!JWT_SECRET) {
    // Optionally log an error here
    return null;
  }
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

export function getUserFromRequest(request: NextRequest): TokenPayload | null {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                request.cookies.get('token')?.value

  if (!token) return null

  return verifyToken(token)
}
