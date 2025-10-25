import express from "express";
import { storage } from "../storage";
import { insertProductSchema } from "@shared/schema";
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

// GET /api/products - Get all products for tenant
router.get("/", async (req: any, res) => {
  try {
    const products = await storage.getProducts(req.tenantId);
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /api/products/:id - Get specific product
router.get("/:id", async (req: any, res) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }
    
    const product = await storage.getProduct(productId, req.tenantId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// POST /api/products - Create new product
router.post("/", async (req: any, res) => {
  try {
    const validatedData = insertProductSchema.parse({
      ...req.body,
      tenantId: req.tenantId,
    });
    
    const product = await storage.createProduct(validatedData);
    res.status(201).json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: error.errors 
      });
    }
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// PUT /api/products/:id - Update product
router.put("/:id", async (req: any, res) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }
    
    const updateData = { ...req.body };
    delete updateData.tenantId; // Prevent tenant ID from being updated
    
    const product = await storage.updateProduct(productId, updateData, req.tenantId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE /api/products/:id - Delete product
router.delete("/:id", async (req: any, res) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }
    
    const success = await storage.deleteProduct(productId, req.tenantId);
    if (!success) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// GET /api/products/category/:categoryId - Get products by category
router.get("/category/:categoryId", async (req: any, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId);
    if (isNaN(categoryId)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }
    
    // For now, return all products and filter client-side
    // TODO: Implement getProductsByCategory in storage
    const products = await storage.getProducts(req.tenantId);
    const filtered = products.filter((p: any) => p.categoryId === categoryId);
    res.json(filtered);
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ error: "Failed to fetch products by category" });
  }
});

// GET /api/products/search/:query - Search products
router.get("/search/:query", async (req: any, res) => {
  try {
    const query = req.params.query;
    if (!query || query.length < 2) {
      return res.status(400).json({ error: "Search query must be at least 2 characters" });
    }
    
    // For now, return all products and filter client-side
    // TODO: Implement searchProducts in storage
    const products = await storage.getProducts(req.tenantId);
    const filtered = products.filter((p: any) => 
      p.name?.toLowerCase().includes(query.toLowerCase()) ||
      p.title?.toLowerCase().includes(query.toLowerCase())
    );
    res.json(filtered);
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ error: "Failed to search products" });
  }
});

export default router;