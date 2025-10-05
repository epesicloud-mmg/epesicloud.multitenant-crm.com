import express from "express";
import { storage } from "../storage";
import { insertProductVariationSchema } from "@shared/schema";
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

// GET /api/product-variations - Get all product variations (optionally filtered by productId)
router.get("/", async (req: any, res) => {
  try {
    const productId = req.query.productId ? parseInt(req.query.productId) : undefined;
    
    if (productId) {
      const variations = await storage.getProductVariationsByProduct(productId, req.tenantId);
      res.json(variations);
    } else {
      const variations = await storage.getProductVariations(req.tenantId);
      res.json(variations);
    }
  } catch (error) {
    console.error("Error fetching product variations:", error);
    res.status(500).json({ error: "Failed to fetch product variations" });
  }
});

// GET /api/product-variations/:id - Get specific product variation
router.get("/:id", async (req: any, res) => {
  try {
    const variationId = parseInt(req.params.id);
    if (isNaN(variationId)) {
      return res.status(400).json({ error: "Invalid variation ID" });
    }
    
    const variation = await storage.getProductVariation(variationId, req.tenantId);
    if (!variation) {
      return res.status(404).json({ error: "Product variation not found" });
    }
    
    res.json(variation);
  } catch (error) {
    console.error("Error fetching product variation:", error);
    res.status(500).json({ error: "Failed to fetch product variation" });
  }
});

// POST /api/product-variations - Create new product variation
router.post("/", async (req: any, res) => {
  try {
    const validatedData = insertProductVariationSchema.parse({
      ...req.body,
      tenantId: req.tenantId,
    });
    
    const variation = await storage.createProductVariation(validatedData);
    res.status(201).json(variation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: error.errors 
      });
    }
    console.error("Error creating product variation:", error);
    res.status(500).json({ error: "Failed to create product variation" });
  }
});

// PUT /api/product-variations/:id - Update product variation
router.put("/:id", async (req: any, res) => {
  try {
    const variationId = parseInt(req.params.id);
    if (isNaN(variationId)) {
      return res.status(400).json({ error: "Invalid variation ID" });
    }
    
    const updateData = { ...req.body };
    delete updateData.tenantId; // Prevent tenant ID from being updated
    
    const variation = await storage.updateProductVariation(variationId, updateData, req.tenantId);
    if (!variation) {
      return res.status(404).json({ error: "Product variation not found" });
    }
    
    res.json(variation);
  } catch (error) {
    console.error("Error updating product variation:", error);
    res.status(500).json({ error: "Failed to update product variation" });
  }
});

// DELETE /api/product-variations/:id - Delete product variation
router.delete("/:id", async (req: any, res) => {
  try {
    const variationId = parseInt(req.params.id);
    if (isNaN(variationId)) {
      return res.status(400).json({ error: "Invalid variation ID" });
    }
    
    const success = await storage.deleteProductVariation(variationId, req.tenantId);
    if (!success) {
      return res.status(404).json({ error: "Product variation not found" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting product variation:", error);
    res.status(500).json({ error: "Failed to delete product variation" });
  }
});

export default router;
