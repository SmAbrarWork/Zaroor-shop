const inRange = (current, start, end) => current >= start && current <= end

export const getActiveEventByDate = (events, now = new Date()) => {
  const eventMatch = events.find((event) => {
    const start = new Date(event.startDate)
    const end = new Date(event.endDate)
    return inRange(now, start, end)
  })

  return eventMatch ?? events[0]
}

export const getTimeLeft = (targetDate) => {
  const distance = new Date(targetDate).getTime() - Date.now()

  if (distance <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
  }

  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((distance / (1000 * 60)) % 60),
    seconds: Math.floor((distance / 1000) % 60),
    isExpired: false,
  }
}

export const formatCurrencyPKR = (value) =>
  new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(value)
