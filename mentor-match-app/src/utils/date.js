export const formatDate = (value, locale) => {
  if (!value) return 'N/A'

  // Firestore Timestamp
  if (
    typeof value === 'object' &&
    value !== null &&
    typeof value.toDate === 'function'
  ) {
    const date = value.toDate()
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString(locale)
  }

  // JS Date
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? 'N/A' : value.toLocaleDateString(locale)
  }

  // Numeric epoch
  if (typeof value === 'number') {
    const date = new Date(value)
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString(locale)
  }

  // String (ISO or parseable)
  if (typeof value === 'string') {
    const date = new Date(value)
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString(locale)
  }

  return 'N/A'
}
