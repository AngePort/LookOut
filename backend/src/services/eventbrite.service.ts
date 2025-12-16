import axios from 'axios';

const EVENTBRITE_API_BASE = 'https://www.eventbriteapi.com/v3';

function getAPIKey(): string {
  const key = process.env.EVENTBRITE_API_KEY;
  if (!key) {
    throw new Error('EVENTBRITE_API_KEY is not set in environment variables');
  }
  return key;
}

export interface EventbriteEvent {
  id: string;
  name: {
    text: string;
  };
  description?: {
    text: string;
  };
  url: string;
  start: {
    timezone: string;
    local: string;
    utc: string;
  };
  end: {
    timezone: string;
    local: string;
    utc: string;
  };
  organization_id: string;
  created: string;
  changed: string;
  capacity?: number;
  status: string;
  currency: string;
  is_free: boolean;
  logo?: {
    url: string;
  };
  venue?: {
    id: string;
    name: string;
    address: {
      address_1?: string;
      address_2?: string;
      city?: string;
      region?: string;
      postal_code?: string;
      country?: string;
      latitude?: string;
      longitude?: string;
    };
  };
  category?: {
    id: string;
    name: string;
  };
  subcategory?: {
    id: string;
    name: string;
  };
}

export interface EventbriteSearchParams {
  latitude?: number;
  longitude?: number;
  radius?: string; // e.g., "10km", "25mi"
  city?: string;
  startDate?: string;
  endDate?: string;
  categories?: string; // comma-separated category IDs
  isFree?: boolean;
  page?: number;
}

/**
 * Search for events using Eventbrite API
 */
export async function searchEventbriteEvents(
  params: EventbriteSearchParams
): Promise<{ events: EventbriteEvent[]; totalResults: number; hasMore: boolean }> {
  try {
    const queryParams: any = {
      expand: 'venue,category,subcategory',
    };

    // Location-based search
    if (params.latitude && params.longitude) {
      queryParams['location.latitude'] = params.latitude;
      queryParams['location.longitude'] = params.longitude;
      queryParams['location.within'] = params.radius || '25mi';
    } else if (params.city) {
      queryParams['location.address'] = params.city;
    }

    // Date filters (ISO 8601 format)
    if (params.startDate) {
      queryParams['start_date.range_start'] = params.startDate;
    }
    if (params.endDate) {
      queryParams['start_date.range_end'] = params.endDate;
    }

    // Category filter
    if (params.categories) {
      queryParams.categories = params.categories;
    }

    // Free events filter
    if (params.isFree !== undefined) {
      queryParams.price = params.isFree ? 'free' : 'paid';
    }

    // Pagination
    if (params.page) {
      queryParams.page = params.page;
    }

    // Eventbrite deprecated /events/search/ - using user's events endpoint
    const response = await axios.get(`${EVENTBRITE_API_BASE}/users/me/events/`, {
      params: queryParams,
      headers: {
        Authorization: `Bearer ${getAPIKey()}`,
      },
      timeout: 10000,
    });

    const events = response.data.events || [];
    const pagination = response.data.pagination || {};

    return {
      events,
      totalResults: pagination.object_count || 0,
      hasMore: pagination.has_more_items || false,
    };
  } catch (error: any) {
    console.error('Eventbrite API Error:', error.response?.data || error.message);
    throw new Error('Failed to fetch events from Eventbrite');
  }
}

/**
 * Get event details by ID
 */
export async function getEventbriteEventById(eventId: string): Promise<EventbriteEvent> {
  try {
    const response = await axios.get(`${EVENTBRITE_API_BASE}/events/${eventId}/`, {
      params: {
        expand: 'venue,category,subcategory,organizer',
      },
      headers: {
        Authorization: `Bearer ${getAPIKey()}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Eventbrite API Error:', error.response?.data || error.message);
    throw new Error('Failed to fetch event details from Eventbrite');
  }
}

/**
 * Get event categories
 */
export async function getEventbriteCategories() {
  try {
    const response = await axios.get(`${EVENTBRITE_API_BASE}/categories/`, {
      headers: {
        Authorization: `Bearer ${getAPIKey()}`,
      },
    });

    return response.data.categories || [];
  } catch (error: any) {
    console.error('Eventbrite API Error:', error.response?.data || error.message);
    throw new Error('Failed to fetch categories from Eventbrite');
  }
}

/**
 * Get venue details by ID
 */
export async function getEventbriteVenue(venueId: string) {
  try {
    const response = await axios.get(`${EVENTBRITE_API_BASE}/venues/${venueId}/`, {
      headers: {
        Authorization: `Bearer ${getAPIKey()}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Eventbrite API Error:', error.response?.data || error.message);
    throw new Error('Failed to fetch venue details from Eventbrite');
  }
}
