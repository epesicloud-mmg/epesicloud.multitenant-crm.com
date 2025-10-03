import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { AgentConversation, AgentMessage } from "@shared/schema";

interface ConversationWithMessages extends AgentConversation {
  messages?: AgentMessage[];
}

interface CreateConversationData {
  title: string;
  isActive?: boolean;
}

interface AddMessageData {
  role: "user" | "assistant";
  content: string;
}

export function useAIConversations() {
  const queryClient = useQueryClient();

  // Get user's conversations
  const {
    data: conversations,
    isLoading: conversationsLoading,
    error: conversationsError
  } = useQuery({
    queryKey: ["/api/ai-conversations"],
    queryFn: async () => {
      const response = await fetch("/api/ai-conversations", {
        headers: {
          'X-User-Id': '1',
          'X-Tenant-Id': '1'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch conversations');
      return response.json() as Promise<AgentConversation[]>;
    }
  });

  // Create new conversation
  const createConversation = useMutation({
    mutationFn: async (data: CreateConversationData) => {
      const response = await fetch("/api/ai-conversations", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': '1',
          'X-Tenant-Id': '1'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create conversation');
      return response.json() as Promise<AgentConversation>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-conversations"] });
    }
  });

  // Update conversation
  const updateConversation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateConversationData> }) => {
      const response = await fetch(`/api/ai-conversations/${id}`, {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': '1',
          'X-Tenant-Id': '1'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update conversation');
      return response.json() as Promise<AgentConversation>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-conversations"] });
    }
  });

  // Delete conversation
  const deleteConversation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/ai-conversations/${id}`, {
        method: "DELETE",
        headers: {
          'X-User-Id': '1',
          'X-Tenant-Id': '1'
        }
      });
      if (!response.ok) throw new Error('Failed to delete conversation');
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-conversations"] });
    }
  });

  return {
    conversations: conversations || [],
    conversationsLoading,
    conversationsError,
    createConversation,
    updateConversation,
    deleteConversation
  };
}

export function useAIConversation(conversationId: number | null) {
  const queryClient = useQueryClient();

  // Get conversation with messages
  const {
    data: conversation,
    isLoading: conversationLoading,
    error: conversationError
  } = useQuery({
    queryKey: ["/api/ai-conversations", conversationId],
    queryFn: async () => {
      if (!conversationId) return null;
      const response = await fetch(`/api/ai-conversations/${conversationId}`, {
        headers: {
          'X-User-Id': '1',
          'X-Tenant-Id': '1'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch conversation');
      return response.json() as Promise<ConversationWithMessages>;
    },
    enabled: !!conversationId
  });

  // Add message to conversation
  const addMessage = useMutation({
    mutationFn: async ({ conversationId, data }: { conversationId: number; data: AddMessageData }) => {
      const response = await fetch(`/api/ai-conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': '1',
          'X-Tenant-Id': '1'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to add message');
      return response.json() as Promise<AgentMessage>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-conversations", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai-conversations"] });
    }
  });

  return {
    conversation,
    conversationLoading,
    conversationError,
    addMessage,
    messages: conversation?.messages || []
  };
}