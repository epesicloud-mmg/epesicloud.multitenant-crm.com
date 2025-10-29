import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { insertCustomerTypeSchema, type InsertCustomerType } from "@shared/schema";
import { authenticateToken as authenticate, type AuthRequest } from "../auth";

const router = Router();

// GET /api/customer-types - Get all customer types for tenant
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const customerTypes = await storage.getCustomerTypes(tenantId);
    res.json(customerTypes);
  } catch (error) {
    console.error("Error fetching customer types:", error);
    res.status(500).json({ error: "Failed to fetch customer types" });
  }
});

// POST /api/customer-types - Create new customer type
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const validatedData = insertCustomerTypeSchema.parse(req.body);
    const dataToInsert = { ...validatedData, tenantId };

    const newCustomerType = await storage.createCustomerType(dataToInsert);
    res.status(201).json(newCustomerType);
  } catch (error) {
    console.error("Error creating customer type:", error);
    res.status(400).json({ error: "Failed to create customer type" });
  }
});

// PATCH /api/customer-types/:id - Update customer type
router.patch("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const id = parseInt(req.params.id);
    
    const updateSchema = insertCustomerTypeSchema.partial();
    const { tenantId: _, ...validatedData } = updateSchema.parse(req.body);
    
    const updated = await storage.updateCustomerType(id, validatedData, tenantId);
    
    if (!updated) {
      return res.status(404).json({ error: "Customer type not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating customer type:", error);
    res.status(400).json({ error: "Failed to update customer type" });
  }
});

// DELETE /api/customer-types/:id - Delete customer type
router.delete("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const id = parseInt(req.params.id);
    const deleted = await storage.deleteCustomerType(id, tenantId);
    
    if (!deleted) {
      return res.status(404).json({ error: "Customer type not found" });
    }

    res.json({ message: "Customer type deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer type:", error);
    res.status(500).json({ error: "Failed to delete customer type" });
  }
});

export default router;
