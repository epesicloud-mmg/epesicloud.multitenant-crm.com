import { Router } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../db";
import { agentConversations, agentMessages, type InsertAgentConversation, type InsertAgentMessage } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Get user's agent conversations
router.get("/", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const tenantId = parseInt(req.headers['x-tenant-id'] as string);

    if (!userId || !tenantId) {
      return res.status(400).json({ error: "User ID and Tenant ID required" });
    }

    const conversations = await db
      .select()
      .from(agentConversations)
      .where(and(
        eq(agentConversations.userId, parseInt(userId)),
        eq(agentConversations.tenantId, tenantId)
      ))
      .orderBy(desc(agentConversations.updatedAt));

    res.json(conversations);
  } catch (error) {
    console.error("Error fetching agent conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// Create new agent conversation
router.post("/", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const tenantId = parseInt(req.headers['x-tenant-id'] as string);

    if (!userId || !tenantId) {
      return res.status(400).json({ error: "User ID and Tenant ID required" });
    }

    const schema = z.object({
      title: z.string().min(1).max(255),
    });

    const data = schema.parse(req.body);

    const newConversation: InsertAgentConversation = {
      userId: parseInt(userId),
      tenantId,
      title: data.title,
      isActive: true,
    };

    const [conversation] = await db
      .insert(agentConversations)
      .values(newConversation)
      .returning();

    res.status(201).json(conversation);
  } catch (error) {
    console.error("Error creating agent conversation:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// Get messages for a specific conversation
router.get("/:conversationId/messages", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const tenantId = parseInt(req.headers['x-tenant-id'] as string);
    const conversationId = parseInt(req.params.conversationId);

    if (!userId || !tenantId) {
      return res.status(400).json({ error: "User ID and Tenant ID required" });
    }

    // Verify conversation belongs to user
    const [conversation] = await db
      .select()
      .from(agentConversations)
      .where(and(
        eq(agentConversations.id, conversationId),
        eq(agentConversations.userId, parseInt(userId)),
        eq(agentConversations.tenantId, tenantId)
      ));

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const messages = await db
      .select()
      .from(agentMessages)
      .where(and(
        eq(agentMessages.conversationId, conversationId),
        eq(agentMessages.userId, parseInt(userId)),
        eq(agentMessages.tenantId, tenantId)
      ))
      .orderBy(agentMessages.createdAt);

    res.json(messages);
  } catch (error) {
    console.error("Error fetching agent messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Add message to conversation
router.post("/:conversationId/messages", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const tenantId = parseInt(req.headers['x-tenant-id'] as string);
    const conversationId = parseInt(req.params.conversationId);

    if (!userId || !tenantId) {
      return res.status(400).json({ error: "User ID and Tenant ID required" });
    }

    const schema = z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().min(1),
    });

    const data = schema.parse(req.body);

    // Verify conversation belongs to user
    const [conversation] = await db
      .select()
      .from(agentConversations)
      .where(and(
        eq(agentConversations.id, conversationId),
        eq(agentConversations.userId, parseInt(userId)),
        eq(agentConversations.tenantId, tenantId)
      ));

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const newMessage: InsertAgentMessage = {
      conversationId,
      userId: parseInt(userId),
      tenantId,
      role: data.role,
      content: data.content,
    };

    const [message] = await db
      .insert(agentMessages)
      .values(newMessage)
      .returning();

    // Update conversation's updatedAt timestamp
    await db
      .update(agentConversations)
      .set({ updatedAt: new Date() })
      .where(eq(agentConversations.id, conversationId));

    res.status(201).json(message);
  } catch (error) {
    console.error("Error adding agent message:", error);
    res.status(500).json({ error: "Failed to add message" });
  }
});

// Update conversation (e.g., mark as inactive)
router.patch("/:conversationId", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const tenantId = parseInt(req.headers['x-tenant-id'] as string);
    const conversationId = parseInt(req.params.conversationId);

    if (!userId || !tenantId) {
      return res.status(400).json({ error: "User ID and Tenant ID required" });
    }

    const schema = z.object({
      title: z.string().min(1).max(255).optional(),
      isActive: z.boolean().optional(),
    });

    const data = schema.parse(req.body);

    // Verify conversation belongs to user
    const [existingConversation] = await db
      .select()
      .from(agentConversations)
      .where(and(
        eq(agentConversations.id, conversationId),
        eq(agentConversations.userId, parseInt(userId)),
        eq(agentConversations.tenantId, tenantId)
      ));

    if (!existingConversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const [updatedConversation] = await db
      .update(agentConversations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(agentConversations.id, conversationId))
      .returning();

    res.json(updatedConversation);
  } catch (error) {
    console.error("Error updating agent conversation:", error);
    res.status(500).json({ error: "Failed to update conversation" });
  }
});

export default router;