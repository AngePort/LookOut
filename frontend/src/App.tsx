import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import EventDetailPage from './pages/EventDetailPage'
import { Location } from './types'

function App() {
  const [userLocation, setUserLocation] = useState<Location | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error('Error getting location:', error)
          setLocationError('Unable to get your location. Please enable location services.')
          setUserLocation({ lat: 40.7128, lng: -74.0060 })
        }
      )
    } else {
      setLocationError('Geolocation is not supported by your browser.')
      setUserLocation({ lat: 40.7128, lng: -74.0060 })
    }
  }, [])

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                userLocation={userLocation}
                locationError={locationError}
              />
            }
          />
          <Route path="/event/:id" element={<EventDetailPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
