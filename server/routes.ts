import type { Express } from "express";
import { createServer, type Server } from "http";

// Import authentication routes
import authRouter from "./routes/auth";
import tenantsRouter from "./routes/tenants";
import crmRouter from "./modules/crm/api/crm-routes.js";

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

  // CRM API routes (protected)
  app.use("/api", crmRouter);

  const server = createServer(app);
  return server;
}
