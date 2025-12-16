# API Integration Setup - Complete ✅

## Configured APIs

### ✅ Ticketmaster Discovery API - **WORKING**
- **API Key**: Configured and loaded
- **Status**: Fully operational
- **Test**: Successfully returning events for NYC area
- **Coverage**: Major events (concerts, sports, theater, festivals)
- **Rate Limit**: 5,000 requests/day (free tier)

### ⚠️ Eventbrite API - **NEEDS ATTENTION**
- **API Key**: Configured but returning 404 errors
- **Issue**: The token provided may be:
  - An org-specific private token (not a public API token)
  - The API endpoint structure changed
  - The token requires additional permissions
- **Next Steps**:
  - Verify the Eventbrite token type at https://www.eventbrite.com/platform/api#/introduction/authentication
  - You may need to create a new OAuth app and get a proper API key
  - For now, Ticketmaster provides excellent coverage

## API Endpoints Available

### 1. Get Nearby Events
```bash
GET /api/events/nearby?lat=40.7128&lng=-74.0060&radius=25
```
**Query Parameters:**
- `lat` (required): Latitude
- `lng` (required): Longitude
- `radius` (optional): Radius in miles (default: 25)
- `category` (optional): Event category filter
- `isFree` (optional): Filter for free events (true/false)
- `page` (optional): Page number for pagination
- `limit` (optional): Results per page (default: 20)

**Example Response:**
```json
{
  "success": true,
  "events": [
    {
      "id": "tm-17GZvxG62DuNf1-",
      "source": "ticketmaster",
      "title": "Brooklyn Nets v. Toronto Raptors",
      "url": "https://www.ticketmaster.com/...",
      "imageUrl": "https://s1.ticketm.net/...",
      "startDate": "2025-12-21T18:00:00",
      "venue": {
        "name": "Barclays Center",
        "address": "620 Atlantic Ave",
        "city": "Brooklyn",
        "state": "New York",
        "latitude": 40.68285,
        "longitude": -73.97519
      },
      "category": "Sports",
      "isFree": false
    }
  ],
  "count": 20,
  "totalResults": 150
}
```

### 2. Search Events (Advanced)
```bash
POST /api/events/search
Content-Type: application/json

{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "radius": 25,
  "city": "New York",
  "stateCode": "NY",
  "startDate": "2025-12-15T00:00:00Z",
  "endDate": "2025-12-31T23:59:59Z",
  "category": "Music",
  "isFree": false,
  "page": 0,
  "limit": 20
}
```

### 3. Get Event by ID
```bash
GET /api/events/ticketmaster/:eventId
GET /api/events/eventbrite/:eventId
```

**Example:**
```bash
GET /api/events/ticketmaster/17GZvxG62DuNf1-
```

## Environment Variables

Location: `/Users/angeport/Documents/GitHub/Local-Event-Finder/.env`

```env
TICKETMASTER_API_KEY=78Sw1jz50v7R8orpiPhlxAadx8i5aP7K ✅
EVENTBRITE_API_KEY=HF6CRXBR6ZPTA3KUFFZD ⚠️
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
```

## Running the Backend

```bash
cd backend
npm run dev
```

Server will start at: `http://localhost:3001`

## Testing the API

### Health Check
```bash
curl http://localhost:3001/health
```

### Get Events Near NYC
```bash
curl "http://localhost:3001/api/events/nearby?lat=40.7128&lng=-74.0060&radius=25"
```

### Get Events Near Your Location (Example: San Francisco)
```bash
curl "http://localhost:3001/api/events/nearby?lat=37.7749&lng=-122.4194&radius=50"
```

## Event Data Structure

All events are normalized to a common format:

```typescript
interface NormalizedEvent {
  id: string;                    // Prefixed with "tm-" or "eb-"
  source: 'ticketmaster' | 'eventbrite';
  title: string;
  description?: string;
  url: string;                   // Link to buy tickets
  imageUrl?: string;             // Event poster/image
  startDate: string;             // ISO 8601 format
  endDate?: string;
  venue: {
    name: string;
    address?: string;
    city?: string;
    state?: string;
    latitude?: number;           // For map display
    longitude?: number;
  };
  category?: string;             // Music, Sports, Theater, etc.
  isFree: boolean;
  priceRange?: {
    min: number;
    max: number;
    currency: string;
  };
}
```

## Next Steps

1. **Fix Eventbrite** (optional):
   - Get a proper OAuth token from Eventbrite API Console
   - Update the `.env` file with the new token

2. **Add Frontend Integration**:
   - Connect React/Next.js frontend to these API endpoints
   - Display events on a map using coordinates
   - Add search and filter UI

3. **Add Caching** (Phase 7):
   - Cache API responses to reduce API calls
   - Implement Redis or in-memory caching

4. **Add More APIs** (optional):
   - Meetup API for social events
   - Yelp API for local happenings

## Current Status: ✅ READY FOR FRONTEND DEVELOPMENT

Your backend is fully operational with Ticketmaster providing excellent event coverage. You can now proceed to Phase 2 (Geolocation & Mapping) in the frontend!
