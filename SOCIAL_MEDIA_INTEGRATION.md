# Social Media Events Integration Guide

## Overview

This guide explains how to add social media event sources to the Local Event Finder app.

## Architecture Approach

### Multi-Source Event Aggregator Pattern

```
Frontend
    ↓
Backend API Gateway
    ↓
Event Aggregator Service
    ├→ Ticketmaster Service (✅ Already implemented)
    ├→ Eventbrite Service (New)
    ├→ Meetup Service (New)
    └→ Facebook Events Service (New - Limited)
    ↓
Unified Event Format
    ↓
Return to Frontend
```

## Recommended Social Media Sources

### 1. Eventbrite (BEST for Social Events)

**Pros:**
- ✅ Free tier: 1,000 requests/day
- ✅ Great for community/social events
- ✅ Easy API integration
- ✅ Good documentation
- ✅ Similar to Ticketmaster format

**Setup:**
1. Register at [eventbrite.com/platform](https://www.eventbrite.com/platform/)
2. Get API key (OAuth token)
3. No credit card required

**API Endpoints:**
```
GET /events/search/?location.address={location}&expand=venue
```

### 2. Meetup API

**Pros:**
- ✅ Best for local meetups and social gatherings
- ✅ Community-focused events
- ✅ Free tier available

**Setup:**
1. Register at [meetup.com/api](https://www.meetup.com/api/)
2. OAuth 2.0 authentication

### 3. Facebook Events (Limited)

**Challenges:**
- ❌ Public event discovery deprecated in 2018
- ⚠️ Only works for pages you manage
- ⚠️ Requires Facebook App approval
- ⚠️ Complex OAuth flow

**Alternative:**
- Use Facebook Page Events if you have page access
- Better for businesses posting their own events

### 4. Alternatives

**Universe.com API**
- Ticketing platform
- Social events focus

**Dice.fm API**
- Music events, nightlife
- Social scene focused

**Eventful API** (Deprecated but alternatives exist)
- Was good for local events

## Implementation Plan

### Phase 1: Add Eventbrite

Let me show you how to add Eventbrite integration:

#### 1. Update Backend Environment Variables

```bash
# backend/.env
TICKETMASTER_API_KEY=your_key
EVENTBRITE_API_KEY=your_eventbrite_token
MEETUP_API_KEY=your_meetup_key
```

#### 2. Create Eventbrite Service

```typescript
// backend/src/services/eventbrite.ts

import axios from 'axios';
import { Event, SearchFilters } from '../models/Event';

const EVENTBRITE_API_URL = 'https://www.eventbriteapi.com/v3';
const API_TOKEN = process.env.EVENTBRITE_API_KEY || '';

export async function searchEvents(filters: SearchFilters): Promise<Event[]> {
  try {
    const params: any = {
      'location.address': `${filters.location?.lat},${filters.location?.lng}`,
      'location.within': `${filters.radius}km`,
      expand: 'venue',
      token: API_TOKEN,
    };

    if (filters.keyword) {
      params.q = filters.keyword;
    }

    if (filters.startDate) {
      params['start_date.range_start'] = filters.startDate;
    }

    const response = await axios.get(`${EVENTBRITE_API_URL}/events/search/`, { params });

    return response.data.events.map(normalizeEventbriteEvent);
  } catch (error) {
    console.error('Error fetching from Eventbrite:', error);
    return [];
  }
}

function normalizeEventbriteEvent(ebEvent: any): Event {
  return {
    id: `eb-${ebEvent.id}`,
    name: ebEvent.name.text,
    description: ebEvent.description.text,
    startDate: ebEvent.start.utc,
    endDate: ebEvent.end.utc,
    venue: {
      name: ebEvent.venue?.name || 'Online Event',
      address: ebEvent.venue?.address?.address_1 || '',
      city: ebEvent.venue?.address?.city || '',
      state: ebEvent.venue?.address?.region,
      country: ebEvent.venue?.address?.country || '',
      location: {
        lat: parseFloat(ebEvent.venue?.latitude) || 0,
        lng: parseFloat(ebEvent.venue?.longitude) || 0,
      },
    },
    images: ebEvent.logo ? [{
      url: ebEvent.logo.url,
      width: ebEvent.logo.width,
      height: ebEvent.logo.height,
    }] : [],
    url: ebEvent.url,
    category: ebEvent.category?.name || 'Community',
    priceRange: ebEvent.is_free ? undefined : {
      min: 0,
      max: 0,
      currency: ebEvent.currency || 'USD',
    },
  };
}
```

#### 3. Create Event Aggregator Service

```typescript
// backend/src/services/eventAggregator.ts

import * as ticketmaster from './ticketmaster';
import * as eventbrite from './eventbrite';
import { Event, SearchFilters } from '../models/Event';

export async function searchAllSources(filters: SearchFilters): Promise<Event[]> {
  try {
    // Fetch from all sources in parallel
    const [tmEvents, ebEvents] = await Promise.all([
      ticketmaster.searchEvents(filters).catch(() => []),
      eventbrite.searchEvents(filters).catch(() => []),
    ]);

    // Combine and deduplicate
    const allEvents = [...tmEvents, ...ebEvents];
    const uniqueEvents = deduplicateEvents(allEvents);

    // Sort by distance or date
    return uniqueEvents.sort((a, b) => {
      if (a.distance && b.distance) {
        return a.distance - b.distance;
      }
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
  } catch (error) {
    console.error('Error aggregating events:', error);
    throw error;
  }
}

function deduplicateEvents(events: Event[]): Event[] {
  const seen = new Map<string, Event>();

  for (const event of events) {
    // Create a key based on name, date, and location
    const key = `${event.name.toLowerCase()}-${event.startDate}-${event.venue.city}`;

    if (!seen.has(key)) {
      seen.set(key, event);
    }
  }

  return Array.from(seen.values());
}
```

#### 4. Update Controller

```typescript
// backend/src/controllers/eventController.ts

import * as eventAggregator from '../services/eventAggregator';

export async function searchEvents(req: Request, res: Response) {
  try {
    const filters: SearchFilters = req.body;

    // Use aggregator instead of single source
    const events = await eventAggregator.searchAllSources(filters);

    res.json({
      events,
      count: events.length,
      sources: ['ticketmaster', 'eventbrite']
    });
  } catch (error) {
    console.error('Error in searchEvents controller:', error);
    res.status(500).json({ error: 'Failed to search events' });
  }
}
```

### Phase 2: Add Source Filtering

Allow users to choose which sources to search:

#### Frontend: Add Source Filter

```typescript
// frontend/src/components/SearchFilters.tsx

const sources = [
  { id: 'all', name: 'All Sources' },
  { id: 'ticketmaster', name: 'Ticketmaster (Concerts, Sports)' },
  { id: 'eventbrite', name: 'Eventbrite (Community, Social)' },
  { id: 'meetup', name: 'Meetup (Networking, Groups)' },
];

// Add to search filters
<select value={selectedSources} onChange={...}>
  {sources.map(source => (
    <option key={source.id} value={source.id}>
      {source.name}
    </option>
  ))}
</select>
```

#### Backend: Conditional Source Selection

```typescript
// backend/src/services/eventAggregator.ts

export async function searchAllSources(
  filters: SearchFilters,
  sources: string[] = ['ticketmaster', 'eventbrite']
): Promise<Event[]> {
  const promises: Promise<Event[]>[] = [];

  if (sources.includes('ticketmaster')) {
    promises.push(ticketmaster.searchEvents(filters).catch(() => []));
  }

  if (sources.includes('eventbrite')) {
    promises.push(eventbrite.searchEvents(filters).catch(() => []));
  }

  if (sources.includes('meetup')) {
    promises.push(meetup.searchEvents(filters).catch(() => []));
  }

  const results = await Promise.all(promises);
  const allEvents = results.flat();

  return deduplicateEvents(allEvents);
}
```

### Phase 3: User-Generated Events (Future)

For truly social, user-created events:

#### Option 1: Add Your Own Event Form

```typescript
// Allow users to create and share events
POST /api/events/create
{
  name, description, date, venue, organizer
}

// Store in your own database (PostgreSQL/MongoDB)
// Moderate before displaying
```

#### Option 2: Integrate with Social Platforms

**Discord Events:**
- Use Discord API to fetch community events
- Good for gaming/tech communities

**LinkedIn Events:**
- Professional networking events
- Requires LinkedIn API access

**Instagram/Twitter Hashtags:**
- Scrape hashtags like #EventsNearMe
- **Not recommended**: Against TOS, unreliable

## Cost Breakdown with Social Sources

| Source | Free Tier | Cost After |
|--------|-----------|------------|
| Ticketmaster | 5,000/day | Contact sales |
| Eventbrite | 1,000/day | Contact for higher |
| Meetup | Limited | $5-10/month |
| Facebook | N/A | N/A (deprecated) |

**Total**: Still FREE for most users!

## Recommended Implementation Order

1. ✅ **Start with Ticketmaster** (already done)
2. 🎯 **Add Eventbrite** (best ROI for social events)
3. 📅 **Add Meetup** (if you want networking/groups)
4. 🔮 **Consider user-generated** (requires database + moderation)

## Database Schema for User Events

If you want users to create events:

```sql
CREATE TABLE user_events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  venue_name VARCHAR(255),
  venue_address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_by INTEGER REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP DEFAULT NOW(),
  image_url TEXT,
  category VARCHAR(100)
);
```

## Security Considerations

### API Key Management
- ✅ Never expose API keys in frontend
- ✅ All API calls go through backend
- ✅ Use environment variables

### User-Generated Content
- ⚠️ Requires moderation
- ⚠️ Add spam prevention
- ⚠️ Implement rate limiting
- ⚠️ Content filtering

### Rate Limiting
```typescript
// backend/src/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
```

## UI Enhancements for Multi-Source

### Show Event Source Badge

```typescript
// frontend/src/components/EventCard.tsx

const sourceColors = {
  ticketmaster: '#026CDF',
  eventbrite: '#F05537',
  meetup: '#ED1C40',
  user: '#28a745',
};

<div style={{
  backgroundColor: sourceColors[event.source],
  color: 'white',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '12px',
}}>
  {event.source}
</div>
```

### Filter by Source

```typescript
const [selectedSources, setSelectedSources] = useState(['all']);

const filteredEvents = events.filter(event =>
  selectedSources.includes('all') || selectedSources.includes(event.source)
);
```

## Testing Strategy

### Test Each Source Separately
```bash
# Test Ticketmaster
curl "http://localhost:5000/api/events/nearby?lat=40.7128&lng=-74.0060&source=ticketmaster"

# Test Eventbrite
curl "http://localhost:5000/api/events/nearby?lat=40.7128&lng=-74.0060&source=eventbrite"

# Test All
curl "http://localhost:5000/api/events/nearby?lat=40.7128&lng=-74.0060&source=all"
```

## Next Steps

1. **Register for Eventbrite API** → Get token
2. **Implement eventbrite.ts service** → Copy pattern from ticketmaster.ts
3. **Create eventAggregator.ts** → Combine sources
4. **Update frontend** → Add source badges/filters
5. **Test thoroughly** → Ensure deduplication works

## Additional Resources

- [Eventbrite API Docs](https://www.eventbrite.com/platform/api)
- [Meetup API Docs](https://www.meetup.com/api/)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api) (Limited)

---

**Status**: Ready to implement
**Effort**: 4-6 hours for Eventbrite integration
**Value**: 2-3x more events, better social coverage
