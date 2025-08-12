/**
 * Utility functions for handling RTL/LTR text direction and mixed content
 */

import { cn } from './utils'

/**
 * Checks if the current pathname indicates Arabic locale
 */
export function isArabicLocale(pathname: string): boolean {
  return pathname.includes('/ar')
}

/**
 * Returns the appropriate text alignment class based on locale
 */
export function getTextAlignment(isArabic: boolean, alignment?: 'start' | 'center' | 'end'): string {
  if (alignment === 'center') return 'text-center'
  if (alignment === 'end') return isArabic ? 'text-left' : 'text-right'
  
  // Default alignment (start)
  return isArabic ? 'text-right' : 'text-left'
}

/**
 * Returns CSS classes for proper mixed content handling
 * This prevents English text from being reversed in RTL contexts
 */
export function getMixedContentClasses(additionalClasses?: string): string {
  return cn(
    'mixed-content', // This class has unicode-bidi: isolate and direction: auto
    additionalClasses
  )
}

/**
 * Returns the appropriate direction attribute value
 */
export function getDirection(isArabic: boolean): 'rtl' | 'ltr' {
  return isArabic ? 'rtl' : 'ltr'
}

/**
 * Comprehensive text container classes for mixed content
 */
export function getTextContainerClasses(
  isArabic: boolean,
  options?: {
    alignment?: 'start' | 'center' | 'end'
    additionalClasses?: string
    enableMixedContent?: boolean
  }
): string {
  const { alignment = 'start', additionalClasses = '', enableMixedContent = true } = options || {}
  
  return cn(
    getTextAlignment(isArabic, alignment),
    enableMixedContent && 'mixed-content',
    additionalClasses
  )
}

/**
 * Creates props for text containers that need proper direction handling
 */
export function getTextDirectionProps(isArabic: boolean, enableMixedContent: boolean = true) {
  return {
    dir: enableMixedContent ? 'auto' : getDirection(isArabic),
    className: enableMixedContent ? 'mixed-content' : ''
  }
}

/**
 * Detects if text contains mixed content (Arabic + Latin scripts)
 */
export function hasMixedContent(text: string): boolean {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/
  const latinPattern = /[A-Za-z]/
  
  return arabicPattern.test(text) && latinPattern.test(text)
}

/**
 * Returns appropriate classes for table cells with mixed content
 */
export function getTableCellClasses(
  isArabic: boolean,
  additionalClasses?: string
): string {
  return cn(
    'px-6 py-4',
    getTextAlignment(isArabic),
    'mixed-content',
    additionalClasses
  )
}
