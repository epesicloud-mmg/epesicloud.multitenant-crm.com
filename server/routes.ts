import type { Express } from "express";
import { createServer, type Server } from "http";

// Import authentication routes
import authRouter from "./routes/auth";
import tenantsRouter from "./routes/tenants";
import crmRouter from "./modules/crm/api/crm-routes.js";
import financeRouter from "./modules/finance/api/finance-routes.js";
import hrRouter from "./modules/hr/api/hr-routes.js";

// Extend Request interface for authentication
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: number;
        email: string;
        tenantId: number | null;
      };
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Authentication routes (public)
  app.use("/api/auth", authRouter);

  // Tenant management routes (protected)
  app.use("/api/tenants", tenantsRouter);

  // Module routes (protected)
  app.use("/api/crm", crmRouter);
  
  // Finance and HR modules - NOT YET IMPLEMENTED
  // Reason: Database schemas for Finance/HR tables not yet created
  // Required tables: invoices, expenses, accounts, budgets, departments, employees, etc.
  // app.use("/api/finance", financeRouter);
  // app.use("/api/hr", hrRouter);

  const server = createServer(app);
  return server;
}
