import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { insertPaymentMethodSchema, type InsertPaymentMethod } from "@shared/schema";
import { authenticateToken as authenticate, type AuthRequest } from "../auth";

const router = Router();

// GET /api/payment-methods - Get all payment methods for tenant
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const paymentMethods = await storage.getPaymentMethods(tenantId);
    res.json(paymentMethods);
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    res.status(500).json({ error: "Failed to fetch payment methods" });
  }
});

// POST /api/payment-methods - Create new payment method
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const validatedData = insertPaymentMethodSchema.parse({
      ...req.body,
      tenantId,
    });

    const newMethod = await storage.createPaymentMethod(validatedData);
    res.status(201).json(newMethod);
  } catch (error) {
    console.error("Error creating payment method:", error);
    res.status(400).json({ error: "Failed to create payment method" });
  }
});

// PATCH /api/payment-methods/:id - Update payment method
router.patch("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const id = parseInt(req.params.id);
    
    const updateSchema = insertPaymentMethodSchema.partial();
    const { tenantId: _, ...validatedData } = updateSchema.parse(req.body);
    
    const updated = await storage.updatePaymentMethod(id, validatedData, tenantId);
    
    if (!updated) {
      return res.status(404).json({ error: "Payment method not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating payment method:", error);
    res.status(400).json({ error: "Failed to update payment method" });
  }
});

// DELETE /api/payment-methods/:id - Delete payment method
router.delete("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const id = parseInt(req.params.id);
    const deleted = await storage.deletePaymentMethod(id, tenantId);
    
    if (!deleted) {
      return res.status(404).json({ error: "Payment method not found" });
    }

    res.json({ message: "Payment method deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    res.status(500).json({ error: "Failed to delete payment method" });
  }
});

export default router;
