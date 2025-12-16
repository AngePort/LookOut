import { Router } from 'express';
import * as eventController from '../controllers/eventController';

const router = Router();

router.post('/search', eventController.searchEvents);
router.get('/nearby', eventController.getNearbyEvents);
router.get('/:id', eventController.getEventById);

export default router;
