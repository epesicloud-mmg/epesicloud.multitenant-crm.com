import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertCompanySchema, insertProductSchema, insertLeadSchema, insertDealSchema, insertActivitySchema, insertUserSchema, insertActivityTypeSchema, insertSalesPipelineSchema, insertSalesStageSchema, insertInterestLevelSchema } from "@shared/schema";
import { z } from "zod";
import { generateDashboardInsights, generateContactInsights, generateDealScoring } from "./ai";
import { generateCRMInsights, generateQuickInsight } from "./ai-assistant";
import { seedSampleData } from "./seed-data";

// Import microservice routers
import dealsRouter from "./api/deals";
import contactsRouter from "./api/contacts";
import activitiesRouter from "./api/activities";
import pipelinesRouter from "./api/pipelines";
import companiesRouter from "./api/companies";
import productsRouter from "./api/products";
import usersRouter from "./api/users";
import eventsRouter from "./api/events/index";
import aiDashboardRouter from "./api/ai-dashboard";
import { aiConversationsRouter } from "./api/ai-conversations";
import { aiChatRouter } from "./api/ai-chat";
import { auditLogger } from "./middleware/audit-logger";

// Extend Request interface
declare global {
  namespace Express {
    interface Request {
      tenantId: number;
      user?: {
        id: number;
        username: string;
        role: {
          id: number;
          name: string;
          level: number;
        };
        managerId?: number;
      };
      teamFilter?: { managerId: number };
      userFilter?: { userId: number };
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware to extract tenant from subdomain or header
  app.use((req, res, next) => {
    // For simplicity, we'll use a header. In production, you'd extract from subdomain
    const tenantId = parseInt(req.headers['x-tenant-id'] as string) || 1;
    req.tenantId = tenantId;
    next();
  });

  // Import module routers
  const { default: crmRouter } = await import("./modules/crm/api/crm-routes.js");
  const { default: financeRouter } = await import("./modules/finance/api/finance-routes.js");
  const { default: hrRouter } = await import("./modules/hr/api/hr-routes.js");
  const { default: aamRouter } = await import("./modules/aam/api/aam-routes.js");
  const { default: analyticsRouter } = await import("./modules/analytics/api/analytics-routes.js");
  const { default: workflowsRouter } = await import("./modules/workflows/api/workflows-routes.js");

  // Mount module routers for organized API access
  app.use("/api/crm", crmRouter);
  app.use("/api/finance", financeRouter);
  app.use("/api/workflows", workflowsRouter);
  app.use("/api/hr", hrRouter);
  app.use("/api/analytics", analyticsRouter);
  app.use("/api/aam", aamRouter);

  // Enhanced Financial Transaction System
  const { default: enhancedFinanceRouter } = await import("./api/finance-routes.js");
  app.use("/api/finance-enhanced", enhancedFinanceRouter);

  // Use individual microservice routers (backward compatibility)
  app.use("/api/deals", dealsRouter);
  app.use("/api/contacts", contactsRouter);
  app.use("/api/activities", activitiesRouter);
  app.use("/api/pipelines", pipelinesRouter);
  app.use("/api/companies", companiesRouter);
  app.use("/api/products", productsRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/events", eventsRouter);
  app.use("/api/ai-dashboard", aiDashboardRouter);
  app.use("/api/ai-conversations", aiConversationsRouter);
  app.use("/api/chat", aiChatRouter);

  // AI Chat endpoint that integrates with multi-chat UI
  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    try {
      const { message, conversationId, context } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Generate AI response using real Gemini AI
      const { generateAIChatResponse } = await import('./ai');
      const aiResponse = await generateAIChatResponse(message, context);
      
      // Store AI response in chat messages
      const aiMessage = await storage.addChatMessage({
        conversationId: parseInt(conversationId),
        tenantId: req.tenantId,
        userId: 1, // Mock user ID for development
        content: aiResponse,
        role: 'assistant',
        messageType: 'text',
        context: { response_to: message }
      });

      res.json(aiMessage);
    } catch (error) {
      console.error('AI Chat error:', error);
      res.status(500).json({ error: 'Failed to generate AI response' });
    }
  });

  // Event logs API for AI context - filtered by logged-in user
  app.get("/api/event-logs/recent", async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id || 1; // Mock user ID for development
      const limit = parseInt(req.query.limit as string) || 10;
      
      const recentEvents = await storage.getUserRecentEvents(userId, req.tenantId, limit);
      res.json(recentEvents);
    } catch (error) {
      console.error("Error fetching recent events:", error);
      res.status(500).json({ error: "Failed to fetch recent events" });
    }
  });

  // Chat Conversations API - Multi-chat functionality
  app.get("/api/chat/conversations", async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id || 1; // Mock user ID for development
      const conversations = await storage.getUserChatConversations(userId, req.tenantId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.post("/api/chat/conversations", async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id || 1; // Mock user ID for development
      const { title } = req.body;
      
      const newConversation = await storage.createChatConversation({
        tenantId: req.tenantId,
        userId,
        title: title || "New Chat",
      });
      
      res.status(201).json(newConversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.get("/api/chat/conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id || 1; // Mock user ID for development
      const conversationId = parseInt(req.params.id);
      
      const messages = await storage.getChatMessages(conversationId, userId, req.tenantId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/chat/conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id || 1; // Mock user ID for development
      const conversationId = parseInt(req.params.id);
      const { content, role, context } = req.body;
      
      const newMessage = await storage.addChatMessage({
        conversationId,
        tenantId: req.tenantId,
        userId,
        content,
        role,
        context,
      });
      
      res.status(201).json(newMessage);
    } catch (error) {
      console.error("Error adding message:", error);
      res.status(500).json({ error: "Failed to add message" });
    }
  });

  app.delete("/api/chat/conversations/:id", async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id || 1; // Mock user ID for development
      const conversationId = parseInt(req.params.id);
      
      const deleted = await storage.deleteChatConversation(conversationId, userId, req.tenantId);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Conversation not found" });
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // Additional routes for entities
  app.get("/api/deal-stages", async (req: Request, res: Response) => {
    try {
      const stages = await storage.getDealStages(req.tenantId);
      res.json(stages);
    } catch (error) {
      console.error("Error fetching deal stages:", error);
      res.status(500).json({ error: "Failed to fetch deal stages" });
    }
  });

  app.get("/api/interest-levels", async (req: Request, res: Response) => {
    try {
      const levels = await storage.getInterestLevels(req.tenantId);
      res.json(levels);
    } catch (error) {
      console.error("Error fetching interest levels:", error);
      res.status(500).json({ error: "Failed to fetch interest levels" });
    }
  });
  
  // Import additional routes after checking they exist
  try {
    const assistantsRouter = await import("./routes/assistants");
    app.use("/api/assistants", assistantsRouter.default);
  } catch (e) {
    console.log("Assistants routes not available yet");
  }
  
  try {
    const instantSearchRouter = await import("./routes/instant-search");
    app.use("/api/instant-search", instantSearchRouter.default);
  } catch (e) {
    console.log("Instant search routes not available yet");
  }

  // AI Chat endpoints for floating control
  app.get("/api/workspaces/:workspaceId/conversations", (req: Request, res: Response) => {
    const conversations = [
      {
        conversationId: 'default',
        title: 'General Chat',
        lastMessage: 'How can I help you today?',
        lastActivity: new Date(),
        messageCount: 1
      },
      {
        conversationId: 'sales-analysis',
        title: 'Sales Performance Analysis', 
        lastMessage: 'Based on your pipeline data...',
        lastActivity: new Date(Date.now() - 3600000),
        messageCount: 8
      }
    ];
    res.json(conversations);
  });

  // Store messages in memory (in production, use database)
  const conversationMessages: { [key: string]: any[] } = {};

  app.get("/api/workspaces/:workspaceId/conversations/:conversationId/messages", (req: Request, res: Response) => {
    const { conversationId } = req.params;
    const messages = conversationMessages[conversationId] || [
      {
        id: 1,
        message: '',
        response: 'Hello! I\'m your AI assistant for CRM analytics and insights. How can I help you optimize your sales performance today?',
        createdAt: new Date().toISOString(),
        conversationId: conversationId,
        type: 'ai'
      }
    ];
    res.json(messages);
  });

  app.post("/api/workspaces/:workspaceId/chat", async (req: Request, res: Response) => {
    try {
      const { message, conversationId } = req.body;
      const { workspaceId } = req.params;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const aiResponse = await generateCRMInsights(message, workspaceId);

      const chatMessage = {
        id: Date.now(),
        message,
        response: aiResponse,
        createdAt: new Date().toISOString(),
        conversationId: conversationId || 'default'
      };

      // Store the message in memory
      const convId = conversationId || 'default';
      if (!conversationMessages[convId]) {
        conversationMessages[convId] = [
          {
            id: 1,
            message: '',
            response: 'Hello! I\'m your AI assistant for CRM analytics and insights. How can I help you optimize your sales performance today?',
            createdAt: new Date(Date.now() - 10000).toISOString(),
            conversationId: convId,
            type: 'ai'
          }
        ];
      }
      conversationMessages[convId].push(chatMessage);

      res.json(chatMessage);
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ error: "Failed to generate AI response" });
    }
  });
  app.use("/api/sales-pipelines", pipelinesRouter); // Alias for backward compatibility

  // Mock authentication middleware - in production, use proper JWT/session auth
  app.use((req, res, next) => {
    // Mock user based on header for development
    const userId = parseInt(req.headers['x-user-id'] as string) || 1;
    const userRole = req.headers['x-user-role'] as string || 'super admin';
    const managerId = req.headers['x-manager-id'] ? parseInt(req.headers['x-manager-id'] as string) : undefined;
    
    req.user = {
      id: userId,
      username: `user${userId}`,
      role: {
        id: 1,
        name: userRole,
        level: userRole === 'super admin' ? 4 : userRole === 'sales manager' ? 3 : userRole === 'supervisor' ? 2 : 1
      },
      managerId
    };
    next();
  });

  // RBAC middleware for data access control
  const enforceDataAccess = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userRole = req.user.role.name.toLowerCase();
    
    // Super admins and sales managers can see all data
    if (userRole === 'super admin' || userRole === 'sales manager') {
      return next();
    }

    // Supervisors can only see their team's data
    if (userRole === 'supervisor') {
      req.teamFilter = { managerId: req.user.id };
      return next();
    }

    // Agents can only see their own data
    if (userRole === 'agent') {
      req.userFilter = { userId: req.user.id };
      return next();
    }

    next();
  };

  // Dashboard metrics
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics(req.tenantId);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard metrics" });
    }
  });

  // Contacts routes with role-based filtering
  app.get("/api/contacts", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const user = req.user as any;
      const userRole = user?.role?.name?.toLowerCase();
      
      // Role-based filtering: agents, supervisors, and higher roles can access contacts
      // Agents and supervisors see all contacts (needed for lead/deal management)
      // In production, you might implement more sophisticated filtering
      const contacts = await storage.getContacts(req.tenantId, limit);
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  app.get("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contact = await storage.getContact(id, req.tenantId);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contact" });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      console.log("Creating contact with data:", req.body);
      console.log("Tenant ID:", req.tenantId);
      
      const validatedData = insertContactSchema.parse({
        ...req.body,
        tenantId: req.tenantId,
      });
      
      console.log("Validated data:", validatedData);
      
      const contact = await storage.createContact(validatedData);
      res.status(201).json(contact);
    } catch (error) {
      console.error("Error creating contact:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create contact", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.put("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertContactSchema.partial().parse(req.body);
      const contact = await storage.updateContact(id, validatedData, req.tenantId);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update contact" });
    }
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteContact(id, req.tenantId);
      if (!success) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete contact" });
    }
  });

  // Companies routes
  app.get("/api/companies", async (req, res) => {
    try {
      const companies = await storage.getCompanies(req.tenantId);
      res.json(companies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  });

  app.post("/api/companies", async (req, res) => {
    try {
      const validatedData = insertCompanySchema.parse({
        ...req.body,
        tenantId: req.tenantId,
      });
      const company = await storage.createCompany(validatedData);
      res.status(201).json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create company" });
    }
  });

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts(req.tenantId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse({
        ...req.body,
        tenantId: req.tenantId,
      });
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, validatedData, req.tenantId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProduct(id, req.tenantId);
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Interaction Types in-memory storage
  let interactionTypes = [
    {
      id: 1,
      typeName: "Cold Call",
      description: "Initial outreach via phone call to prospects",
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      typeName: "Email Follow-up",
      description: "Follow-up email communication with existing contacts",
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      typeName: "Meeting",
      description: "In-person or virtual meeting with prospects",
      createdAt: new Date().toISOString()
    }
  ];

  // Interaction Types routes
  app.get("/api/interaction-types", async (req, res) => {
    try {
      res.json(interactionTypes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch interaction types" });
    }
  });

  app.post("/api/interaction-types", async (req, res) => {
    try {
      const { typeName, description } = req.body;
      
      if (!typeName || !description) {
        return res.status(400).json({ error: "Type name and description are required" });
      }

      const newInteractionType = {
        id: Math.max(...interactionTypes.map(t => t.id), 0) + 1,
        typeName,
        description,
        createdAt: new Date().toISOString()
      };
      
      interactionTypes.push(newInteractionType);
      res.status(201).json(newInteractionType);
    } catch (error) {
      res.status(500).json({ error: "Failed to create interaction type" });
    }
  });

  app.patch("/api/interaction-types/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { typeName, description } = req.body;
      
      const typeIndex = interactionTypes.findIndex(t => t.id === id);
      if (typeIndex === -1) {
        return res.status(404).json({ error: "Interaction type not found" });
      }

      interactionTypes[typeIndex] = {
        ...interactionTypes[typeIndex],
        typeName,
        description,
      };
      
      res.json(interactionTypes[typeIndex]);
    } catch (error) {
      res.status(500).json({ error: "Failed to update interaction type" });
    }
  });

  app.delete("/api/interaction-types/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const typeIndex = interactionTypes.findIndex(t => t.id === id);
      if (typeIndex === -1) {
        return res.status(404).json({ error: "Interaction type not found" });
      }

      interactionTypes.splice(typeIndex, 1);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete interaction type" });
    }
  });

  // Customer Types in-memory storage
  let customerTypes = [
    {
      id: 1,
      title: "Enterprise",
      description: "Large corporations and enterprise clients",
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      title: "SMB",
      description: "Small and medium business customers",
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      title: "Startup",
      description: "Early-stage startup companies",
      createdAt: new Date().toISOString()
    },
    {
      id: 4,
      title: "Individual",
      description: "Individual customers and freelancers",
      createdAt: new Date().toISOString()
    }
  ];

  // Customer Types routes
  app.get("/api/customer-types", async (req, res) => {
    try {
      res.json(customerTypes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer types" });
    }
  });

  app.post("/api/customer-types", async (req, res) => {
    try {
      const { title, description } = req.body;
      
      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }

      const newCustomerType = {
        id: Math.max(...customerTypes.map(t => t.id), 0) + 1,
        title,
        description: description || undefined,
        createdAt: new Date().toISOString()
      };
      
      customerTypes.push(newCustomerType);
      res.status(201).json(newCustomerType);
    } catch (error) {
      res.status(500).json({ error: "Failed to create customer type" });
    }
  });

  app.patch("/api/customer-types/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { title, description } = req.body;
      
      const typeIndex = customerTypes.findIndex(t => t.id === id);
      if (typeIndex === -1) {
        return res.status(404).json({ error: "Customer type not found" });
      }

      customerTypes[typeIndex] = {
        ...customerTypes[typeIndex],
        title,
        description: description || undefined,
      };
      
      res.json(customerTypes[typeIndex]);
    } catch (error) {
      res.status(500).json({ error: "Failed to update customer type" });
    }
  });

  app.delete("/api/customer-types/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const typeIndex = customerTypes.findIndex(t => t.id === id);
      if (typeIndex === -1) {
        return res.status(404).json({ error: "Customer type not found" });
      }

      customerTypes.splice(typeIndex, 1);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete customer type" });
    }
  });

  // Lead Source Categories in-memory storage
  let leadSourceCategories = [
    {
      id: 1,
      categoryTitle: "Online Marketing",
      description: "Leads generated from online marketing campaigns including social media, search ads, and content marketing",
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      categoryTitle: "Referrals",
      description: "Customer referrals and word-of-mouth recommendations from existing clients",
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      categoryTitle: "Trade Shows",
      description: "Leads collected from industry trade shows, conferences, and events",
      createdAt: new Date().toISOString()
    },
    {
      id: 4,
      categoryTitle: "Cold Outreach",
      description: "Proactive outreach through cold calls, emails, and direct mail campaigns",
      createdAt: new Date().toISOString()
    },
    {
      id: 5,
      categoryTitle: "Website Inquiries",
      description: "Direct inquiries through company website contact forms and chat",
      createdAt: new Date().toISOString()
    }
  ];

  // Lead Source Categories routes
  app.get("/api/lead-source-categories", async (req, res) => {
    try {
      res.json(leadSourceCategories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lead source categories" });
    }
  });

  app.post("/api/lead-source-categories", async (req, res) => {
    try {
      const { categoryTitle, description } = req.body;
      
      if (!categoryTitle || !description) {
        return res.status(400).json({ error: "Category title and description are required" });
      }

      const newLeadSourceCategory = {
        id: Math.max(...leadSourceCategories.map(c => c.id), 0) + 1,
        categoryTitle,
        description,
        createdAt: new Date().toISOString()
      };
      
      leadSourceCategories.push(newLeadSourceCategory);
      res.status(201).json(newLeadSourceCategory);
    } catch (error) {
      res.status(500).json({ error: "Failed to create lead source category" });
    }
  });

  app.patch("/api/lead-source-categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { categoryTitle, description } = req.body;
      
      const categoryIndex = leadSourceCategories.findIndex(c => c.id === id);
      if (categoryIndex === -1) {
        return res.status(404).json({ error: "Lead source category not found" });
      }

      leadSourceCategories[categoryIndex] = {
        ...leadSourceCategories[categoryIndex],
        categoryTitle,
        description,
      };
      
      res.json(leadSourceCategories[categoryIndex]);
    } catch (error) {
      res.status(500).json({ error: "Failed to update lead source category" });
    }
  });

  app.delete("/api/lead-source-categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const categoryIndex = leadSourceCategories.findIndex(c => c.id === id);
      if (categoryIndex === -1) {
        return res.status(404).json({ error: "Lead source category not found" });
      }

      leadSourceCategories.splice(categoryIndex, 1);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete lead source category" });
    }
  });

  // Lead Sources in-memory storage
  let leadSources = [
    {
      id: 1,
      leadSourceCategoryId: "1",
      leadSourceCategoryTitle: "Online Marketing",
      leadSourceTitle: "Google Ads",
      description: "Leads from Google advertising campaigns",
      enableTracking: "Yes",
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      leadSourceCategoryId: "1",
      leadSourceCategoryTitle: "Online Marketing",
      leadSourceTitle: "Facebook Ads",
      description: "Social media advertising on Facebook platform",
      enableTracking: "Yes",
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      leadSourceCategoryId: "2",
      leadSourceCategoryTitle: "Referrals",
      leadSourceTitle: "Customer Referral",
      description: "Direct referrals from existing customers",
      enableTracking: "No",
      createdAt: new Date().toISOString()
    },
    {
      id: 4,
      leadSourceCategoryId: "5",
      leadSourceCategoryTitle: "Website Inquiries",
      leadSourceTitle: "Contact Form",
      description: "Inquiries submitted through website contact form",
      enableTracking: "Yes",
      createdAt: new Date().toISOString()
    }
  ];

  // Lead Sources routes
  app.get("/api/lead-sources", async (req, res) => {
    try {
      res.json(leadSources);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lead sources" });
    }
  });

  app.post("/api/lead-sources", async (req, res) => {
    try {
      const { leadSourceCategoryId, leadSourceTitle, description, enableTracking } = req.body;
      
      if (!leadSourceCategoryId || !leadSourceTitle || !enableTracking) {
        return res.status(400).json({ error: "Lead source category, title, and tracking setting are required" });
      }

      // Find category title from leadSourceCategories
      const category = leadSourceCategories.find(c => c.id.toString() === leadSourceCategoryId);

      const newLeadSource = {
        id: Math.max(...leadSources.map(s => s.id), 0) + 1,
        leadSourceCategoryId,
        leadSourceCategoryTitle: category?.categoryTitle || "Unknown",
        leadSourceTitle,
        description: description || undefined,
        enableTracking,
        createdAt: new Date().toISOString()
      };
      
      leadSources.push(newLeadSource);
      res.status(201).json(newLeadSource);
    } catch (error) {
      res.status(500).json({ error: "Failed to create lead source" });
    }
  });

  app.patch("/api/lead-sources/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { leadSourceCategoryId, leadSourceTitle, description, enableTracking } = req.body;
      
      const sourceIndex = leadSources.findIndex(s => s.id === id);
      if (sourceIndex === -1) {
        return res.status(404).json({ error: "Lead source not found" });
      }

      // Find category title from leadSourceCategories
      const category = leadSourceCategories.find(c => c.id.toString() === leadSourceCategoryId);

      leadSources[sourceIndex] = {
        ...leadSources[sourceIndex],
        leadSourceCategoryId,
        leadSourceCategoryTitle: category?.categoryTitle || "Unknown",
        leadSourceTitle,
        description: description || undefined,
        enableTracking,
      };
      
      res.json(leadSources[sourceIndex]);
    } catch (error) {
      res.status(500).json({ error: "Failed to update lead source" });
    }
  });

  app.delete("/api/lead-sources/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const sourceIndex = leadSources.findIndex(s => s.id === id);
      if (sourceIndex === -1) {
        return res.status(404).json({ error: "Lead source not found" });
      }

      leadSources.splice(sourceIndex, 1);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete lead source" });
    }
  });

  // Deal stages routes
  app.get("/api/deal-stages", async (req, res) => {
    try {
      const stages = await storage.getDealStages(req.tenantId);
      res.json(stages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch deal stages" });
    }
  });

  // Legacy deals routes - now handled by microservice router
  // Commented out to avoid conflicts with microservice API

  // Leads routes with role-based filtering
  app.get("/api/leads", async (req, res) => {
    try {
      const user = req.user as any;
      const userRole = user?.role?.name?.toLowerCase();
      const leads = await storage.getLeads(req.tenantId, user?.id, userRole);
      res.json(leads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      // Convert score to number if it's a string before validation
      const processedBody = {
        ...req.body,
        score: req.body.score !== undefined ? 
          (typeof req.body.score === 'string' ? parseInt(req.body.score, 10) || 0 : req.body.score) : 
          undefined
      };
      
      const validatedData = insertLeadSchema.parse({
        ...processedBody,
        tenantId: req.tenantId,
      });
      const lead = await storage.createLead(validatedData);
      res.status(201).json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create lead" });
    }
  });

  app.patch("/api/leads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // Convert score to number if it's a string before validation
      const processedBody = {
        ...req.body,
        score: req.body.score !== undefined ? 
          (typeof req.body.score === 'string' ? parseInt(req.body.score, 10) || 0 : req.body.score) : 
          undefined
      };
      
      const validatedData = insertLeadSchema.partial().parse(processedBody);
      const lead = await storage.updateLead(id, validatedData, req.tenantId);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update lead" });
    }
  });

  app.delete("/api/leads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteLead(id, req.tenantId);
      if (!success) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete lead" });
    }
  });

  // Lead assignment routes
  app.post("/api/leads/:id/assign", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { assignedToId } = req.body;
      const user = req.user as any;
      
      // Check if user has permission to assign leads
      const userRole = user?.role?.name?.toLowerCase();
      if (!['sales manager', 'supervisor', 'super admin', 'director'].includes(userRole)) {
        return res.status(403).json({ error: "Insufficient permissions to assign leads" });
      }
      
      const lead = await storage.assignLead(id, assignedToId, user.id, req.tenantId);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      res.status(500).json({ error: "Failed to assign lead" });
    }
  });

  app.post("/api/leads/:id/unassign", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = req.user as any;
      
      // Check if user has permission to unassign leads
      const userRole = user?.role?.name?.toLowerCase();
      if (!['sales manager', 'supervisor', 'super admin', 'director'].includes(userRole)) {
        return res.status(403).json({ error: "Insufficient permissions to unassign leads" });
      }
      
      const lead = await storage.unassignLead(id, req.tenantId);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      res.status(500).json({ error: "Failed to unassign lead" });
    }
  });

  app.get("/api/leads/my", async (req, res) => {
    try {
      const user = req.user as any;
      const leads = await storage.getMyLeads(user.id, req.tenantId);
      res.json(leads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch my leads" });
    }
  });

  app.get("/api/leads/team", async (req, res) => {
    try {
      const user = req.user as any;
      const userRole = user?.role?.name?.toLowerCase();
      
      if (!['sales manager', 'supervisor', 'super admin', 'director'].includes(userRole)) {
        return res.status(403).json({ error: "Insufficient permissions to view team leads" });
      }
      
      const leads = await storage.getTeamLeads(user.id, req.tenantId);
      res.json(leads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team leads" });
    }
  });

  app.post("/api/leads/:id/convert", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contact = await storage.convertLead(id, req.tenantId);
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: "Failed to convert lead" });
    }
  });

  // Activities routes
  app.get("/api/activities", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const activities = await storage.getActivities(req.tenantId, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const validatedData = insertActivitySchema.parse({
        ...req.body,
        tenantId: req.tenantId,
        userId: 1, // In a real app, this would come from authentication
      });
      const activity = await storage.createActivity(validatedData);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create activity" });
    }
  });

  app.patch("/api/activities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertActivitySchema.partial().parse(req.body);
      const activity = await storage.updateActivity(id, validatedData, req.tenantId);
      if (!activity) {
        return res.status(404).json({ error: "Activity not found" });
      }
      res.json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update activity" });
    }
  });

  app.delete("/api/activities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteActivity(id, req.tenantId);
      if (!success) {
        return res.status(404).json({ error: "Activity not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete activity" });
    }
  });

  app.patch("/api/activities/:id/complete", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const activity = await storage.updateActivity(id, { completedAt: new Date() }, req.tenantId);
      if (!activity) {
        return res.status(404).json({ error: "Activity not found" });
      }
      res.json(activity);
    } catch (error) {
      res.status(500).json({ error: "Failed to complete activity" });
    }
  });

  // AI Endpoints
  app.get("/api/ai/dashboard-insights", async (req, res) => {
    try {
      const [deals, contacts, activities, companies, leads] = await Promise.all([
        storage.getDeals(req.tenantId),
        storage.getContacts(req.tenantId),
        storage.getActivities(req.tenantId),
        storage.getCompanies(req.tenantId),
        storage.getLeads(req.tenantId)
      ]);

      const insights = await generateDashboardInsights(deals, contacts, activities, companies, leads);
      res.json(insights);
    } catch (error) {
      console.error('Dashboard insights error:', error);
      res.status(500).json({ error: "Failed to generate insights" });
    }
  });

  app.get("/api/ai/contact-insights/:id", async (req, res) => {
    try {
      const contactId = parseInt(req.params.id);
      const contact = await storage.getContact(contactId, req.tenantId);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }

      const [activities, deals] = await Promise.all([
        storage.getActivitiesForContact(contactId, req.tenantId),
        storage.getDeals(req.tenantId)
      ]);

      const insights = await generateContactInsights(contact, activities, deals);
      res.json(insights);
    } catch (error) {
      console.error('Contact insights error:', error);
      res.status(500).json({ error: "Failed to generate contact insights" });
    }
  });

  app.get("/api/ai/deal-scoring/:id", async (req, res) => {
    try {
      const dealId = parseInt(req.params.id);
      const deal = await storage.getDeal(dealId, req.tenantId);
      if (!deal) {
        return res.status(404).json({ error: "Deal not found" });
      }

      const [contact, activities] = await Promise.all([
        deal.contactId ? storage.getContact(deal.contactId, req.tenantId) : Promise.resolve(undefined),
        storage.getActivities(req.tenantId)
      ]);

      const scoring = await generateDealScoring(deal, contact, activities);
      res.json(scoring);
    } catch (error) {
      console.error('Deal scoring error:', error);
      res.status(500).json({ error: "Failed to generate deal scoring" });
    }
  });

  // User management routes
  app.get("/api/users", enforceDataAccess, async (req: Request, res: Response) => {
    try {
      const tenantId = req.tenantId;
      const userRole = req.user?.role.name.toLowerCase();
      let managerId: number | undefined;

      // Apply role-based filtering
      if (userRole === 'supervisor') {
        // Supervisors only see their team
        managerId = req.user!.id;
      } else if (userRole === 'agent') {
        // Agents only see themselves
        const selfUser = await storage.getUser(req.user!.id);
        return res.json(selfUser ? [selfUser] : []);
      } else {
        // Super admins and sales managers see all users
        managerId = req.query.managerId ? parseInt(req.query.managerId as string) : undefined;
      }

      const users = await storage.getUsers(tenantId, managerId);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const tenantId = req.tenantId;
      const userData = insertUserSchema.parse({ ...req.body, tenantId });
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username || '', tenantId);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.patch("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const tenantId = req.tenantId;
      const userId = parseInt(req.params.id);
      const updates = req.body;

      // If updating username, check for duplicates
      if (updates.username) {
        const existingUser = await storage.getUserByUsername(updates.username, tenantId);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ error: "Username already exists" });
        }
      }

      const user = await storage.updateUser(userId, updates, tenantId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const tenantId = req.tenantId;
      const userId = parseInt(req.params.id);
      
      const success = await storage.deleteUser(userId, tenantId);
      if (!success) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.get("/api/roles", async (req: Request, res: Response) => {
    try {
      const tenantId = req.tenantId;
      const roles = await storage.getRoles(tenantId);
      res.json(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ error: "Failed to fetch roles" });
    }
  });

  // Simple login endpoint for testing RBAC
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username } = req.body;
      const user = await storage.getUserByUsername(username, req.tenantId);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // In a real app, you'd verify password here
      // For testing, we'll just set the session
      req.session.userId = user.id;
      req.session.tenantId = req.tenantId;
      
      res.json({ 
        user: {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Get current user endpoint - return mock user for development
  app.get("/api/users/current", async (req: Request, res: Response) => {
    try {
      // Always return a valid mock user for development
      const user = {
        id: 1,
        username: "admin",
        email: "admin@example.com",
        firstName: "Alex",
        lastName: "Morgan", 
        roleId: 1,
        department: "sales",
        tenantId: req.tenantId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        managerId: null,
        phone: null,
        lastLoginAt: null,
        currentWorkspaceId: 2,
        currentProjectId: 3,
        role: {
          id: 1,
          name: "Sales Manager",
          level: 3
        }
      };

      res.json(user);
    } catch (error) {
      console.error("Error fetching current user:", error);
      res.status(500).json({ error: "Failed to fetch current user" });
    }
  });

  // Admin endpoint to seed test data
  app.post("/api/admin/seed", async (req: Request, res: Response) => {
    try {
      await seedSampleData();
      res.json({ message: "Database seeded successfully with test data" });
    } catch (error) {
      console.error("Error seeding database:", error);
      res.status(500).json({ error: "Failed to seed database" });
    }
  });

  app.post("/api/admin/quick-seed", async (req: Request, res: Response) => {
    try {
      const { quickSeed } = await import('./quick-seed');
      await quickSeed();
      res.json({ message: "Database quick-seeded successfully" });
    } catch (error) {
      console.error("Error quick-seeding database:", error);
      res.status(500).json({ error: "Failed to quick-seed database" });
    }
  });

  // Activity Types routes
  app.get("/api/activity-types", async (req, res) => {
    try {
      const activityTypes = await storage.getActivityTypes(req.tenantId);
      res.json(activityTypes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activity types" });
    }
  });

  app.post("/api/activity-types", async (req, res) => {
    try {
      const validatedData = insertActivityTypeSchema.parse({
        ...req.body,
        tenantId: req.tenantId,
      });
      const activityType = await storage.createActivityType(validatedData);
      res.status(201).json(activityType);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create activity type" });
    }
  });

  app.patch("/api/activity-types/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertActivityTypeSchema.partial().parse(req.body);
      const activityType = await storage.updateActivityType(id, validatedData, req.tenantId);
      if (!activityType) {
        return res.status(404).json({ error: "Activity type not found" });
      }
      res.json(activityType);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update activity type" });
    }
  });

  app.delete("/api/activity-types/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteActivityType(id, req.tenantId);
      if (!success) {
        return res.status(404).json({ error: "Activity type not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete activity type" });
    }
  });

  // Sales Pipelines routes
  app.get("/api/sales-pipelines", async (req, res) => {
    try {
      const pipelines = await storage.getSalesPipelines(req.tenantId);
      res.json(pipelines);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales pipelines" });
    }
  });

  app.post("/api/sales-pipelines", async (req, res) => {
    try {
      const { pipeline, stages } = req.body;
      
      // Create the pipeline first
      const validatedPipeline = insertSalesPipelineSchema.parse({
        ...pipeline,
        tenantId: req.tenantId,
      });
      
      const newPipeline = await storage.createSalesPipeline(validatedPipeline);
      
      // Create stages for the pipeline
      if (stages && stages.length > 0) {
        for (const stage of stages) {
          const validatedStage = insertSalesStageSchema.parse({
            ...stage,
            salePipelineId: newPipeline.id,
            tenantId: req.tenantId,
          });
          await storage.createSalesStage(validatedStage);
        }
      }
      
      // Return the complete pipeline with stages
      const completePipeline = await storage.getSalesPipeline(newPipeline.id, req.tenantId);
      res.status(201).json(completePipeline);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create sales pipeline" });
    }
  });

  app.patch("/api/sales-pipelines/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { pipeline, stages } = req.body;
      
      // Update the pipeline
      const validatedPipeline = insertSalesPipelineSchema.partial().parse(pipeline);
      const updatedPipeline = await storage.updateSalesPipeline(id, validatedPipeline, req.tenantId);
      
      if (!updatedPipeline) {
        return res.status(404).json({ error: "Sales pipeline not found" });
      }
      
      // Update stages if provided
      if (stages) {
        // Delete existing stages
        const existingStages = await storage.getSalesStages(req.tenantId, id);
        for (const stage of existingStages) {
          await storage.deleteSalesStage(stage.id, req.tenantId);
        }
        
        // Create new stages
        for (const stage of stages) {
          const validatedStage = insertSalesStageSchema.parse({
            ...stage,
            salePipelineId: id,
            tenantId: req.tenantId,
          });
          await storage.createSalesStage(validatedStage);
        }
      }
      
      const completePipeline = await storage.getSalesPipeline(id, req.tenantId);
      res.json(completePipeline);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update sales pipeline" });
    }
  });

  app.delete("/api/sales-pipelines/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSalesPipeline(id, req.tenantId);
      if (!success) {
        return res.status(404).json({ error: "Sales pipeline not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete sales pipeline" });
    }
  });

  // Sales Stages routes
  app.get("/api/sales-stages", async (req, res) => {
    try {
      const pipelineId = req.query.pipelineId ? parseInt(req.query.pipelineId as string) : undefined;
      const stages = await storage.getSalesStages(req.tenantId, pipelineId);
      res.json(stages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales stages" });
    }
  });

  // Interest Levels routes
  app.get("/api/interest-levels", async (req, res) => {
    try {
      const interestLevels = await storage.getInterestLevels(req.tenantId);
      res.json(interestLevels);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch interest levels" });
    }
  });

  app.post("/api/interest-levels", async (req, res) => {
    try {
      const validatedData = insertInterestLevelSchema.parse({
        ...req.body,
        tenantId: req.tenantId,
      });
      const interestLevel = await storage.createInterestLevel(validatedData);
      res.status(201).json(interestLevel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create interest level" });
    }
  });

  app.patch("/api/interest-levels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertInterestLevelSchema.partial().parse(req.body);
      const interestLevel = await storage.updateInterestLevel(id, validatedData, req.tenantId);
      if (!interestLevel) {
        return res.status(404).json({ error: "Interest level not found" });
      }
      res.json(interestLevel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update interest level" });
    }
  });

  app.delete("/api/interest-levels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteInterestLevel(id, req.tenantId);
      if (!success) {
        return res.status(404).json({ error: "Interest level not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete interest level" });
    }
  });

  // Export endpoints
  app.get("/api/export/:type", enforceDataAccess, async (req: Request, res: Response) => {
    try {
      const { type } = req.params;
      let data;

      switch (type) {
        case 'leads':
          data = await storage.getLeads(req.tenantId);
          break;
        case 'contacts':
          data = await storage.getContacts(req.tenantId);
          break;
        case 'companies':
          data = await storage.getCompanies(req.tenantId);
          break;
        case 'deals':
          data = await storage.getDeals(req.tenantId);
          break;
        default:
          return res.status(400).json({ error: "Invalid export type" });
      }

      res.json(data);
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ error: "Export failed" });
    }
  });

  // Import endpoint
  app.post("/api/import", enforceDataAccess, async (req: Request, res: Response) => {
    try {
      const multer = await import('multer');
      const upload = multer.default({ storage: multer.memoryStorage() });
      
      upload.single('file')(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ error: "File upload failed" });
        }

        const file = req.file;
        const { type } = req.body;

        if (!file) {
          return res.status(400).json({ error: "No file provided" });
        }

        if (file.mimetype !== 'text/csv') {
          return res.status(400).json({ error: "File must be CSV format" });
        }

        const csvData = file.buffer.toString('utf-8');
        const result = await processCSVImport(csvData, type, req.tenantId, storage);
        
        res.json(result);
      });
    } catch (error) {
      console.error("Import error:", error);
      res.status(500).json({ error: "Import failed" });
    }
  });

// CSV Import processing function
async function processCSVImport(csvData: string, type: string, tenantId: number, storage: any) {
  const lines = csvData.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    return { success: false, imported: 0, errors: ['CSV file must have at least a header and one data row'], duplicates: 0 };
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const dataLines = lines.slice(1);
  
  let imported = 0;
  let duplicates = 0;
  const errors: string[] = [];

  for (let i = 0; i < dataLines.length; i++) {
    try {
      const values = parseCSVLine(dataLines[i]);
      if (values.length !== headers.length) {
        errors.push(`Row ${i + 2}: Column count mismatch`);
        continue;
      }

      const rowData: any = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index] || null;
      });

      // Add tenant ID
      rowData.tenantId = tenantId;

      let created = false;
      switch (type) {
        case 'leads':
          if (rowData.email) {
            // Check for duplicates
            const existing = await storage.getLeads(tenantId);
            const isDuplicate = existing.some((lead: any) => lead.email === rowData.email);
            if (isDuplicate) {
              duplicates++;
            } else {
              await storage.createLead({
                firstName: rowData.firstName || '',
                lastName: rowData.lastName || '',
                email: rowData.email,
                phone: rowData.phone,
                company: rowData.company,
                jobTitle: rowData.jobTitle,
                source: rowData.source || 'Import',
                status: rowData.status || 'new',
                notes: rowData.notes,
                tenantId,
                score: 0
              });
              created = true;
            }
          }
          break;

        case 'contacts':
          if (rowData.email) {
            const existing = await storage.getContacts(tenantId);
            const isDuplicate = existing.some((contact: any) => contact.email === rowData.email);
            if (isDuplicate) {
              duplicates++;
            } else {
              await storage.createContact({
                firstName: rowData.firstName || '',
                lastName: rowData.lastName || '',
                email: rowData.email,
                phone: rowData.phone,
                jobTitle: rowData.jobTitle,
                tenantId
              });
              created = true;
            }
          }
          break;

        case 'companies':
          if (rowData.name) {
            const existing = await storage.getCompanies(tenantId);
            const isDuplicate = existing.some((company: any) => company.name === rowData.name);
            if (isDuplicate) {
              duplicates++;
            } else {
              await storage.createCompany({
                name: rowData.name,
                industry: rowData.industry,
                website: rowData.website,
                phone: rowData.phone,
                address: rowData.address,
                tenantId
              });
              created = true;
            }
          }
          break;

        case 'deals':
          if (rowData.title) {
            const existing = await storage.getDeals(tenantId);
            const isDuplicate = existing.some((deal: any) => deal.title === rowData.title);
            if (isDuplicate) {
              duplicates++;
            } else {
              // Get first deal stage for new deals
              const stages = await storage.getDealStages(tenantId);
              const firstStage = stages[0];
              
              await storage.createDeal({
                title: rowData.title,
                value: parseFloat(rowData.value) || 0,
                stageId: firstStage?.id || 1,
                expectedCloseDate: rowData.expectedCloseDate ? new Date(rowData.expectedCloseDate) : null,
                notes: rowData.notes,
                tenantId
              });
              created = true;
            }
          }
          break;
      }

      if (created) {
        imported++;
      }
    } catch (error) {
      errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Processing error'}`);
    }
  }

  return {
    success: errors.length === 0,
    imported,
    errors,
    duplicates
  };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

  const httpServer = createServer(app);
  return httpServer;
}

// Extend Express Request interface to include tenantId
declare global {
  namespace Express {
    interface Request {
      tenantId: number;
    }
  }
}
