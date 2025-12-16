import axios from 'axios';

const TICKETMASTER_API_BASE = 'https://app.ticketmaster.com/discovery/v2';

function getAPIKey(): string {
  const key = process.env.TICKETMASTER_API_KEY;
  if (!key) {
    throw new Error('TICKETMASTER_API_KEY is not set in environment variables');
  }
  return key;
}

export interface TicketmasterEvent {
  id: string;
  name: string;
  url: string;
  images: Array<{ url: string; width: number; height: number }>;
  dates: {
    start: {
      localDate: string;
      localTime?: string;
    };
  };
  classifications?: Array<{
    segment?: { name: string };
    genre?: { name: string };
  }>;
  priceRanges?: Array<{
    min: number;
    max: number;
    currency: string;
  }>;
  _embedded?: {
    venues?: Array<{
      name: string;
      address?: { line1: string };
      city?: { name: string };
      state?: { name: string };
      location?: { latitude: string; longitude: string };
    }>;
  };
}

export interface TicketmasterSearchParams {
  latitude?: number;
  longitude?: number;
  radius?: number; // miles
  city?: string;
  stateCode?: string;
  startDateTime?: string;
  endDateTime?: string;
  classificationName?: string; // Music, Sports, Arts & Theatre, etc.
  size?: number; // results per page (max 200)
  page?: number;
}

/**
 * Search for events using Ticketmaster Discovery API
 */
export async function searchTicketmasterEvents(
  params: TicketmasterSearchParams
): Promise<{ events: TicketmasterEvent[]; totalResults: number }> {
  try {
    const queryParams: any = {
      apikey: getAPIKey(),
      size: params.size || 20,
      page: params.page || 0,
    };

    // Location-based search
    if (params.latitude && params.longitude) {
      queryParams.latlong = `${params.latitude},${params.longitude}`;
      queryParams.radius = params.radius || 25; // default 25 miles
      queryParams.unit = 'miles';
    } else if (params.city) {
      queryParams.city = params.city;
      if (params.stateCode) {
        queryParams.stateCode = params.stateCode;
      }
    }

    // Date filters
    if (params.startDateTime) {
      queryParams.startDateTime = params.startDateTime;
    }
    if (params.endDateTime) {
      queryParams.endDateTime = params.endDateTime;
    }

    // Category filter
    if (params.classificationName) {
      queryParams.classificationName = params.classificationName;
    }

    const response = await axios.get(`${TICKETMASTER_API_BASE}/events.json`, {
      params: queryParams,
    });

    const events = response.data._embedded?.events || [];
    const totalResults = response.data.page?.totalElements || 0;

    return { events, totalResults };
  } catch (error: any) {
    console.error('Ticketmaster API Error:', error.response?.data || error.message);
    throw new Error('Failed to fetch events from Ticketmaster');
  }
}

/**
 * Get event details by ID
 */
export async function getTicketmasterEventById(eventId: string): Promise<TicketmasterEvent> {
  try {
    const response = await axios.get(`${TICKETMASTER_API_BASE}/events/${eventId}.json`, {
      params: { apikey: getAPIKey() },
    });

    return response.data;
  } catch (error: any) {
    console.error('Ticketmaster API Error:', error.response?.data || error.message);
    throw new Error('Failed to fetch event details from Ticketmaster');
  }
}

/**
 * Get event categories/classifications
 */
export async function getTicketmasterClassifications() {
  try {
    const response = await axios.get(`${TICKETMASTER_API_BASE}/classifications.json`, {
      params: { apikey: getAPIKey() },
    });

    return response.data._embedded?.classifications || [];
  } catch (error: any) {
    console.error('Ticketmaster API Error:', error.response?.data || error.message);
    throw new Error('Failed to fetch classifications from Ticketmaster');
  }
}
