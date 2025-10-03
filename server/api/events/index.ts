import { Router } from 'express';
import { getEvents, createEvent, getEventAnalytics, searchEvents, getEventFunnel } from '../events';

const router = Router();

// GET /api/events - Get events with filtering
router.get('/', getEvents);

// POST /api/events - Create a new event
router.post('/', createEvent);

// GET /api/events/analytics - Get event analytics
router.get('/analytics', getEventAnalytics);

// GET /api/events/search - Search events
router.get('/search', searchEvents);

// POST /api/events/funnel - Get funnel analysis
router.post('/funnel', getEventFunnel);

export default router;