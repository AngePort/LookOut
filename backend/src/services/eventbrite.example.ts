// Example Eventbrite Service Integration
// Rename to eventbrite.ts and add your API key to .env

import axios from 'axios';
import { Event, SearchFilters, Location } from '../models/Event';

const EVENTBRITE_API_URL = 'https://www.eventbriteapi.com/v3';
const API_TOKEN = process.env.EVENTBRITE_API_KEY || '';

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

function normalizeEventbriteEvent(ebEvent: any, userLocation?: Location): Event {
  const event: Event = {
    id: `eb-${ebEvent.id}`,
    name: ebEvent.name.text,
    description: ebEvent.description?.text || ebEvent.summary,
    startDate: ebEvent.start.utc,
    endDate: ebEvent.end?.utc,
    venue: {
      name: ebEvent.venue?.name || 'Online Event',
      address: ebEvent.venue?.address?.address_1 || '',
      city: ebEvent.venue?.address?.city || 'Online',
      state: ebEvent.venue?.address?.region,
      country: ebEvent.venue?.address?.country || '',
      location: {
        lat: parseFloat(ebEvent.venue?.latitude) || 0,
        lng: parseFloat(ebEvent.venue?.longitude) || 0,
      },
    },
    images: ebEvent.logo ? [{
      url: ebEvent.logo.url,
      width: ebEvent.logo.original?.width || 640,
      height: ebEvent.logo.original?.height || 320,
    }] : [],
    url: ebEvent.url,
    category: ebEvent.category?.name || 'Community',
  };

  // Add price information if available
  if (!ebEvent.is_free && ebEvent.ticket_classes) {
    const prices = ebEvent.ticket_classes
      .map((tc: any) => tc.cost?.major_value || 0)
      .filter((p: number) => p > 0);

    if (prices.length > 0) {
      event.priceRange = {
        min: Math.min(...prices),
        max: Math.max(...prices),
        currency: ebEvent.currency || 'USD',
      };
    }
  }

  // Calculate distance if user location provided
  if (userLocation && ebEvent.venue?.latitude && ebEvent.venue?.longitude) {
    event.distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      parseFloat(ebEvent.venue.latitude),
      parseFloat(ebEvent.venue.longitude)
    );
  }

  return event;
}

export async function searchEvents(filters: SearchFilters): Promise<Event[]> {
  try {
    if (!API_TOKEN) {
      console.warn('Eventbrite API key not configured');
      return [];
    }

    const params: any = {
      token: API_TOKEN,
      expand: 'venue,ticket_classes,category',
    };

    // Location-based search
    if (filters.location) {
      params['location.latitude'] = filters.location.lat;
      params['location.longitude'] = filters.location.lng;
      params['location.within'] = `${filters.radius || 25}km`;
    }

    // Keyword search
    if (filters.keyword) {
      params.q = filters.keyword;
    }

    // Date filtering
    if (filters.startDate) {
      params['start_date.range_start'] = filters.startDate;
    }

    if (filters.endDate) {
      params['start_date.range_end'] = filters.endDate;
    }

    // Category filtering - map our categories to Eventbrite categories
    if (filters.category) {
      const categoryMap: Record<string, string> = {
        'Music': 'Music',
        'Sports': 'Sports & Fitness',
        'Arts & Theatre': 'Performing & Visual Arts',
        'Family': 'Family & Education',
        'Film': 'Film & Media',
      };
      const ebCategory = categoryMap[filters.category];
      if (ebCategory) {
        params['categories'] = ebCategory;
      }
    }

    const response = await axios.get(`${EVENTBRITE_API_URL}/events/search/`, { params });

    if (response.data.events) {
      return response.data.events.map((event: any) =>
        normalizeEventbriteEvent(event, filters.location)
      );
    }

    return [];
  } catch (error) {
    console.error('Error fetching from Eventbrite:', error);
    return [];
  }
}

export async function getEventById(id: string): Promise<Event | null> {
  try {
    if (!API_TOKEN) {
      console.warn('Eventbrite API key not configured');
      return null;
    }

    // Remove 'eb-' prefix if present
    const eventbriteId = id.replace('eb-', '');

    const response = await axios.get(`${EVENTBRITE_API_URL}/events/${eventbriteId}/`, {
      params: {
        token: API_TOKEN,
        expand: 'venue,ticket_classes,category',
      },
    });

    return normalizeEventbriteEvent(response.data);
  } catch (error) {
    console.error('Error fetching event by ID from Eventbrite:', error);
    return null;
  }
}

export async function getNearbyEvents(lat: number, lng: number, radius: number = 25): Promise<Event[]> {
  return searchEvents({
    location: { lat, lng },
    radius,
  });
}
