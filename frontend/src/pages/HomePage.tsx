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
        background: darkMode 
          ? 'linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f3460 100%)' 
          : 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ffd23f 100%)',
        color: 'white',
        padding: '32px 20px',
        boxShadow: darkMode 
          ? '0 8px 32px rgba(255, 0, 128, 0.3), 0 0 60px rgba(138, 43, 226, 0.2)' 
          : '0 8px 32px rgba(255, 107, 53, 0.4), 0 0 60px rgba(255, 210, 63, 0.3)',
        borderBottom: darkMode ? '4px solid #ff0080' : '4px solid #ff6b35',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Retro pattern overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: darkMode ? 0.1 : 0.15,
          background: darkMode 
            ? 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 0, 128, 0.3) 2px, rgba(255, 0, 128, 0.3) 4px)'
            : 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.1) 10px, rgba(255, 255, 255, 0.1) 20px)',
          pointerEvents: 'none',
        }}></div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div>
            <h1 style={{ 
              margin: '0', 
              fontSize: '56px', 
              fontWeight: '900',
              fontFamily: '"Arial Black", "Arial Bold", Gadget, sans-serif',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              textShadow: darkMode 
                ? `
                  3px 3px 0px #ff0080,
                  6px 6px 0px #ff00ff,
                  9px 9px 0px #8a2be2,
                  12px 12px 20px rgba(138, 43, 226, 0.6),
                  0 0 40px rgba(255, 0, 128, 0.8),
                  0 0 80px rgba(255, 0, 255, 0.6)
                `
                : `
                  3px 3px 0px #d45d00,
                  6px 6px 0px #8b3a00,
                  9px 9px 0px #5a2400,
                  12px 12px 20px rgba(139, 58, 0, 0.5),
                  0 0 30px rgba(255, 210, 63, 0.8)
                `,
              transform: 'skew(-2deg)',
              display: 'inline-block',
              background: darkMode
                ? 'linear-gradient(180deg, #fff 0%, #ff00ff 50%, #8a2be2 100%)'
                : 'linear-gradient(180deg, #fff 0%, #ffd700 50%, #ff6b35 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: darkMode ? 'retroPulse 2s ease-in-out infinite' : 'none',
            }}>
              👁️ LOOKOUT
            </h1>
            <p style={{ 
              margin: '12px 0 0 0', 
              fontSize: '18px', 
              opacity: 0.95,
              fontWeight: '700',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontFamily: 'monospace',
              textShadow: darkMode 
                ? '2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 10px rgba(255, 0, 128, 0.5)'
                : '2px 2px 4px rgba(0, 0, 0, 0.3)',
              transform: 'skew(-1deg)',
            }}>
              ⚡ Discover rad events near you ⚡
            </p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              background: darkMode 
                ? 'linear-gradient(135deg, #ff0080 0%, #ff00ff 100%)'
                : 'linear-gradient(135deg, #ffd23f 0%, #ff6b35 100%)',
              border: darkMode ? '3px solid #ff00ff' : '3px solid #ff6b35',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              cursor: 'pointer',
              fontSize: '24px',
              transition: 'all 0.3s ease',
              boxShadow: darkMode 
                ? '0 0 20px rgba(255, 0, 255, 0.6), 0 4px 15px rgba(0, 0, 0, 0.5)'
                : '0 0 20px rgba(255, 210, 63, 0.6), 0 4px 15px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'rotate(0deg)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'rotate(180deg) scale(1.1)'
              e.currentTarget.style.boxShadow = darkMode 
                ? '0 0 40px rgba(255, 0, 255, 1), 0 8px 20px rgba(0, 0, 0, 0.6)'
                : '0 0 40px rgba(255, 210, 63, 1), 0 8px 20px rgba(0, 0, 0, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'rotate(0deg) scale(1)'
              e.currentTarget.style.boxShadow = darkMode 
                ? '0 0 20px rgba(255, 0, 255, 0.6), 0 4px 15px rgba(0, 0, 0, 0.5)'
                : '0 0 20px rgba(255, 210, 63, 0.6), 0 4px 15px rgba(0, 0, 0, 0.3)'
            }}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Add keyframe animation for dark mode pulse */}
        <style>{`
          @keyframes retroPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
        `}</style>
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

            {/* End of results message */}
            <div style={{
              marginTop: '40px',
              padding: '24px',
              textAlign: 'center',
              backgroundColor: darkMode ? 'rgba(255, 0, 128, 0.15)' : 'rgba(255, 210, 63, 0.2)',
              borderRadius: '16px',
              border: darkMode ? '2px dashed #ff0080' : '2px dashed #ff6b35',
            }}>
              <p style={{
                margin: '0 0 8px 0',
                fontSize: '20px',
                fontWeight: '900',
                color: theme.text,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}>
                🎯 End of {currentRadius} Mile Radius
              </p>
              <p style={{
                margin: 0,
                fontSize: '15px',
                color: theme.textSecondary,
                fontWeight: '600',
              }}>
                Increase radius or adjust filters to discover more events
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default HomePage
