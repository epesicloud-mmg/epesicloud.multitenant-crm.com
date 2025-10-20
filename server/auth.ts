import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { seedRealEstateData } from './seed-real-estate-data';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '30d';

export interface JWTPayload {
  userId: number;
  email: string;
  tenantId: number | null;
}

export interface AuthRequest extends Request {
  auth?: JWTPayload;
}

// Password hashing functions
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Token generation functions
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Middleware to authenticate requests
export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    res.status(403).json({ error: 'Invalid or expired token' });
    return;
  }

  req.auth = payload;
  
  // Set tenantId and userId on request for downstream middleware/routes
  (req as any).tenantId = payload.tenantId;
  (req as any).userId = payload.userId;
  
  next();
}

// Middleware to require tenant context
export function requireTenant(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.auth?.tenantId) {
    res.status(400).json({ error: 'Tenant context required' });
    return;
  }
  next();
}

// Helper to create default tenant for new user
export async function createDefaultTenant(userId: number, userName: string) {
  // Create tenant with user's name
  const tenant = await storage.createTenant({
    name: `${userName}'s Tenant`,
    subdomain: `${userName.toLowerCase().replace(/\s+/g, '-')}-${userId}`,
  });

  // Create default owner role for this tenant
  const ownerRole = await storage.createRole({
    name: 'Owner',
    level: 1,
    description: 'Tenant owner with full access',
    tenantId: tenant.id,
    isActive: true,
  });

  // Add user to tenant as owner
  await storage.addUserToTenant({
    userId,
    tenantId: tenant.id,
    roleId: ownerRole.id,
  });

  // Update user's last tenant
  await storage.updateUserLastTenant(userId, tenant.id);

  // Create default sales pipeline
  const pipeline = await storage.createSalesPipeline({
    title: 'Default Sales Pipeline',
    description: 'Main sales pipeline',
    isDefault: true,
    tenantId: tenant.id,
  });

  // Create default sales stages
  const stages = [
    { title: 'Research/Discovery', description: 'Initial research phase', order: 1 },
    { title: 'Initial Contact', description: 'First contact with lead', order: 2 },
    { title: 'Qualification', description: 'Qualify the lead', order: 3 },
    { title: 'Presentation', description: 'Present solution', order: 4 },
    { title: 'Negotiation', description: 'Negotiate terms', order: 5 },
    { title: 'Contract Accepted', description: 'Contract signed', order: 6 },
    { title: 'Closed Won', description: 'Deal won', order: 7 },
    { title: 'Closed Lost', description: 'Deal lost', order: 8 },
  ];

  for (const stage of stages) {
    await storage.createSalesStage({
      ...stage,
      salePipelineId: pipeline.id,
      tenantId: tenant.id,
    });
  }

  // Create default interest levels
  const interestLevels = [
    { level: 'Hot', description: 'High interest', color: '#ef4444' },
    { level: 'Warm', description: 'Medium interest', color: '#f97316' },
    { level: 'Cold', description: 'Low interest', color: '#3b82f6' },
  ];

  for (const level of interestLevels) {
    await storage.createInterestLevel({
      ...level,
      tenantId: tenant.id,
    });
  }

  // Create default activity types
  const activityTypes = [
    { typeName: 'Call', description: 'Phone call activity' },
    { typeName: 'Email', description: 'Email correspondence' },
    { typeName: 'Meeting', description: 'In-person or virtual meeting' },
    { typeName: 'Task', description: 'General task' },
  ];

  for (const activityType of activityTypes) {
    await storage.createActivityType({
      ...activityType,
      tenantId: tenant.id,
    });
  }

  // Seed real estate data (lead sources, product types, product categories)
  await seedRealEstateData(tenant.id);

  return tenant;
}

// Helper to create default global roles
export async function createDefaultGlobalRoles() {
  const roles = [
    { name: 'Admin', description: 'System administrator', tenantId: null },
    { name: 'Manager', description: 'Team manager', tenantId: null },
    { name: 'Member', description: 'Regular member', tenantId: null },
    { name: 'Viewer', description: 'Read-only access', tenantId: null },
  ];

  const createdRoles = [];
  for (let i = 0; i < roles.length; i++) {
    const role = roles[i];
    const existing = await storage.getRoles();
    if (!existing.find(r => r.name === role.name && !r.tenantId)) {
      createdRoles.push(await storage.createRole({ ...role, level: i + 1, isActive: true }));
    }
  }

  return createdRoles;
}

// Helper to create default permissions
export async function createDefaultPermissions() {
  const permissions = [
    // CRM permissions
    { name: 'view_contacts', description: 'View contacts', module: 'crm' },
    { name: 'create_contacts', description: 'Create contacts', module: 'crm' },
    { name: 'edit_contacts', description: 'Edit contacts', module: 'crm' },
    { name: 'delete_contacts', description: 'Delete contacts', module: 'crm' },
    { name: 'view_leads', description: 'View leads', module: 'crm' },
    { name: 'create_leads', description: 'Create leads', module: 'crm' },
    { name: 'edit_leads', description: 'Edit leads', module: 'crm' },
    { name: 'delete_leads', description: 'Delete leads', module: 'crm' },
    { name: 'view_deals', description: 'View deals', module: 'crm' },
    { name: 'create_deals', description: 'Create deals', module: 'crm' },
    { name: 'edit_deals', description: 'Edit deals', module: 'crm' },
    { name: 'delete_deals', description: 'Delete deals', module: 'crm' },
    { name: 'view_companies', description: 'View companies', module: 'crm' },
    { name: 'create_companies', description: 'Create companies', module: 'crm' },
    { name: 'edit_companies', description: 'Edit companies', module: 'crm' },
    { name: 'delete_companies', description: 'Delete companies', module: 'crm' },
    { name: 'view_products', description: 'View products', module: 'crm' },
    { name: 'manage_products', description: 'Manage products', module: 'crm' },
    { name: 'view_reports', description: 'View reports', module: 'crm' },
    // Tenant permissions
    { name: 'manage_users', description: 'Manage tenant users', module: 'tenant' },
    { name: 'manage_roles', description: 'Manage roles', module: 'tenant' },
    { name: 'manage_settings', description: 'Manage tenant settings', module: 'tenant' },
  ];

  const existingPermissions = await storage.getPermissions();
  const createdPermissions = [];

  for (const permission of permissions) {
    if (!existingPermissions.find(p => p.name === permission.name)) {
      createdPermissions.push(await storage.createPermission(permission));
    }
  }

  return createdPermissions;
}
