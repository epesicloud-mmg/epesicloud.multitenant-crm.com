import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDealSchema } from "@shared/schema";
import { Plus, TrendingUp, MoreHorizontal, Edit, Trash2, DollarSign, Target } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Deal, Contact, Product } from "@shared/schema";
import { z } from "zod";

// Types for dropdown data
type DealStage = {
  id: number;
  salePipelineId: number;
  title: string;
  description: string;
  order: number;
  tenantId: number;
};

type InterestLevel = {
  id: number;
  level: string;
  description: string;
  color: string;
  tenantId: number;
};

// Clean form schema - exactly like companies
const dealFormSchema = insertDealSchema.omit({ tenantId: true }).extend({
  title: z.string().min(1, "Deal title is required"),
  value: z.string().min(1, "Deal value is required"),
  stageId: z.number().nullable().optional(),
  contactId: z.number().nullable().optional(),
  productId: z.number().nullable().optional(),
  interestLevelId: z.number().nullable().optional(),
});

type DealFormData = z.infer<typeof dealFormSchema>;

export default function Deals() {
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data queries - exact pattern from companies
  const { data: deals = [], isLoading } = useQuery<Deal[]>({
    queryKey: ["/api/deals"],
  });

  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: dealStages = [], isLoading: stagesLoading, error: stagesError } = useQuery<DealStage[]>({
    queryKey: ["/api/sales-stages"],
  });

  // Debug stages
  console.log("Deal Stages:", dealStages);
  console.log("Stages Loading:", stagesLoading);
  console.log("Stages Error:", stagesError);

  const { data: interestLevels = [] } = useQuery<InterestLevel[]>({
    queryKey: ["/api/interest-levels"],
  });

  // Form setup - exact pattern from companies  
  const form = useForm<DealFormData>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: {
      title: "",
      value: "",
      stageId: null,
      contactId: null,
      productId: null,
      interestLevelId: null,
      probability: 50,
      expectedCloseDate: null,
      actualCloseDate: null,
      notes: "",
      assignedToId: null,
      supervisorId: null,
      workspaceId: null,
      projectId: null,
    },
  });

  // Create deal mutation - exact pattern from companies
  const createDealMutation = useMutation({
    mutationFn: async (data: DealFormData) => {
      console.log("Creating deal with data:", data);
      // Convert value to string for backend
      const payload = { 
        ...data, 
        value: data.value.toString(),
        tenantId: 1 
      };
      console.log("Payload with tenantId:", payload);
      const response = await apiRequest("POST", "/api/deals", payload);
      console.log("Create deal response:", response);
      return response.json();
    },
    onSuccess: (result) => {
      console.log("Create deal success:", result);
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      setShowNewDealModal(false);
      form.reset();
      toast({
        title: "Success",
        description: "Deal created successfully",
      });
    },
    onError: (error) => {
      console.error("Create deal error:", error);
      toast({
        title: "Error",
        description: "Failed to create deal",
        variant: "destructive",
      });
    },
  });

  // Update deal mutation
  const updateDealMutation = useMutation({
    mutationFn: async (data: DealFormData & { id: number }) => {
      const { id, ...updateData } = data;
      const payload = { 
        ...updateData, 
        value: updateData.value.toString(),
        tenantId: 1 
      };
      return apiRequest("PUT", `/api/deals/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      setEditingDeal(null);
      setShowNewDealModal(false);
      form.reset();
      toast({
        title: "Success",
        description: "Deal updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update deal",
        variant: "destructive",
      });
    },
  });

  // Delete deal mutation
  const deleteDealMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/deals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      toast({
        title: "Success",
        description: "Deal deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete deal",
        variant: "destructive",
      });
    },
  });

  // Form submission with detailed debugging
  const onSubmit = (data: DealFormData) => {
    console.log("=== FORM SUBMISSION DEBUG ===");
    console.log("Raw form data:", data);
    console.log("Form errors:", form.formState.errors);
    console.log("Form valid:", form.formState.isValid);
    console.log("Form values:", form.getValues());
    console.log("Editing deal:", editingDeal);
    console.log("================");
    
    if (editingDeal) {
      updateDealMutation.mutate({ ...data, id: editingDeal.id });
    } else {
      createDealMutation.mutate(data);
    }
  };

  // Edit deal handler - exact pattern from companies
  const handleEditDeal = (deal: Deal) => {
    setEditingDeal(deal);
    form.reset({
      title: deal.title,
      value: deal.value,
      stageId: deal.stageId,
      contactId: deal.contactId,
      productId: deal.productId,
      interestLevelId: deal.interestLevelId,
      probability: deal.probability,
      expectedCloseDate: deal.expectedCloseDate || undefined,
      actualCloseDate: deal.actualCloseDate || undefined,
      notes: deal.notes || "",
      assignedToId: deal.assignedToId,
      supervisorId: deal.supervisorId,
    });
    setShowNewDealModal(true);
  };

  const openNewDealModal = () => {
    setEditingDeal(null);
    form.reset({
      title: "",
      value: "",
      stageId: null,
      contactId: null,
      productId: null,
      interestLevelId: null,
      probability: 50,
      expectedCloseDate: null,
      actualCloseDate: null,
      notes: "",
      assignedToId: null,
      supervisorId: null,
      workspaceId: null,
      projectId: null,
    });
    setShowNewDealModal(true);
  };

  return (
    <MainLayout>
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Deals</h2>
        <Button onClick={openNewDealModal}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Deal
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${deals.reduce((sum, deal) => sum + parseFloat(deal.value), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Deals</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-muted-foreground">Loading deals...</div>
            </div>
          ) : deals.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No deals yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Create your first deal to get started</p>
              <Button onClick={openNewDealModal}>
                <Plus className="mr-2 h-4 w-4" />
                Create Deal
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {deals.map((deal) => {
                const contact = contacts.find(c => c.id === deal.contactId);
                const stage = dealStages.find(s => s.id === deal.stageId);
                const product = products.find(p => p.id === deal.productId);
                
                return (
                  <div
                    key={deal.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{deal.title}</h4>
                        {stage && (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                            {stage.title}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-medium text-green-600">${parseFloat(deal.value).toLocaleString()}</span>
                        {contact && <span>{contact.firstName} {contact.lastName}</span>}
                        {product && <span>• {product.name}</span>}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditDeal(deal)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteDealMutation.mutate(deal.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deal Modal - Fresh Build */}
      <Dialog open={showNewDealModal || !!editingDeal} onOpenChange={(open) => {
        if (!open) {
          setShowNewDealModal(false);
          setEditingDeal(null);
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingDeal ? "Edit Deal" : "Create New Deal"}</DialogTitle>
            <DialogDescription>
              {editingDeal ? "Update the deal information below." : "Fill out the form below to create a new deal."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deal Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter deal title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deal Value</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter deal value" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stageId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stage</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : null)} 
                        value={field.value?.toString() || ""}
                        disabled={stagesLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={stagesLoading ? "Loading stages..." : "Select stage"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dealStages.length > 0 ? (
                            dealStages.map((stage) => (
                              <SelectItem key={stage.id} value={stage.id.toString()}>
                                {stage.title}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-stages" disabled>
                              {stagesLoading ? "Loading..." : "No stages found - Create stages in Settings → Sales Pipelines"}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : null)} value={field.value?.toString() || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select contact" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contacts.map((contact) => (
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
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : null)} value={field.value?.toString() || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name} - ${product.salePrice}
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
                  name="interestLevelId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interest Level</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : null)} value={field.value?.toString() || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select interest" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {interestLevels.map((level) => (
                            <SelectItem key={level.id} value={level.id.toString()}>
                              {level.level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Textarea placeholder="Enter notes about this deal" {...field} value={field.value || ""} />
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
                    setShowNewDealModal(false);
                    setEditingDeal(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createDealMutation.isPending || updateDealMutation.isPending}
                >
                  {createDealMutation.isPending || updateDealMutation.isPending ? "Saving..." : (editingDeal ? "Update Deal" : "Create Deal")}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
    </MainLayout>
  );
}