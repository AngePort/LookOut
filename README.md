# Local Event Finder

Discover local events happening near you, anywhere in the world.

## Features

- **Location-Based Discovery**: Automatically detects your location or search any area
- **Interactive Map**: Visual representation of events with clickable markers
- **Smart Filtering**: Filter by category, date, distance, and keywords
- **Event Details**: Comprehensive information including venue, pricing, and directions
- **Real-Time Data**: Powered by Ticketmaster API with thousands of events worldwide
- **Mobile Responsive**: Works seamlessly on desktop, tablet, and mobile devices

## Technology Stack

### Frontend
- React with TypeScript
- Vite (fast build tool)
- React Router (navigation)
- Leaflet + OpenStreetMap (mapping)
- Axios (API calls)
- date-fns (date formatting)

### Backend
- Node.js + Express
- TypeScript
- Ticketmaster Discovery API
- CORS enabled for cross-origin requests

### Deployment (100% FREE)
- **Frontend**: Vercel (free hosting)
- **Backend**: Render (free tier)
- **Maps**: OpenStreetMap (free)
- **Event Data**: Ticketmaster API (5,000 free requests/day)

## Quick Start

See [SETUP.md](./SETUP.md) for detailed installation and deployment instructions.

### Local Development

1. Get a free Ticketmaster API key from [developer.ticketmaster.com](https://developer.ticketmaster.com)

2. Clone and setup backend:
```bash
cd backend
npm install
cp .env.example .env
# Add your Ticketmaster API key to .env
npm run dev
```

3. Setup frontend (in a new terminal):
```bash
cd frontend
npm install
npm run dev
```

4. Open `http://localhost:3000` in your browser

## Project Structure

```
Local-Event-Finder/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Helper functions
│   └── package.json
├── backend/               # Express backend API
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── models/        # Data models
│   │   └── server.ts      # App entry point
│   └── package.json
├── CLAUDE.md             # Development plan
├── SETUP.md              # Setup and deployment guide
└── README.md             # This file
```

## API Endpoints

- `GET /api/events/nearby?lat={lat}&lng={lng}&radius={km}` - Get events near location
- `POST /api/events/search` - Search events with filters
- `GET /api/events/:id` - Get event details by ID
- `GET /health` - Health check endpoint

## Features in Detail

### Geolocation
- Automatic browser location detection
- Fallback to default location (New York City) if permission denied
- Manual location search and selection

### Event Search
- Keyword search across event names and descriptions
- Category filtering (Music, Sports, Arts, Family, etc.)
- Date range filtering
- Distance radius control (5-100 km)

### Event Display
- Grid view with event cards showing key information
- Interactive map with event markers
- Click markers or cards to view full details
- Distance calculation from your location

### Event Details
- Full event information and description
- Venue details with embedded map
- Direct links to purchase tickets
- Google Maps directions integration

## Free Deployment

This app can be deployed entirely for free:

- **Vercel** (Frontend): Unlimited deployments, 100GB bandwidth/month
- **Render** (Backend): 750 hours/month (enough for 1 always-running app)
- **Ticketmaster API**: 5,000 requests/day free
- **OpenStreetMap**: Unlimited, free mapping

Total cost: **$0/month** for small to medium traffic

See [SETUP.md](./SETUP.md) for step-by-step deployment instructions.

## Environment Variables

### Backend (.env)
```
PORT=5000
TICKETMASTER_API_KEY=your_api_key_here
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## Future Enhancements

- [ ] User authentication and profiles
- [ ] Save favorite events
- [ ] Event notifications and reminders
- [ ] Social sharing features
- [ ] Multiple event API sources (Eventbrite, SeatGeek)
- [ ] Event categories with icons
- [ ] Advanced filtering (price range, venue type)
- [ ] Calendar integration
- [ ] Dark mode

## License

MIT License - feel free to use this project for learning or as a base for your own applications.

## Support

For setup help, see [SETUP.md](./SETUP.md)

For the full development plan, see [CLAUDE.md](./Claude.md)

---

Built with Claude Code
