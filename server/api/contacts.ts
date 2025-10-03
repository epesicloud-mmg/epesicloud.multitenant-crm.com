import express from "express";
import { storage } from "../storage";
import { insertContactSchema } from "@shared/schema";
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

// GET /api/contacts - Get all contacts for tenant
router.get("/", async (req: any, res) => {
  try {
    const contacts = await storage.getContacts(req.tenantId);
    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

// GET /api/contacts/:id - Get specific contact
router.get("/:id", async (req: any, res) => {
  try {
    const contactId = parseInt(req.params.id);
    if (isNaN(contactId)) {
      return res.status(400).json({ error: "Invalid contact ID" });
    }
    
    const contact = await storage.getContact(contactId, req.tenantId);
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    
    res.json(contact);
  } catch (error) {
    console.error("Error fetching contact:", error);
    res.status(500).json({ error: "Failed to fetch contact" });
  }
});

// POST /api/contacts - Create new contact
router.post("/", async (req: any, res) => {
  try {
    const validatedData = insertContactSchema.parse({
      ...req.body,
      tenantId: req.tenantId,
    });
    
    const contact = await storage.createContact(validatedData);
    res.status(201).json(contact);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: error.errors 
      });
    }
    console.error("Error creating contact:", error);
    res.status(500).json({ error: "Failed to create contact" });
  }
});

// PUT /api/contacts/:id - Update contact
router.put("/:id", async (req: any, res) => {
  try {
    const contactId = parseInt(req.params.id);
    if (isNaN(contactId)) {
      return res.status(400).json({ error: "Invalid contact ID" });
    }
    
    const updateData = { ...req.body };
    delete updateData.tenantId; // Prevent tenant ID from being updated
    
    const contact = await storage.updateContact(contactId, updateData, req.tenantId);
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    
    res.json(contact);
  } catch (error) {
    console.error("Error updating contact:", error);
    res.status(500).json({ error: "Failed to update contact" });
  }
});

// DELETE /api/contacts/:id - Delete contact
router.delete("/:id", async (req: any, res) => {
  try {
    const contactId = parseInt(req.params.id);
    if (isNaN(contactId)) {
      return res.status(400).json({ error: "Invalid contact ID" });
    }
    
    const success = await storage.deleteContact(contactId, req.tenantId);
    if (!success) {
      return res.status(404).json({ error: "Contact not found" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ error: "Failed to delete contact" });
  }
});

// GET /api/contacts/company/:companyId - Get contacts for specific company
router.get("/company/:companyId", async (req: any, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    if (isNaN(companyId)) {
      return res.status(400).json({ error: "Invalid company ID" });
    }
    
    // For now, return all contacts and filter client-side
    // TODO: Implement getContactsByCompany in storage
    const contacts = await storage.getContacts(req.tenantId);
    const filtered = contacts.filter((c: any) => c.companyId === companyId);
    res.json(filtered);
  } catch (error) {
    console.error("Error fetching company contacts:", error);
    res.status(500).json({ error: "Failed to fetch company contacts" });
  }
});

// GET /api/contacts/search/:query - Search contacts
router.get("/search/:query", async (req: any, res) => {
  try {
    const query = req.params.query;
    if (!query || query.length < 2) {
      return res.status(400).json({ error: "Search query must be at least 2 characters" });
    }
    
    // For now, return all contacts and filter client-side
    // TODO: Implement searchContacts in storage
    const contacts = await storage.getContacts(req.tenantId);
    const filtered = contacts.filter((c: any) => 
      c.firstName?.toLowerCase().includes(query.toLowerCase()) ||
      c.lastName?.toLowerCase().includes(query.toLowerCase()) ||
      c.email?.toLowerCase().includes(query.toLowerCase())
    );
    res.json(filtered);
  } catch (error) {
    console.error("Error searching contacts:", error);
    res.status(500).json({ error: "Failed to search contacts" });
  }
});

export default router;