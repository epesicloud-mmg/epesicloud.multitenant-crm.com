import { Request } from 'express';
import { db } from './db';
import { events, type InsertEvent } from '@shared/schema';

// Event tracking service for automatic event logging
export class EventTracker {
  static async track(eventData: {
    eventName: string;
    userId?: number;
    tenantId: number;
    req?: Request;
    properties?: Record<string, any>;
  }) {
    try {
      const {
        eventName,
        userId,
        tenantId,
        req,
        properties = {}
      } = eventData;

      // Extract request metadata if available
      let url, userAgent, ipAddress, sessionId, source = 'web';
      
      if (req) {
        url = req.originalUrl;
        userAgent = req.get('User-Agent');
        ipAddress = req.ip || req.connection.remoteAddress;
        sessionId = req.sessionID;
        
        // Determine source based on User-Agent or headers
        if (userAgent?.includes('Mobile')) {
          source = 'mobile';
        } else if (req.get('X-API-Key')) {
          source = 'api';
        }
      }

      // Enrich properties with request context
      const enrichedProperties = {
        ...properties,
        ...(req && {
          method: req.method,
          path: req.path,
          query: req.query,
          referrer: req.get('Referrer'),
        })
      };

      const event: InsertEvent = {
        eventName,
        userId,
        tenantId,
        source,
        url,
        userAgent,
        ipAddress,
        sessionId,
        eventProperties: enrichedProperties,
      };

      await db.insert(events).values(event);
    } catch (error) {
      console.error('Failed to track event:', error);
      // Don't throw - event tracking shouldn't break the main flow
    }
  }

  // Common event tracking methods
  static async trackPageView(req: Request, userId?: number, tenantId: number = 1) {
    return this.track({
      eventName: 'page.view',
      userId,
      tenantId,
      req,
      properties: {
        page: req.path,
        referrer: req.get('Referrer'),
        duration: 0, // Can be updated with client-side timing
      }
    });
  }

  static async trackUserLogin(userId: number, tenantId: number, req?: Request) {
    return this.track({
      eventName: 'user.login',
      userId,
      tenantId,
      req,
      properties: {
        loginMethod: 'password',
      }
    });
  }

  static async trackUserLogout(userId: number, tenantId: number, req?: Request) {
    return this.track({
      eventName: 'user.logout',
      userId,
      tenantId,
      req,
    });
  }

  static async trackDealCreated(dealId: number, userId: number, tenantId: number, dealData: any, req?: Request) {
    return this.track({
      eventName: 'deal.created',
      userId,
      tenantId,
      req,
      properties: {
        dealId,
        value: dealData.value,
        stage: dealData.stage,
        assignedTo: dealData.assignedToId,
        contactId: dealData.contactId,
      }
    });
  }

  static async trackDealUpdated(dealId: number, userId: number, tenantId: number, changes: any, req?: Request) {
    return this.track({
      eventName: 'deal.updated',
      userId,
      tenantId,
      req,
      properties: {
        dealId,
        changes,
      }
    });
  }

  static async trackContactCreated(contactId: number, userId: number, tenantId: number, contactData: any, req?: Request) {
    return this.track({
      eventName: 'contact.created',
      userId,
      tenantId,
      req,
      properties: {
        contactId,
        companyId: contactData.companyId,
        assignedTo: contactData.assignedToId,
        source: contactData.contactSource,
      }
    });
  }

  static async trackActivityCreated(activityId: number, userId: number, tenantId: number, activityData: any, req?: Request) {
    return this.track({
      eventName: 'activity.created',
      userId,
      tenantId,
      req,
      properties: {
        activityId,
        type: activityData.type,
        contactId: activityData.contactId,
        dealId: activityData.dealId,
      }
    });
  }

  static async trackReportDownload(reportType: string, userId: number, tenantId: number, filters: any, req?: Request) {
    return this.track({
      eventName: 'report.download',
      userId,
      tenantId,
      req,
      properties: {
        reportType,
        format: 'PDF',
        filters,
      }
    });
  }

  static async trackSearchQuery(query: string, resultsCount: number, userId: number, tenantId: number, req?: Request) {
    return this.track({
      eventName: 'search.query',
      userId,
      tenantId,
      req,
      properties: {
        query,
        resultsCount,
        filters: req?.query,
      }
    });
  }

  static async trackAIInsightGenerated(insightType: string, confidence: number, userId: number, tenantId: number, req?: Request) {
    return this.track({
      eventName: 'ai.insight_generated',
      userId,
      tenantId,
      req,
      properties: {
        insightType,
        confidence,
        dataPoints: Math.floor(Math.random() * 500) + 100, // Would be actual data points in real implementation
        recommendation: insightType,
      }
    });
  }

  static async trackDashboardView(dashboardType: string, userId: number, tenantId: number, req?: Request) {
    return this.track({
      eventName: 'dashboard.view',
      userId,
      tenantId,
      req,
      properties: {
        dashboardType,
        viewType: 'full_page',
      }
    });
  }

  static async trackFeatureUsage(featureName: string, userId: number, tenantId: number, context: any, req?: Request) {
    return this.track({
      eventName: 'feature.used',
      userId,
      tenantId,
      req,
      properties: {
        featureName,
        context,
      }
    });
  }

  // Bulk event tracking for performance
  static async trackBulk(events: Array<Omit<InsertEvent, 'id' | 'timestamp' | 'createdAt'>>) {
    try {
      if (events.length === 0) return;
      
      await db.insert(events).values(events);
    } catch (error) {
      console.error('Failed to track bulk events:', error);
    }
  }
}

// Middleware for automatic page tracking
export function eventTrackingMiddleware() {
  return async (req: any, res: any, next: any) => {
    // Skip tracking for static assets and API health checks
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/) || 
        req.path === '/health' || 
        req.path.startsWith('/api/placeholder')) {
      return next();
    }

    // Skip tracking for auth endpoints (no tenant context during registration/login)
    if (req.path.startsWith('/api/auth/')) {
      return next();
    }

    // Track API calls
    if (req.path.startsWith('/api/')) {
      const userId = req.user?.id;
      const tenantId = parseInt(req.headers['x-tenant-id'] as string);
      
      // Only track if we have a valid tenantId
      if (tenantId) {
        await EventTracker.track({
          eventName: 'api.call',
          userId,
          tenantId,
          req,
          properties: {
            endpoint: req.path,
            method: req.method,
          }
        });
      }
    }

    next();
  };
}