import express from 'express';
import { storage } from '../storage';
import { insertCommissionSchema, insertCommissionStatusSchema, insertCommissionItemSchema } from '@shared/schema';

const router = express.Router();

// ==================== COMMISSION STATUSES ====================

// GET all commission statuses
router.get('/statuses', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const statuses = await storage.getCommissionStatuses(tenantId);
    res.json(statuses);
  } catch (error: any) {
    console.error('Error fetching commission statuses:', error);
    res.status(500).json({ error: error.message || "Failed to fetch commission statuses" });
  }
});

// POST create commission status
router.post('/statuses', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    // Validate and sanitize status data - explicitly exclude tenantId
    const statusSchema = insertCommissionStatusSchema.partial();
    const { tenantId: _, ...validatedData } = statusSchema.parse(req.body);
    
    const statusData = {
      ...validatedData,
      tenantId,
    };
    
    const newStatus = await storage.createCommissionStatus(statusData);
    res.status(201).json(newStatus);
  } catch (error: any) {
    console.error('Error creating commission status:', error);
    res.status(500).json({ error: error.message || "Failed to create commission status" });
  }
});

// PATCH update commission status
router.patch('/statuses/:id', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const id = parseInt(req.params.id);
    
    // Validate and sanitize update data - explicitly exclude tenantId
    const updateSchema = insertCommissionStatusSchema.partial();
    const { tenantId: _, ...validatedData } = updateSchema.parse(req.body);
    
    const updatedStatus = await storage.updateCommissionStatus(id, validatedData, tenantId);
    
    if (!updatedStatus) {
      return res.status(404).json({ error: "Commission status not found" });
    }
    
    res.json(updatedStatus);
  } catch (error: any) {
    console.error('Error updating commission status:', error);
    res.status(500).json({ error: error.message || "Failed to update commission status" });
  }
});

// DELETE commission status
router.delete('/statuses/:id', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const id = parseInt(req.params.id);
    const deleted = await storage.deleteCommissionStatus(id, tenantId);
    
    if (!deleted) {
      return res.status(404).json({ error: "Commission status not found" });
    }
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting commission status:', error);
    res.status(500).json({ error: error.message || "Failed to delete commission status" });
  }
});

// ==================== COMMISSIONS ====================

// GET all commissions (with optional filters)
router.get('/', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const status = req.query.status as string | undefined;
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    
    const filters = { status, userId };
    const commissions = await storage.getCommissions(tenantId, filters);
    res.json(commissions);
  } catch (error: any) {
    console.error('Error fetching commissions:', error);
    res.status(500).json({ error: error.message || "Failed to fetch commissions" });
  }
});

// GET commissions by user
router.get('/user/:userId', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const userId = parseInt(req.params.userId);
    const commissions = await storage.getCommissionsByUser(userId, tenantId);
    res.json(commissions);
  } catch (error: any) {
    console.error('Error fetching commissions by user:', error);
    res.status(500).json({ error: error.message || "Failed to fetch commissions" });
  }
});

// GET commissions by deal
router.get('/deal/:dealId', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const dealId = parseInt(req.params.dealId);
    const commissions = await storage.getCommissionsByDeal(dealId, tenantId);
    res.json(commissions);
  } catch (error: any) {
    console.error('Error fetching commissions by deal:', error);
    res.status(500).json({ error: error.message || "Failed to fetch commissions" });
  }
});

// GET single commission
router.get('/:id', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const id = parseInt(req.params.id);
    const commission = await storage.getCommission(id, tenantId);
    
    if (!commission) {
      return res.status(404).json({ error: "Commission not found" });
    }
    
    res.json(commission);
  } catch (error: any) {
    console.error('Error fetching commission:', error);
    res.status(500).json({ error: error.message || "Failed to fetch commission" });
  }
});

// POST create commission
router.post('/', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }
    
    const createdById = req.auth?.userId;

    // Generate commission number
    const commissionNumber = await storage.generateCommissionNumber(tenantId);

    // Validate and sanitize commission data - explicitly exclude tenantId
    const commissionSchema = insertCommissionSchema.partial();
    const { tenantId: _, ...validatedData } = commissionSchema.parse(req.body);
    
    // Inject server-controlled fields
    const commissionData = {
      ...validatedData,
      commissionNumber,
      tenantId,
      createdById: createdById || null,
      status: 'pending',
    };
    
    const newCommission = await storage.createCommission(commissionData);
    res.status(201).json(newCommission);
  } catch (error: any) {
    console.error('Error creating commission:', error);
    res.status(500).json({ error: error.message || "Failed to create commission" });
  }
});

// PATCH update commission
router.patch('/:id', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const id = parseInt(req.params.id);
    
    // Validate and sanitize update data - explicitly exclude tenantId and commissionNumber
    const updateSchema = insertCommissionSchema.partial().omit({ commissionNumber: true });
    const { tenantId: _, ...validatedData } = updateSchema.parse(req.body);
    
    const updatedCommission = await storage.updateCommission(id, validatedData, tenantId);
    
    if (!updatedCommission) {
      return res.status(404).json({ error: "Commission not found" });
    }
    
    res.json(updatedCommission);
  } catch (error: any) {
    console.error('Error updating commission:', error);
    res.status(500).json({ error: error.message || "Failed to update commission" });
  }
});

// DELETE commission
router.delete('/:id', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const id = parseInt(req.params.id);
    const deleted = await storage.deleteCommission(id, tenantId);
    
    if (!deleted) {
      return res.status(404).json({ error: "Commission not found" });
    }
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting commission:', error);
    res.status(500).json({ error: error.message || "Failed to delete commission" });
  }
});

// ==================== COMMISSION WORKFLOW ACTIONS ====================

// POST verify commission
router.post('/:id/verify', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }
    
    const verifiedById = req.auth?.userId;
    if (!verifiedById) {
      return res.status(401).json({ error: "User not found" });
    }

    const id = parseInt(req.params.id);
    const verifiedCommission = await storage.verifyCommission(id, verifiedById, tenantId);
    
    if (!verifiedCommission) {
      return res.status(404).json({ error: "Commission not found" });
    }
    
    res.json(verifiedCommission);
  } catch (error: any) {
    console.error('Error verifying commission:', error);
    res.status(500).json({ error: error.message || "Failed to verify commission" });
  }
});

// POST approve commission
router.post('/:id/approve', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }
    
    const approvedById = req.auth?.userId;
    if (!approvedById) {
      return res.status(401).json({ error: "User not found" });
    }

    const id = parseInt(req.params.id);
    const approvedCommission = await storage.approveCommission(id, approvedById, tenantId);
    
    if (!approvedCommission) {
      return res.status(404).json({ error: "Commission not found" });
    }
    
    res.json(approvedCommission);
  } catch (error: any) {
    console.error('Error approving commission:', error);
    res.status(500).json({ error: error.message || "Failed to approve commission" });
  }
});

// POST mark commission as paid
router.post('/:id/mark-paid', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }
    
    const paidById = req.auth?.userId;
    if (!paidById) {
      return res.status(401).json({ error: "User not found" });
    }

    const id = parseInt(req.params.id);
    const { paymentReference } = req.body;
    
    if (!paymentReference) {
      return res.status(400).json({ error: "Payment reference is required" });
    }
    
    const paidCommission = await storage.markCommissionPaid(id, paidById, paymentReference, tenantId);
    
    if (!paidCommission) {
      return res.status(404).json({ error: "Commission not found" });
    }
    
    res.json(paidCommission);
  } catch (error: any) {
    console.error('Error marking commission as paid:', error);
    res.status(500).json({ error: error.message || "Failed to mark commission as paid" });
  }
});

// ==================== COMMISSION ITEMS ====================

// GET commission items
router.get('/:commissionId/items', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const commissionId = parseInt(req.params.commissionId);
    const items = await storage.getCommissionItems(commissionId, tenantId);
    res.json(items);
  } catch (error: any) {
    console.error('Error fetching commission items:', error);
    res.status(500).json({ error: error.message || "Failed to fetch commission items" });
  }
});

// POST create commission item
router.post('/:commissionId/items', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const commissionId = parseInt(req.params.commissionId);

    // Validate and sanitize item data - explicitly exclude tenantId
    const itemSchema = insertCommissionItemSchema.partial();
    const { tenantId: _, ...validatedData } = itemSchema.parse(req.body);
    
    const itemData = {
      ...validatedData,
      commissionId,
      tenantId,
    };
    
    const newItem = await storage.createCommissionItem(itemData);
    res.status(201).json(newItem);
  } catch (error: any) {
    console.error('Error creating commission item:', error);
    res.status(500).json({ error: error.message || "Failed to create commission item" });
  }
});

// PATCH update commission item
router.patch('/items/:id', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const id = parseInt(req.params.id);
    
    // Validate and sanitize update data - explicitly exclude tenantId
    const updateSchema = insertCommissionItemSchema.partial();
    const { tenantId: _, ...validatedData } = updateSchema.parse(req.body);
    
    const updatedItem = await storage.updateCommissionItem(id, validatedData, tenantId);
    
    if (!updatedItem) {
      return res.status(404).json({ error: "Commission item not found" });
    }
    
    res.json(updatedItem);
  } catch (error: any) {
    console.error('Error updating commission item:', error);
    res.status(500).json({ error: error.message || "Failed to update commission item" });
  }
});

// DELETE commission item
router.delete('/items/:id', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const id = parseInt(req.params.id);
    const deleted = await storage.deleteCommissionItem(id, tenantId);
    
    if (!deleted) {
      return res.status(404).json({ error: "Commission item not found" });
    }
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting commission item:', error);
    res.status(500).json({ error: error.message || "Failed to delete commission item" });
  }
});

export default router;
