import { Router } from 'express';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db';
import { 
  assistants, 
  assistantConversations, 
  assistantMessages, 
  assistantDocuments,
  assistantProspects,
  insertAssistantSchema,
  insertAssistantConversationSchema,
  insertAssistantMessageSchema,
  insertAssistantDocumentSchema,
  insertAssistantProspectSchema,
  type Assistant,
  type AssistantConversation,
  type AssistantMessage
} from '@shared/schema';

const router = Router();

// Get all assistants for a tenant
router.get('/', async (req, res) => {
  try {
    const tenantId = parseInt(req.headers['x-tenant-id'] as string || '1');
    
    const results = await db
      .select()
      .from(assistants)
      .where(eq(assistants.tenantId, tenantId))
      .orderBy(desc(assistants.createdAt));

    res.json(results);
  } catch (error) {
    console.error('Error fetching assistants:', error);
    res.status(500).json({ error: 'Failed to fetch assistants' });
  }
});

// Get a specific assistant
router.get('/:id', async (req, res) => {
  try {
    const tenantId = parseInt(req.headers['x-tenant-id'] as string || '1');
    const assistantId = parseInt(req.params.id);

    const [assistant] = await db
      .select()
      .from(assistants)
      .where(and(
        eq(assistants.id, assistantId),
        eq(assistants.tenantId, tenantId)
      ));

    if (!assistant) {
      return res.status(404).json({ error: 'Assistant not found' });
    }

    res.json(assistant);
  } catch (error) {
    console.error('Error fetching assistant:', error);
    res.status(500).json({ error: 'Failed to fetch assistant' });
  }
});

// Create a new assistant
router.post('/', async (req, res) => {
  try {
    const tenantId = parseInt(req.headers['x-tenant-id'] as string || '1');
    
    const validatedData = insertAssistantSchema.parse({
      ...req.body,
      tenantId
    });

    const [newAssistant] = await db
      .insert(assistants)
      .values(validatedData)
      .returning();

    res.status(201).json(newAssistant);
  } catch (error) {
    console.error('Error creating assistant:', error);
    res.status(500).json({ error: 'Failed to create assistant' });
  }
});

// Update an assistant
router.put('/:id', async (req, res) => {
  try {
    const tenantId = parseInt(req.headers['x-tenant-id'] as string || '1');
    const assistantId = parseInt(req.params.id);

    const validatedData = insertAssistantSchema.partial().parse(req.body);

    const [updatedAssistant] = await db
      .update(assistants)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(and(
        eq(assistants.id, assistantId),
        eq(assistants.tenantId, tenantId)
      ))
      .returning();

    if (!updatedAssistant) {
      return res.status(404).json({ error: 'Assistant not found' });
    }

    res.json(updatedAssistant);
  } catch (error) {
    console.error('Error updating assistant:', error);
    res.status(500).json({ error: 'Failed to update assistant' });
  }
});

// Delete an assistant
router.delete('/:id', async (req, res) => {
  try {
    const tenantId = parseInt(req.headers['x-tenant-id'] as string || '1');
    const assistantId = parseInt(req.params.id);

    const [deletedAssistant] = await db
      .delete(assistants)
      .where(and(
        eq(assistants.id, assistantId),
        eq(assistants.tenantId, tenantId)
      ))
      .returning();

    if (!deletedAssistant) {
      return res.status(404).json({ error: 'Assistant not found' });
    }

    res.json({ message: 'Assistant deleted successfully' });
  } catch (error) {
    console.error('Error deleting assistant:', error);
    res.status(500).json({ error: 'Failed to delete assistant' });
  }
});

// Get conversations for an assistant
router.get('/:id/conversations', async (req, res) => {
  try {
    const tenantId = parseInt(req.headers['x-tenant-id'] as string || '1');
    const assistantId = parseInt(req.params.id);

    const conversations = await db
      .select()
      .from(assistantConversations)
      .where(and(
        eq(assistantConversations.assistantId, assistantId),
        eq(assistantConversations.tenantId, tenantId)
      ))
      .orderBy(desc(assistantConversations.updatedAt));

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Create a new conversation
router.post('/:id/conversations', async (req, res) => {
  try {
    const tenantId = parseInt(req.headers['x-tenant-id'] as string || '1');
    const assistantId = parseInt(req.params.id);

    const validatedData = insertAssistantConversationSchema.parse({
      ...req.body,
      assistantId,
      tenantId
    });

    const [newConversation] = await db
      .insert(assistantConversations)
      .values(validatedData)
      .returning();

    res.status(201).json(newConversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const tenantId = parseInt(req.headers['x-tenant-id'] as string || '1');
    const conversationId = parseInt(req.params.conversationId);

    const messages = await db
      .select()
      .from(assistantMessages)
      .where(and(
        eq(assistantMessages.conversationId, conversationId),
        eq(assistantMessages.tenantId, tenantId)
      ))
      .orderBy(assistantMessages.createdAt);

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Add a message to a conversation
router.post('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const tenantId = parseInt(req.headers['x-tenant-id'] as string || '1');
    const conversationId = parseInt(req.params.conversationId);

    const validatedData = insertAssistantMessageSchema.parse({
      ...req.body,
      conversationId,
      tenantId
    });

    const [newMessage] = await db
      .insert(assistantMessages)
      .values(validatedData)
      .returning();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

export default router;