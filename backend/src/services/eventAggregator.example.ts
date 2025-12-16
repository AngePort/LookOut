// Example Event Aggregator Service
// Combines multiple event sources into a single unified response
// Rename to eventAggregator.ts to use

import * as ticketmaster from './ticketmaster';
// import * as eventbrite from './eventbrite'; // Uncomment when eventbrite.ts is created
import { Event, SearchFilters } from '../models/Event';

interface EventSource {
  name: string;
  searchFn: (filters: SearchFilters) => Promise<Event[]>;
  getByIdFn: (id: string) => Promise<Event | null>;
  enabled: boolean;
}

// Configure available sources
const SOURCES: EventSource[] = [
  {
    name: 'ticketmaster',
    searchFn: ticketmaster.searchEvents,
    getByIdFn: ticketmaster.getEventById,
    enabled: !!process.env.TICKETMASTER_API_KEY,
  },
  // Uncomment when you add Eventbrite
  // {
  //   name: 'eventbrite',
  //   searchFn: eventbrite.searchEvents,
  //   getByIdFn: eventbrite.getEventById,
  //   enabled: !!process.env.EVENTBRITE_API_KEY,
  // },
];

/**
 * Search events from multiple sources and combine results
 */
export async function searchAllSources(
  filters: SearchFilters,
  requestedSources?: string[]
): Promise<{
  events: Event[];
  sources: string[];
  totalCount: number;
}> {
  try {
    // Filter sources based on what's requested and enabled
    const activeSources = SOURCES.filter(source => {
      const isRequested = !requestedSources || requestedSources.includes(source.name);
      return source.enabled && isRequested;
    });

    console.log(`Searching ${activeSources.length} sources:`, activeSources.map(s => s.name));

    // Fetch from all sources in parallel
    const promises = activeSources.map(source =>
      source.searchFn(filters)
        .then(events => ({
          source: source.name,
          events: events.map(e => ({ ...e, source: source.name })), // Tag with source
        }))
        .catch(error => {
          console.error(`Error from ${source.name}:`, error.message);
          return { source: source.name, events: [] };
        })
    );

    const results = await Promise.all(promises);

    // Combine all events
    const allEvents = results.flatMap(r => r.events);

    // Deduplicate events (same name, date, location = duplicate)
    const uniqueEvents = deduplicateEvents(allEvents);

    // Sort by distance (if available) or date
    const sortedEvents = sortEvents(uniqueEvents);

    return {
      events: sortedEvents,
      sources: activeSources.map(s => s.name),
      totalCount: sortedEvents.length,
    };
  } catch (error) {
    console.error('Error aggregating events:', error);
    throw error;
  }
}

/**
 * Get event by ID from any source
 */
export async function getEventById(id: string): Promise<Event | null> {
  // Determine source from ID prefix (e.g., 'eb-123' = eventbrite)
  const source = detectSourceFromId(id);

  if (source) {
    return source.getByIdFn(id);
  }

  // Try all sources if no prefix
  for (const src of SOURCES.filter(s => s.enabled)) {
    try {
      const event = await src.getByIdFn(id);
      if (event) {
        return { ...event, source: src.name };
      }
    } catch (error) {
      console.error(`Error fetching from ${src.name}:`, error);
    }
  }

  return null;
}

/**
 * Get nearby events from all sources
 */
export async function getNearbyEvents(
  lat: number,
  lng: number,
  radius: number = 25,
  requestedSources?: string[]
): Promise<{
  events: Event[];
  sources: string[];
  totalCount: number;
}> {
  return searchAllSources(
    {
      location: { lat, lng },
      radius,
    },
    requestedSources
  );
}

/**
 * Remove duplicate events based on similarity
 */
function deduplicateEvents(events: Event[]): Event[] {
  const seen = new Map<string, Event>();

  for (const event of events) {
    // Create a normalized key for comparison
    const normalizedName = event.name.toLowerCase().trim();
    const dateKey = event.startDate.substring(0, 10); // Just the date part
    const locationKey = `${event.venue.city}-${event.venue.name}`.toLowerCase();

    const key = `${normalizedName}-${dateKey}-${locationKey}`;

    if (!seen.has(key)) {
      seen.set(key, event);
    } else {
      // If duplicate found, prefer the one with more information
      const existing = seen.get(key)!;
      if (hasMoreInfo(event, existing)) {
        seen.set(key, event);
      }
    }
  }

  return Array.from(seen.values());
}

/**
 * Compare two events to see which has more information
 */
function hasMoreInfo(event1: Event, event2: Event): boolean {
  const score1 = calculateInfoScore(event1);
  const score2 = calculateInfoScore(event2);
  return score1 > score2;
}

/**
 * Calculate a score based on how much information an event has
 */
function calculateInfoScore(event: Event): number {
  let score = 0;
  if (event.description) score += 2;
  if (event.images && event.images.length > 0) score += 2;
  if (event.priceRange) score += 1;
  if (event.url) score += 1;
  if (event.category) score += 1;
  return score;
}

/**
 * Sort events by distance (if available) then by date
 */
function sortEvents(events: Event[]): Event[] {
  return events.sort((a, b) => {
    // If both have distance, sort by distance
    if (a.distance !== undefined && b.distance !== undefined) {
      if (Math.abs(a.distance - b.distance) > 0.1) {
        return a.distance - b.distance;
      }
    }

    // Otherwise sort by date
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });
}

/**
 * Detect event source from ID prefix
 */
function detectSourceFromId(id: string): EventSource | null {
  if (id.startsWith('eb-')) {
    return SOURCES.find(s => s.name === 'eventbrite') || null;
  }
  // Ticketmaster IDs don't have a prefix
  return SOURCES.find(s => s.name === 'ticketmaster') || null;
}

/**
 * Get statistics about available sources
 */
export function getSourceStats(): {
  total: number;
  enabled: number;
  disabled: number;
  sources: Array<{ name: string; enabled: boolean }>;
} {
  const enabled = SOURCES.filter(s => s.enabled);

  return {
    total: SOURCES.length,
    enabled: enabled.length,
    disabled: SOURCES.length - enabled.length,
    sources: SOURCES.map(s => ({ name: s.name, enabled: s.enabled })),
  };
}
