import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { MessageSquare, X, Sparkles, Send, Loader2, Bot, User, Plus, Trash2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EventTracker } from "@/lib/event-tracker";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAIConversations, useAIConversation } from "@/hooks/useAIConversations";
import type { AgentMessage } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";

interface PageContext {
  pageName: string;
  description: string;
  suggestions: string[];
  recentActions: string[];
}

const getPageContext = (pathname: string): PageContext => {
  const contexts: Record<string, PageContext> = {
    '/': {
      pageName: 'AI Dashboard',
      description: 'Your main CRM overview with AI insights',
      suggestions: [
        'Show me today\'s top priorities',
        'What deals need attention?',
        'Generate a sales forecast',
        'Analyze pipeline performance'
      ],
      recentActions: ['Viewed dashboard metrics', 'Generated AI insights']
    },
    '/deals': {
      pageName: 'Deals Management',
      description: 'Manage your sales pipeline and deals',
      suggestions: [
        'Create a new deal',
        'Find deals in closing stage',
        'Show deal analytics',
        'Update deal probabilities'
      ],
      recentActions: ['Viewed deals list', 'Filtered by stage']
    },
    '/contacts': {
      pageName: 'Contacts Management',
      description: 'Manage customer and prospect relationships',
      suggestions: [
        'Add a new contact',
        'Find contacts by company',
        'Show contact activity',
        'Export contact list'
      ],
      recentActions: ['Viewed contacts', 'Searched contacts']
    },
    '/pipelines': {
      pageName: 'Pipeline Kanban',
      description: 'Visual pipeline management with drag-and-drop',
      suggestions: [
        'Move deals through stages',
        'Analyze pipeline health',
        'Find bottlenecks',
        'Update deal priorities'
      ],
      recentActions: ['Viewed pipeline', 'Moved deals between stages']
    }
  };

  return contexts[pathname] || {
    pageName: 'CRM Platform',
    description: 'Your comprehensive CRM solution',
    suggestions: [
      'What can I help you with?',
      'Show me recent activity',
      'Generate insights',
      'Navigate to a specific section'
    ],
    recentActions: []
  };
};

export function EnhancedFloatingAIOrb() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const { toast } = useToast();

  const pageContext = getPageContext(location);

  // Use database-backed conversations
  const {
    conversations,
    conversationsLoading,
    createConversation,
    deleteConversation,
    updateConversation
  } = useAIConversations();

  const {
    conversation,
    messages,
    conversationLoading,
    addMessage
  } = useAIConversation(currentConversationId);

  // Set default conversation when conversations load
  useEffect(() => {
    if (conversations.length > 0 && !currentConversationId) {
      setCurrentConversationId(conversations[0].id);
    }
  }, [conversations, currentConversationId]);

  // AI response mutation with context awareness
  const sendAIMessage = useMutation({
    mutationFn: async (userMessage: string) => {
      if (!currentConversationId) throw new Error('No conversation selected');

      // Add user message
      await addMessage.mutateAsync({
        conversationId: currentConversationId,
        data: {
          role: 'user',
          content: userMessage
        }
      });

      // Generate contextual AI response
      const response = await apiRequest('/api/chat/completions', {
        method: 'POST',
        body: JSON.stringify({
          message: userMessage,
          context: {
            page: location,
            pageName: pageContext.pageName,
            description: pageContext.description,
            recentActions: pageContext.recentActions,
            suggestions: pageContext.suggestions
          },
          conversationId: currentConversationId
        })
      });

      // Add AI response
      await addMessage.mutateAsync({
        conversationId: currentConversationId,
        data: {
          role: 'assistant',
          content: response.response
        }
      });

      return response;
    },
    onSuccess: () => {
      EventTracker.track({
        eventName: 'ai_conversation.message_sent',
        properties: {
          page: location,
          conversationId: currentConversationId,
          timestamp: new Date().toISOString()
        }
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const messageContent = input;
    setInput('');
    
    // Create conversation if needed
    if (!currentConversationId) {
      try {
        setIsCreatingConversation(true);
        const newConv = await createConversation.mutateAsync({
          title: messageContent.length > 50 ? 
            messageContent.substring(0, 50) + '...' : 
            messageContent,
          isActive: true
        });
        setCurrentConversationId(newConv.id);
        
        // Wait for conversation to be set before sending message
        setTimeout(() => {
          sendAIMessage.mutate(messageContent);
        }, 100);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create conversation",
          variant: "destructive"
        });
      } finally {
        setIsCreatingConversation(false);
      }
    } else {
      sendAIMessage.mutate(messageContent);
    }
  };

  const handleNewConversation = async () => {
    try {
      const newConv = await createConversation.mutateAsync({
        title: `New conversation ${new Date().toLocaleTimeString()}`,
        isActive: true
      });
      setCurrentConversationId(newConv.id);
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to create new conversation",
        variant: "destructive"
      });
    }
  };

  const handleDeleteConversation = async (id: number) => {
    if (conversations.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one conversation",
        variant: "destructive"
      });
      return;
    }

    try {
      await deleteConversation.mutateAsync(id);
      if (currentConversationId === id) {
        const remaining = conversations.filter(c => c.id !== id);
        setCurrentConversationId(remaining[0]?.id || null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive"
      });
    }
  };

  const renderMessage = (message: AgentMessage) => (
    <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {message.role === 'assistant' && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      <div className={`max-w-[80%] rounded-lg p-3 ${
        message.role === 'user' 
          ? 'bg-blue-500 text-white ml-auto' 
          : 'bg-gray-100 dark:bg-gray-800'
      }`}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <span className="text-xs opacity-70 mt-1 block">
          {new Date(message.createdAt).toLocaleTimeString()}
        </span>
      </div>
      {message.role === 'user' && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarFallback className="bg-blue-500 text-white">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );

  return (
    <>
      {/* Floating AI Orb Button */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 z-50"
            onClick={() => {
              EventTracker.track({
                eventName: 'ai_orb.opened',
                properties: { page: location, timestamp: new Date().toISOString() }
              });
            }}
          >
            <Sparkles className="h-6 w-6 text-white" />
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="w-96 p-0">
          <SheetHeader className="p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-purple-600" />
                  Ask Epesi Agent
                </SheetTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  AI-powered CRM assistant with memory
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNewConversation}
                  disabled={createConversation.isPending}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SheetHeader>

          {/* Conversation Selector */}
          <div className="p-4 border-b bg-gray-50 dark:bg-gray-900">
            <Select 
              value={currentConversationId?.toString()} 
              onValueChange={(value) => setCurrentConversationId(parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select conversation" />
              </SelectTrigger>
              <SelectContent>
                {conversations.map((conv) => (
                  <SelectItem key={conv.id} value={conv.id.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{conv.title}</span>
                      {conversations.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conv.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Page Context */}
          <div className="p-4 border-b">
            <Badge variant="secondary" className="mb-2">
              Current Page: {pageContext.pageName}
            </Badge>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {pageContext.description}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {pageContext.suggestions.slice(0, 2).map((suggestion, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6"
                  onClick={() => setInput(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4 h-96">
            {conversationLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">Start a conversation with Epesi Agent</p>
                <p className="text-xs text-gray-400 mt-1">
                  I have context about your current page and can help with CRM tasks
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map(renderMessage)}
                {sendAIMessage.isPending && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your CRM..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={sendAIMessage.isPending || isCreatingConversation}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || sendAIMessage.isPending || isCreatingConversation}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {sendAIMessage.isPending || isCreatingConversation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}