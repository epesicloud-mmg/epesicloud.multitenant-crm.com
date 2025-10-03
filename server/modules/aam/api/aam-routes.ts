import { Router } from "express";
import { db } from "../../../db";
import { 
  users,
  roles,
  userRoles,
  rolePermissions,
  insertUserSchema,
  insertRoleSchema,
  insertUserRoleSchema,
  insertRolePermissionSchema
} from "../../../../shared/schema";
import { eq, desc, and, count, sql } from "drizzle-orm";
import { z } from "zod";

const aamRouter = Router();

// Middleware for tenant ID (using mock for development)
function getTenantId(req: any) {
  return parseInt(req.headers['x-tenant-id'] || '1');
}

// Health check
aamRouter.get("/health", (req, res) => {
  res.json({
    module: "AAM",
    status: "healthy",
    timestamp: new Date().toISOString(),
    features: ["user-management", "role-management", "permissions", "access-control"]
  });
});

// AAM dashboard stats
aamRouter.get("/stats", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    
    // Get user stats
    const [userStats] = await db
      .select({
        totalUsers: count(users.id),
        activeUsers: count(sql`CASE WHEN ${users.isActive} = true THEN 1 END`)
      })
      .from(users)
      .where(eq(users.tenantId, tenantId));

    // Get role stats
    const [roleStats] = await db
      .select({
        totalRoles: count(roles.id),
        activeRoles: count(sql`CASE WHEN ${roles.isActive} = true THEN 1 END`)
      })
      .from(roles)
      .where(eq(roles.tenantId, tenantId));

    const stats = {
      totalUsers: userStats?.totalUsers || 0,
      activeUsers: userStats?.activeUsers || 0,
      totalRoles: roleStats?.totalRoles || 0,
      activeRoles: roleStats?.activeRoles || 0,
      moduleAccess: 3, // CRM, Finance, HR
      systemHealth: "optimal"
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching AAM stats:", error);
    res.status(500).json({ error: "Failed to fetch AAM statistics" });
  }
});

// User Management
aamRouter.get("/users", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    
    const userList = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        isActive: users.isActive,
        lastLogin: users.lastLogin,
        createdAt: users.createdAt
      })
      .from(users)
      .where(eq(users.tenantId, tenantId))
      .orderBy(desc(users.createdAt));

    res.json(userList);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

aamRouter.post("/users", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const userData = insertUserSchema.parse(req.body);
    
    const [newUser] = await db
      .insert(users)
      .values({
        ...userData,
        tenantId,
        isActive: true
      })
      .returning();

    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Role Management
aamRouter.get("/roles", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    
    const roleList = await db
      .select({
        id: roles.id,
        name: roles.name,
        description: roles.description,
        isActive: roles.isActive,
        modules: roles.modules,
        createdAt: roles.createdAt
      })
      .from(roles)
      .where(eq(roles.tenantId, tenantId))
      .orderBy(desc(roles.createdAt));

    res.json(roleList);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
});

aamRouter.post("/roles", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const roleData = insertRoleSchema.parse(req.body);
    
    const [newRole] = await db
      .insert(roles)
      .values({
        ...roleData,
        tenantId,
        isActive: true
      })
      .returning();

    res.status(201).json(newRole);
  } catch (error) {
    console.error("Error creating role:", error);
    res.status(500).json({ error: "Failed to create role" });
  }
});

// User-Role Assignments
aamRouter.get("/user-roles", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    
    const assignments = await db
      .select({
        id: userRoles.id,
        userId: userRoles.userId,
        roleId: userRoles.roleId,
        assignedAt: userRoles.assignedAt,
        user: {
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName
        },
        role: {
          name: roles.name,
          description: roles.description
        }
      })
      .from(userRoles)
      .leftJoin(users, eq(userRoles.userId, users.id))
      .leftJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(users.tenantId, tenantId));

    res.json(assignments);
  } catch (error) {
    console.error("Error fetching user-role assignments:", error);
    res.status(500).json({ error: "Failed to fetch user-role assignments" });
  }
});

aamRouter.post("/user-roles", async (req, res) => {
  try {
    const assignmentData = insertUserRoleSchema.parse(req.body);
    
    const [newAssignment] = await db
      .insert(userRoles)
      .values(assignmentData)
      .returning();

    res.status(201).json(newAssignment);
  } catch (error) {
    console.error("Error creating user-role assignment:", error);
    res.status(500).json({ error: "Failed to assign role to user" });
  }
});

// Role Permissions
aamRouter.get("/role-permissions", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    
    const permissions = await db
      .select({
        id: rolePermissions.id,
        roleId: rolePermissions.roleId,
        module: rolePermissions.module,
        permissions: rolePermissions.permissions,
        role: {
          name: roles.name,
          description: roles.description
        }
      })
      .from(rolePermissions)
      .leftJoin(roles, eq(rolePermissions.roleId, roles.id))
      .where(eq(roles.tenantId, tenantId));

    res.json(permissions);
  } catch (error) {
    console.error("Error fetching role permissions:", error);
    res.status(500).json({ error: "Failed to fetch role permissions" });
  }
});

aamRouter.post("/role-permissions", async (req, res) => {
  try {
    const permissionData = insertRolePermissionSchema.parse(req.body);
    
    const [newPermission] = await db
      .insert(rolePermissions)
      .values(permissionData)
      .returning();

    res.status(201).json(newPermission);
  } catch (error) {
    console.error("Error creating role permission:", error);
    res.status(500).json({ error: "Failed to create role permission" });
  }
});

export default aamRouter;