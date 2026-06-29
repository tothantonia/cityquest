export function isQuizAvailable() {
  return new Date().getHours() >= 18
}

export function unlockCountdown() {
  const now = new Date()
  const totalMins = 18 * 60 - (now.getHours() * 60 + now.getMinutes())
  if (totalMins <= 0) return null
  const h = Math.floor(totalMins / 60)
  const m = totalMins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export function todayLabel() {
  return new Date().toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}
