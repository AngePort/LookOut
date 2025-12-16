import {
  searchTicketmasterEvents,
  getTicketmasterEventById,
  TicketmasterEvent,
} from './ticketmaster.service';
import {
  searchEventbriteEvents,
  getEventbriteEventById,
  EventbriteEvent,
} from './eventbrite.service';
import {
  searchOSMEvents,
  OSMEvent,
  getOSMCategory,
  formatOSMAddress,
} from './openstreetmap.service';

/**
 * Normalized event structure for the app
 */
export interface NormalizedEvent {
  id: string;
  source: 'ticketmaster' | 'eventbrite' | 'openstreetmap';
  title: string;
  description?: string;
  url: string;
  imageUrl?: string;
  startDate: string;
  endDate?: string;
  venue: {
    name: string;
    address?: string;
    city?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
    location?: {
      lat: number;
      lng: number;
    };
  };
  category?: string;
  isFree: boolean;
  priceRange?: {
    min: number;
    max: number;
    currency: string;
  };
}

/**
 * Normalize Ticketmaster event to common format
 */
function normalizeTicketmasterEvent(event: TicketmasterEvent): NormalizedEvent {
  const venue = event._embedded?.venues?.[0];
  const classification = event.classifications?.[0];
  const priceRange = event.priceRanges?.[0];

  const latitude = venue?.location?.latitude ? parseFloat(venue.location.latitude) : undefined;
  const longitude = venue?.location?.longitude ? parseFloat(venue.location.longitude) : undefined;

  return {
    id: `tm-${event.id}`,
    source: 'ticketmaster',
    title: event.name,
    description: undefined, // Ticketmaster doesn't provide descriptions in list view
    url: event.url,
    imageUrl: event.images?.[0]?.url,
    startDate: `${event.dates.start.localDate}${event.dates.start.localTime ? 'T' + event.dates.start.localTime : ''}`,
    venue: {
      name: venue?.name || 'Venue TBA',
      address: venue?.address?.line1,
      city: venue?.city?.name,
      state: venue?.state?.name,
      latitude,
      longitude,
      location: latitude !== undefined && longitude !== undefined ? {
        lat: latitude,
        lng: longitude,
      } : undefined,
    },
    category: classification?.segment?.name || classification?.genre?.name,
    isFree: priceRange ? priceRange.min === 0 : false,
    priceRange: priceRange
      ? {
          min: priceRange.min,
          max: priceRange.max,
          currency: priceRange.currency,
        }
      : undefined,
  };
}

/**
 * Normalize Eventbrite event to common format
 */
function normalizeEventbriteEvent(event: EventbriteEvent): NormalizedEvent {
  const latitude = event.venue?.address?.latitude ? parseFloat(event.venue.address.latitude) : undefined;
  const longitude = event.venue?.address?.longitude ? parseFloat(event.venue.address.longitude) : undefined;

  return {
    id: `eb-${event.id}`,
    source: 'eventbrite',
    title: event.name.text,
    description: event.description?.text,
    url: event.url,
    imageUrl: event.logo?.url,
    startDate: event.start.local,
    endDate: event.end.local,
    venue: {
      name: event.venue?.name || 'Venue TBA',
      address: event.venue?.address?.address_1,
      city: event.venue?.address?.city,
      state: event.venue?.address?.region,
      latitude,
      longitude,
      location: latitude !== undefined && longitude !== undefined ? {
        lat: latitude,
        lng: longitude,
      } : undefined,
    },
    category: event.category?.name || event.subcategory?.name,
    isFree: event.is_free,
    priceRange: undefined, // Eventbrite doesn't provide price range in search results
  };
}

/**
 * Normalize OpenStreetMap venue to common format
 * Note: OSM provides venues/locations, not time-based events
 * We create "ongoing" events for these venues
 */
function normalizeOSMEvent(element: OSMEvent): NormalizedEvent {
  const latitude = element.lat || element.center?.lat;
  const longitude = element.lon || element.center?.lon;
  const tags = element.tags;

  // Create a date far in the future to indicate "ongoing/always available"
  const ongoingDate = new Date();
  ongoingDate.setFullYear(ongoingDate.getFullYear() + 10);

  return {
    id: `osm-${element.type}-${element.id}`,
    source: 'openstreetmap',
    title: tags.name || 'Local Venue',
    description: tags.description || tags.opening_hours || 'Community venue or facility',
    url: tags.website || tags['contact:website'] || `https://www.openstreetmap.org/${element.type}/${element.id}`,
    imageUrl: undefined, // OSM doesn't provide images
    startDate: new Date().toISOString(), // Available now
    endDate: ongoingDate.toISOString(), // Ongoing
    venue: {
      name: tags.name || 'Local Venue',
      address: formatOSMAddress(tags),
      city: tags['addr:city'],
      state: tags['addr:state'],
      latitude,
      longitude,
      location: latitude !== undefined && longitude !== undefined ? {
        lat: latitude,
        lng: longitude,
      } : undefined,
    },
    category: getOSMCategory(tags),
    isFree: true, // Most OSM venues are free to visit
    priceRange: undefined,
  };
}

export interface EventSearchParams {
  latitude?: number;
  longitude?: number;
  radius?: number; // miles
  city?: string;
  stateCode?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  isFree?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Search events from all sources (Ticketmaster only - Eventbrite temporarily disabled)
 *
 * NOTE: Eventbrite API is currently disabled because the free tier token
 * only provides access to user-created events, not public event search.
 * To re-enable, uncomment the Eventbrite sections below.
 */
export async function searchAllEvents(
  params: EventSearchParams
): Promise<{ events: NormalizedEvent[]; totalResults: number }> {
  try {
    // Fetch from Ticketmaster only (Eventbrite and OSM disabled)
    const [ticketmasterResults] = await Promise.allSettled([
      searchTicketmasterEvents({
        latitude: params.latitude,
        longitude: params.longitude,
        radius: params.radius,
        city: params.city,
        stateCode: params.stateCode,
        startDateTime: params.startDate,
        endDateTime: params.endDate,
        classificationName: params.category,
        size: params.limit || 20,
        page: params.page || 0,
      }),
      // EVENTBRITE DISABLED - Uncomment to re-enable
      // searchEventbriteEvents({
      //   latitude: params.latitude,
      //   longitude: params.longitude,
      //   radius: params.radius ? `${params.radius}mi` : undefined,
      //   city: params.city,
      //   startDate: params.startDate,
      //   endDate: params.endDate,
      //   isFree: params.isFree,
      //   page: params.page || 1,
      // }),
    ]);

    // Normalize events from Ticketmaster
    const allEvents: NormalizedEvent[] = [];

    if (ticketmasterResults.status === 'fulfilled') {
      const normalized = ticketmasterResults.value.events.map(normalizeTicketmasterEvent);
      allEvents.push(...normalized);
    } else {
      console.error('Ticketmaster search failed:', ticketmasterResults.reason);
      throw new Error('Failed to fetch events from Ticketmaster');
    }

    // DISABLED: OpenStreetMap venues (not time-based events)
    // Keeping code for future reference, but not adding to results
    // if (osmResults.status === 'fulfilled') {
    //   const normalized = osmResults.value.events.map(normalizeOSMEvent);
    //   allEvents.push(...normalized);
    //   console.log(`Found ${normalized.length} OpenStreetMap venues`);
    // } else {
    //   console.error('OpenStreetMap search failed:', osmResults.reason);
    //   // Don't throw - OSM is supplementary
    // }

    // EVENTBRITE DISABLED - Uncomment to re-enable
    // if (eventbriteResults.status === 'fulfilled') {
    //   const normalized = eventbriteResults.value.events.map(normalizeEventbriteEvent);
    //   allEvents.push(...normalized);
    // } else {
    //   console.error('Eventbrite search failed:', eventbriteResults.reason);
    // }

    // Sort by date (earliest first)
    allEvents.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    const totalResults = ticketmasterResults.status === 'fulfilled'
      ? ticketmasterResults.value.totalResults
      : 0;

    return {
      events: allEvents,
      totalResults,
    };
  } catch (error: any) {
    console.error('Error searching all events:', error.message);
    throw new Error('Failed to search events');
  }
}

/**
 * Get event details by source and ID
 */
export async function getEventById(source: string, eventId: string): Promise<NormalizedEvent> {
  try {
    if (source === 'ticketmaster' || source === 'tm') {
      const event = await getTicketmasterEventById(eventId);
      return normalizeTicketmasterEvent(event);
    } else if (source === 'eventbrite' || source === 'eb') {
      // EVENTBRITE DISABLED - Uncomment to re-enable
      throw new Error('Eventbrite integration is temporarily disabled');
      // const event = await getEventbriteEventById(eventId);
      // return normalizeEventbriteEvent(event);
    } else {
      throw new Error('Invalid event source');
    }
  } catch (error: any) {
    console.error('Error fetching event by ID:', error.message);
    throw new Error('Failed to fetch event details');
  }
}
