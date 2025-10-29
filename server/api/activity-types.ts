import { Router, type Request, type Response } from "express";
import { storage } from "../storage.js";
import { insertActivityTypeSchema, type InsertActivityType } from "@shared/schema";
import { authenticateToken as authenticate, type AuthRequest } from "../auth.js";

const router = Router();

// GET /api/activity-types - Get all activity types for tenant
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const activityTypes = await storage.getActivityTypes(tenantId);
    res.json(activityTypes);
  } catch (error) {
    console.error("Error fetching activity types:", error);
    res.status(500).json({ error: "Failed to fetch activity types" });
  }
});

// POST /api/activity-types - Create new activity type
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const validatedData = insertActivityTypeSchema.parse(req.body);
    const dataToInsert = { ...validatedData, tenantId };

    const newActivityType = await storage.createActivityType(dataToInsert);
    res.status(201).json(newActivityType);
  } catch (error) {
    console.error("Error creating activity type:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create activity type";
    res.status(400).json({ error: errorMessage });
  }
});

// PATCH /api/activity-types/:id - Update activity type
router.patch("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const id = parseInt(req.params.id);
    
    const updateSchema = insertActivityTypeSchema.partial();
    const { tenantId: _, ...validatedData } = updateSchema.parse(req.body);
    
    const updated = await storage.updateActivityType(id, validatedData, tenantId);
    
    if (!updated) {
      return res.status(404).json({ error: "Activity type not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating activity type:", error);
    res.status(400).json({ error: "Failed to update activity type" });
  }
});

// DELETE /api/activity-types/:id - Delete activity type
router.delete("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const id = parseInt(req.params.id);
    const deleted = await storage.deleteActivityType(id, tenantId);
    
    if (!deleted) {
      return res.status(404).json({ error: "Activity type not found" });
    }

    res.json({ message: "Activity type deleted successfully" });
  } catch (error) {
    console.error("Error deleting activity type:", error);
    res.status(500).json({ error: "Failed to delete activity type" });
  }
});

export default router;
