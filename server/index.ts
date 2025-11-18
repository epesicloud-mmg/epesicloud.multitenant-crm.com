import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { eventTrackingMiddleware } from "./event-tracker";
import { auditLogger } from "./middleware/audit-logger";
import "dotenv/config";


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add event tracking and audit logging middleware
app.use(eventTrackingMiddleware());
app.use(auditLogger());

// Middleware to set tenantId and userId from headers OR auth payload
app.use((req: any, res, next) => {
  const tenantIdHeader = req.headers['x-tenant-id'];
  const userIdHeader = req.headers['x-user-id'];
  
  // Priority 1: Get from JWT auth payload (set by authenticateToken middleware)
  if (req.auth?.tenantId) {
    req.tenantId = req.auth.tenantId;
  } 
  // Priority 2: Fall back to headers for backward compatibility
  else if (tenantIdHeader) {
    req.tenantId = parseInt(tenantIdHeader as string);
  }
  
  // Same for userId
  if (req.auth?.userId) {
    req.userId = req.auth.userId;
  } else if (userIdHeader) {
    req.userId = parseInt(userIdHeader as string);
  }
  
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Setup Vite in development, serve static files in production
  const isDevelopment = process.env.NODE_ENV !== "production";
  
  if (isDevelopment) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use environment variable for port with fallback to 5000
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

// Railway requires binding to 0.0.0.0, not localhost
const HOST = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";

server.listen(PORT, HOST, () => {
  log(`🚀 Server running on http://${HOST}:${PORT}`);
  log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
});
})();