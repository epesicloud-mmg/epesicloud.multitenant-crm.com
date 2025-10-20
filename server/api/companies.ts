import express from "express";
import { storage } from "../storage";
import { insertCompanySchema } from "@shared/schema";
import { z } from "zod";
import { authenticateToken } from "../auth";

const router = express.Router();

// Apply authentication first
router.use(authenticateToken);

// Middleware for tenant context
const ensureContext = (req: any, res: any, next: any) => {
  if (!req.tenantId) {
    return res.status(400).json({ error: "Tenant context required" });
  }
  next();
};

router.use(ensureContext);

// GET /api/companies - Get all companies for tenant
router.get("/", async (req: any, res) => {
  try {
    const companies = await storage.getCompanies(req.tenantId);
    res.json(companies);
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ error: "Failed to fetch companies" });
  }
});

// GET /api/companies/:id - Get specific company
router.get("/:id", async (req: any, res) => {
  try {
    const companyId = parseInt(req.params.id);
    if (isNaN(companyId)) {
      return res.status(400).json({ error: "Invalid company ID" });
    }
    
    const company = await storage.getCompany(companyId, req.tenantId);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    
    res.json(company);
  } catch (error) {
    console.error("Error fetching company:", error);
    res.status(500).json({ error: "Failed to fetch company" });
  }
});

// POST /api/companies - Create new company
router.post("/", async (req: any, res) => {
  try {
    const validatedData = insertCompanySchema.parse({
      ...req.body,
      tenantId: req.tenantId,
    });
    
    const company = await storage.createCompany(validatedData);
    res.status(201).json(company);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: error.errors 
      });
    }
    console.error("Error creating company:", error);
    res.status(500).json({ error: "Failed to create company" });
  }
});

// PUT /api/companies/:id - Update company
router.put("/:id", async (req: any, res) => {
  try {
    const companyId = parseInt(req.params.id);
    if (isNaN(companyId)) {
      return res.status(400).json({ error: "Invalid company ID" });
    }
    
    const updateData = { ...req.body };
    delete updateData.tenantId; // Prevent tenant ID from being updated
    
    const company = await storage.updateCompany(companyId, updateData, req.tenantId);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    
    res.json(company);
  } catch (error) {
    console.error("Error updating company:", error);
    res.status(500).json({ error: "Failed to update company" });
  }
});

// DELETE /api/companies/:id - Delete company
router.delete("/:id", async (req: any, res) => {
  try {
    const companyId = parseInt(req.params.id);
    if (isNaN(companyId)) {
      return res.status(400).json({ error: "Invalid company ID" });
    }
    
    const success = await storage.deleteCompany(companyId, req.tenantId);
    if (!success) {
      return res.status(404).json({ error: "Company not found" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting company:", error);
    res.status(500).json({ error: "Failed to delete company" });
  }
});

// GET /api/companies/search/:query - Search companies
router.get("/search/:query", async (req: any, res) => {
  try {
    const query = req.params.query;
    if (!query || query.length < 2) {
      return res.status(400).json({ error: "Search query must be at least 2 characters" });
    }
    
    // For now, return all companies and filter client-side
    // TODO: Implement searchCompanies in storage
    const companies = await storage.getCompanies(req.tenantId);
    const filtered = companies.filter((c: any) => 
      c.name?.toLowerCase().includes(query.toLowerCase())
    );
    res.json(filtered);
  } catch (error) {
    console.error("Error searching companies:", error);
    res.status(500).json({ error: "Failed to search companies" });
  }
});

export default router;