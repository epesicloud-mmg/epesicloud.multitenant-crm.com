import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  authenticateToken,
  createDefaultTenant,
  AuthRequest,
} from '../auth';

const router = Router();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const schema = z.object({
      username: z.string().min(3),
      email: z.string().email(),
      password: z.string().min(6),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      phone: z.string().optional(),
    });

    const data = schema.parse(req.body);

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(data.email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const existingUsername = await storage.getUserByUsername(data.username);
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Step 1: Create tenant first
    const tenant = await storage.createTenant({
      name: `${data.firstName} ${data.lastName}'s Workspace`,
      subdomain: `${data.username}-${Date.now()}`.toLowerCase().replace(/\s+/g, '-'),
    });

    // Step 2: Create owner role for this tenant
    const ownerRole = await storage.createRole({
      name: 'Owner',
      level: 1, // Highest level (1 = Owner/Admin)
      permissions: [],
      description: 'Tenant owner with full access',
      modules: [],
      isActive: true,
      tenantId: tenant.id,
    } as any);

    // Step 3: Create user with tenant and role
    const user = await storage.createUser({
      username: data.username,
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      isActive: true,
      roleId: ownerRole.id,
      tenantId: tenant.id,
    } as any);

    // Step 4: Add user to tenant as owner
    await storage.addUserToTenant({
      userId: user.id,
      tenantId: tenant.id,
      roleId: ownerRole.id,
    });

    // Update user's last login
    await storage.updateUserLastLogin(user.id);

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      tenantId: tenant.id,
    });

    const refreshTokenValue = generateRefreshToken();
    const refreshTokenHash = hashToken(refreshTokenValue);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await storage.createRefreshToken({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt,
      revoked: false,
    });

    return res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
      },
      accessToken,
      refreshToken: refreshTokenValue,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      password: z.string(),
    });

    const data = schema.parse(req.body);

    // Get user by email
    const user = await storage.getUserByEmail(data.email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await verifyPassword(data.password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    // Get user's last tenant or default to first tenant
    let tenantId = user.lastTenantId;
    
    if (!tenantId) {
      // Get user's tenants
      const tenants = await storage.getUserTenants(user.id);
      
      if (tenants.length === 0) {
        // Create default tenant if user has none
        const tenant = await createDefaultTenant(user.id, `${user.firstName} ${user.lastName}`);
        tenantId = tenant.id;
      } else {
        tenantId = tenants[0].id;
        await storage.updateUserLastTenant(user.id, tenantId);
      }
    }

    // Update last login
    await storage.updateUserLastLogin(user.id);

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      tenantId,
    });

    const refreshTokenValue = generateRefreshToken();
    const refreshTokenHash = hashToken(refreshTokenValue);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await storage.createRefreshToken({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt,
      revoked: false,
    });

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      tenantId,
      accessToken,
      refreshToken: refreshTokenValue,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const schema = z.object({
      refreshToken: z.string(),
    });

    const data = schema.parse(req.body);
    const tokenHash = hashToken(data.refreshToken);

    // Verify refresh token
    const storedToken = await storage.getRefreshToken(tokenHash);
    if (!storedToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Check if token is expired
    if (new Date() > storedToken.expiresAt) {
      return res.status(401).json({ error: 'Refresh token expired' });
    }

    // Get user
    const user = await storage.getUser(storedToken.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    // Use last tenant
    const tenantId = user.lastTenantId;

    // If user has no lastTenantId, try to get their first tenant
    if (!tenantId) {
      const userTenants = await storage.getUserTenants(user.id);
      if (userTenants.length === 0) {
        return res.status(400).json({ 
          error: 'User has no associated tenant. Please contact support.' 
        });
      }
      // Use first tenant and update lastTenantId
      const firstTenant = userTenants[0];
      await storage.updateUserLastTenant(user.id, firstTenant.id);
      // Reload user to get updated lastTenantId
      const updatedUser = await storage.getUser(user.id);
      if (!updatedUser) {
        return res.status(500).json({ error: 'Failed to update user tenant' });
      }
    }

    // Get tenant details
    const tenant = tenantId ? await storage.getTenant(tenantId) : null;

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      tenantId: tenantId || null,
    });

    // Optionally rotate refresh token
    await storage.revokeRefreshToken(tokenHash);

    const newRefreshTokenValue = generateRefreshToken();
    const newRefreshTokenHash = hashToken(newRefreshTokenValue);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await storage.createRefreshToken({
      userId: user.id,
      tokenHash: newRefreshTokenHash,
      expiresAt,
      revoked: false,
    });

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      tenant: tenant ? {
        id: tenant.id,
        name: tenant.name,
      } : null,
      accessToken,
      refreshToken: newRefreshTokenValue,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Refresh token error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    const schema = z.object({
      refreshToken: z.string(),
    });

    const data = schema.parse(req.body);
    const tokenHash = hashToken(data.refreshToken);

    // Revoke refresh token
    await storage.revokeRefreshToken(tokenHash);

    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user (protected)
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.auth) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await storage.getUser(req.auth.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's tenants
    const tenants = await storage.getUserTenants(user.id);

    // Get current tenant
    const currentTenant = req.auth.tenantId 
      ? await storage.getTenant(req.auth.tenantId)
      : null;

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
      },
      currentTenant: currentTenant ? {
        id: currentTenant.id,
        name: currentTenant.name,
        subdomain: currentTenant.subdomain,
      } : null,
      tenants: tenants.map(t => ({
        id: t.id,
        name: t.name,
        subdomain: t.subdomain,
        role: t.role,
      })),
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
