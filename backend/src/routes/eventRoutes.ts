import { Router } from 'express';
import * as eventController from '../controllers/eventController';

const router = Router();

// Search events with filters (POST with body)
router.post('/search', eventController.searchEvents);

// Get nearby events using coordinates (GET with query params)
router.get('/nearby', eventController.getNearbyEvents);

// Get specific event by source and ID
router.get('/:source/:id', eventController.getEventById);

export default router;
