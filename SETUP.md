# Local Event Finder - Setup Guide

This guide will help you set up and run the Local Event Finder application locally and deploy it for free.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Ticketmaster API key (free)

## Getting Your Free Ticketmaster API Key

1. Go to [Ticketmaster Developer Portal](https://developer.ticketmaster.com/)
2. Click "Get Your API Key" or "Sign Up"
3. Create a free account
4. Once logged in, go to "My Apps" and create a new app
5. Copy your API Key (you get 5,000 requests per day for free)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Local-Event-Finder
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit the `.env` file and add your Ticketmaster API key:

```
PORT=5000
TICKETMASTER_API_KEY=your_actual_api_key_here
```

Start the backend server:

```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal window:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```bash
cp .env.example .env
```

The default configuration should work for local development:

```
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

### 4. Test the Application

1. Open your browser and go to `http://localhost:3000`
2. Allow location access when prompted
3. You should see a map with your location and nearby events

## Deploying for FREE

### Deploy Backend to Render (FREE)

1. Create account at [render.com](https://render.com) (no credit card required)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: local-event-finder-backend
   - **Region**: Choose closest to you
   - **Branch**: main
   - **Root Directory**: backend
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   - `TICKETMASTER_API_KEY`: your API key
   - `NODE_ENV`: production
6. Click "Create Web Service"
7. Copy your backend URL (e.g., `https://your-app.onrender.com`)

### Deploy Frontend to Vercel (FREE)

1. Create account at [vercel.com](https://vercel.com) (no credit card required)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: dist
5. Add Environment Variable:
   - `VITE_API_URL`: Your Render backend URL + `/api` (e.g., `https://your-app.onrender.com/api`)
6. Click "Deploy"
7. Your app will be live at `https://your-project.vercel.app`

## Free Tier Limitations

### Render Free Tier
- Server sleeps after 15 minutes of inactivity
- Wakes up in ~30 seconds when accessed
- 750 hours/month (enough for 1 app)

### Vercel Free Tier
- Unlimited deployments
- 100GB bandwidth/month
- Always on, no sleep time

### Ticketmaster Free Tier
- 5,000 API requests per day
- Enough for hundreds of users daily

## Upgrading Later

If your app gets popular and you need to upgrade:

- **Render**: $7/month for always-on server
- **Vercel**: Stays free for most projects
- **Ticketmaster**: Contact them for higher limits if needed

## Troubleshooting

### Backend Issues

**"Cannot connect to backend"**
- Make sure backend is running on port 5000
- Check `.env` file has correct configuration

**"No events found"**
- Verify your Ticketmaster API key is correct
- Check the API key is active (5,000 requests/day limit)
- Try a different location or increase search radius

### Frontend Issues

**"Location not working"**
- Allow location permissions in your browser
- If denied, the app defaults to New York City

**"Map not displaying"**
- Check internet connection (maps load from OpenStreetMap)
- Clear browser cache and reload

### Deployment Issues

**Render: "Build failed"**
- Make sure all dependencies are in `package.json`
- Check build logs for specific errors

**Vercel: "Build failed"**
- Verify environment variable `VITE_API_URL` is set
- Make sure backend URL is correct and accessible

## Testing Your Deployment

1. Visit your Vercel URL
2. Allow location access
3. Events should load (may take 30 seconds if backend was sleeping)
4. Click on events to view details
5. Try different search filters

## Cost Breakdown

**Total Monthly Cost: $0**

You can run this app completely free with:
- Vercel (frontend): FREE
- Render (backend): FREE
- OpenStreetMap (maps): FREE
- Ticketmaster API: FREE (5k requests/day)

Only pay if you need:
- Custom domain: ~$12/year
- Always-on backend: $7/month
- More API requests: Contact Ticketmaster

## Next Steps

- Customize the UI to match your style
- Add more event sources (Eventbrite, SeatGeek)
- Add user authentication for favorites
- Implement event notifications
- Add social sharing features

## Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review error messages in browser console
3. Check backend logs on Render dashboard
4. Verify all environment variables are set correctly
