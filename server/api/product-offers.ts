import express from "express";
import { storage } from "../storage";
import { insertProductOfferSchema } from "@shared/schema";
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

// GET /api/product-offers - Get all product offers (optionally filtered by productId)
router.get("/", async (req: any, res) => {
  try {
    const productId = req.query.productId ? parseInt(req.query.productId) : undefined;
    
    if (productId) {
      const offers = await storage.getProductOffersByProduct(productId, req.tenantId);
      res.json(offers);
    } else {
      const offers = await storage.getProductOffers(req.tenantId);
      res.json(offers);
    }
  } catch (error) {
    console.error("Error fetching product offers:", error);
    res.status(500).json({ error: "Failed to fetch product offers" });
  }
});

// GET /api/product-offers/:id - Get specific product offer
router.get("/:id", async (req: any, res) => {
  try {
    const offerId = parseInt(req.params.id);
    if (isNaN(offerId)) {
      return res.status(400).json({ error: "Invalid offer ID" });
    }
    
    const offer = await storage.getProductOffer(offerId, req.tenantId);
    if (!offer) {
      return res.status(404).json({ error: "Product offer not found" });
    }
    
    res.json(offer);
  } catch (error) {
    console.error("Error fetching product offer:", error);
    res.status(500).json({ error: "Failed to fetch product offer" });
  }
});

// POST /api/product-offers - Create new product offer
router.post("/", async (req: any, res) => {
  try {
    const validatedData = insertProductOfferSchema.parse({
      ...req.body,
      tenantId: req.tenantId,
    });
    
    const offer = await storage.createProductOffer(validatedData);
    res.status(201).json(offer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: error.errors 
      });
    }
    console.error("Error creating product offer:", error);
    res.status(500).json({ error: "Failed to create product offer" });
  }
});

// PUT /api/product-offers/:id - Update product offer
router.put("/:id", async (req: any, res) => {
  try {
    const offerId = parseInt(req.params.id);
    if (isNaN(offerId)) {
      return res.status(400).json({ error: "Invalid offer ID" });
    }
    
    const updateData = { ...req.body };
    delete updateData.tenantId; // Prevent tenant ID from being updated
    
    const offer = await storage.updateProductOffer(offerId, updateData, req.tenantId);
    if (!offer) {
      return res.status(404).json({ error: "Product offer not found" });
    }
    
    res.json(offer);
  } catch (error) {
    console.error("Error updating product offer:", error);
    res.status(500).json({ error: "Failed to update product offer" });
  }
});

// DELETE /api/product-offers/:id - Delete product offer
router.delete("/:id", async (req: any, res) => {
  try {
    const offerId = parseInt(req.params.id);
    if (isNaN(offerId)) {
      return res.status(400).json({ error: "Invalid offer ID" });
    }
    
    const success = await storage.deleteProductOffer(offerId, req.tenantId);
    if (!success) {
      return res.status(404).json({ error: "Product offer not found" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting product offer:", error);
    res.status(500).json({ error: "Failed to delete product offer" });
  }
});

export default router;
