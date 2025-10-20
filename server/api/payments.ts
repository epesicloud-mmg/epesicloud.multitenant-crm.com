import express from 'express';
import { storage } from '../storage';
import { insertPaymentPlanSchema, insertPaymentSchema } from '@shared/schema';

const router = express.Router();

// ==================== PAYMENT PLANS ====================

// GET all payment plans
router.get('/plans', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const plans = await storage.getPaymentPlans(tenantId);
    res.json(plans);
  } catch (error: any) {
    console.error('Error fetching payment plans:', error);
    res.status(500).json({ error: error.message || "Failed to fetch payment plans" });
  }
});

// GET payment plans by deal
router.get('/plans/deal/:dealId', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const dealId = parseInt(req.params.dealId);
    const plans = await storage.getPaymentPlansByDeal(dealId, tenantId);
    res.json(plans);
  } catch (error: any) {
    console.error('Error fetching payment plans by deal:', error);
    res.status(500).json({ error: error.message || "Failed to fetch payment plans" });
  }
});

// GET single payment plan
router.get('/plans/:id', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const id = parseInt(req.params.id);
    const plan = await storage.getPaymentPlan(id, tenantId);
    
    if (!plan) {
      return res.status(404).json({ error: "Payment plan not found" });
    }
    
    res.json(plan);
  } catch (error: any) {
    console.error('Error fetching payment plan:', error);
    res.status(500).json({ error: error.message || "Failed to fetch payment plan" });
  }
});

// POST create payment plan
router.post('/plans', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }
    
    const createdById = req.auth?.userId;

    // Validate and sanitize plan data - explicitly exclude tenantId
    const planSchema = insertPaymentPlanSchema.partial();
    const { tenantId: _, ...validatedData } = planSchema.parse(req.body);
    
    // Inject server-controlled fields
    const planData = {
      ...validatedData,
      tenantId,
      createdById: createdById || null,
    };
    
    const newPlan = await storage.createPaymentPlan(planData);
    res.status(201).json(newPlan);
  } catch (error: any) {
    console.error('Error creating payment plan:', error);
    res.status(500).json({ error: error.message || "Failed to create payment plan" });
  }
});

// PATCH update payment plan
router.patch('/plans/:id', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const id = parseInt(req.params.id);
    
    // Validate and sanitize update data - explicitly exclude tenantId
    const updateSchema = insertPaymentPlanSchema.partial();
    const { tenantId: _, ...validatedData } = updateSchema.parse(req.body);
    
    const updatedPlan = await storage.updatePaymentPlan(id, validatedData, tenantId);
    
    if (!updatedPlan) {
      return res.status(404).json({ error: "Payment plan not found" });
    }
    
    res.json(updatedPlan);
  } catch (error: any) {
    console.error('Error updating payment plan:', error);
    res.status(500).json({ error: error.message || "Failed to update payment plan" });
  }
});

// DELETE payment plan
router.delete('/plans/:id', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const id = parseInt(req.params.id);
    const deleted = await storage.deletePaymentPlan(id, tenantId);
    
    if (!deleted) {
      return res.status(404).json({ error: "Payment plan not found" });
    }
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting payment plan:', error);
    res.status(500).json({ error: error.message || "Failed to delete payment plan" });
  }
});

// ==================== PAYMENTS ====================

// GET all payments
router.get('/', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const payments = await storage.getPayments(tenantId);
    res.json(payments);
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: error.message || "Failed to fetch payments" });
  }
});

// GET payments by deal
router.get('/deal/:dealId', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const dealId = parseInt(req.params.dealId);
    const payments = await storage.getPaymentsByDeal(dealId, tenantId);
    res.json(payments);
  } catch (error: any) {
    console.error('Error fetching payments by deal:', error);
    res.status(500).json({ error: error.message || "Failed to fetch payments" });
  }
});

// GET payments by plan
router.get('/plan/:planId', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const planId = parseInt(req.params.planId);
    const payments = await storage.getPaymentsByPlan(planId, tenantId);
    res.json(payments);
  } catch (error: any) {
    console.error('Error fetching payments by plan:', error);
    res.status(500).json({ error: error.message || "Failed to fetch payments" });
  }
});

// GET payments by contact
router.get('/contact/:contactId', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const contactId = parseInt(req.params.contactId);
    const payments = await storage.getPaymentsByContact(contactId, tenantId);
    res.json(payments);
  } catch (error: any) {
    console.error('Error fetching payments by contact:', error);
    res.status(500).json({ error: error.message || "Failed to fetch payments" });
  }
});

// GET single payment
router.get('/:id', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const id = parseInt(req.params.id);
    const payment = await storage.getPayment(id, tenantId);
    
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    
    res.json(payment);
  } catch (error: any) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: error.message || "Failed to fetch payment" });
  }
});

// POST create payment (collect payment)
router.post('/', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }
    
    const collectedById = req.auth?.userId;

    // Generate receipt number
    const receiptNumber = await storage.generateReceiptNumber(tenantId);

    // Validate and sanitize payment data - explicitly exclude tenantId
    const paymentSchema = insertPaymentSchema.partial();
    const { tenantId: _, ...validatedData } = paymentSchema.parse(req.body);
    
    // Inject server-controlled fields
    const paymentData = {
      ...validatedData,
      receiptNumber,
      tenantId,
      collectedById: collectedById || null,
    };
    
    const newPayment = await storage.createPayment(paymentData);
    res.status(201).json(newPayment);
  } catch (error: any) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: error.message || "Failed to create payment" });
  }
});

// PATCH update payment
router.patch('/:id', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const id = parseInt(req.params.id);
    
    // Validate and sanitize update data - explicitly exclude tenantId and receiptNumber
    const updateSchema = insertPaymentSchema.partial().omit({ receiptNumber: true });
    const { tenantId: _, ...validatedData } = updateSchema.parse(req.body);
    
    const updatedPayment = await storage.updatePayment(id, validatedData, tenantId);
    
    if (!updatedPayment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    
    res.json(updatedPayment);
  } catch (error: any) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: error.message || "Failed to update payment" });
  }
});

// DELETE payment
router.delete('/:id', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "Tenant not found" });
    }

    const id = parseInt(req.params.id);
    const deleted = await storage.deletePayment(id, tenantId);
    
    if (!deleted) {
      return res.status(404).json({ error: "Payment not found" });
    }
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ error: error.message || "Failed to delete payment" });
  }
});

export default router;
