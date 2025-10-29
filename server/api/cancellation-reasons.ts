import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { insertMeetingCancellationReasonSchema, type InsertMeetingCancellationReason } from "@shared/schema";
import { authenticateToken as authenticate, type AuthRequest } from "../auth";

const router = Router();

// GET /api/cancellation-reasons - Get all cancellation reasons for tenant
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const reasons = await storage.getMeetingCancellationReasons(tenantId);
    res.json(reasons);
  } catch (error) {
    console.error("Error fetching cancellation reasons:", error);
    res.status(500).json({ error: "Failed to fetch cancellation reasons" });
  }
});

// POST /api/cancellation-reasons - Create new cancellation reason
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const validatedData = insertMeetingCancellationReasonSchema.parse(req.body);
    const dataToInsert = { ...validatedData, tenantId };

    const newReason = await storage.createMeetingCancellationReason(dataToInsert);
    res.status(201).json(newReason);
  } catch (error) {
    console.error("Error creating cancellation reason:", error);
    res.status(400).json({ error: "Failed to create cancellation reason" });
  }
});

// PATCH /api/cancellation-reasons/:id - Update cancellation reason
router.patch("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const id = parseInt(req.params.id);
    
    const updateSchema = insertMeetingCancellationReasonSchema.partial();
    const { tenantId: _, ...validatedData } = updateSchema.parse(req.body);
    
    const updated = await storage.updateMeetingCancellationReason(id, validatedData, tenantId);
    
    if (!updated) {
      return res.status(404).json({ error: "Cancellation reason not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating cancellation reason:", error);
    res.status(400).json({ error: "Failed to update cancellation reason" });
  }
});

// DELETE /api/cancellation-reasons/:id - Delete cancellation reason
router.delete("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const id = parseInt(req.params.id);
    const deleted = await storage.deleteMeetingCancellationReason(id, tenantId);
    
    if (!deleted) {
      return res.status(404).json({ error: "Cancellation reason not found" });
    }

    res.json({ message: "Cancellation reason deleted successfully" });
  } catch (error) {
    console.error("Error deleting cancellation reason:", error);
    res.status(500).json({ error: "Failed to delete cancellation reason" });
  }
});

export default router;
