import { Request, Response } from 'express';
import * as ticketmasterService from '../services/ticketmaster';
import { SearchFilters } from '../models/Event';

export async function searchEvents(req: Request, res: Response) {
  try {
    const filters: SearchFilters = req.body;
    const events = await ticketmasterService.searchEvents(filters);
    res.json({ events, count: events.length });
  } catch (error) {
    console.error('Error in searchEvents controller:', error);
    res.status(500).json({ error: 'Failed to search events' });
  }
}

export async function getEventById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const event = await ticketmasterService.getEventById(id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ event });
  } catch (error) {
    console.error('Error in getEventById controller:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
}

export async function getNearbyEvents(req: Request, res: Response) {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const events = await ticketmasterService.getNearbyEvents(
      parseFloat(lat as string),
      parseFloat(lng as string),
      radius ? parseInt(radius as string) : 25
    );

    res.json({ events, count: events.length });
  } catch (error) {
    console.error('Error in getNearbyEvents controller:', error);
    res.status(500).json({ error: 'Failed to fetch nearby events' });
  }
}
