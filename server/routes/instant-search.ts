import { Router } from 'express';
import { z } from 'zod';
import { eq, and, desc, like, or, sql } from 'drizzle-orm';
import { db } from '../db';
import { 
  instantSearches, 
  instantSearchEvents,
  products,
  productTypes,
  productCategories,
  insertInstantSearchSchema,
  insertInstantSearchEventSchema
} from '@shared/schema';

const router = Router();

// Get all instant searches for a tenant
router.get('/', async (req, res) => {
  try {
    const tenantId = parseInt(req.headers['x-tenant-id'] as string || '1');
    
    const results = await db
      .select()
      .from(instantSearches)
      .where(eq(instantSearches.tenantId, tenantId))
      .orderBy(desc(instantSearches.createdAt));

    res.json(results);
  } catch (error) {
    console.error('Error fetching instant searches:', error);
    res.status(500).json({ error: 'Failed to fetch instant searches' });
  }
});

// Get a specific instant search
router.get('/:id', async (req, res) => {
  try {
    const tenantId = parseInt(req.headers['x-tenant-id'] as string || '1');
    const searchId = parseInt(req.params.id);

    const [search] = await db
      .select()
      .from(instantSearches)
      .where(and(
        eq(instantSearches.id, searchId),
        eq(instantSearches.tenantId, tenantId)
      ));

    if (!search) {
      return res.status(404).json({ error: 'Instant search not found' });
    }

    res.json(search);
  } catch (error) {
    console.error('Error fetching instant search:', error);
    res.status(500).json({ error: 'Failed to fetch instant search' });
  }
});

// Create a new instant search
router.post('/', async (req, res) => {
  try {
    const tenantId = parseInt(req.headers['x-tenant-id'] as string || '1');
    
    const validatedData = insertInstantSearchSchema.parse({
      ...req.body,
      tenantId
    });

    const [newSearch] = await db
      .insert(instantSearches)
      .values(validatedData)
      .returning();

    res.status(201).json(newSearch);
  } catch (error) {
    console.error('Error creating instant search:', error);
    res.status(500).json({ error: 'Failed to create instant search' });
  }
});

// Update an instant search
router.put('/:id', async (req, res) => {
  try {
    const tenantId = parseInt(req.headers['x-tenant-id'] as string || '1');
    const searchId = parseInt(req.params.id);

    const validatedData = insertInstantSearchSchema.partial().parse(req.body);

    const [updatedSearch] = await db
      .update(instantSearches)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(and(
        eq(instantSearches.id, searchId),
        eq(instantSearches.tenantId, tenantId)
      ))
      .returning();

    if (!updatedSearch) {
      return res.status(404).json({ error: 'Instant search not found' });
    }

    res.json(updatedSearch);
  } catch (error) {
    console.error('Error updating instant search:', error);
    res.status(500).json({ error: 'Failed to update instant search' });
  }
});

// Delete an instant search
router.delete('/:id', async (req, res) => {
  try {
    const tenantId = parseInt(req.headers['x-tenant-id'] as string || '1');
    const searchId = parseInt(req.params.id);

    const [deletedSearch] = await db
      .delete(instantSearches)
      .where(and(
        eq(instantSearches.id, searchId),
        eq(instantSearches.tenantId, tenantId)
      ))
      .returning();

    if (!deletedSearch) {
      return res.status(404).json({ error: 'Instant search not found' });
    }

    res.json({ message: 'Instant search deleted successfully' });
  } catch (error) {
    console.error('Error deleting instant search:', error);
    res.status(500).json({ error: 'Failed to delete instant search' });
  }
});

// Search products with instant search functionality
router.post('/:id/search', async (req, res) => {
  try {
    const tenantId = parseInt(req.headers['x-tenant-id'] as string || '1');
    const searchId = parseInt(req.params.id);
    const { query, filters, limit = 20, offset = 0 } = req.body;

    // Build the search query
    let searchQuery = db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        sku: products.sku,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        hasOffers: sql<boolean>`CASE WHEN EXISTS(SELECT 1 FROM product_offers WHERE product_id = ${products.id}) THEN true ELSE false END`,
        productType: productTypes.name,
        productCategory: productCategories.name,
      })
      .from(products)
      .leftJoin(productTypes, eq(products.productTypeId, productTypes.id))
      .leftJoin(productCategories, eq(products.categoryId, productCategories.id))
;

    // Build conditions array
    const conditions = [
      eq(products.tenantId, tenantId),
      eq(products.isActive, true)
    ];

    // Add text search if query is provided
    if (query && query.trim()) {
      conditions.push(
        or(
          like(products.name, `%${query}%`),
          like(products.description, `%${query}%`)
        )
      );
    }

    // Apply filters
    if (filters) {
      if (filters.is_featured === true) {
        conditions.push(eq(products.isFeatured, true));
      }
      if (filters.product_type) {
        conditions.push(eq(products.productTypeId, filters.product_type));
      }
      if (filters.product_category) {
        conditions.push(eq(products.categoryId, filters.product_category));
      }
    }

    // Apply all conditions
    searchQuery = searchQuery.where(and(...conditions));

    // Apply pagination
    const results = await searchQuery
      .limit(limit)
      .offset(offset)
      .orderBy(desc(products.isFeatured), products.name);

    // Log the search event
    if (query || filters) {
      await db.insert(instantSearchEvents).values({
        instantSearchId: searchId,
        eventType: 'search',
        query: query || null,
        filters: filters || null,
        results: { count: results.length, total: results.length },
        sessionId: req.headers['x-session-id'] as string || 'anonymous',
        userAgent: req.headers['user-agent'] || null,
        ipAddress: req.ip || null,
        tenantId
      });
    }

    res.json({
      results,
      pagination: {
        limit,
        offset,
        total: results.length
      }
    });
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

// Track search events
router.post('/:id/events', async (req, res) => {
  try {
    const tenantId = parseInt(req.headers['x-tenant-id'] as string || '1');
    const searchId = parseInt(req.params.id);

    const validatedData = insertInstantSearchEventSchema.parse({
      ...req.body,
      instantSearchId: searchId,
      tenantId,
      sessionId: req.headers['x-session-id'] as string || 'anonymous',
      userAgent: req.headers['user-agent'] || null,
      ipAddress: req.ip || null,
    });

    const [newEvent] = await db
      .insert(instantSearchEvents)
      .values(validatedData)
      .returning();

    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error tracking search event:', error);
    res.status(500).json({ error: 'Failed to track search event' });
  }
});

// Get analytics for an instant search
router.get('/:id/analytics', async (req, res) => {
  try {
    const tenantId = parseInt(req.headers['x-tenant-id'] as string || '1');
    const searchId = parseInt(req.params.id);
    const { dateFrom, dateTo } = req.query;

    let analyticsQuery = db
      .select({
        eventType: instantSearchEvents.eventType,
        count: sql<number>`COUNT(*)`,
        date: sql<string>`DATE(${instantSearchEvents.createdAt})`,
      })
      .from(instantSearchEvents)
      .where(and(
        eq(instantSearchEvents.instantSearchId, searchId),
        eq(instantSearchEvents.tenantId, tenantId)
      ))
      .groupBy(instantSearchEvents.eventType, sql`DATE(${instantSearchEvents.createdAt})`)
      .orderBy(sql`DATE(${instantSearchEvents.createdAt})`);

    const analyticsConditions = [
      eq(instantSearchEvents.instantSearchId, searchId),
      eq(instantSearchEvents.tenantId, tenantId)
    ];

    if (dateFrom) {
      analyticsConditions.push(
        sql`${instantSearchEvents.createdAt} >= ${new Date(dateFrom as string)}`
      );
    }

    if (dateTo) {
      analyticsConditions.push(
        sql`${instantSearchEvents.createdAt} <= ${new Date(dateTo as string)}`
      );
    }

    analyticsQuery = analyticsQuery.where(and(...analyticsConditions));

    const analytics = await analyticsQuery;

    // Get top queries
    const topQueries = await db
      .select({
        query: instantSearchEvents.query,
        searches: sql<number>`COUNT(*)`,
        clicks: sql<number>`SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END)`,
      })
      .from(instantSearchEvents)
      .where(and(
        eq(instantSearchEvents.instantSearchId, searchId),
        eq(instantSearchEvents.tenantId, tenantId),
        eq(instantSearchEvents.eventType, 'search'),
        sql`${instantSearchEvents.query} IS NOT NULL`
      ))
      .groupBy(instantSearchEvents.query)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(10);

    res.json({
      analytics,
      topQueries
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;