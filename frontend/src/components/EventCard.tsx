import React from 'react'
import { Event } from '../types'
import { formatDistance } from '../utils/distance'
import { format } from 'date-fns'

interface EventCardProps {
  event: Event
  onClick?: () => void
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const imageUrl = event.images?.[0]?.url || 'https://via.placeholder.com/300x200?text=No+Image'
  const formattedDate = format(new Date(event.startDate), 'EEE, MMM d, yyyy • h:mm a')

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
        }
      }}
    >
      <img
        src={imageUrl}
        alt={event.name}
        style={{
          width: '100%',
          height: '200px',
          objectFit: 'cover',
        }}
      />
      <div style={{ padding: '16px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
          {event.name}
        </h3>
        <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
          {formattedDate}
        </p>
        <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
          {event.venue.name}
        </p>
        <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
          {event.venue.city}, {event.venue.country}
        </p>
        {event.distance && (
          <p style={{ margin: '8px 0 0 0', color: '#007bff', fontSize: '14px', fontWeight: '500' }}>
            {formatDistance(event.distance)}
          </p>
        )}
        {event.priceRange && (
          <p style={{ margin: '8px 0 0 0', color: '#28a745', fontSize: '14px', fontWeight: '500' }}>
            {event.priceRange.currency} {event.priceRange.min} - {event.priceRange.max}
          </p>
        )}
      </div>
    </div>
  )
}

export default EventCard
