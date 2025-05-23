import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility functions for the TalentSol ATS application
 */

/**
 * Combines multiple class names using clsx and tailwind-merge
 * This allows for conditional and dynamic class names with proper Tailwind CSS handling
 *
 * @param inputs - Class names to combine
 * @returns Combined class name string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date consistently across the application
 *
 * @param date - Date to format (Date object or string)
 * @param options - Intl.DateTimeFormatOptions to customize the format
 * @returns Formatted date string
 */
export function formatDate(
  date?: Date | string | null,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }
) {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (dateObj instanceof Date && !isNaN(dateObj.getTime())) {
    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
  }

  return typeof date === 'string' ? date : '';
}

/**
 * Truncates a string to a specified length and adds an ellipsis if needed
 *
 * @param str - String to truncate
 * @param length - Maximum length before truncation
 * @returns Truncated string
 */
export function truncateString(str: string, length: number = 50): string {
  if (!str) return '';
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

/**
 * Generates initials from a name (e.g., "John Doe" -> "JD")
 *
 * @param name - Full name
 * @param maxLength - Maximum number of initials to return
 * @returns String of initials
 */
export function getInitials(name: string, maxLength: number = 2): string {
  if (!name) return '';

  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, maxLength);
}

/**
 * Debounces a function call
 *
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function(...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Formats a number as currency
 *
 * @param value - Number to format
 * @param currency - Currency code (default: USD)
 * @param locale - Locale for formatting (default: en-US)
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Formats a number with thousands separators
 *
 * @param value - Number to format
 * @param locale - Locale for formatting (default: en-US)
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Generates a random ID
 *
 * @param length - Length of the ID (default: 8)
 * @returns Random ID string
 */
export function generateId(length: number = 8): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, or empty object)
 *
 * @param value - Value to check
 * @returns True if the value is empty
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Capitalizes the first letter of each word in a string
 *
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalizeWords(str: string): string {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Formats a phone number to a standard format (e.g., (123) 456-7890)
 *
 * @param phone - Phone number to format
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
  }

  // Return original if it doesn't match expected formats
  return phone;
}

/**
 * ATS-specific color utilities
 */
export const atsColors = {
  blue: {
    light: 'bg-ats-blue/10 text-ats-dark-blue border-ats-blue/20',
    medium: 'bg-ats-blue/20 text-ats-dark-blue border-ats-blue/30',
    solid: 'bg-ats-blue text-white',
  },
  purple: {
    light: 'bg-ats-purple/10 text-ats-dark-purple border-ats-purple/20',
    medium: 'bg-ats-purple/20 text-ats-dark-purple border-ats-purple/30',
    solid: 'bg-ats-purple text-white',
  },
  status: {
    active: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    inactive: 'bg-gray-100 text-gray-800 border-gray-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
  }
};
