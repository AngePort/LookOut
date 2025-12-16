# Quick Start Guide

Get your Local Event Finder app running in 5 minutes!

## Step 1: Get Your Free API Key

1. Visit [https://developer.ticketmaster.com/](https://developer.ticketmaster.com/)
2. Click "Get Your API Key"
3. Sign up for a free account
4. Create a new app
5. Copy your API Key (you'll need it in Step 3)

## Step 2: Install Dependencies

Choose one of these options:

### Option A: Install Both at Once (Recommended)
```bash
npm install
npm run install:all
```

### Option B: Install Separately
```bash
# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

## Step 3: Configure Environment Variables

### Backend Configuration
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and add your Ticketmaster API key:
```
TICKETMASTER_API_KEY=paste_your_key_here
```

### Frontend Configuration
```bash
cd frontend
cp .env.example .env
```

The default settings should work as-is for local development.

## Step 4: Run the App

### Option A: Run Both Servers Together (Easiest)
From the root directory:
```bash
npm run dev
```

This starts both the backend and frontend simultaneously.

### Option B: Run Separately
In one terminal (backend):
```bash
cd backend
npm run dev
```

In another terminal (frontend):
```bash
cd frontend
npm run dev
```

## Step 5: Open Your Browser

Go to: `http://localhost:3000`

Allow location access when prompted, and you should see events near you!

## Troubleshooting

### "Cannot find module"
Run `npm run install:all` again

### "Port already in use"
Another app is using port 3000 or 5000. Stop that app or change the port in the `.env` files.

### "No events found"
- Check your Ticketmaster API key is correct
- Try increasing the search radius
- Make sure you have internet connection

### "Location not working"
- Click "Allow" when browser asks for location permission
- If denied, the app will default to New York City
- You can manually search for any location

## Next Steps

See [SETUP.md](./SETUP.md) for:
- Deployment instructions
- Detailed configuration
- Production setup

See [README.md](./README.md) for:
- Full feature list
- API documentation
- Contributing guidelines

## Help

Having issues? Check:
1. All dependencies are installed (`node_modules` folders exist in both `frontend` and `backend`)
2. Environment variables are set correctly
3. Ticketmaster API key is valid
4. Both servers are running (backend on 5000, frontend on 3000)

Happy event finding!
