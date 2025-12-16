import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import { api } from '../services/api'
import { Event } from '../types'
import { format } from 'date-fns'

const eventIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadEvent(id)
    }
  }, [id])

  const loadEvent = async (eventId: string) => {
    setLoading(true)
    setError(null)
    try {
      const fetchedEvent = await api.getEventById(eventId)
      setEvent(fetchedEvent)
    } catch (err) {
      setError('Failed to load event details.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading event details...</h2>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '12px 20px',
          borderRadius: '4px',
          marginBottom: '20px',
        }}>
          {error || 'Event not found'}
        </div>
        <button
          onClick={() => navigate('/')}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Back to Search
        </button>
      </div>
    )
  }

  const imageUrl = event.images?.[0]?.url || 'https://via.placeholder.com/800x400?text=No+Image'
  const formattedDate = format(new Date(event.startDate), 'EEEE, MMMM d, yyyy')
  const formattedTime = format(new Date(event.startDate), 'h:mm a')

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <header style={{
        backgroundColor: '#007bff',
        color: 'white',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              backgroundColor: 'transparent',
              color: 'white',
              border: '1px solid white',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            ← Back to Search
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <img
            src={imageUrl}
            alt={event.name}
            style={{ width: '100%', height: '400px', objectFit: 'cover' }}
          />

          <div style={{ padding: '32px' }}>
            <h1 style={{ margin: '0 0 16px 0', fontSize: '32px' }}>{event.name}</h1>

            <div style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666', textTransform: 'uppercase' }}>
                  Date & Time
                </h3>
                <p style={{ margin: '0', fontSize: '18px' }}>
                  {formattedDate} at {formattedTime}
                </p>
              </div>

              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666', textTransform: 'uppercase' }}>
                  Venue
                </h3>
                <p style={{ margin: '0', fontSize: '18px' }}>{event.venue.name}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#666' }}>
                  {event.venue.address}
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#666' }}>
                  {event.venue.city}, {event.venue.state && `${event.venue.state}, `}{event.venue.country}
                </p>
              </div>

              {event.priceRange && (
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666', textTransform: 'uppercase' }}>
                    Price Range
                  </h3>
                  <p style={{ margin: '0', fontSize: '18px', color: '#28a745' }}>
                    {event.priceRange.currency} {event.priceRange.min} - {event.priceRange.max}
                  </p>
                </div>
              )}

              {event.description && (
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666', textTransform: 'uppercase' }}>
                    Description
                  </h3>
                  <p style={{ margin: '0', fontSize: '16px', lineHeight: '1.6' }}>
                    {event.description}
                  </p>
                </div>
              )}
            </div>

            {event.url && (
              <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#007bff',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontWeight: '500',
                  marginBottom: '32px',
                }}
              >
                Get Tickets
              </a>
            )}

            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>Location</h3>
              <div style={{ height: '400px', borderRadius: '8px', overflow: 'hidden' }}>
                <MapContainer
                  center={[event.venue.location.lat, event.venue.location.lng]}
                  zoom={15}
                  style={{ width: '100%', height: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker
                    position={[event.venue.location.lat, event.venue.location.lng]}
                    icon={eventIcon}
                  >
                    <Popup>{event.venue.name}</Popup>
                  </Marker>
                </MapContainer>
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${event.venue.location.lat},${event.venue.location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  marginTop: '16px',
                  color: '#007bff',
                  textDecoration: 'none',
                  fontSize: '16px',
                }}
              >
                Get Directions →
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default EventDetailPage
