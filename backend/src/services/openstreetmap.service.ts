import axios from 'axios';

const OVERPASS_API_BASE = 'https://overpass-api.de/api/interpreter';

export interface OSMEvent {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags: {
    name?: string;
    description?: string;
    'addr:street'?: string;
    'addr:housenumber'?: string;
    'addr:city'?: string;
    'addr:state'?: string;
    'addr:postcode'?: string;
    amenity?: string;
    shop?: string;
    leisure?: string;
    tourism?: string;
    sport?: string;
    opening_hours?: string;
    website?: string;
    phone?: string;
    'contact:website'?: string;
    'contact:phone'?: string;
  };
}

export interface OSMSearchParams {
  latitude: number;
  longitude: number;
  radius: number; // in meters
}

/**
 * Search for events and venues using OpenStreetMap Overpass API
 * Finds: farmers markets, community centers, sports facilities, festivals, etc.
 */
export async function searchOSMEvents(
  params: OSMSearchParams
): Promise<{ events: OSMEvent[] }> {
  try {
    const radiusMeters = params.radius * 1609.34; // Convert miles to meters

    // Overpass QL query to find relevant venues and events
    // This searches for farmers markets, community centers, sports facilities, etc.
    const query = `
      [out:json][timeout:25];
      (
        // Farmers markets
        node["amenity"="marketplace"](around:${radiusMeters},${params.latitude},${params.longitude});
        way["amenity"="marketplace"](around:${radiusMeters},${params.latitude},${params.longitude});
        
        // Community centers
        node["amenity"="community_centre"](around:${radiusMeters},${params.latitude},${params.longitude});
        way["amenity"="community_centre"](around:${radiusMeters},${params.latitude},${params.longitude});
        
        // Sports facilities
        node["leisure"="sports_centre"](around:${radiusMeters},${params.latitude},${params.longitude});
        way["leisure"="sports_centre"](around:${radiusMeters},${params.latitude},${params.longitude});
        node["leisure"="stadium"](around:${radiusMeters},${params.latitude},${params.longitude});
        way["leisure"="stadium"](around:${radiusMeters},${params.latitude},${params.longitude});
        node["leisure"="track"](around:${radiusMeters},${params.latitude},${params.longitude});
        way["leisure"="track"](around:${radiusMeters},${params.latitude},${params.longitude});
        
        // Parks and recreation
        node["leisure"="park"](around:${radiusMeters},${params.latitude},${params.longitude});
        way["leisure"="park"](around:${radiusMeters},${params.latitude},${params.longitude});
        
        // Event venues
        node["tourism"="attraction"](around:${radiusMeters},${params.latitude},${params.longitude});
        way["tourism"="attraction"](around:${radiusMeters},${params.latitude},${params.longitude});
      );
      out center;
    `;

    const response = await axios.post(
      OVERPASS_API_BASE,
      `data=${encodeURIComponent(query)}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    const elements = response.data.elements || [];

    // Filter out results without names
    const namedEvents = elements.filter((element: OSMEvent) => element.tags?.name);

    return {
      events: namedEvents,
    };
  } catch (error: any) {
    console.error('Error searching OpenStreetMap:', error.message);
    // Return empty results instead of throwing to not break the aggregated search
    return { events: [] };
  }
}

/**
 * Get venue type category from OSM tags
 */
export function getOSMCategory(tags: OSMEvent['tags']): string {
  if (tags.amenity === 'marketplace') return 'Farmers Market';
  if (tags.amenity === 'community_centre') return 'Community';
  if (tags.leisure === 'sports_centre') return 'Sports';
  if (tags.leisure === 'stadium') return 'Sports';
  if (tags.leisure === 'track') return 'Athletics';
  if (tags.leisure === 'park') return 'Recreation';
  if (tags.tourism === 'attraction') return 'Attractions';
  if (tags.sport) return `Sports - ${tags.sport}`;
  return 'Local Venue';
}

/**
 * Format OSM address from tags
 */
export function formatOSMAddress(tags: OSMEvent['tags']): string | undefined {
  const parts = [];
  
  if (tags['addr:housenumber'] && tags['addr:street']) {
    parts.push(`${tags['addr:housenumber']} ${tags['addr:street']}`);
  } else if (tags['addr:street']) {
    parts.push(tags['addr:street']);
  }
  
  return parts.length > 0 ? parts.join(', ') : undefined;
}
