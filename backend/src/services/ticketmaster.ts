import axios from 'axios';
import { Event, SearchFilters, Location } from '../models/Event';

const TICKETMASTER_API_URL = 'https://app.ticketmaster.com/discovery/v2';
const API_KEY = process.env.TICKETMASTER_API_KEY || '';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function normalizeTicketmasterEvent(tmEvent: any, userLocation?: Location): Event {
  const venue = tmEvent._embedded?.venues?.[0];
  const priceRanges = tmEvent.priceRanges?.[0];

  const event: Event = {
    id: tmEvent.id,
    name: tmEvent.name,
    description: tmEvent.description || tmEvent.info,
    startDate: tmEvent.dates?.start?.dateTime || tmEvent.dates?.start?.localDate,
    venue: {
      name: venue?.name || 'Unknown Venue',
      address: venue?.address?.line1 || '',
      city: venue?.city?.name || '',
      state: venue?.state?.name,
      country: venue?.country?.name || '',
      location: {
        lat: parseFloat(venue?.location?.latitude) || 0,
        lng: parseFloat(venue?.location?.longitude) || 0,
      },
    },
    images: tmEvent.images?.map((img: any) => ({
      url: img.url,
      width: img.width,
      height: img.height,
    })),
    category: tmEvent.classifications?.[0]?.segment?.name,
    url: tmEvent.url,
  };

  if (priceRanges) {
    event.priceRange = {
      min: priceRanges.min,
      max: priceRanges.max,
      currency: priceRanges.currency || 'USD',
    };
  }

  if (userLocation && venue?.location) {
    event.distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      parseFloat(venue.location.latitude),
      parseFloat(venue.location.longitude)
    );
  }

  return event;
}

export async function searchEvents(filters: SearchFilters): Promise<Event[]> {
  try {
    if (!API_KEY) {
      console.warn('Ticketmaster API key not configured');
      return [];
    }

    const params: any = {
      apikey: API_KEY,
      size: 50,
    };

    if (filters.location) {
      params.latlong = `${filters.location.lat},${filters.location.lng}`;
      params.radius = filters.radius || 25;
      params.unit = 'km';
    }

    if (filters.keyword) {
      params.keyword = filters.keyword;
    }

    if (filters.category) {
      params.classificationName = filters.category;
    }

    if (filters.startDate) {
      params.startDateTime = `${filters.startDate}T00:00:00Z`;
    }

    if (filters.endDate) {
      params.endDateTime = `${filters.endDate}T23:59:59Z`;
    }

    const response = await axios.get(`${TICKETMASTER_API_URL}/events.json`, { params });

    if (response.data._embedded?.events) {
      return response.data._embedded.events.map((event: any) =>
        normalizeTicketmasterEvent(event, filters.location)
      );
    }

    return [];
  } catch (error) {
    console.error('Error fetching from Ticketmaster:', error);
    throw error;
  }
}

export async function getEventById(id: string): Promise<Event | null> {
  try {
    if (!API_KEY) {
      console.warn('Ticketmaster API key not configured');
      return null;
    }

    const response = await axios.get(`${TICKETMASTER_API_URL}/events/${id}.json`, {
      params: { apikey: API_KEY },
    });

    return normalizeTicketmasterEvent(response.data);
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    throw error;
  }
}

export async function getNearbyEvents(lat: number, lng: number, radius: number = 25): Promise<Event[]> {
  return searchEvents({
    location: { lat, lng },
    radius,
  });
}
