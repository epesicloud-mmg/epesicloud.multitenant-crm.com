import express from "express";
import { storage } from "../storage";
import { insertDealSchema } from "@shared/schema";
import { z } from "zod";
import { authenticateToken } from "../auth";

const router = express.Router();

// Apply authentication first
router.use(authenticateToken);

// Middleware for tenant and user context
const ensureContext = (req: any, res: any, next: any) => {
  if (!req.tenantId) {
    return res.status(400).json({ error: "Tenant context required" });
  }
  next();
};

router.use(ensureContext);

// GET /api/deals - Get all deals for tenant
router.get("/", async (req: any, res) => {
  try {
    const deals = await storage.getDeals(req.tenantId);
    res.json(deals);
  } catch (error) {
    console.error("Error fetching deals:", error);
    res.status(500).json({ error: "Failed to fetch deals" });
  }
});

// GET /api/deals/:id - Get specific deal
router.get("/:id", async (req: any, res) => {
  try {
    const dealId = parseInt(req.params.id);
    if (isNaN(dealId)) {
      return res.status(400).json({ error: "Invalid deal ID" });
    }
    
    const deal = await storage.getDeal(dealId, req.tenantId);
    if (!deal) {
      return res.status(404).json({ error: "Deal not found" });
    }
    
    res.json(deal);
  } catch (error) {
    console.error("Error fetching deal:", error);
    res.status(500).json({ error: "Failed to fetch deal" });
  }
});

// POST /api/deals - Create new deal
router.post("/", async (req: any, res) => {
  try {
    const validatedData = insertDealSchema.parse({
      ...req.body,
      tenantId: req.tenantId,
    });
    
    const deal = await storage.createDeal(validatedData);
    res.status(201).json(deal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: error.errors 
      });
    }
    console.error("Error creating deal:", error);
    res.status(500).json({ error: "Failed to create deal" });
  }
});

// PUT /api/deals/:id - Update deal
router.put("/:id", async (req: any, res) => {
  try {
    const dealId = parseInt(req.params.id);
    if (isNaN(dealId)) {
      return res.status(400).json({ error: "Invalid deal ID" });
    }
    
    const updateData = { ...req.body };
    delete updateData.tenantId; // Prevent tenant ID from being updated
    
    const deal = await storage.updateDeal(dealId, updateData, req.tenantId);
    if (!deal) {
      return res.status(404).json({ error: "Deal not found" });
    }
    
    res.json(deal);
  } catch (error) {
    console.error("Error updating deal:", error);
    res.status(500).json({ error: "Failed to update deal" });
  }
});

// DELETE /api/deals/:id - Delete deal
router.delete("/:id", async (req: any, res) => {
  try {
    const dealId = parseInt(req.params.id);
    if (isNaN(dealId)) {
      return res.status(400).json({ error: "Invalid deal ID" });
    }
    
    const success = await storage.deleteDeal(dealId, req.tenantId);
    if (!success) {
      return res.status(404).json({ error: "Deal not found" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting deal:", error);
    res.status(500).json({ error: "Failed to delete deal" });
  }
});

// GET /api/deals/pipeline/:pipelineId - Get deals for specific pipeline
router.get("/pipeline/:pipelineId", async (req: any, res) => {
  try {
    const pipelineId = parseInt(req.params.pipelineId);
    if (isNaN(pipelineId)) {
      return res.status(400).json({ error: "Invalid pipeline ID" });
    }
    
    // For now, return all deals and filter client-side
    // TODO: Implement getDealsByPipeline in storage
    const deals = await storage.getDeals(req.tenantId);
    const filtered = deals.filter((d: any) => d.pipelineId === pipelineId);
    res.json(filtered);
  } catch (error) {
    console.error("Error fetching pipeline deals:", error);
    res.status(500).json({ error: "Failed to fetch pipeline deals" });
  }
});

// GET /api/deals/stage/:stageId - Get deals for specific stage
router.get("/stage/:stageId", async (req: any, res) => {
  try {
    const stageId = parseInt(req.params.stageId);
    if (isNaN(stageId)) {
      return res.status(400).json({ error: "Invalid stage ID" });
    }
    
    // For now, return all deals and filter client-side
    // TODO: Implement getDealsByStage in storage
    const deals = await storage.getDeals(req.tenantId);
    const filtered = deals.filter((d: any) => d.stageId === stageId);
    res.json(filtered);
  } catch (error) {
    console.error("Error fetching stage deals:", error);
    res.status(500).json({ error: "Failed to fetch stage deals" });
  }
});

// PUT /api/deals/:id/stage - Move deal to different stage
router.put("/:id/stage", async (req: any, res) => {
  try {
    const dealId = parseInt(req.params.id);
    const { stageId } = req.body;
    
    if (isNaN(dealId) || isNaN(stageId)) {
      return res.status(400).json({ error: "Invalid deal or stage ID" });
    }
    
    const deal = await storage.updateDeal(dealId, { stageId }, req.tenantId);
    if (!deal) {
      return res.status(404).json({ error: "Deal not found" });
    }
    
    res.json(deal);
  } catch (error) {
    console.error("Error moving deal:", error);
    res.status(500).json({ error: "Failed to move deal" });
  }
});

export default router;