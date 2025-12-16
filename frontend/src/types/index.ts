export interface Location {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  venue: Venue;
  images?: Image[];
  priceRange?: {
    min: number;
    max: number;
    currency: string;
  };
  url?: string;
  category?: string;
  distance?: number;
  imageUrl?: string;
  title?: string;
  classifications?: Array<{
    segment?: {
      name?: string;
    };
  }>;
}

export interface Venue {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  location?: Location;
}

export interface Image {
  url: string;
  width: number;
  height: number;
}

export interface SearchFilters {
  location?: Location;
  radius: number;
  category?: string;
  keyword?: string;
}
