import { Request, Response } from 'express';
import { db } from '../db';
import { events, type InsertEvent } from '@shared/schema';
import { and, eq, desc, gte, sql } from 'drizzle-orm';
import { z } from 'zod';

// Request validation schemas
const createEventSchema = z.object({
  eventName: z.string().min(1),
  userId: z.number().optional(),
  workspaceId: z.number().optional(),
  source: z.string().default('web'),
  url: z.string().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  sessionId: z.string().optional(),
  eventProperties: z.record(z.any()).default({}),
});

const getEventsSchema = z.object({
  limit: z.string().transform(val => parseInt(val, 10)).default('50'),
  offset: z.string().transform(val => parseInt(val, 10)).default('0'),
  eventName: z.string().optional(),
  userId: z.string().transform(val => parseInt(val, 10)).optional(),
  from: z.string().optional(), // ISO date string
  to: z.string().optional(), // ISO date string
});

// Get events with filtering and pagination
export async function getEvents(req: Request, res: Response) {
  try {
    const tenantId = parseInt(req.headers['x-tenant-id'] as string) || 1;
    const query = getEventsSchema.parse(req.query);

    // Build where conditions
    const conditions = [eq(events.tenantId, tenantId)];
    
    if (query.eventName) {
      conditions.push(eq(events.eventName, query.eventName));
    }
    
    if (query.userId) {
      conditions.push(eq(events.userId, query.userId));
    }
    
    if (query.from) {
      conditions.push(gte(events.timestamp, new Date(query.from)));
    }
    
    if (query.to) {
      conditions.push(gte(new Date(query.to), events.timestamp));
    }

    const eventsList = await db
      .select()
      .from(events)
      .where(and(...conditions))
      .orderBy(desc(events.timestamp))
      .limit(query.limit)
      .offset(query.offset);

    res.json(eventsList);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
}

// Create a new event
export async function createEvent(req: Request, res: Response) {
  try {
    const tenantId = parseInt(req.headers['x-tenant-id'] as string) || 1;
    const eventData = createEventSchema.parse(req.body);

    const newEvent = await db
      .insert(events)
      .values({
        ...eventData,
        tenantId,
      } as InsertEvent)
      .returning();

    res.status(201).json(newEvent[0]);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
}

// Get event analytics and insights
export async function getEventAnalytics(req: Request, res: Response) {
  try {
    const tenantId = parseInt(req.headers['x-tenant-id'] as string) || 1;
    const { timeframe = '7d' } = req.query;

    // Calculate date range
    const now = new Date();
    const daysBack = timeframe === '30d' ? 30 : timeframe === '1d' ? 1 : 7;
    const fromDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    // Get event counts by type
    const eventCounts = await db
      .select({
        eventName: events.eventName,
        count: sql<number>`count(*)::int`,
      })
      .from(events)
      .where(
        and(
          eq(events.tenantId, tenantId),
          gte(events.timestamp, fromDate)
        )
      )
      .groupBy(events.eventName)
      .orderBy(desc(sql`count(*)`));

    // Get events by hour for timeline
    const hourlyEvents = await db
      .select({
        hour: sql<string>`date_trunc('hour', timestamp)`,
        count: sql<number>`count(*)::int`,
      })
      .from(events)
      .where(
        and(
          eq(events.tenantId, tenantId),
          gte(events.timestamp, fromDate)
        )
      )
      .groupBy(sql`date_trunc('hour', timestamp)`)
      .orderBy(sql`date_trunc('hour', timestamp)`);

    // Get top users by activity
    const topUsers = await db
      .select({
        userId: events.userId,
        count: sql<number>`count(*)::int`,
      })
      .from(events)
      .where(
        and(
          eq(events.tenantId, tenantId),
          gte(events.timestamp, fromDate)
        )
      )
      .groupBy(events.userId)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    // Get page views and popular pages
    const pageViews = await db
      .select({
        page: sql<string>`event_properties->>'page'`,
        count: sql<number>`count(*)::int`,
      })
      .from(events)
      .where(
        and(
          eq(events.tenantId, tenantId),
          eq(events.eventName, 'page.view'),
          gte(events.timestamp, fromDate)
        )
      )
      .groupBy(sql`event_properties->>'page'`)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    res.json({
      timeframe: `${daysBack} days`,
      summary: {
        totalEvents: eventCounts.reduce((sum, item) => sum + item.count, 0),
        uniqueEventTypes: eventCounts.length,
        activeUsers: topUsers.length,
        totalPageViews: pageViews.reduce((sum, item) => sum + item.count, 0),
      },
      eventsByType: eventCounts,
      timeline: hourlyEvents,
      topUsers,
      popularPages: pageViews,
    });
  } catch (error) {
    console.error('Error fetching event analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}

// Search events by properties
export async function searchEvents(req: Request, res: Response) {
  try {
    const tenantId = parseInt(req.headers['x-tenant-id'] as string) || 1;
    const { query: searchQuery, limit = 50 } = req.query;

    if (!searchQuery) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchResults = await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.tenantId, tenantId),
          sql`(
            event_name ILIKE ${`%${searchQuery}%`} OR
            event_properties::text ILIKE ${`%${searchQuery}%`} OR
            url ILIKE ${`%${searchQuery}%`}
          )`
        )
      )
      .orderBy(desc(events.timestamp))
      .limit(parseInt(limit as string));

    res.json(searchResults);
  } catch (error) {
    console.error('Error searching events:', error);
    res.status(500).json({ error: 'Failed to search events' });
  }
}

// Get event funnel analysis
export async function getEventFunnel(req: Request, res: Response) {
  try {
    const tenantId = parseInt(req.headers['x-tenant-id'] as string) || 1;
    const { steps } = req.body; // Array of event names representing funnel steps

    if (!steps || !Array.isArray(steps)) {
      return res.status(400).json({ error: 'Funnel steps are required' });
    }

    const funnelData = [];
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepData = await db
        .select({
          count: sql<number>`count(distinct user_id)::int`,
        })
        .from(events)
        .where(
          and(
            eq(events.tenantId, tenantId),
            eq(events.eventName, step)
          )
        );

      funnelData.push({
        step: step,
        stepNumber: i + 1,
        users: stepData[0]?.count || 0,
        dropoffRate: i > 0 ? 
          Math.max(0, (funnelData[i-1].users - (stepData[0]?.count || 0)) / funnelData[i-1].users * 100) : 0
      });
    }

    res.json({
      funnel: funnelData,
      conversionRate: funnelData.length > 1 ? 
        (funnelData[funnelData.length - 1].users / funnelData[0].users * 100) : 100
    });
  } catch (error) {
    console.error('Error calculating funnel:', error);
    res.status(500).json({ error: 'Failed to calculate funnel' });
  }
}