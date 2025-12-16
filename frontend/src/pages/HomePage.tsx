import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import EventCard from '../components/EventCard'
import SearchFilters from '../components/SearchFilters'
import { api } from '../services/api'
import { Event, Location, SearchFilters as Filters } from '../types'
import { calculateDistance } from '../utils/distance'

interface HomePageProps {
  userLocation: Location | null
  locationError: string | null
}

const HomePage: React.FC<HomePageProps> = ({ userLocation, locationError }) => {
  const navigate = useNavigate()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchLocation, setSearchLocation] = useState<Location | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'alphabetical'>('date')
  const [currentRadius, setCurrentRadius] = useState(25)

  const currentLocation = searchLocation || userLocation

  // Theme object with vibrant colors
  const theme = {
    bg: darkMode ? '#0f172a' : '#f8f9ff',
    cardBg: darkMode ? '#1e293b' : '#ffffff',
    headerBg: darkMode ? '#1e293b' : '#ffffff',
    headerGradient: darkMode 
      ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)' 
      : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)',
    text: darkMode ? '#f1f5f9' : '#1e293b',
    textSecondary: darkMode ? '#cbd5e1' : '#64748b',
    accent: darkMode ? '#6366f1' : '#8b5cf6',
    accentHover: darkMode ? '#818cf8' : '#a78bfa',
    border: darkMode ? '#334155' : '#e2e8f0',
    error: '#ef4444',
    success: '#10b981',
  }

  const sortEvents = (eventsToSort: Event[], sortType: 'date' | 'alphabetical') => {
    if (sortType === 'date') {
      return [...eventsToSort].sort((a, b) => {
        const dateA = new Date(a.startDate).getTime()
        const dateB = new Date(b.startDate).getTime()
        return dateA - dateB
      })
    } else {
      return [...eventsToSort].sort((a, b) => a.name.localeCompare(b.name))
    }
  }

  const handleSortChange = (newSort: 'date' | 'alphabetical') => {
    setSortBy(newSort)
    setEvents(prevEvents => sortEvents(prevEvents, newSort))
  }

  useEffect(() => {
    if (userLocation) {
      loadNearbyEvents(userLocation)
    }
  }, [userLocation])

  const loadNearbyEvents = async (location: Location, radius: number = 25) => {
    setLoading(true)
    setError(null)
    try {
      const fetchedEvents = await api.getNearbyEvents(location.lat, location.lng, radius)
      const eventsWithDistance = fetchedEvents.map((event) => ({
        ...event,
        distance: event.venue.location ? calculateDistance(location, event.venue.location) : undefined,
      }))
      const sortedEvents = sortEvents(eventsWithDistance, sortBy)
      setEvents(sortedEvents)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load events. Please try again.'
      setError(errorMessage)
      console.error('Load events error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (filters: Filters) => {
    if (!currentLocation) return

    setLoading(true)
    setError(null)
    setCurrentRadius(filters.radius) // Store the current radius
    try {
      const searchFilters = {
        ...filters,
        location: currentLocation,
      }
      const fetchedEvents = await api.searchEvents(searchFilters)
      const eventsWithDistance = fetchedEvents.map((event) => ({
        ...event,
        distance: event.venue.location ? calculateDistance(currentLocation, event.venue.location) : undefined,
      }))
      const sortedEvents = sortEvents(eventsWithDistance, sortBy)
      setEvents(sortedEvents)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to search events. Please try again.'
      setError(errorMessage)
      console.error('Search events error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEventClick = (event: Event) => {
    navigate(`/event/${event.id}`)
  }

  if (!userLocation) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading your location...</h2>
        {locationError && <p style={{ color: '#dc3545' }}>{locationError}</p>}
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.bg, transition: 'background-color 0.3s ease' }}>
      <header style={{
        background: theme.headerGradient,
        color: 'white',
        padding: '24px 20px',
        boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(139, 92, 246, 0.2)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0', fontSize: '32px', fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>👁️ LookOut</h1>
            <p style={{ margin: '8px 0 0 0', fontSize: '15px', opacity: 0.95 }}>
              Discover amazing events happening near you
            </p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              padding: '10px 16px',
              cursor: 'pointer',
              fontSize: '20px',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {locationError && (
          <div style={{
            backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.2)' : '#fff3cd',
            color: darkMode ? '#fca5a5' : '#856404',
            padding: '12px 20px',
            borderRadius: '12px',
            marginBottom: '20px',
            border: `2px solid ${darkMode ? '#ef4444' : '#ffc107'}`,
          }}>
            {locationError}
          </div>
        )}

        <SearchFilters 
          onSearch={handleSearch} 
          onSortChange={handleSortChange} 
          darkMode={darkMode} 
          theme={theme} 
          defaultRadius={currentRadius}
        />

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: theme.text, fontSize: '18px', fontWeight: '600' }}>Loading events...</p>
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.2)' : '#f8d7da',
            color: darkMode ? '#fca5a5' : '#721c24',
            padding: '12px 20px',
            borderRadius: '12px',
            marginBottom: '20px',
            border: `2px solid ${theme.error}`,
          }}>
            {error}
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: theme.textSecondary, fontSize: '16px' }}>No events found. Try adjusting your search filters.</p>
          </div>
        )}

        {!loading && events.length > 0 && (
          <>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '26px', fontWeight: '700', color: theme.text }}>
              Found {events.length} event{events.length !== 1 ? 's' : ''}
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
            }}>
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => handleEventClick(event)}
                  darkMode={darkMode}
                  theme={theme}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default HomePage
