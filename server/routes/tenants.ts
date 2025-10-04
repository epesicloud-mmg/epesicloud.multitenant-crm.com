import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import {
  authenticateToken,
  generateAccessToken,
  AuthRequest,
  createDefaultTenant,
} from '../auth';

const router = Router();

// All tenant routes require authentication
router.use(authenticateToken);

// Get user's tenants
router.get('/', async (req: AuthRequest, res) => {
  try {
    if (!req.auth) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const tenants = await storage.getUserTenants(req.auth.userId);

    return res.json(tenants.map(t => ({
      id: t.id,
      name: t.name,
      subdomain: t.subdomain,
      role: t.role,
      createdAt: t.createdAt,
    })));
  } catch (error) {
    console.error('Get tenants error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Switch active tenant
router.post('/switch', async (req: AuthRequest, res) => {
  try {
    if (!req.auth) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const schema = z.object({
      tenantId: z.number(),
    });

    const data = schema.parse(req.body);

    // Verify user has access to this tenant
    const membership = await storage.getUserTenantMembership(req.auth.userId, data.tenantId);
    if (!membership) {
      return res.status(403).json({ error: 'You do not have access to this tenant' });
    }

    // Update user's last tenant
    await storage.updateUserLastTenant(req.auth.userId, data.tenantId);

    // Generate new access token with new tenant context
    const accessToken = generateAccessToken({
      userId: req.auth.userId,
      email: req.auth.email,
      tenantId: data.tenantId,
    });

    const tenant = await storage.getTenant(data.tenantId);

    return res.json({
      accessToken,
      tenant: tenant ? {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
      } : null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Switch tenant error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new tenant
router.post('/', async (req: AuthRequest, res) => {
  try {
    if (!req.auth) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const schema = z.object({
      name: z.string().min(1),
    });

    const data = schema.parse(req.body);

    // Get user
    const user = await storage.getUser(req.auth.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create tenant
    const tenant = await createDefaultTenant(req.auth.userId, data.name);

    // Generate new access token with new tenant context
    const accessToken = generateAccessToken({
      userId: req.auth.userId,
      email: req.auth.email,
      tenantId: tenant.id,
    });

    return res.status(201).json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
      },
      accessToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create tenant error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get tenant details
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    if (!req.auth) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const tenantId = parseInt(req.params.id);
    
    // Verify user has access to this tenant
    const membership = await storage.getUserTenantMembership(req.auth.userId, tenantId);
    if (!membership) {
      return res.status(403).json({ error: 'You do not have access to this tenant' });
    }

    const tenant = await storage.getTenant(tenantId);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Get tenant users
    const tenantUsers = await storage.getTenantUsers(tenantId);

    return res.json({
      id: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      createdAt: tenant.createdAt,
      users: tenantUsers.map(tu => ({
        id: tu.user.id,
        username: tu.user.username,
        email: tu.user.email,
        firstName: tu.user.firstName,
        lastName: tu.user.lastName,
        roleId: tu.roleId,
      })),
    });
  } catch (error) {
    console.error('Get tenant details error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Invite user to tenant (future feature)
router.post('/:id/invite', async (req: AuthRequest, res) => {
  try {
    if (!req.auth) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const tenantId = parseInt(req.params.id);

    // Verify user has access to this tenant
    const membership = await storage.getUserTenantMembership(req.auth.userId, tenantId);
    if (!membership) {
      return res.status(403).json({ error: 'You do not have access to this tenant' });
    }

    const schema = z.object({
      email: z.string().email(),
      roleId: z.number(),
    });

    const data = schema.parse(req.body);

    // Check if user exists
    const invitedUser = await storage.getUserByEmail(data.email);
    if (!invitedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is already a member
    const existingMembership = await storage.getUserTenantMembership(invitedUser.id, tenantId);
    if (existingMembership) {
      return res.status(400).json({ error: 'User is already a member of this tenant' });
    }

    // Add user to tenant
    await storage.addUserToTenant({
      userId: invitedUser.id,
      tenantId,
      roleId: data.roleId,
    });

    return res.status(201).json({ message: 'User added to tenant successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Invite user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
