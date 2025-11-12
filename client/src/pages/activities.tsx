import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { NewContactModal } from "@/components/modals/new-contact-modal";
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
import { insertActivitySchema } from "@shared/schema";
import { Search, Calendar, Plus, Edit, Trash2, Phone, Mail, Users, FileText, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Activity, Contact, Deal, ActivityType } from "@shared/schema";
import { z } from "zod";

const activityFormSchema = insertActivitySchema.omit({ tenantId: true, scheduledAt: true }).extend({
  scheduledAt: z.string().optional(),
});

type ActivityFormData = z.infer<typeof activityFormSchema>;

export default function Activities() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewActivityModal, setShowNewActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [currentWorkspace, setCurrentWorkspace] = useState('sales-operations');
  const [showContactModal, setShowContactModal] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleWorkspaceChange = (workspace: string) => {
    setCurrentWorkspace(workspace);
  };

  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const { data: deals = [] } = useQuery<Deal[]>({
    queryKey: ["/api/deals"],
  });

  const { data: activityTypes = [] } = useQuery<ActivityType[]>({
    queryKey: ["/api/activity-types"],
  });

  const createActivityMutation = useMutation({
    mutationFn: async (data: ActivityFormData) => {
      console.log("Creating activity with data:", data);
      const payload = { 
        ...data, 
        tenantId: 1,
        userId: 44, // Use existing user ID
        // Convert scheduledAt to ISO string if provided
        scheduledAt: data.scheduledAt ? data.scheduledAt : null,
      };
      console.log("Payload with tenantId:", payload);
      const response = await apiRequest("POST", "/api/activities", payload);
      console.log("Create activity response:", response);
      return response.json();
    },
    onSuccess: (result) => {
      console.log("Create activity success:", result);
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      setShowNewActivityModal(false);
      form.reset();
      toast({
        title: "Success",
        description: "Activity created successfully",
      });
    },
    onError: (error) => {
      console.error("Create activity error:", error);
      toast({
        title: "Error",
        description: "Failed to create activity",
        variant: "destructive",
      });
    },
  });

  const updateActivityMutation = useMutation({
    mutationFn: async (data: ActivityFormData & { id: number }) => {
      const { id, ...updateData } = data;
      const payload = { ...updateData, tenantId: 1, userId: 44 };
      return apiRequest("PUT", `/api/activities/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      setEditingActivity(null);
      setShowNewActivityModal(false);
      form.reset();
      toast({
        title: "Success",
        description: "Activity updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update activity",
        variant: "destructive",
      });
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/activities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Success",
        description: "Activity deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete activity",
        variant: "destructive",
      });
    },
  });

  const completeActivityMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("PATCH", `/api/activities/${id}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Success",
        description: "Activity marked as completed",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete activity",
        variant: "destructive",
      });
    },
  });

  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      subject: "",
      description: "",
      contactId: undefined,
      dealId: undefined,
      activityTypeId: undefined,
      userId: 44, // Use existing user ID
      scheduledAt: "",
    },
  });

  const onSubmit = (data: ActivityFormData) => {
    console.log("Form submitted with data:", data);
    console.log("Form errors:", form.formState.errors);
    console.log("Editing activity:", editingActivity);
    
    // Validate required fields
    if (!data.subject) {
      console.error("Missing required fields:", { subject: data.subject });
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (subject)",
        variant: "destructive",
      });
      return;
    }
    
    if (editingActivity) {
      updateActivityMutation.mutate({ ...data, id: editingActivity.id });
    } else {
      createActivityMutation.mutate(data);
    }
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    form.reset({
      subject: activity.subject,
      description: activity.description || "",
      contactId: activity.contactId || undefined,
      dealId: activity.dealId || undefined,
      activityTypeId: activity.activityTypeId || undefined,
      userId: activity.userId,
      scheduledAt: activity.scheduledAt ? 
        new Date(activity.scheduledAt).toISOString().slice(0, 16) : "",
    });
    setShowNewActivityModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this activity?")) {
      deleteActivityMutation.mutate(id);
    }
  };

  const handleComplete = (id: number) => {
    completeActivityMutation.mutate(id);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "call": return <Phone className="w-4 h-4" />;
      case "email": return <Mail className="w-4 h-4" />;
      case "meeting": return <Users className="w-4 h-4" />;
      case "note": return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "call": return "bg-blue-100 text-blue-800";
      case "email": return "bg-green-100 text-green-800";
      case "meeting": return "bg-purple-100 text-purple-800";
      case "note": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (completed: boolean) => {
    return completed ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";
  };

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString();
  };

  const filteredActivities = activities.filter((activity: Activity) => {
    const matchesSearch = activity.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (activity.description && activity.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === "all" || activity.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const openNewActivityModal = () => {
    setEditingActivity(null);
    form.reset({
      subject: "",
      description: "",
      contactId: undefined,
      dealId: undefined,
      activityTypeId: undefined,
      userId: 44, // Use existing user ID
      scheduledAt: "",
    });
    setShowNewActivityModal(true);
  };

  const activityCounts = {
    total: activities.length,
    calls: activities.filter((a: Activity) => a.type === "call").length,
    emails: activities.filter((a: Activity) => a.type === "email").length,
    meetings: activities.filter((a: Activity) => a.type === "meeting").length,
    notes: activities.filter((a: Activity) => a.type === "note").length,
    completed: activities.filter((a: Activity) => a.completedAt).length,
    pending: activities.filter((a: Activity) => !a.completedAt).length,
  };

  return (
    <MainLayout 
      showWorkspaceSelector={true} 
      currentWorkspace={currentWorkspace}
      onWorkspaceChange={handleWorkspaceChange}
    >
      <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-slate-900">Activity Management</h1>
                <Button onClick={openNewActivityModal}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Activity
                </Button>
              </div>
              

              
              {/* Filters */}
              <div className="flex space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="call">Calls</SelectItem>
                    <SelectItem value="email">Emails</SelectItem>
                    <SelectItem value="meeting">Meetings</SelectItem>
                    <SelectItem value="note">Notes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Activities List */}
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                          <div className="h-3 bg-slate-200 rounded w-2/3 mb-3"></div>
                          <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                        </div>
                        <div className="flex space-x-2">
                          <div className="h-8 w-16 bg-slate-200 rounded"></div>
                          <div className="h-8 w-8 bg-slate-200 rounded"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredActivities.map((activity: Activity) => {
                  const contact = contacts.find((c: Contact) => c.id === activity.contactId);
                  const deal = deals.find((d: Deal) => d.id === activity.dealId);
                  const isCompleted = !!activity.completedAt;
                  
                  return (
                    <Card key={activity.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className={`p-2 rounded-lg ${getTypeColor(activity.type).replace('text-', 'text-').replace('bg-', 'bg-')}`}>
                                {getTypeIcon(activity.type)}
                              </div>
                              <div>
                                <h3 className="font-semibold text-slate-900">{activity.subject}</h3>
                                <div className="flex items-center space-x-4 text-sm text-slate-500">
                                  <Badge className={getTypeColor(activity.type)}>
                                    {activity.type}
                                  </Badge>
                                  <Badge className={getStatusColor(isCompleted)}>
                                    {isCompleted ? "Completed" : "Pending"}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            {activity.description && (
                              <p className="text-slate-600 mb-3">{activity.description}</p>
                            )}
                            
                            <div className="flex items-center space-x-6 text-sm text-slate-500">
                              {contact && (
                                <span>Contact: {contact.firstName} {contact.lastName}</span>
                              )}
                              {deal && (
                                <span>Deal: {deal.title}</span>
                              )}
                              {activity.scheduledAt && (
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{formatDateTime(activity.scheduledAt)}</span>
                                </div>
                              )}
                              <span>Created: {formatDateTime(activity.createdAt)}</span>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            {!isCompleted && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleComplete(activity.id)}
                                disabled={completeActivityMutation.isPending}
                              >
                                Complete
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(activity)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(activity.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {filteredActivities.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No activities found</h3>
                <p className="text-slate-500 mb-4">
                  {searchTerm || selectedType !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Get started by adding your first activity"}
                </p>
                {!searchTerm && selectedType === "all" && (
                  <Button onClick={openNewActivityModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Activity
                  </Button>
                )}
              </div>
            )}
          </div>

      {/* New/Edit Activity Modal */}
      <Dialog open={showNewActivityModal || !!editingActivity} onOpenChange={(open) => {
        if (!open) {
          setShowNewActivityModal(false);
          setEditingActivity(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingActivity ? "Edit Activity" : "Add New Activity"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="activityTypeId"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Activity Type *</FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => window.location.href = '/setup/activity-types'}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Type
                      </Button>
                    </div>
                    <Select 
                      onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))} 
                      value={field.value?.toString() || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No Activity Type</SelectItem>
                        {activityTypes.map((activityType: ActivityType) => (
                          <SelectItem key={activityType.id} value={activityType.id.toString()} data-testid={`activity-type-option-${activityType.id}`}>
                            {activityType.typeName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="scheduledAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scheduled Date & Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} data-testid="input-scheduled-at" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject *</FormLabel>
                    <FormControl>
                      <Input placeholder="Call to discuss proposal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactId"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Contact</FormLabel>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => setShowContactModal(true)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Contact
                        </Button>
                      </div>
                      <Select 
                        onValueChange={(value) => {
                          const contactId = value === "none" ? undefined : parseInt(value);
                          field.onChange(contactId);
                          // Clear deal selection when contact changes
                          form.setValue("dealId", undefined);
                        }} 
                        value={field.value?.toString() || "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select contact" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No Contact</SelectItem>
                          {contacts.map((contact: Contact) => (
                            <SelectItem key={contact.id} value={contact.id.toString()}>
                              {contact.firstName} {contact.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dealId"
                  render={({ field }) => {
                    const selectedContactId = form.watch("contactId");
                    const filteredDeals = selectedContactId 
                      ? deals.filter((deal: Deal) => deal.contactId === selectedContactId)
                      : deals;
                    
                    return (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Deal</FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => window.location.href = '/deals'}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Deal
                          </Button>
                        </div>
                        <Select onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))} value={field.value?.toString() || "none"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={selectedContactId ? "Select deal for this contact" : "Select deal"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No Deal</SelectItem>
                            {filteredDeals.length === 0 && selectedContactId ? (
                              <SelectItem value="no-deals" disabled>
                                No deals found for this contact
                              </SelectItem>
                            ) : (
                              filteredDeals.map((deal: Deal) => (
                                <SelectItem key={deal.id} value={deal.id.toString()}>
                                  {deal.title}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional details about this activity..."
                        className="min-h-[100px]"
                        {...field}
                        value={field.value || ""}
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
                    setShowNewActivityModal(false);
                    setEditingActivity(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createActivityMutation.isPending || updateActivityMutation.isPending}
                  onClick={(e) => {
                    console.log("Save Activity button clicked!");
                    console.log("Form valid:", form.formState.isValid);
                    console.log("Form errors:", form.formState.errors);
                    console.log("Form values:", form.getValues());
                  }}
                >
                  {createActivityMutation.isPending || updateActivityMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Quick Add Modals */}
      <NewContactModal 
        open={showContactModal} 
        onOpenChange={setShowContactModal}
        onContactCreated={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
          setShowContactModal(false);
        }}
      />
      </div>
    </MainLayout>
  );
}