import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { MessageSquare, X, Sparkles, Send, Loader2, Bot, User, Plus, Trash2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { EventTracker } from "@/lib/event-tracker";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { EventLog, ChatConversation, ChatMessage } from "@shared/schema";
import { MarkdownRenderer } from "@/lib/markdown-formatter";
import { apiRequest, queryClient } from "@/lib/queryClient";

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
        'Find warm leads',
        'Schedule follow-ups',
        'Export contact list'
      ],
      recentActions: ['Viewed contacts', 'Added new contact']
    },
    '/companies': {
      pageName: 'Companies',
      description: 'Manage organizational accounts',
      suggestions: [
        'Add new company',
        'Show company insights',
        'Find decision makers',
        'Track company interactions'
      ],
      recentActions: ['Viewed companies', 'Updated company profile']
    },
    '/pipelines': {
      pageName: 'Pipeline View',
      description: 'Visual Kanban pipeline management',
      suggestions: [
        'Move deals between stages',
        'Analyze stage conversion',
        'Set up pipeline alerts',
        'Customize stage workflow'
      ],
      recentActions: ['Viewed pipeline', 'Moved deal to next stage']
    }
  };
  return contexts[pathname] || contexts['/'];
};

export function MultiChatFloatingAIOrb() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [showConversationList, setShowConversationList] = useState(false);
  const [recentEvents, setRecentEvents] = useState<EventLog[]>([]);
  const [location] = useLocation();
  const { toast } = useToast();

  const pageContext = getPageContext(location);

  // Query for user conversations
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['/api/chat/conversations'],
    enabled: isOpen,
  });

  // Query for messages in current conversation
  const { data: conversationMessages, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/chat/conversations', currentConversationId, 'messages'],
    enabled: !!currentConversationId,
  });

  // Query for recent events
  const { data: eventLogs } = useQuery({
    queryKey: ['/api/event-logs/recent'],
    enabled: isOpen,
  });

  useEffect(() => {
    if (eventLogs) {
      setRecentEvents(eventLogs as EventLog[]);
    }
  }, [eventLogs]);

  useEffect(() => {
    if (conversationMessages && Array.isArray(conversationMessages)) {
      console.log("Loading conversation messages:", conversationMessages);
      setMessages(conversationMessages as ChatMessage[]);
    }
  }, [conversationMessages]);

  // Create new conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async (): Promise<ChatConversation> => {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': '1'
        },
        body: JSON.stringify({
          title: `${pageContext.pageName} Chat - ${new Date().toLocaleDateString()}`
        })
      });
      if (!response.ok) throw new Error('Failed to create conversation');
      return response.json();
    },
    onSuccess: (newConversation: ChatConversation) => {
      setCurrentConversationId(newConversation.id);
      setMessages([]);
      setShowConversationList(false);
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
    },
    onError: (error) => {
      console.error("Failed to create conversation:", error);
      toast({
        title: "Error",
        description: "Failed to create new conversation.",
        variant: "destructive",
      });
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      if (!currentConversationId) {
        throw new Error("No active conversation");
      }

      // Add user message
      const userResponse = await fetch(`/api/chat/conversations/${currentConversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': '1'
        },
        body: JSON.stringify({
          content: userMessage,
          role: 'user',
          context: {
            page: location,
            pageName: pageContext.pageName,
            recentEvents: recentEvents.slice(0, 5),
            timestamp: new Date().toISOString()
          }
        })
      });
      
      if (!userResponse.ok) throw new Error('Failed to send user message');
      const userMsg = await userResponse.json();

      // Generate AI response using real AI service
      const aiResponseFetch = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': '1'
        },
        body: JSON.stringify({
          message: userMessage,
          conversationId: currentConversationId,
          context: {
            page: location,
            pageName: pageContext.pageName,
            recentEvents: recentEvents.slice(0, 5),
            timestamp: new Date().toISOString()
          }
        })
      });
      
      if (!aiResponseFetch.ok) throw new Error('Failed to get AI response');
      const aiResponseData = await aiResponseFetch.json();

      return { userMsg, aiMsg: aiResponseData };
    },
    onSuccess: () => {
      setInput("");
      setIsTyping(false);
      queryClient.invalidateQueries({ 
        queryKey: ['/api/chat/conversations', currentConversationId, 'messages'] 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
      
      EventTracker.track({
        eventName: 'ai_orb.message_sent',
        properties: {
          conversationId: currentConversationId,
          page: location,
          pageName: pageContext.pageName
        }
      });
    },
    onError: (error) => {
      console.error("Failed to send message:", error);
      setIsTyping(false);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete conversation mutation
  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: number) => {
      const response = await fetch(`/api/chat/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'X-Tenant-Id': '1'
        }
      });
      if (!response.ok) throw new Error('Failed to delete conversation');
    },
    onSuccess: (_, deletedId) => {
      if (currentConversationId === deletedId) {
        setCurrentConversationId(null);
        setMessages([]);
      }
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
      toast({
        title: "Chat Deleted",
        description: "Conversation removed successfully.",
      });
    },
    onError: (error) => {
      console.error("Failed to delete conversation:", error);
      toast({
        title: "Error",
        description: "Failed to delete conversation.",
        variant: "destructive",
      });
    }
  });

  const generateContextualResponse = (userMessage: string, context: PageContext, events: EventLog[] = []): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    const recentEventsContext = events.length > 0 ? 
      `**Recent Activity Context:**\n${events.slice(0, 3).map(e => `• ${e.description}`).join('\n')}\n\n` : '';

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return `${recentEventsContext}Hello! I'm Epesi Agent, your AI-powered CRM assistant. 

I can see you're currently on the **${context.pageName}** page. Here's how I can help:

${context.suggestions.slice(0, 3).map(s => `• ${s}`).join('\n')}

What would you like me to help you with today?`;
    }

    if (lowerMessage.includes('recent') || lowerMessage.includes('activity') || lowerMessage.includes('latest')) {
      return `${recentEventsContext}Here's your recent CRM activity:

**Recent Actions on ${context.pageName}:**
${context.recentActions.map(action => `• ${action}`).join('\n')}

**Key Insights:**
• Active deals requiring attention
• Recent contact interactions
• Upcoming follow-ups
• New opportunities to review

Would you like me to provide more details on any of these areas?`;
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return `I'm your AI-powered CRM assistant! Here's what I can help you with:

**${context.pageName} Actions:**
${context.suggestions.map(s => `• ${s}`).join('\n')}

**General Capabilities:**
• Generate sales insights and forecasts
• Analyze pipeline performance  
• Track customer interactions
• Provide actionable recommendations
• Answer questions about your CRM data

Feel free to ask me anything about your CRM or request specific actions!`;
    }

    return `Based on your question about "${userMessage}", here's what I can tell you:

${recentEventsContext}I understand you're working on the **${context.pageName}** page. While I'm processing your request with AI intelligence, here are some relevant suggestions:

${context.suggestions.slice(0, 2).map(s => `• ${s}`).join('\n')}

I'm continuously learning from your CRM data to provide better insights. Is there a specific aspect you'd like me to focus on?`;
  };

  const handleSendMessage = () => {
    if (input.trim() && currentConversationId) {
      setIsTyping(true);
      sendMessageMutation.mutate(input.trim());
    } else if (input.trim() && !currentConversationId) {
      // Create new conversation first
      createConversationMutation.mutate();
    }
  };

  const handleNewChat = () => {
    createConversationMutation.mutate();
  };

  const selectConversation = (conversation: ChatConversation) => {
    setCurrentConversationId(conversation.id);
    setShowConversationList(false);
    EventTracker.track({
      eventName: 'ai_orb.conversation_selected',
      properties: {
        conversationId: conversation.id,
        page: location
      }
    });
  };

  // Auto-create conversation if none exists and select the first one
  useEffect(() => {
    const conversationList = conversations as ChatConversation[] || [];
    console.log("Auto-select conversation effect:", { 
      isOpen, 
      conversationCount: conversationList.length, 
      currentConversationId,
      firstConversation: conversationList[0]?.id 
    });
    
    if (isOpen && conversationList.length === 0 && !currentConversationId) {
      console.log("Creating new conversation - no existing ones");
      createConversationMutation.mutate();
    } else if (isOpen && conversationList.length > 0 && !currentConversationId) {
      console.log("Selecting first conversation:", conversationList[0].id);
      setCurrentConversationId(conversationList[0].id);
    }
  }, [isOpen, conversations, currentConversationId]);

  const conversationList = (conversations as ChatConversation[]) || [];
  const currentConversation = conversationList.find((c: ChatConversation) => c.id === currentConversationId);

  return (
    <>
      {/* Floating AI Orb Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 group"
              onClick={() => {
                setIsOpen(true);
                EventTracker.track({
                  eventName: 'ai_orb.opened',
                  properties: {
                    page: location,
                    pageName: pageContext.pageName
                  }
                });
              }}
            >
              <Sparkles className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-[500px] p-0 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
            <div className="flex flex-col h-full">
              {/* Header */}
              <SheetHeader className="p-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Sparkles className="h-6 w-6" />
                    <SheetTitle className="text-white text-lg font-semibold">
                      Ask Epesi Agent
                    </SheetTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                      onClick={() => setShowConversationList(!showConversationList)}
                    >
                      <History className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                      onClick={handleNewChat}
                      disabled={createConversationMutation.isPending}
                    >
                      {createConversationMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="mt-2 text-sm text-white/90">
                  Currently on: <Badge variant="secondary" className="ml-1">{pageContext.pageName}</Badge>
                </div>
              </SheetHeader>

              {/* Conversation List */}
              {showConversationList && (
                <div className="p-4 border-b bg-slate-50 dark:bg-slate-800">
                  <h4 className="font-medium mb-3 text-sm text-slate-600 dark:text-slate-300">Recent Chats</h4>
                  <ScrollArea className="max-h-40">
                    <div className="space-y-2">
                      {conversationsLoading ? (
                        <div className="text-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        </div>
                      ) : conversationList.length > 0 ? (
                        conversationList.slice(0, 5).map((conversation: ChatConversation) => (
                          <div key={conversation.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                            <div
                              className="flex-1"
                              onClick={() => selectConversation(conversation)}
                            >
                              <p className="text-sm font-medium truncate">{conversation.title}</p>
                              <p className="text-xs text-slate-500">
                                {conversation.messageCount} messages • {new Date(conversation.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-slate-400 hover:text-red-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteConversationMutation.mutate(conversation.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500 text-center py-2">No conversations yet</p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Chat Messages */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    {/* Empty State */}
                    {messages.length === 0 && !messagesLoading ? (
                      <div className="text-center py-8">
                        <Bot className="h-12 w-12 mx-auto text-slate-400 mb-3" />
                        <h3 className="font-medium text-slate-700 dark:text-slate-200 mb-2">
                          Start a Conversation
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">
                          I'm here to help with your CRM tasks and questions.
                        </p>
                        <div className="space-y-2">
                          {pageContext.suggestions.slice(0, 3).map((suggestion, idx) => (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              className="w-full text-left justify-start"
                              onClick={() => setInput(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* Message List */
                      messages.map((message) => (
                        <div
                          key={`msg-${message.id}`}
                          className={`flex gap-3 ${
                            message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                          }`}
                        >
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            {message.role === 'assistant' ? (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                                <Bot className="w-4 h-4 text-white" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center">
                                <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                              </div>
                            )}
                          </div>
                          
                          {/* Message Bubble */}
                          <div
                            className={`flex-1 max-w-[75%] rounded-lg px-3 py-2 ${
                              message.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {message.role === 'assistant' ? (
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <MarkdownRenderer content={message.content || 'No content'} />
                              </div>
                            ) : (
                              <div className="text-sm whitespace-pre-wrap">
                                {message.content || 'No message'}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Input Area */}
              <div className="p-4 border-t bg-white dark:bg-slate-900">
                {currentConversation && (
                  <p className="text-xs text-slate-500 mb-2">
                    Chat: {currentConversation.title}
                  </p>
                )}
                <div className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything about your CRM..."
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || sendMessageMutation.isPending}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}