import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Bot, User, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface Conversation {
  id: number;
  title: string;
  isActive: boolean;
  createdAt: string;
}

interface MessagePanelProps {
  children?: React.ReactNode;
}

export function MessagePanel({ children }: MessagePanelProps) {
  const [open, setOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch conversations
  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/workspaces/sales-operations/conversations"],
    enabled: open,
  });

  // Get active conversation or first one
  const activeConversation = selectedConversation 
    ? conversations.find(c => c.id === selectedConversation)
    : conversations.find(c => c.isActive) || conversations[0];

  // Fetch messages for active conversation
  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/workspaces/sales-operations/conversations", activeConversation?.id, "messages"],
    enabled: open && !!activeConversation,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!activeConversation) throw new Error("No active conversation");
      
      return apiRequest("POST", `/api/workspaces/sales-operations/conversations/${activeConversation.id}/messages`, {
        role: "user",
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/workspaces/sales-operations/conversations", activeConversation?.id, "messages"] 
      });
      setCurrentMessage("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || sendMessageMutation.isPending) return;
    
    sendMessageMutation.mutate(currentMessage.trim());
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button
            className="fixed bottom-6 right-6 h-14 px-6 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 z-50 flex items-center space-x-2 text-white transition-all duration-200 hover:scale-105"
          >
            <Sparkles className="h-5 w-5" />
            <span className="font-medium">Ask Epesi Agent</span>
          </Button>
        )}
      </SheetTrigger>
      
      <SheetContent side="right" className="w-[400px] p-0 flex flex-col h-full border-l-2 border-blue-100 bg-gradient-to-b from-white to-blue-50/30">
        <SheetHeader className="p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <SheetTitle className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold">Epesi Agent</div>
                <div className="text-xs text-blue-100">AI-Powered CRM Assistant</div>
              </div>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Online
            </Badge>
          </SheetTitle>
        </SheetHeader>

        {/* Conversation List */}
        {conversations.length > 1 && (
          <div className="p-3 border-b bg-slate-50">
            <div className="text-xs font-medium text-slate-600 mb-2">Conversations</div>
            <div className="space-y-1">
              {conversations.slice(0, 3).map((conv) => (
                <button
                  key={`conv-${conv.id}`}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`w-full text-left text-sm p-2 rounded hover:bg-white transition-colors ${
                    activeConversation?.id === conv.id ? 'bg-white border border-blue-200' : 'bg-transparent'
                  }`}
                >
                  <div className="truncate font-medium">{conv.title}</div>
                  <div className="text-xs text-slate-500">
                    {formatTime(conv.createdAt)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 px-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <div className="text-lg font-semibold text-slate-900 mb-2">
                  Hello! I'm Epesi Agent
                </div>
                <div className="text-sm text-slate-600 mb-4">
                  Your intelligent CRM assistant. I can help you with:
                </div>
                <div className="space-y-2 text-left">
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Analyze deals and sales pipeline</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Find contacts and companies</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Generate insights and reports</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Recommend next actions</span>
                  </div>
                </div>
                <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                  <div className="text-xs text-blue-800 font-medium mb-1">Try asking:</div>
                  <div className="text-xs text-blue-600">"Show me my top deals" or "What's my sales forecast?"</div>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex space-x-3 ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className={
                      message.role === 'user' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-green-100 text-green-600'
                    }>
                      {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div
                      className={`inline-block p-3 rounded-lg text-sm max-w-xs ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      {message.content}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {formatTime(message.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {sendMessageMutation.isPending && (
              <div className="flex space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-green-100 text-green-600">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="inline-block p-3 rounded-lg bg-slate-100">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t bg-white">
          <form onSubmit={handleSendMessage} className="space-y-3">
            <div className="flex space-x-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Ask Epesi Agent anything about your CRM..."
                className="flex-1 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                disabled={sendMessageMutation.isPending}
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={!currentMessage.trim() || sendMessageMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setCurrentMessage("Show me my top deals")}
              >
                Top Deals
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setCurrentMessage("What's my sales forecast?")}
              >
                Forecast
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setCurrentMessage("Find contacts that need follow-up")}
              >
                Follow-ups
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}