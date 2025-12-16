import { Location } from '../types'

export function calculateDistance(loc1: Location, loc2: Location): number {
  const R = 6371
  const dLat = toRad(loc2.lat - loc1.lat)
  const dLon = toRad(loc2.lng - loc1.lng)
  const lat1 = toRad(loc1.lat)
  const lat2 = toRad(loc2.lat)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return Math.round(distance * 10) / 10
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m away`
  }
  return `${km.toFixed(1)}km away`
}
