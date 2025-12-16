import { Request, Response } from 'express';
import { searchAllEvents, getEventById as getEventByIdService } from '../services/events.service';

/**
 * Search events from all sources (POST /api/events/search)
 */
export async function searchEvents(req: Request, res: Response) {
  try {
    const {
      latitude,
      longitude,
      radius,
      city,
      stateCode,
      startDate,
      endDate,
      category,
      isFree,
      page,
      limit,
    } = req.body;

    const result = await searchAllEvents({
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      radius: radius ? parseInt(radius) : undefined,
      city,
      stateCode,
      startDate,
      endDate,
      category,
      isFree,
      page: page ? parseInt(page) : 0,
      limit: limit ? parseInt(limit) : 20,
    });

    res.json({
      success: true,
      events: result.events,
      count: result.events.length,
      totalResults: result.totalResults,
    });
  } catch (error: any) {
    console.error('Error in searchEvents controller:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to search events',
      message: error.message
    });
  }
}

/**
 * Get nearby events using lat/lng (GET /api/events/nearby)
 */
export async function getNearbyEvents(req: Request, res: Response) {
  try {
    const { lat, lng, radius, category, isFree, page, limit } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const result = await searchAllEvents({
      latitude: parseFloat(lat as string),
      longitude: parseFloat(lng as string),
      radius: radius ? parseInt(radius as string) : 25,
      category: category as string,
      isFree: isFree === 'true',
      page: page ? parseInt(page as string) : 0,
      limit: limit ? parseInt(limit as string) : 20,
    });

    res.json({
      success: true,
      events: result.events,
      count: result.events.length,
      totalResults: result.totalResults,
    });
  } catch (error: any) {
    console.error('Error in getNearbyEvents controller:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch nearby events',
      message: error.message
    });
  }
}

/**
 * Get event by ID (GET /api/events/:source/:id)
 * Example: /api/events/ticketmaster/12345 or /api/events/eventbrite/67890
 */
export async function getEventById(req: Request, res: Response) {
  try {
    const { source, id } = req.params;

    if (!source || !id) {
      return res.status(400).json({
        success: false,
        error: 'Source and ID are required'
      });
    }

    const event = await getEventByIdService(source, id);

    res.json({
      success: true,
      event,
    });
  } catch (error: any) {
    console.error('Error in getEventById controller:', error.message);

    if (error.message.includes('Invalid event source')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event source',
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch event',
      message: error.message
    });
  }
}
