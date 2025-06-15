/**
 * Utility functions for safe date handling to prevent hydration mismatches
 */

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date'
    }
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    }
    
    return dateObj.toLocaleDateString('en-US', defaultOptions)
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid date'
  }
}

export function formatTime(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (isNaN(dateObj.getTime())) {
      return 'Invalid time'
    }
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      ...options
    }
    
    return dateObj.toLocaleTimeString('en-US', defaultOptions)
  } catch (error) {
    console.error('Error formatting time:', error)
    return 'Invalid time'
  }
}

export function isRecentDate(date: string | Date, daysAgo: number = 7): boolean {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (isNaN(dateObj.getTime())) {
      return false
    }
    
    const cutoffDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
    return dateObj > cutoffDate
  } catch (error) {
    console.error('Error checking recent date:', error)
    return false
  }
}

export function getDaysFromNow(date: string | Date): number {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (isNaN(dateObj.getTime())) {
      return 0
    }
    
    const now = new Date()
    const diffTime = now.getTime() - dateObj.getTime()
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
  } catch (error) {
    console.error('Error calculating days from now:', error)
    return 0
  }
}

export function isSameDay(date1: string | Date, date2: string | Date): boolean {
  try {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2
    
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
      return false
    }
    
    return d1.toDateString() === d2.toDateString()
  } catch (error) {
    console.error('Error comparing dates:', error)
    return false
  }
}
