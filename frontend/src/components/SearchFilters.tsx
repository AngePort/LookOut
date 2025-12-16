import React, { useState } from 'react'
import { SearchFilters as Filters } from '../types'

interface SearchFiltersProps {
  onSearch: (filters: Filters) => void
  defaultRadius?: number
}

const categories = [
  'All',
  'Music',
  'Sports',
  'Arts & Theatre',
  'Family',
  'Film',
  'Miscellaneous',
]

const SearchFilters: React.FC<SearchFiltersProps> = ({ onSearch, defaultRadius = 25 }) => {
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('All')
  const [radius, setRadius] = useState(defaultRadius)
  const [startDate, setStartDate] = useState('')

  const handleSearch = () => {
    const filters: Filters = {
      radius,
      keyword: keyword || undefined,
      category: category !== 'All' ? category : undefined,
      startDate: startDate || undefined,
    }
    onSearch(filters)
  }

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '20px',
    }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>Search Events</h2>

      <div style={{ display: 'grid', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Keyword
          </label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search for events..."
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px',
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '14px',
              }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '14px',
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Radius: {radius} km
          </label>
          <input
            type="range"
            min="5"
            max="100"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <button
          onClick={handleSearch}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '12px',
            borderRadius: '4px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
        >
          Search Events
        </button>
      </div>
    </div>
  )
}

export default SearchFilters
