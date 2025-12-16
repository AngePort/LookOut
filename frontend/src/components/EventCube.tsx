import React from 'react'
import { Event } from '../types'
import { format } from 'date-fns'

interface EventCubeProps {
  event: Event
  onClick?: () => void
}

const EventCube: React.FC<EventCubeProps> = ({ event, onClick }) => {
  const eventName = event.title || event.name
  const imageUrl = event.imageUrl || event.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=No+Image'
  const formattedDate = format(new Date(event.startDate), 'MMM d, yyyy')
  const formattedTime = format(new Date(event.startDate), 'h:mm a')

  // Get category badge color
  const getCategoryColor = (category?: string) => {
    const colors: { [key: string]: string } = {
      'Music': '#8b5cf6',
      'Sports': '#ef4444',
      'Arts & Theater': '#ec4899',
      'Food & Drink': '#f59e0b',
      'Festivals': '#10b981',
      'Comedy': '#f59e0b',
      'Family': '#3b82f6',
    }
    return colors[category || ''] || '#6b7280'
  }

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0) scale(1)'
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
        }
      }}
    >
      {/* Event Image */}
      <div style={{ position: 'relative', paddingTop: '100%', overflow: 'hidden' }}>
        <img
          src={imageUrl}
          alt={eventName}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        {/* Category Badge */}
        {(event.category || event.classifications?.[0]?.segment?.name) && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: getCategoryColor(event.category || event.classifications?.[0]?.segment?.name),
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            {event.category || event.classifications[0].segment.name}
          </div>
        )}
      </div>

      {/* Event Info */}
      <div style={{ padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <h3
          style={{
            margin: '0 0 12px 0',
            fontSize: '16px',
            fontWeight: '700',
            lineHeight: '1.4',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '44px',
          }}
        >
          {eventName}
        </h3>

        {/* Venue Location */}
        {event.venue && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '6px',
              marginBottom: '10px',
            }}
          >
            <span style={{ fontSize: '18px', marginTop: '1px' }}>📍</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#374151', lineHeight: '1.3' }}>
                {event.venue.name}
              </p>
              {(event.venue.city || event.venue.state || event.venue.country) && (
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                  {event.venue.city}{event.venue.city && (event.venue.state || event.venue.country) ? ', ' : ''}
                  {event.venue.state || event.venue.country}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Date & Time */}
        <div style={{ marginTop: 'auto' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '6px',
            }}
          >
            <span style={{ fontSize: '18px' }}>📅</span>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#374151' }}>
              {formattedDate}
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '18px' }}>🕐</span>
            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
              {formattedTime}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventCube
