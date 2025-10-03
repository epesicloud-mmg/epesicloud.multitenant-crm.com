import { Router } from "express";
import { storage } from "../storage";
import { insertUserSchema, insertRoleSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Get current user session info
router.get("/current", async (req, res) => {
  try {
    // Mock session - in production this would come from session/JWT
    const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id'] as string) : 1;
    const tenantId = parseInt(req.headers['x-tenant-id'] as string) || 1;
    
    if (!userId) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await storage.getUserWithPermissions(userId, tenantId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Get all users with filtering based on role permissions
router.get("/", async (req, res) => {
  try {
    const tenantId = parseInt(req.headers['x-tenant-id'] as string) || 1;
    const currentUserId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id'] as string) : 1;
    const workspaceId = req.query.workspaceId ? parseInt(req.query.workspaceId as string) : undefined;
    const roleFilter = req.query.role as string | undefined;
    const managerId = req.query.managerId ? parseInt(req.query.managerId as string) : undefined;

    // Get current user's data scope
    const dataScope = await storage.getUserDataScope(currentUserId, tenantId);
    
    let users;
    if (dataScope === 'own') {
      // Agent: only see themselves
      users = await storage.getUsers(tenantId, currentUserId, currentUserId);
    } else if (dataScope === 'team') {
      // Supervisor: see their subordinates
      users = await storage.getUsers(tenantId, workspaceId, managerId || currentUserId);
    } else {
      // Manager/Admin: see all users
      users = await storage.getUsers(tenantId, workspaceId, managerId);
    }

    // Apply role filter if provided
    if (roleFilter) {
      users = users.filter(user => user.role.name.toLowerCase().includes(roleFilter.toLowerCase()));
    }

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get user hierarchy (manager and subordinates)
router.get("/:id/hierarchy", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const tenantId = parseInt(req.headers['x-tenant-id'] as string) || 1;
    
    const hierarchy = await storage.getUserHierarchy(userId, tenantId);
    if (!hierarchy) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(hierarchy);
  } catch (error) {
    console.error("Error fetching user hierarchy:", error);
    res.status(500).json({ error: "Failed to fetch user hierarchy" });
  }
});

// Get all roles
router.get("/roles", async (req, res) => {
  try {
    const tenantId = parseInt(req.headers['x-tenant-id'] as string) || 1;
    const workspaceId = req.query.workspaceId ? parseInt(req.query.workspaceId as string) : undefined;
    
    const roles = await storage.getRoles(tenantId, workspaceId);
    res.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
});

// Create new user
router.post("/", async (req, res) => {
  try {
    const tenantId = parseInt(req.headers['x-tenant-id'] as string) || 1;
    
    const validatedData = insertUserSchema.parse({
      ...req.body,
      tenantId
    });
    
    const user = await storage.createUser(validatedData);
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid user data", details: error.errors });
    } else {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  }
});

// Update user
router.put("/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const tenantId = parseInt(req.headers['x-tenant-id'] as string) || 1;
    
    const validatedData = insertUserSchema.partial().parse(req.body);
    
    const user = await storage.updateUser(userId, validatedData, tenantId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid user data", details: error.errors });
    } else {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  }
});

// Create new role
router.post("/roles", async (req, res) => {
  try {
    const tenantId = parseInt(req.headers['x-tenant-id'] as string) || 1;
    
    const validatedData = insertRoleSchema.parse({
      ...req.body,
      tenantId
    });
    
    const role = await storage.createRole(validatedData);
    res.status(201).json(role);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid role data", details: error.errors });
    } else {
      console.error("Error creating role:", error);
      res.status(500).json({ error: "Failed to create role" });
    }
  }
});

// Switch user context (workspace/project)
router.post("/:id/switch-context", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const tenantId = parseInt(req.headers['x-tenant-id'] as string) || 1;
    const { workspaceId, projectId } = req.body;
    
    const user = await storage.updateUserContext(userId, workspaceId, projectId, tenantId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.error("Error switching user context:", error);
    res.status(500).json({ error: "Failed to switch context" });
  }
});

// Get user's subordinates
router.get("/:id/subordinates", async (req, res) => {
  try {
    const managerId = parseInt(req.params.id);
    const tenantId = parseInt(req.headers['x-tenant-id'] as string) || 1;
    
    const subordinates = await storage.getUserSubordinates(managerId, tenantId);
    res.json(subordinates);
  } catch (error) {
    console.error("Error fetching subordinates:", error);
    res.status(500).json({ error: "Failed to fetch subordinates" });
  }
});

export default router;