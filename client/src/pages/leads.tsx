import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { AIInsightsModal } from "@/components/modals/ai-insights-modal";
import { AssignLeadModal } from "@/components/modals/assign-lead-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLeadSchema } from "@shared/schema";
import { z } from "zod";
import { Search, UserPlus, Plus, Edit, Trash2, Star, MessageSquare, UserCheck, Brain } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Lead } from "@shared/schema";

// Create a form schema that accepts string scores and converts them to numbers
const leadFormSchema = insertLeadSchema.extend({
  score: z.union([z.number(), z.string()]).optional().transform((val) => {
    if (typeof val === 'string') {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return val || 0;
  }),
});

type LeadFormData = z.infer<typeof leadFormSchema>;

export default function Leads() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showAIInsights, setShowAIInsights] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user to determine role-based filtering
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  // Fetch leads based on user role
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["/api/leads"],
    enabled: !!currentUser,
  });

  // Add role-based lead queries
  const { data: myLeads = [] } = useQuery({
    queryKey: ["/api/leads/my"],
    enabled: currentUser?.role?.name === 'agent',
  });

  const { data: teamLeads = [] } = useQuery({
    queryKey: ["/api/leads/team"],
    enabled: ['sales manager', 'super admin', 'director'].includes(currentUser?.role?.name),
  });

  const createLeadMutation = useMutation({
    mutationFn: async (data: LeadFormData) => {
      return await apiRequest("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setShowNewLeadModal(false);
      toast({
        title: "Success",
        description: "Lead created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create lead",
        variant: "destructive",
      });
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: async (data: LeadFormData & { id: number }) => {
      const { id, ...updateData } = data;
      return await apiRequest(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setEditingLead(null);
      toast({
        title: "Success",
        description: "Lead updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update lead",
        variant: "destructive",
      });
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/leads/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Success",
        description: "Lead deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete lead",
        variant: "destructive",
      });
    },
  });

  const convertLeadMutation = useMutation({
    mutationFn: async (leadId: number) => {
      return await apiRequest(`/api/leads/${leadId}/convert`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Success",
        description: "Lead converted to contact successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to convert lead",
        variant: "destructive",
      });
    },
  });

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      jobTitle: "",
      source: "website",
      status: "new",
      score: 0,
      notes: "",
    },
  });

  const onSubmit = (data: LeadFormData) => {
    // Convert score to number if it's a string
    const processedData = {
      ...data,
      score: typeof data.score === 'string' ? parseInt(data.score, 10) || 0 : data.score || 0,
    };
    
    if (editingLead) {
      updateLeadMutation.mutate({ ...processedData, id: editingLead.id });
    } else {
      createLeadMutation.mutate(processedData);
    }
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    form.reset({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone || "",
      company: lead.company || "",
      jobTitle: lead.jobTitle || "",
      source: lead.source,
      status: lead.status,
      score: lead.score || 0,
      notes: lead.notes || "",
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this lead?")) {
      deleteLeadMutation.mutate(id);
    }
  };

  const handleConvert = (id: number) => {
    if (confirm("Convert this lead to a contact?")) {
      convertLeadMutation.mutate(id);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800";
      case "contacted": return "bg-yellow-100 text-yellow-800";
      case "qualified": return "bg-green-100 text-green-800";
      case "unqualified": return "bg-red-100 text-red-800";
      case "converted": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "website": return "🌐";
      case "referral": return "👥";
      case "cold-call": return "📞";
      case "social-media": return "📱";
      case "event": return "📅";
      case "advertisement": return "📢";
      default: return "📝";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  // Determine which leads to display based on user role
  const getLeadsToDisplay = () => {
    if (!currentUser) return [];
    
    const userRole = currentUser.role?.name;
    
    // Agents see only their assigned leads
    if (userRole === 'agent') {
      return myLeads;
    }
    
    // Sales managers see their team's leads
    if (['sales manager', 'super admin', 'director'].includes(userRole)) {
      return teamLeads.length > 0 ? teamLeads : leads;
    }
    
    // Default to all leads for other roles
    return leads;
  };

  const leadsToDisplay = getLeadsToDisplay();

  const filteredLeads = leadsToDisplay.filter((lead: Lead) => {
    const matchesSearch = lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = selectedStatus === "all" || lead.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const openNewLeadModal = () => {
    setEditingLead(null);
    form.reset({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      jobTitle: "",
      source: "website",
      status: "new",
      score: 0,
      notes: "",
    });
    setShowNewLeadModal(true);
  };

  const leadCounts = {
    total: leadsToDisplay.length,
    new: leadsToDisplay.filter((l: Lead) => l.status === "new").length,
    contacted: leadsToDisplay.filter((l: Lead) => l.status === "contacted").length,
    qualified: leadsToDisplay.filter((l: Lead) => l.status === "qualified").length,
    converted: leadsToDisplay.filter((l: Lead) => l.status === "converted").length,
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <TopBar title="Leads" onNewContact={openNewLeadModal} />
        
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Lead Management</h1>
                  {currentUser && (
                    <p className="text-sm text-slate-500 mt-1">
                      {currentUser.role?.name === 'agent' && 'Viewing your assigned leads'}
                      {['sales manager', 'super admin', 'director'].includes(currentUser.role?.name) && 'Viewing team leads'}
                    </p>
                  )}
                </div>
                <div className="flex space-x-3">
                  <Button 
                    variant="outline"
                    onClick={() => setShowAIInsights(true)}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100"
                  >
                    <Brain className="w-4 h-4 mr-2 text-blue-600" />
                    AI Mode
                  </Button>
                  <Button onClick={openNewLeadModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lead
                  </Button>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-slate-900">{leadCounts.total}</div>
                    <div className="text-sm text-slate-500">Total Leads</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">{leadCounts.new}</div>
                    <div className="text-sm text-slate-500">New</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-yellow-600">{leadCounts.contacted}</div>
                    <div className="text-sm text-slate-500">Contacted</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">{leadCounts.qualified}</div>
                    <div className="text-sm text-slate-500">Qualified</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-purple-600">{leadCounts.converted}</div>
                    <div className="text-sm text-slate-500">Converted</div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Filters */}
              <div className="flex space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="unqualified">Unqualified</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Leads Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-slate-200 rounded"></div>
                        <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLeads.map((lead: Lead) => (
                  <Card key={lead.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-slate-600">
                              {getInitials(lead.firstName, lead.lastName)}
                            </span>
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {lead.firstName} {lead.lastName}
                            </CardTitle>
                            {lead.company && (
                              <p className="text-sm text-slate-500">{lead.company}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <AssignLeadModal 
                            leadId={lead.id}
                            currentAssignee={lead.assignedTo}
                            trigger={
                              <Button variant="ghost" size="sm">
                                <UserPlus className="w-4 h-4" />
                              </Button>
                            }
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(lead)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(lead.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-slate-600">{lead.email}</p>
                          {lead.phone && (
                            <p className="text-sm text-slate-600">{lead.phone}</p>
                          )}
                          {lead.jobTitle && (
                            <p className="text-sm text-slate-500">{lead.jobTitle}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(lead.status)}>
                              {lead.status}
                            </Badge>
                            {lead.assignedTo && (
                              <Badge variant="outline" className="text-xs">
                                Assigned to {lead.assignedTo.firstName} {lead.assignedTo.lastName}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs">{getSourceIcon(lead.source)}</span>
                            <span className="text-xs text-slate-500 capitalize">{lead.source.replace('-', ' ')}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className={`text-sm font-medium ${getScoreColor(lead.score || 0)}`}>
                              {lead.score || 0}
                            </span>
                          </div>
                          
                          {lead.status === "qualified" && (
                            <Button
                              size="sm"
                              onClick={() => handleConvert(lead.id)}
                              disabled={convertLeadMutation.isPending}
                            >
                              <UserCheck className="w-4 h-4 mr-1" />
                              Convert
                            </Button>
                          )}
                        </div>
                        
                        {lead.notes && (
                          <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded">
                            {lead.notes}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredLeads.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <UserPlus className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No leads found</h3>
                <p className="text-slate-500 mb-4">
                  {searchTerm || selectedStatus !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Get started by adding your first lead"}
                </p>
                {!searchTerm && selectedStatus === "all" && (
                  <Button onClick={openNewLeadModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lead
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* New/Edit Lead Modal */}
      <Dialog open={showNewLeadModal || !!editingLead} onOpenChange={(open) => {
        if (!open) {
          setShowNewLeadModal(false);
          setEditingLead(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingLead ? "Edit Lead" : "Add New Lead"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corporation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Marketing Manager" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                          <SelectItem value="cold-call">Cold Call</SelectItem>
                          <SelectItem value="social-media">Social Media</SelectItem>
                          <SelectItem value="event">Event</SelectItem>
                          <SelectItem value="advertisement">Advertisement</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="qualified">Qualified</SelectItem>
                          <SelectItem value="unqualified">Unqualified</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Score (0-100)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="100" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional notes about this lead..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowNewLeadModal(false);
                    setEditingLead(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createLeadMutation.isPending || updateLeadMutation.isPending}
                >
                  {createLeadMutation.isPending || updateLeadMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AIInsightsModal 
        open={showAIInsights}
        onOpenChange={setShowAIInsights}
        pageType="leads"
        pageTitle="Leads"
        contextData={leads}
      />
    </div>
  );
}