import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { insertMeetingTypeSchema, type InsertMeetingType } from "@shared/schema";
import { authenticateToken as authenticate, type AuthRequest } from "../auth";

const router = Router();

// GET /api/meeting-types - Get all meeting types for tenant
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const meetingTypes = await storage.getMeetingTypes(tenantId);
    res.json(meetingTypes);
  } catch (error) {
    console.error("Error fetching meeting types:", error);
    res.status(500).json({ error: "Failed to fetch meeting types" });
  }
});

// POST /api/meeting-types - Create new meeting type
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const validatedData = insertMeetingTypeSchema.parse({
      ...req.body,
      tenantId,
    });

    const newMeetingType = await storage.createMeetingType(validatedData);
    res.status(201).json(newMeetingType);
  } catch (error) {
    console.error("Error creating meeting type:", error);
    res.status(400).json({ error: "Failed to create meeting type" });
  }
});

// PATCH /api/meeting-types/:id - Update meeting type
router.patch("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const id = parseInt(req.params.id);
    
    const updateSchema = insertMeetingTypeSchema.partial();
    const { tenantId: _, ...validatedData } = updateSchema.parse(req.body);
    
    const updated = await storage.updateMeetingType(id, validatedData, tenantId);
    
    if (!updated) {
      return res.status(404).json({ error: "Meeting type not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating meeting type:", error);
    res.status(400).json({ error: "Failed to update meeting type" });
  }
});

// DELETE /api/meeting-types/:id - Delete meeting type
router.delete("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const id = parseInt(req.params.id);
    const deleted = await storage.deleteMeetingType(id, tenantId);
    
    if (!deleted) {
      return res.status(404).json({ error: "Meeting type not found" });
    }

    res.json({ message: "Meeting type deleted successfully" });
  } catch (error) {
    console.error("Error deleting meeting type:", error);
    res.status(500).json({ error: "Failed to delete meeting type" });
  }
});

export default router;
