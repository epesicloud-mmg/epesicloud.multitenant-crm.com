import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { 
  insertAgentConversationSchema,
  insertAgentMessageSchema,
  type AgentConversation,
  type AgentMessage 
} from "@shared/schema";

export const aiConversationsRouter = Router();

// Get user's conversations
aiConversationsRouter.get("/", async (req, res) => {
  try {
    const userId = parseInt(req.headers['x-user-id'] as string);
    const tenantId = parseInt(req.headers['x-tenant-id'] as string);

    if (!userId || !tenantId) {
      return res.status(401).json({ error: "User ID and Tenant ID are required" });
    }

    const conversations = await storage.getUserConversations(userId, tenantId);
    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// Get specific conversation with messages
aiConversationsRouter.get("/:id", async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id);
    const userId = parseInt(req.headers['x-user-id'] as string);
    const tenantId = parseInt(req.headers['x-tenant-id'] as string);

    if (!userId || !tenantId) {
      return res.status(401).json({ error: "User ID and Tenant ID are required" });
    }

    const conversation = await storage.getConversation(conversationId, userId, tenantId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const messages = await storage.getConversationMessages(conversationId, userId, tenantId);
    
    res.json({
      ...conversation,
      messages
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
});

// Create new conversation
aiConversationsRouter.post("/", async (req, res) => {
  try {
    const userId = parseInt(req.headers['x-user-id'] as string);
    const tenantId = parseInt(req.headers['x-tenant-id'] as string);

    if (!userId || !tenantId) {
      return res.status(401).json({ error: "User ID and Tenant ID are required" });
    }

    const conversationData = {
      ...req.body,
      userId,
      tenantId
    };

    const validatedData = insertAgentConversationSchema.parse(conversationData);
    const conversation = await storage.createConversation(validatedData);
    
    res.status(201).json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// Add message to conversation
aiConversationsRouter.post("/:id/messages", async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id);
    const userId = parseInt(req.headers['x-user-id'] as string);
    const tenantId = parseInt(req.headers['x-tenant-id'] as string);

    if (!userId || !tenantId) {
      return res.status(401).json({ error: "User ID and Tenant ID are required" });
    }

    // Verify user owns this conversation
    const conversation = await storage.getConversation(conversationId, userId, tenantId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const messageData = {
      ...req.body,
      conversationId,
      userId,
      tenantId
    };

    const validatedMessage = insertAgentMessageSchema.parse(messageData);
    const message = await storage.addMessage(validatedMessage);
    
    // Update conversation's updatedAt timestamp
    await storage.updateConversation(conversationId, {}, userId, tenantId);
    
    res.status(201).json(message);
  } catch (error) {
    console.error("Error adding message:", error);
    res.status(500).json({ error: "Failed to add message" });
  }
});

// Update conversation (e.g., title, active status)
aiConversationsRouter.patch("/:id", async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id);
    const userId = parseInt(req.headers['x-user-id'] as string);
    const tenantId = parseInt(req.headers['x-tenant-id'] as string);

    if (!userId || !tenantId) {
      return res.status(401).json({ error: "User ID and Tenant ID are required" });
    }

    const updatedConversation = await storage.updateConversation(
      conversationId,
      req.body,
      userId,
      tenantId
    );

    if (!updatedConversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.json(updatedConversation);
  } catch (error) {
    console.error("Error updating conversation:", error);
    res.status(500).json({ error: "Failed to update conversation" });
  }
});

// Delete conversation
aiConversationsRouter.delete("/:id", async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id);
    const userId = parseInt(req.headers['x-user-id'] as string);
    const tenantId = parseInt(req.headers['x-tenant-id'] as string);

    if (!userId || !tenantId) {
      return res.status(401).json({ error: "User ID and Tenant ID are required" });
    }

    const deleted = await storage.deleteConversation(conversationId, userId, tenantId);
    
    if (!deleted) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

// Delete message
aiConversationsRouter.delete("/:conversationId/messages/:messageId", async (req, res) => {
  try {
    const messageId = parseInt(req.params.messageId);
    const userId = parseInt(req.headers['x-user-id'] as string);
    const tenantId = parseInt(req.headers['x-tenant-id'] as string);

    if (!userId || !tenantId) {
      return res.status(401).json({ error: "User ID and Tenant ID are required" });
    }

    const deleted = await storage.deleteMessage(messageId, userId, tenantId);
    
    if (!deleted) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
});