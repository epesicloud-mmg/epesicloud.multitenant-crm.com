import { Router, type Request, type Response } from "express";
import { storage } from "../storage.js";
import { insertInterestLevelSchema, type InsertInterestLevel } from "@shared/schema";
import { authenticateToken as authenticate, type AuthRequest } from "../auth.js";

const router = Router();

// GET /api/crm/interest-levels - Get all interest levels for tenant
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const interestLevels = await storage.getInterestLevels(tenantId);
    res.json(interestLevels);
  } catch (error) {
    console.error("Error fetching interest levels:", error);
    res.status(500).json({ error: "Failed to fetch interest levels" });
  }
});

// POST /api/crm/interest-levels - Create new interest level
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const validatedData = insertInterestLevelSchema.parse({
      ...req.body,
      tenantId,
    });

    const newInterestLevel = await storage.createInterestLevel(validatedData);
    res.status(201).json(newInterestLevel);
  } catch (error) {
    console.error("Error creating interest level:", error);
    res.status(400).json({ error: "Failed to create interest level" });
  }
});

// PATCH /api/crm/interest-levels/:id - Update interest level
router.patch("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const id = parseInt(req.params.id);
    
    const updateSchema = insertInterestLevelSchema.partial();
    const { tenantId: _, ...validatedData } = updateSchema.parse(req.body);
    
    const updated = await storage.updateInterestLevel(id, validatedData, tenantId);
    
    if (!updated) {
      return res.status(404).json({ error: "Interest level not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating interest level:", error);
    res.status(400).json({ error: "Failed to update interest level" });
  }
});

// DELETE /api/crm/interest-levels/:id - Delete interest level
router.delete("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const id = parseInt(req.params.id);
    const deleted = await storage.deleteInterestLevel(id, tenantId);
    
    if (!deleted) {
      return res.status(404).json({ error: "Interest level not found" });
    }

    res.json({ message: "Interest level deleted successfully" });
  } catch (error) {
    console.error("Error deleting interest level:", error);
    res.status(500).json({ error: "Failed to delete interest level" });
  }
});

export default router;
