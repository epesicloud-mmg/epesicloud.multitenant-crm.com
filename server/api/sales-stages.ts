import { Router, type Request, type Response } from "express";
import { storage } from "../storage.js";
import { insertSalesStageSchema, type InsertSalesStage } from "@shared/schema";
import { authenticateToken as authenticate, type AuthRequest } from "../auth.js";

const router = Router();

// GET /api/crm/sales-stages - Get all sales stages for tenant
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const salesStages = await storage.getSalesStages(tenantId);
    res.json(salesStages);
  } catch (error) {
    console.error("Error fetching sales stages:", error);
    res.status(500).json({ error: "Failed to fetch sales stages" });
  }
});

// POST /api/crm/sales-stages - Create new sales stage
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const validatedData = insertSalesStageSchema.parse({
      ...req.body,
      tenantId,
    });

    const newSalesStage = await storage.createSalesStage(validatedData);
    res.status(201).json(newSalesStage);
  } catch (error) {
    console.error("Error creating sales stage:", error);
    res.status(400).json({ error: "Failed to create sales stage" });
  }
});

// PATCH /api/crm/sales-stages/:id - Update sales stage
router.patch("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const id = parseInt(req.params.id);
    
    const updateSchema = insertSalesStageSchema.partial();
    const { tenantId: _, ...validatedData } = updateSchema.parse(req.body);
    
    const updated = await storage.updateSalesStage(id, validatedData, tenantId);
    
    if (!updated) {
      return res.status(404).json({ error: "Sales stage not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating sales stage:", error);
    res.status(400).json({ error: "Failed to update sales stage" });
  }
});

// DELETE /api/crm/sales-stages/:id - Delete sales stage
router.delete("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const id = parseInt(req.params.id);
    const deleted = await storage.deleteSalesStage(id, tenantId);
    
    if (!deleted) {
      return res.status(404).json({ error: "Sales stage not found" });
    }

    res.json({ message: "Sales stage deleted successfully" });
  } catch (error) {
    console.error("Error deleting sales stage:", error);
    res.status(500).json({ error: "Failed to delete sales stage" });
  }
});

export default router;
