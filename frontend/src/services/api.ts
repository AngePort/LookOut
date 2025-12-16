import axios from 'axios'
import { Event, SearchFilters } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const api = {
  searchEvents: async (filters: SearchFilters): Promise<Event[]> => {
    try {
      const requestBody = {
        latitude: filters.location?.lat,
        longitude: filters.location?.lng,
        radius: filters.radius,
        category: filters.category,
        keyword: filters.keyword,
      }
      const response = await axios.post(`${API_BASE_URL}/events/search`, requestBody)
      return response.data.events || []
    } catch (error) {
      console.error('Error searching events:', error)
      throw error
    }
  },

  getEventById: async (id: string): Promise<Event | null> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/events/${id}`)
      return response.data.event || null
    } catch (error) {
      console.error('Error fetching event:', error)
      throw error
    }
  },

  getNearbyEvents: async (lat: number, lng: number, radius: number = 25): Promise<Event[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/events/nearby`, {
        params: { lat, lng, radius }
      })
      return response.data.events || []
    } catch (error) {
      console.error('Error fetching nearby events:', error)
      throw error
    }
  },
}
