import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MapView from '../components/MapView'
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

  const currentLocation = searchLocation || userLocation

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
        distance: calculateDistance(location, event.venue.location),
      }))
      setEvents(eventsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0)))
    } catch (err) {
      setError('Failed to load events. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (filters: Filters) => {
    if (!currentLocation) return

    setLoading(true)
    setError(null)
    try {
      const searchFilters = {
        ...filters,
        location: currentLocation,
      }
      const fetchedEvents = await api.searchEvents(searchFilters)
      const eventsWithDistance = fetchedEvents.map((event) => ({
        ...event,
        distance: calculateDistance(currentLocation, event.venue.location),
      }))
      setEvents(eventsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0)))
    } catch (err) {
      setError('Failed to search events. Please try again.')
      console.error(err)
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
    <div style={{ minHeight: '100vh' }}>
      <header style={{
        backgroundColor: '#007bff',
        color: 'white',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ margin: '0', fontSize: '28px' }}>Local Event Finder</h1>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
            Discover events happening near you
          </p>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {locationError && (
          <div style={{
            backgroundColor: '#fff3cd',
            color: '#856404',
            padding: '12px 20px',
            borderRadius: '4px',
            marginBottom: '20px',
          }}>
            {locationError}
          </div>
        )}

        <SearchFilters onSearch={handleSearch} />

        {currentLocation && (
          <div style={{ marginBottom: '20px' }}>
            <MapView
              center={currentLocation}
              events={events}
              onEventClick={handleEventClick}
            />
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading events...</p>
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '12px 20px',
            borderRadius: '4px',
            marginBottom: '20px',
          }}>
            {error}
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>No events found. Try adjusting your search filters.</p>
          </div>
        )}

        {!loading && events.length > 0 && (
          <>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '24px' }}>
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
