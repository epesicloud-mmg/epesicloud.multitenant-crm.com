import express from "express";
import { storage } from "../storage";
import { insertActivitySchema } from "@shared/schema";
import { z } from "zod";

const router = express.Router();

// Middleware for tenant context
const ensureContext = (req: any, res: any, next: any) => {
  if (!req.tenantId) {
    return res.status(400).json({ error: "Tenant context required" });
  }
  next();
};

router.use(ensureContext);

// GET /api/activities - Get all activities for tenant
router.get("/", async (req: any, res) => {
  try {
    const activities = await storage.getActivities(req.tenantId);
    res.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

// GET /api/activities/:id - Get specific activity
router.get("/:id", async (req: any, res) => {
  try {
    const activityId = parseInt(req.params.id);
    if (isNaN(activityId)) {
      return res.status(400).json({ error: "Invalid activity ID" });
    }
    
    const activities = await storage.getActivities(req.tenantId);
    const activity = activities.find(a => a.id === activityId);
    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }
    
    res.json(activity);
  } catch (error) {
    console.error("Error fetching activity:", error);
    res.status(500).json({ error: "Failed to fetch activity" });
  }
});

// POST /api/activities - Create new activity
router.post("/", async (req: any, res) => {
  try {
    // Prepare data with proper type conversion
    const activityData = {
      ...req.body,
      tenantId: req.tenantId,
      userId: req.body.userId || req.user?.id || 44, // Use provided userId or fallback to 44
      scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : null,
    };
    
    const validatedData = insertActivitySchema.parse(activityData);
    
    const activity = await storage.createActivity(validatedData);
    res.status(201).json(activity);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: error.errors 
      });
    }
    console.error("Error creating activity:", error);
    res.status(500).json({ error: "Failed to create activity" });
  }
});

// PUT /api/activities/:id - Update activity
router.put("/:id", async (req: any, res) => {
  try {
    const activityId = parseInt(req.params.id);
    if (isNaN(activityId)) {
      return res.status(400).json({ error: "Invalid activity ID" });
    }
    
    const updateData = { ...req.body };
    delete updateData.tenantId; // Prevent tenant ID from being updated
    
    const activity = await storage.updateActivity(activityId, updateData, req.tenantId);
    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }
    
    res.json(activity);
  } catch (error) {
    console.error("Error updating activity:", error);
    res.status(500).json({ error: "Failed to update activity" });
  }
});

// DELETE /api/activities/:id - Delete activity
router.delete("/:id", async (req: any, res) => {
  try {
    const activityId = parseInt(req.params.id);
    if (isNaN(activityId)) {
      return res.status(400).json({ error: "Invalid activity ID" });
    }
    
    const success = await storage.deleteActivity(activityId, req.tenantId);
    if (!success) {
      return res.status(404).json({ error: "Activity not found" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting activity:", error);
    res.status(500).json({ error: "Failed to delete activity" });
  }
});

// GET /api/activities/contact/:contactId - Get activities for contact
router.get("/contact/:contactId", async (req: any, res) => {
  try {
    const contactId = parseInt(req.params.contactId);
    if (isNaN(contactId)) {
      return res.status(400).json({ error: "Invalid contact ID" });
    }
    
    // For now, return all activities and filter client-side
    // TODO: Implement getActivitiesByContact in storage
    const activities = await storage.getActivities(req.tenantId);
    const filtered = activities.filter((a: any) => a.contactId === contactId);
    res.json(filtered);
  } catch (error) {
    console.error("Error fetching contact activities:", error);
    res.status(500).json({ error: "Failed to fetch contact activities" });
  }
});

// GET /api/activities/deal/:dealId - Get activities for deal
router.get("/deal/:dealId", async (req: any, res) => {
  try {
    const dealId = parseInt(req.params.dealId);
    if (isNaN(dealId)) {
      return res.status(400).json({ error: "Invalid deal ID" });
    }
    
    // For now, return all activities and filter client-side
    // TODO: Implement getActivitiesByDeal in storage
    const activities = await storage.getActivities(req.tenantId);
    const filtered = activities.filter((a: any) => a.dealId === dealId);
    res.json(filtered);
  } catch (error) {
    console.error("Error fetching deal activities:", error);
    res.status(500).json({ error: "Failed to fetch deal activities" });
  }
});

// GET /api/activities/user/:userId - Get activities for user
router.get("/user/:userId", async (req: any, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    // For now, return all activities and filter client-side
    // TODO: Implement getActivitiesByUser in storage
    const activities = await storage.getActivities(req.tenantId);
    const filtered = activities.filter((a: any) => a.userId === userId);
    res.json(filtered);
  } catch (error) {
    console.error("Error fetching user activities:", error);
    res.status(500).json({ error: "Failed to fetch user activities" });
  }
});

export default router;