import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { eventLogs, type InsertEventLog } from '@shared/schema';

interface AuditRequest extends Request {
  user?: {
    id: number;
    tenantId: number;
  };
  auditLog?: {
    sourceEntity: string;
    sourceEntityReference?: number;
    description: string;
    eventType: 'created' | 'updated' | 'deleted' | 'viewed';
    metadata?: Record<string, any>;
  };
}

// Middleware to log CRUD operations for auditing and AI context
export const auditLogger = () => {
  return async (req: AuditRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    const originalJson = res.json;

    // Override res.send and res.json to capture successful operations
    res.send = function(body: any) {
      logAuditEvent(req, res, body);
      return originalSend.call(this, body);
    };

    res.json = function(obj: any) {
      logAuditEvent(req, res, obj);
      return originalJson.call(this, obj);
    };

    next();
  };
};

async function logAuditEvent(req: AuditRequest, res: Response, responseBody: any) {
  // Only log successful operations (2xx status codes)
  if (res.statusCode < 200 || res.statusCode >= 300) {
    return;
  }

  // Skip logging for GET requests (these are reads, not changes)
  if (req.method === 'GET') {
    return;
  }

  try {
    const userId = req.user?.id || null;
    const tenantId = req.user?.tenantId || 1; // Default tenant for development

    // Determine the entity from the URL path
    const pathSegments = req.path.split('/').filter(segment => segment !== '');
    const entityMap: Record<string, string> = {
      'deals': 'deals',
      'contacts': 'contacts', 
      'companies': 'companies',
      'activities': 'activities',
      'products': 'products',
      'leads': 'leads',
      'users': 'users',
      'pipelines': 'sales_pipelines',
      'stages': 'sales_stages'
    };

    let sourceEntity = '';
    let eventType: 'created' | 'updated' | 'deleted' | 'viewed' = 'viewed';
    let description = '';
    let sourceEntityReference: number | null = null;

    // Find the entity from the path
    for (const segment of pathSegments) {
      if (entityMap[segment]) {
        sourceEntity = entityMap[segment];
        break;
      }
    }

    if (!sourceEntity) {
      return; // Skip if we can't determine the entity
    }

    // Determine event type based on HTTP method
    switch (req.method) {
      case 'POST':
        eventType = 'created';
        // Try to get the new record ID from response
        if (responseBody && responseBody.id) {
          sourceEntityReference = responseBody.id;
        }
        description = `Created new ${sourceEntity.replace('_', ' ')} record`;
        break;
      case 'PUT':
      case 'PATCH':
        eventType = 'updated';
        // Try to get the record ID from URL or response
        const idFromPath = pathSegments.find(segment => /^\d+$/.test(segment));
        if (idFromPath) {
          sourceEntityReference = parseInt(idFromPath);
        } else if (responseBody && responseBody.id) {
          sourceEntityReference = responseBody.id;
        }
        description = `Updated ${sourceEntity.replace('_', ' ')} record`;
        break;
      case 'DELETE':
        eventType = 'deleted';
        const deleteIdFromPath = pathSegments.find(segment => /^\d+$/.test(segment));
        if (deleteIdFromPath) {
          sourceEntityReference = parseInt(deleteIdFromPath);
        }
        description = `Deleted ${sourceEntity.replace('_', ' ')} record`;
        break;
      default:
        return; // Skip logging for other methods
    }

    // Create audit log entry
    const auditEntry: InsertEventLog = {
      userId,
      sourceEntity,
      sourceEntityReference,
      description,
      eventType,
      metadata: {
        method: req.method,
        path: req.path,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        timestamp: new Date().toISOString()
      },
      tenantId
    };

    await db.insert(eventLogs).values(auditEntry);
    
  } catch (error) {
    console.error('Failed to log audit event:', error);
    // Don't throw - audit logging should not break the main functionality
  }
}

// Helper function to manually log page navigation events
export async function logPageView(userId: number | null, tenantId: number, pageName: string, path: string) {
  try {
    const auditEntry: InsertEventLog = {
      userId,
      sourceEntity: 'navigation',
      sourceEntityReference: null,
      description: `Viewed ${pageName} page`,
      eventType: 'viewed',
      metadata: {
        pageName,
        path,
        timestamp: new Date().toISOString()
      },
      tenantId
    };

    await db.insert(eventLogs).values(auditEntry);
  } catch (error) {
    console.error('Failed to log page view:', error);
  }
}