import "dotenv/config";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "@shared/schema";

// Only configure WebSocket for Neon in production or serverless environments
// In development with Node.js, native WebSocket support is available
if (process.env.NODE_ENV === 'production' || !globalThis.WebSocket) {
  const ws = await import("ws");
  neonConfig.webSocketConstructor = ws.default;
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL
});
export const db = drizzle({ client: pool, schema });