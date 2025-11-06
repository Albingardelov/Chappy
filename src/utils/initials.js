/**
 * Extraherar initialer från ett namn
 * @param {string} name - Namnet att extrahera initialer från
 * @param {number} maxInitials - Max antal initialer (default: 2)
 * @returns {string} - Initialerna i versaler
 */
export function getInitials(name, maxInitials = 2) {
  if (!name || typeof name !== 'string') {
    return '?'
  }

  // Dela upp namnet i ord och filtrera bort tomma strängar
  const words = name.trim().split(/\s+/).filter(word => word.length > 0)
  
  if (words.length === 0) {
    return '?'
  }

  // Ta första bokstaven från varje ord, upp till maxInitials
  const initials = words
    .slice(0, maxInitials)
    .map(word => word.charAt(0).toUpperCase())
    .join('')

  return initials || '?'
}

/**
 * Genererar en konsistent färg baserat på ett namn
 * Samma namn får alltid samma färg
 * @param {string} name - Namnet att generera färg från
 * @returns {string} - Hex-färg (t.ex. '#FF5733')
 */
export function getColorFromName(name) {
  if (!name || typeof name !== 'string') {
    return '#808080' // Grå som fallback
  }

  // Array med olika färger (inspirerat av Telegram)
  const colors = [
    '#FF6B6B', // Röd
    '#4ECDC4', // Turkos
    '#45B7D1', // Blå
    '#FFA07A', // Lax
    '#98D8C8', // Mint
    '#F7DC6F', // Gul
    '#BB8FCE', // Lila
    '#85C1E2', // Ljusblå
    '#F8B739', // Orange
    '#52BE80', // Grön
    '#EC7063', // Korall
    '#5DADE2', // Himmelblå
    '#F1948A', // Rosa
    '#82E0AA', // Ljusgrön
    '#F4D03F', // Guld
    '#AF7AC5', // Ljuslila
    '#5DADE2', // Cyan
    '#F39C12', // Mörkorange
    '#E74C3C', // Mörkröd
    '#3498DB', // Klarblå
  ]

  // Enkel hash-funktion för att konvertera namn till ett nummer
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  // Använd absolutvärde och modulo för att få ett index
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

