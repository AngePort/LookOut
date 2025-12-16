import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Icon } from 'leaflet'
import { Location, Event } from '../types'
import 'leaflet/dist/leaflet.css'

interface MapViewProps {
  center: Location
  events: Event[]
  onEventClick?: (event: Event) => void
  zoom?: number
}

const eventIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const userIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

function MapController({ center }: { center: Location }) {
  const map = useMap()

  useEffect(() => {
    map.setView([center.lat, center.lng])
  }, [center, map])

  return null
}

const MapView: React.FC<MapViewProps> = ({ center, events, onEventClick, zoom = 13 }) => {
  return (
    <div style={{ width: '100%', height: '500px' }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
      >
        <MapController center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[center.lat, center.lng]} icon={userIcon}>
          <Popup>Your Location</Popup>
        </Marker>
        {events.map((event) => (
          <Marker
            key={event.id}
            position={[event.venue.location.lat, event.venue.location.lng]}
            icon={eventIcon}
            eventHandlers={{
              click: () => onEventClick && onEventClick(event)
            }}
          >
            <Popup>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>{event.name}</h3>
                <p style={{ margin: '4px 0', fontSize: '12px' }}>{event.venue.name}</p>
                <p style={{ margin: '4px 0', fontSize: '12px' }}>
                  {new Date(event.startDate).toLocaleDateString()}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default MapView
