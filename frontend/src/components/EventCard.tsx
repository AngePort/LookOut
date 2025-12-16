import React from 'react'
import { Event } from '../types'
import { formatDistance } from '../utils/distance'
import { format } from 'date-fns'

interface EventCardProps {
  event: Event
  onClick?: () => void
  darkMode?: boolean
  theme?: any
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick, darkMode = false, theme }) => {
  const eventName = event.title || event.name
  const imageUrl = event.imageUrl || event.images?.[0]?.url || 'https://via.placeholder.com/300x200?text=No+Image'
  const formattedDate = format(new Date(event.startDate), 'EEE, MMM d, yyyy • h:mm a')

  const defaultTheme = {
    cardBg: darkMode ? '#1e293b' : '#ffffff',
    text: darkMode ? '#f1f5f9' : '#1e293b',
    textSecondary: darkMode ? '#cbd5e1' : '#64748b',
    accent: darkMode ? '#6366f1' : '#8b5cf6',
    success: '#10b981',
  }

  const activeTheme = theme || defaultTheme

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: activeTheme.cardBg,
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: darkMode ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(139, 92, 246, 0.15)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-8px)'
          e.currentTarget.style.boxShadow = darkMode ? '0 12px 30px rgba(99, 102, 241, 0.4)' : '0 12px 30px rgba(139, 92, 246, 0.3)'
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = darkMode ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(139, 92, 246, 0.15)'
        }
      }}
    >
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src={imageUrl}
          alt={eventName}
          style={{
            width: '100%',
            height: '220px',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(10px)',
          borderRadius: '8px',
          padding: '6px 12px',
          color: 'white',
          fontSize: '12px',
          fontWeight: '600',
        }}>
          {format(new Date(event.startDate), 'MMM d')}
        </div>
      </div>
      <div style={{ padding: '20px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: '700', color: activeTheme.text, lineHeight: '1.3' }}>
          {eventName}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ margin: 0, color: activeTheme.textSecondary, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🕐 {formattedDate}
          </p>
          <p style={{ margin: 0, color: activeTheme.textSecondary, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            📍 {event.venue.name}
          </p>
          {(event.venue.city || event.venue.state || event.venue.country) && (
            <p style={{ margin: 0, color: activeTheme.textSecondary, fontSize: '13px', paddingLeft: '22px' }}>
              {event.venue.city}{event.venue.city && (event.venue.state || event.venue.country) ? ', ' : ''}
              {event.venue.state || event.venue.country}
            </p>
          )}
        </div>
        {event.distance && (
          <div style={{ marginTop: '12px', padding: '8px 12px', background: darkMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', border: `1px solid ${activeTheme.accent}` }}>
            <p style={{ margin: 0, color: activeTheme.accent, fontSize: '14px', fontWeight: '600' }}>
              📍 {formatDistance(event.distance)}
            </p>
          </div>
        )}
        {event.priceRange && (
          <div style={{ marginTop: '8px', padding: '8px 12px', background: darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: `1px solid ${activeTheme.success}` }}>
            <p style={{ margin: 0, color: activeTheme.success, fontSize: '14px', fontWeight: '600' }}>
              💵 {event.priceRange.currency} {event.priceRange.min} - {event.priceRange.max}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default EventCard
