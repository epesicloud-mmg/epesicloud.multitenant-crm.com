import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { insertLeadSourceSchema, type InsertLeadSource } from "@shared/schema";
import { authMiddleware as authenticate, type AuthRequest } from "../auth";

const router = Router();

// GET /api/lead-sources - Get all lead sources for tenant
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const leadSources = await storage.getLeadSources(tenantId);
    res.json(leadSources);
  } catch (error) {
    console.error("Error fetching lead sources:", error);
    res.status(500).json({ error: "Failed to fetch lead sources" });
  }
});

// GET /api/lead-sources/:id - Get single lead source
router.get("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const id = parseInt(req.params.id);
    const leadSource = await storage.getLeadSource(id, tenantId);
    
    if (!leadSource) {
      return res.status(404).json({ error: "Lead source not found" });
    }

    res.json(leadSource);
  } catch (error) {
    console.error("Error fetching lead source:", error);
    res.status(500).json({ error: "Failed to fetch lead source" });
  }
});

// POST /api/lead-sources - Create new lead source
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const validatedData = insertLeadSourceSchema.parse({
      ...req.body,
      tenantId,
    });

    const newLeadSource = await storage.createLeadSource(validatedData);
    res.status(201).json(newLeadSource);
  } catch (error) {
    console.error("Error creating lead source:", error);
    res.status(400).json({ error: "Failed to create lead source" });
  }
});

// PATCH /api/lead-sources/:id - Update lead source
router.patch("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const id = parseInt(req.params.id);
    
    // Validate and sanitize update data - prevent tenantId tampering
    const updateSchema = insertLeadSourceSchema.partial().omit({ tenantId: true });
    const validatedData = updateSchema.parse(req.body);
    
    const updatedLeadSource = await storage.updateLeadSource(id, validatedData, tenantId);
    
    if (!updatedLeadSource) {
      return res.status(404).json({ error: "Lead source not found" });
    }

    res.json(updatedLeadSource);
  } catch (error) {
    console.error("Error updating lead source:", error);
    res.status(400).json({ error: "Failed to update lead source" });
  }
});

// DELETE /api/lead-sources/:id - Delete lead source
router.delete("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const id = parseInt(req.params.id);
    const deleted = await storage.deleteLeadSource(id, tenantId);
    
    if (!deleted) {
      return res.status(404).json({ error: "Lead source not found" });
    }

    res.json({ message: "Lead source deleted successfully" });
  } catch (error) {
    console.error("Error deleting lead source:", error);
    res.status(500).json({ error: "Failed to delete lead source" });
  }
});

export default router;
