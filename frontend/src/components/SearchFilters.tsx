import React, { useState, useEffect } from 'react'
import { SearchFilters as Filters } from '../types'

interface SearchFiltersProps {
  onSearch: (filters: Filters) => void
  onSortChange: (sortBy: 'date' | 'alphabetical') => void
  darkMode: boolean
  theme: any
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

const SearchFilters: React.FC<SearchFiltersProps> = ({ onSearch, onSortChange, darkMode, theme, defaultRadius = 25 }) => {
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('All')
  const [radius, setRadius] = useState(defaultRadius)
  const [sortBy, setSortBy] = useState<'date' | 'alphabetical'>('date')
  const [showFilters, setShowFilters] = useState(false)

  // Update radius when defaultRadius prop changes
  useEffect(() => {
    setRadius(defaultRadius)
  }, [defaultRadius])

  const handleSearch = () => {
    const filters: Filters = {
      radius,
      keyword: keyword || undefined,
      category: category !== 'All' ? category : undefined,
    }
    onSearch(filters)
  }

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius)
    // Auto-trigger search when radius changes
    const filters: Filters = {
      radius: newRadius,
      keyword: keyword || undefined,
      category: category !== 'All' ? category : undefined,
    }
    onSearch(filters)
  }

  const handleSortChange = (newSort: 'date' | 'alphabetical') => {
    setSortBy(newSort)
    onSortChange(newSort)
  }

  return (
    <div style={{
      backgroundColor: theme.cardBg,
      padding: '24px',
      borderRadius: '16px',
      boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)',
      marginBottom: '28px',
      border: `1px solid ${theme.border}`,
      transition: 'all 0.3s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: theme.text }}>Search Events</h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            backgroundColor: theme.accent,
            border: 'none',
            borderRadius: '12px',
            padding: '10px 20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: 'white',
            transition: 'all 0.3s ease',
            boxShadow: darkMode ? '0 4px 12px rgba(99, 102, 241, 0.4)' : '0 4px 12px rgba(139, 92, 246, 0.3)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = darkMode ? '0 6px 20px rgba(99, 102, 241, 0.6)' : '0 6px 20px rgba(139, 92, 246, 0.5)'}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = darkMode ? '0 4px 12px rgba(99, 102, 241, 0.4)' : '0 4px 12px rgba(139, 92, 246, 0.3)'}
        >
          🔍 {showFilters ? 'Hide' : 'Show'} Filters
        </button>
      </div>

      {showFilters && (
        <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: darkMode ? 'rgba(99, 102, 241, 0.1)' : '#f8f9ff', borderRadius: '12px', border: `2px solid ${theme.accent}` }}>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: theme.text }}>
            Sort By
          </label>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleSortChange('date')}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: sortBy === 'date' ? `3px solid ${theme.accent}` : `2px solid ${theme.border}`,
                backgroundColor: sortBy === 'date' ? (darkMode ? 'rgba(99, 102, 241, 0.2)' : '#ede9fe') : theme.cardBg,
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: sortBy === 'date' ? '700' : '500',
                color: theme.text,
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              📅 Closest Date
            </button>
            <button
              onClick={() => handleSortChange('alphabetical')}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: sortBy === 'alphabetical' ? `3px solid ${theme.accent}` : `2px solid ${theme.border}`,
                backgroundColor: sortBy === 'alphabetical' ? (darkMode ? 'rgba(99, 102, 241, 0.2)' : '#ede9fe') : theme.cardBg,
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: sortBy === 'alphabetical' ? '700' : '500',
                color: theme.text,
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              🔤 Alphabetical
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: theme.text }}>
            Keyword
          </label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search for events..."
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '10px',
              border: `2px solid ${theme.border}`,
              fontSize: '15px',
              backgroundColor: theme.cardBg,
              color: theme.text,
              transition: 'all 0.3s ease',
              outline: 'none',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = theme.accent}
            onBlur={(e) => e.currentTarget.style.borderColor = theme.border}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: theme.text }}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: `2px solid ${theme.border}`,
                fontSize: '15px',
                backgroundColor: theme.cardBg,
                color: theme.text,
                cursor: 'pointer',
                outline: 'none',
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
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: theme.text }}>
              Radius: <span style={{ color: theme.accent, fontWeight: '700' }}>{radius} miles</span>
            </label>
            <input
              type="range"
              min="5"
              max="100"
              value={radius}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              style={{ 
                width: '100%',
                accentColor: theme.accent,
              }}
            />
          </div>
        </div>

        <button
          onClick={handleSearch}
          style={{
            background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentHover} 100%)`,
            color: 'white',
            padding: '14px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: darkMode ? '0 6px 20px rgba(99, 102, 241, 0.4)' : '0 6px 20px rgba(139, 92, 246, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)'
            e.currentTarget.style.boxShadow = darkMode ? '0 8px 25px rgba(99, 102, 241, 0.5)' : '0 8px 25px rgba(139, 92, 246, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = darkMode ? '0 6px 20px rgba(99, 102, 241, 0.4)' : '0 6px 20px rgba(139, 92, 246, 0.3)'
          }}
        >
          🔍 Search Events
        </button>
      </div>
    </div>
  )
}

export default SearchFilters
