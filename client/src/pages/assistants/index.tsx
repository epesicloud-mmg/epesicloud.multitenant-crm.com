import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Bot, 
  MessageSquare, 
  Users, 
  Database, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Code, 
  Activity, 
  BarChart3,
  Eye,
  Copy,
  Globe,
  Shield,
  Zap
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Assistant {
  id: string;
  name: string;
  description: string;
  scope: 'tenant' | 'workspace';
  workspaceId?: string;
  workspaceName?: string;
  systemPrompt: string;
  isActive: boolean;
  widgetCode: string;
  totalConversations: number;
  totalProspects: number;
  dataSourcesCount: number;
  createdAt: string;
  lastActivity: string;
  performance: {
    avgResponseTime: number;
    satisfactionScore: number;
    conversionsRate: number;
  };
}

interface Conversation {
  id: string;
  assistantId: string;
  visitorId: string;
  messages: number;
  status: 'active' | 'completed' | 'abandoned';
  createdAt: string;
  lastMessage: string;
  leadCaptured: boolean;
  visitorInfo?: {
    name?: string;
    email?: string;
    company?: string;
  };
}

interface DataSource {
  id: string;
  assistantId: string;
  type: 'products' | 'projects' | 'documents' | 'faq';
  name: string;
  description: string;
  itemCount: number;
  lastSynced: string;
  isActive: boolean;
}

// Mock data - would come from API
const mockAssistants: Assistant[] = [
  {
    id: '1',
    name: 'Sales Assistant',
    description: 'Helps with product inquiries and lead generation',
    scope: 'tenant',
    systemPrompt: 'You are a helpful sales assistant for our company. Help visitors with product questions and capture their contact information.',
    isActive: true,
    widgetCode: '<script src="https://widget.example.com/sales-assistant"></script>',
    totalConversations: 127,
    totalProspects: 23,
    dataSourcesCount: 4,
    createdAt: '2024-01-15T10:00:00Z',
    lastActivity: '2024-01-20T14:30:00Z',
    performance: {
      avgResponseTime: 2.3,
      satisfactionScore: 4.2,
      conversionsRate: 18.1
    }
  },
  {
    id: '2',
    name: 'Support Helper',
    description: 'Provides customer support and technical assistance',
    scope: 'workspace',
    workspaceId: 'ws-1',
    workspaceName: 'Main Office',
    systemPrompt: 'You are a technical support assistant. Help users troubleshoot issues and provide helpful solutions.',
    isActive: true,
    widgetCode: '<script src="https://widget.example.com/support-helper"></script>',
    totalConversations: 89,
    totalProspects: 12,
    dataSourcesCount: 2,
    createdAt: '2024-01-10T09:00:00Z',
    lastActivity: '2024-01-20T16:45:00Z',
    performance: {
      avgResponseTime: 1.8,
      satisfactionScore: 4.5,
      conversionsRate: 13.5
    }
  }
];

const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    assistantId: '1',
    visitorId: 'visitor-123',
    messages: 8,
    status: 'completed',
    createdAt: '2024-01-20T14:00:00Z',
    lastMessage: 'Thank you for your help! I\'ll be in touch.',
    leadCaptured: true,
    visitorInfo: {
      name: 'John Smith',
      email: 'john@company.com',
      company: 'Tech Corp'
    }
  },
  {
    id: 'conv-2',
    assistantId: '1',
    visitorId: 'visitor-456',
    messages: 3,
    status: 'active',
    createdAt: '2024-01-20T15:30:00Z',
    lastMessage: 'Can you tell me more about your pricing?',
    leadCaptured: false
  }
];

const mockDataSources: DataSource[] = [
  {
    id: 'ds-1',
    assistantId: '1',
    type: 'products',
    name: 'Product Catalog',
    description: 'All available products and services',
    itemCount: 156,
    lastSynced: '2024-01-20T12:00:00Z',
    isActive: true
  },
  {
    id: 'ds-2',
    assistantId: '1',
    type: 'faq',
    name: 'Frequently Asked Questions',
    description: 'Common customer questions and answers',
    itemCount: 42,
    lastSynced: '2024-01-19T18:00:00Z',
    isActive: true
  }
];

export default function AssistantsPage() {
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { toast } = useToast();

  // Mock queries - would be real API calls
  const queryClient = useQueryClient();

  // Get assistants from API
  const { data: assistants = [], isLoading } = useQuery({
    queryKey: ["/api/assistants"],
    queryFn: () => fetch("/api/assistants").then(res => res.json())
  });

  // Create assistant mutation
  const createAssistantMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/assistants", {
        method: "POST",
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assistants"] });
      setIsCreateOpen(false);
      toast({
        title: "Success",
        description: "Assistant created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create assistant",
        variant: "destructive",
      });
    }
  });

  const { data: conversations = mockConversations } = useQuery({
    queryKey: ['/api/assistants/conversations', selectedAssistant?.id],
    queryFn: async () => mockConversations.filter(c => c.assistantId === selectedAssistant?.id),
    enabled: !!selectedAssistant
  });

  const { data: dataSources = mockDataSources } = useQuery({
    queryKey: ['/api/assistants/data-sources', selectedAssistant?.id],
    queryFn: async () => mockDataSources.filter(ds => ds.assistantId === selectedAssistant?.id),
    enabled: !!selectedAssistant
  });

  const copyWidgetCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Widget code copied",
      description: "The embed code has been copied to your clipboard."
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Epesi Agents</h1>
          <p className="text-muted-foreground">
            Manage your tenant admin created assistants (separate from the floating Epesi Agent)
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Assistant
        </Button>
      </div>

      {/* Assistants Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assistants</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assistants.length}</div>
            <p className="text-xs text-muted-foreground">
              {assistants.filter(a => a.isActive).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assistants.reduce((sum, a) => sum + a.totalConversations, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all assistants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prospects Captured</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assistants.reduce((sum, a) => sum + a.totalProspects, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Qualified leads generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Satisfaction</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(assistants.reduce((sum, a) => sum + a.performance.satisfactionScore, 0) / assistants.length).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of 5.0
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Assistants List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Assistants</CardTitle>
          <CardDescription>
            Manage and configure your AI assistants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assistants.map((assistant) => (
              <div key={assistant.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{assistant.name}</h3>
                    <Badge variant={assistant.isActive ? "default" : "secondary"}>
                      {assistant.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">
                      {assistant.scope === 'tenant' ? <Globe className="h-3 w-3 mr-1" /> : <Shield className="h-3 w-3 mr-1" />}
                      {assistant.scope === 'tenant' ? 'Tenant-wide' : assistant.workspaceName}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{assistant.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{assistant.totalConversations} conversations</span>
                    <span>{assistant.totalProspects} prospects</span>
                    <span>{assistant.dataSourcesCount} data sources</span>
                    <span>Last active {formatDistanceToNow(new Date(assistant.lastActivity), { addSuffix: true })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyWidgetCode(assistant.widgetCode)}
                  >
                    <Code className="h-4 w-4 mr-1" />
                    Widget Code
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAssistant(assistant)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Manage
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedAssistant(assistant);
                      setIsEditOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assistant Details Modal */}
      {selectedAssistant && (
        <Dialog open={!!selectedAssistant} onOpenChange={() => setSelectedAssistant(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                {selectedAssistant.name}
              </DialogTitle>
              <DialogDescription>
                {selectedAssistant.description}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="conversations">Conversations</TabsTrigger>
                <TabsTrigger value="data-sources">Data Sources</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Avg Response Time</span>
                        <span className="text-sm font-medium">{selectedAssistant.performance.avgResponseTime}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Satisfaction Score</span>
                        <span className="text-sm font-medium">{selectedAssistant.performance.satisfactionScore}/5.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Conversion Rate</span>
                        <span className="text-sm font-medium">{selectedAssistant.performance.conversionsRate}%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Activity Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Conversations</span>
                        <span className="text-sm font-medium">{selectedAssistant.totalConversations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Prospects Captured</span>
                        <span className="text-sm font-medium">{selectedAssistant.totalProspects}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Data Sources</span>
                        <span className="text-sm font-medium">{selectedAssistant.dataSourcesCount}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Scope</span>
                        <Badge variant="outline">
                          {selectedAssistant.scope === 'tenant' ? 'Tenant-wide' : selectedAssistant.workspaceName}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge variant={selectedAssistant.isActive ? "default" : "secondary"}>
                          {selectedAssistant.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Created</span>
                        <span className="text-sm font-medium">
                          {formatDistanceToNow(new Date(selectedAssistant.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Widget Embed Code</CardTitle>
                    <CardDescription>
                      Copy this code to embed the assistant on your website
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                        {selectedAssistant.widgetCode}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyWidgetCode(selectedAssistant.widgetCode)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="conversations" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Recent Conversations</h3>
                  <Badge variant="secondary">{conversations.length} conversations</Badge>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Visitor</TableHead>
                      <TableHead>Messages</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Lead Captured</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Last Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conversations.map((conversation) => (
                      <TableRow key={conversation.id}>
                        <TableCell>
                          {conversation.visitorInfo?.name || `Visitor ${conversation.visitorId.slice(-4)}`}
                          {conversation.visitorInfo?.company && (
                            <div className="text-xs text-muted-foreground">
                              {conversation.visitorInfo.company}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{conversation.messages}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              conversation.status === 'active' ? 'default' : 
                              conversation.status === 'completed' ? 'secondary' : 'outline'
                            }
                          >
                            {conversation.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {conversation.leadCaptured ? (
                            <Badge variant="default">Yes</Badge>
                          ) : (
                            <Badge variant="outline">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(conversation.createdAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {conversation.lastMessage}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="data-sources" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Data Sources</h3>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Data Source
                  </Button>
                </div>

                <div className="grid gap-4">
                  {dataSources.map((dataSource) => (
                    <Card key={dataSource.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Database className="h-4 w-4" />
                              <h4 className="font-semibold">{dataSource.name}</h4>
                              <Badge variant="outline">{dataSource.type}</Badge>
                              <Badge variant={dataSource.isActive ? "default" : "secondary"}>
                                {dataSource.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{dataSource.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{dataSource.itemCount} items</span>
                              <span>Last synced {formatDistanceToNow(new Date(dataSource.lastSynced), { addSuffix: true })}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Activity className="h-4 w-4 mr-1" />
                              Sync
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>System Prompt</CardTitle>
                    <CardDescription>
                      Define how your assistant behaves and responds to visitors
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={selectedAssistant.systemPrompt}
                      readOnly
                      rows={6}
                      className="resize-none"
                    />
                    <Button className="mt-2" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Prompt
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Assistant Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Active Status</Label>
                        <p className="text-sm text-muted-foreground">Enable or disable this assistant</p>
                      </div>
                      <Switch checked={selectedAssistant.isActive} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Scope</Label>
                      <Select value={selectedAssistant.scope}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tenant">Tenant-wide</SelectItem>
                          <SelectItem value="workspace">Workspace-specific</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedAssistant.scope === 'workspace' && (
                      <div className="space-y-2">
                        <Label>Workspace</Label>
                        <Select value={selectedAssistant.workspaceId}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ws-1">Main Office</SelectItem>
                            <SelectItem value="ws-2">Branch Office</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Assistant Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Assistant</DialogTitle>
            <DialogDescription>
              Create a new AI assistant for your organization or workspace
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data = {
              name: formData.get('name') as string,
              description: formData.get('description') as string,
              systemPrompt: formData.get('systemPrompt') as string,
              scope: formData.get('scope') as string,
              workspaceId: formData.get('workspaceId') as string || null,
              isActive: true
            };
            createAssistantMutation.mutate(data);
          }} className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Assistant Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter assistant name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe what this assistant does"
                  rows={3}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="systemPrompt">System Prompt</Label>
                <Textarea
                  id="systemPrompt"
                  name="systemPrompt"
                  placeholder="Define how the assistant should behave"
                  rows={4}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="scope">Scope</Label>
                <Select name="scope" defaultValue="tenant">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tenant">Tenant-wide</SelectItem>
                    <SelectItem value="workspace">Workspace-specific</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createAssistantMutation.isPending}
              >
                {createAssistantMutation.isPending ? "Creating..." : "Create Assistant"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}