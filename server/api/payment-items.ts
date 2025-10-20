import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { insertPaymentItemSchema, type InsertPaymentItem } from "@shared/schema";
import { authenticateToken as authenticate, type AuthRequest } from "../auth";

const router = Router();

// GET /api/payment-items - Get all payment items for tenant
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const paymentItems = await storage.getPaymentItems(tenantId);
    res.json(paymentItems);
  } catch (error) {
    console.error("Error fetching payment items:", error);
    res.status(500).json({ error: "Failed to fetch payment items" });
  }
});

// POST /api/payment-items - Create new payment item
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const validatedData = insertPaymentItemSchema.parse({
      ...req.body,
      tenantId,
    });

    const newItem = await storage.createPaymentItem(validatedData);
    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error creating payment item:", error);
    res.status(400).json({ error: "Failed to create payment item" });
  }
});

// PATCH /api/payment-items/:id - Update payment item
router.patch("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const id = parseInt(req.params.id);
    
    const updateSchema = insertPaymentItemSchema.partial();
    const { tenantId: _, ...validatedData } = updateSchema.parse(req.body);
    
    const updated = await storage.updatePaymentItem(id, validatedData, tenantId);
    
    if (!updated) {
      return res.status(404).json({ error: "Payment item not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating payment item:", error);
    res.status(400).json({ error: "Failed to update payment item" });
  }
});

// DELETE /api/payment-items/:id - Delete payment item
router.delete("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const id = parseInt(req.params.id);
    const deleted = await storage.deletePaymentItem(id, tenantId);
    
    if (!deleted) {
      return res.status(404).json({ error: "Payment item not found" });
    }

    res.json({ message: "Payment item deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment item:", error);
    res.status(500).json({ error: "Failed to delete payment item" });
  }
});

export default router;
