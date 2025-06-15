'use client'

import { useIsClient } from '../hooks/useIsClient'
import { formatDate, formatTime } from '../lib/dateUtils'

interface ClientDateProps {
  date: string | Date
  format?: 'date' | 'time' | 'datetime'
  options?: Intl.DateTimeFormatOptions
  fallback?: string
}

/**
 * Component that safely formats dates on the client side only
 * Prevents hydration mismatches due to timezone differences
 */
export default function ClientDate({ 
  date, 
  format = 'date', 
  options,
  fallback = 'Loading...' 
}: ClientDateProps) {
  const isClient = useIsClient()
  
  if (!isClient) {
    return <span>{fallback}</span>
  }
  
  switch (format) {
    case 'time':
      return <span>{formatTime(date, options)}</span>
    case 'datetime':
      return <span>{formatDate(date, options)} {formatTime(date)}</span>
    case 'date':
    default:
      return <span>{formatDate(date, options)}</span>
  }
}
