import express from "express";
import { storage } from "../storage";
import { insertSalesPipelineSchema, insertSalesStageSchema } from "@shared/schema";
import { z } from "zod";

// Server-only schema that includes tenantId
const insertSalesPipelineWithTenantSchema = insertSalesPipelineSchema.extend({ 
  tenantId: z.number().int() 
});

const insertSalesStageWithTenantSchema = insertSalesStageSchema.extend({ 
  tenantId: z.number().int() 
});

const router = express.Router();

// Middleware for tenant context
const ensureContext = (req: any, res: any, next: any) => {
  if (!req.tenantId) {
    return res.status(400).json({ error: "Tenant context required" });
  }
  next();
};

router.use(ensureContext);

// GET /api/pipelines - Get all sales pipelines for tenant
router.get("/", async (req: any, res) => {
  try {
    const pipelines = await storage.getSalesPipelines(req.tenantId);
    res.json(pipelines);
  } catch (error) {
    console.error("Error fetching pipelines:", error);
    res.status(500).json({ error: "Failed to fetch pipelines" });
  }
});

// GET /api/pipelines/:id - Get specific pipeline with stages
router.get("/:id", async (req: any, res) => {
  try {
    const pipelineId = parseInt(req.params.id);
    if (isNaN(pipelineId)) {
      return res.status(400).json({ error: "Invalid pipeline ID" });
    }
    
    const pipeline = await storage.getSalesPipeline(pipelineId, req.tenantId);
    if (!pipeline) {
      return res.status(404).json({ error: "Pipeline not found" });
    }
    
    res.json(pipeline);
  } catch (error) {
    console.error("Error fetching pipeline:", error);
    res.status(500).json({ error: "Failed to fetch pipeline" });
  }
});

// POST /api/pipelines - Create new sales pipeline with stages
router.post("/", async (req: any, res) => {
  try {
    const { pipeline, stages } = req.body;
    
    // Validate pipeline data
    const validatedPipeline = insertSalesPipelineSchema.parse(pipeline);
    const pipelineToInsert = { ...validatedPipeline, tenantId: req.tenantId };
    
    // Create the pipeline
    const createdPipeline = await storage.createSalesPipeline(pipelineToInsert);
    
    // Create stages if provided
    if (stages && Array.isArray(stages) && stages.length > 0) {
      // Create a schema that omits salePipelineId for new stage creation
      const newStageSchema = insertSalesStageSchema.omit({ salePipelineId: true });
      
      for (const stage of stages) {
        const validatedStage = newStageSchema.parse(stage);
        const stageToInsert = {
          ...validatedStage,
          salePipelineId: createdPipeline.id,
          tenantId: req.tenantId,
        };
        await storage.createSalesStage(stageToInsert);
      }
    }
    
    // Fetch the complete pipeline with stages
    const pipelineWithStages = await storage.getSalesPipeline(createdPipeline.id, req.tenantId);
    res.status(201).json(pipelineWithStages);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: error.errors 
      });
    }
    console.error("Error creating pipeline:", error);
    res.status(500).json({ error: "Failed to create pipeline" });
  }
});

// PUT /api/pipelines/:id - Update pipeline
router.put("/:id", async (req: any, res) => {
  try {
    const pipelineId = parseInt(req.params.id);
    if (isNaN(pipelineId)) {
      return res.status(400).json({ error: "Invalid pipeline ID" });
    }
    
    const updateData = { ...req.body };
    delete updateData.tenantId; // Prevent tenant ID from being updated
    
    const pipeline = await storage.updateSalesPipeline(pipelineId, updateData, req.tenantId);
    if (!pipeline) {
      return res.status(404).json({ error: "Pipeline not found" });
    }
    
    res.json(pipeline);
  } catch (error) {
    console.error("Error updating pipeline:", error);
    res.status(500).json({ error: "Failed to update pipeline" });
  }
});

// DELETE /api/pipelines/:id - Delete pipeline
router.delete("/:id", async (req: any, res) => {
  try {
    const pipelineId = parseInt(req.params.id);
    if (isNaN(pipelineId)) {
      return res.status(400).json({ error: "Invalid pipeline ID" });
    }
    
    const success = await storage.deleteSalesPipeline(pipelineId, req.tenantId);
    if (!success) {
      return res.status(404).json({ error: "Pipeline not found" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting pipeline:", error);
    res.status(500).json({ error: "Failed to delete pipeline" });
  }
});

// GET /api/pipelines/:id/stages - Get stages for pipeline
router.get("/:id/stages", async (req: any, res) => {
  try {
    const pipelineId = parseInt(req.params.id);
    if (isNaN(pipelineId)) {
      return res.status(400).json({ error: "Invalid pipeline ID" });
    }
    
    const stages = await storage.getSalesStages(req.tenantId, pipelineId);
    res.json(stages);
  } catch (error) {
    console.error("Error fetching pipeline stages:", error);
    res.status(500).json({ error: "Failed to fetch pipeline stages" });
  }
});

export default router;