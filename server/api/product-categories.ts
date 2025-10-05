import express from "express";
import { storage } from "../storage";
import { insertProductCategorySchema } from "@shared/schema";
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

// GET /api/product-categories - Get all product categories for tenant
router.get("/", async (req: any, res) => {
  try {
    const categories = await storage.getProductCategories(req.tenantId);
    res.json(categories);
  } catch (error) {
    console.error("Error fetching product categories:", error);
    res.status(500).json({ error: "Failed to fetch product categories" });
  }
});

// GET /api/product-categories/:id - Get specific product category
router.get("/:id", async (req: any, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    if (isNaN(categoryId)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }
    
    const category = await storage.getProductCategory(categoryId, req.tenantId);
    if (!category) {
      return res.status(404).json({ error: "Product category not found" });
    }
    
    res.json(category);
  } catch (error) {
    console.error("Error fetching product category:", error);
    res.status(500).json({ error: "Failed to fetch product category" });
  }
});

// POST /api/product-categories - Create new product category
router.post("/", async (req: any, res) => {
  try {
    const validatedData = insertProductCategorySchema.parse({
      ...req.body,
      tenantId: req.tenantId,
    });
    
    const category = await storage.createProductCategory(validatedData);
    res.status(201).json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: error.errors 
      });
    }
    console.error("Error creating product category:", error);
    res.status(500).json({ error: "Failed to create product category" });
  }
});

// PUT /api/product-categories/:id - Update product category
router.put("/:id", async (req: any, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    if (isNaN(categoryId)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }
    
    const updateData = { ...req.body };
    delete updateData.tenantId; // Prevent tenant ID from being updated
    
    const category = await storage.updateProductCategory(categoryId, updateData, req.tenantId);
    if (!category) {
      return res.status(404).json({ error: "Product category not found" });
    }
    
    res.json(category);
  } catch (error) {
    console.error("Error updating product category:", error);
    res.status(500).json({ error: "Failed to update product category" });
  }
});

// DELETE /api/product-categories/:id - Delete product category
router.delete("/:id", async (req: any, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    if (isNaN(categoryId)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }
    
    const success = await storage.deleteProductCategory(categoryId, req.tenantId);
    if (!success) {
      return res.status(404).json({ error: "Product category not found" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting product category:", error);
    res.status(500).json({ error: "Failed to delete product category" });
  }
});

export default router;
