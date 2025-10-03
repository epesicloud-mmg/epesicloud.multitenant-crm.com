import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, TrendingUp, MoreHorizontal, Edit, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertDealSchema } from "@shared/schema";
import type { Deal, Contact, Product } from "@shared/schema";

// Types from schema
type Deal = {
  id: number;
  title: string;
  value: string;
  stageId: number | null;
  contactId: number | null;
  productId: number | null;
  interestLevelId: number | null;
  probability: number;
  expectedCloseDate: string | null;
  actualCloseDate: string | null;
  notes: string | null;
  assignedToId: number | null;
  supervisorId: number | null;
  workspaceId: number | null;
  projectId: number | null;
  tenantId: number;
  createdAt: string;
};

type Contact = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  jobTitle: string | null;
  status: string;
  companyId: number | null;
  tenantId: number;
};

type Product = {
  id: number;
  name: string;
  title: string;
  salePrice: string;
  tenantId: number;
};

type DealStage = {
  id: number;
  title: string;
  salePipelineId: number;
  order: number;
  tenantId: number;
};

type InterestLevel = {
  id: number;
  level: string;
  description: string;
  tenantId: number;
};

// Form schema - using the same pattern as companies
const dealFormSchema = insertDealSchema.omit({ tenantId: true }).extend({
  value: z.string().min(1, "Value is required"),
});

type DealFormData = z.infer<typeof dealFormSchema>;

export default function Deals() {
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form setup
  const form = useForm<DealFormData>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: {
      title: "",
      value: "",
      stageId: undefined,
      contactId: undefined,
      productId: undefined,
      interestLevelId: undefined,
      expectedCloseDate: "",
      notes: "",
    },
  });

  // Data queries
  const { data: deals = [], isLoading: dealsLoading } = useQuery<Deal[]>({
    queryKey: ["/api/deals"],
  });

  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: dealStages = [] } = useQuery<DealStage[]>({
    queryKey: ["/api/deal-stages"],
  });

  const { data: interestLevels = [] } = useQuery<InterestLevel[]>({
    queryKey: ["/api/interest-levels"],
  });

  // Create deal mutation
  const createDealMutation = useMutation({
    mutationFn: async (data: DealFormData) => {
      const payload = {
        title: data.title,
        value: data.value, // Keep as string
        stageId: data.stageId || null,
        contactId: data.contactId || null,
        productId: data.productId || null,
        interestLevelId: data.interestLevelId || null,
        expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate).toISOString() : null,
        notes: data.notes || null,
        tenantId: 1,
      };
      
      console.log("Creating deal with payload:", payload);
      const response = await apiRequest("POST", "/api/deals", payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      setShowNewDealModal(false);
      form.reset();
      toast({
        title: "Success",
        description: "Deal created successfully",
      });
    },
    onError: (error) => {
      console.error("Deal creation error:", error);
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
        title: updateData.title,
        value: updateData.value, // Keep as string
        stageId: updateData.stageId || null,
        contactId: updateData.contactId || null,
        productId: updateData.productId || null,
        interestLevelId: updateData.interestLevelId || null,
        expectedCloseDate: updateData.expectedCloseDate ? new Date(updateData.expectedCloseDate).toISOString() : null,
        notes: updateData.notes || null,
        tenantId: 1,
      };
      
      console.log("Updating deal with payload:", payload);
      const response = await apiRequest("PUT", `/api/deals/${id}`, payload);
      return response.json();
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
    onError: (error) => {
      console.error("Deal update error:", error);
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
      const response = await apiRequest("DELETE", `/api/deals/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      toast({
        title: "Success",
        description: "Deal deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Deal deletion error:", error);
      toast({
        title: "Error",
        description: "Failed to delete deal",
        variant: "destructive",
      });
    },
  });

  // Form submission
  const onSubmit = (data: DealFormData) => {
    console.log("Form submission triggered with data:", data);
    console.log("Form errors:", form.formState.errors);
    
    if (editingDeal) {
      console.log("Updating existing deal:", editingDeal.id);
      updateDealMutation.mutate({ ...data, id: editingDeal.id });
    } else {
      console.log("Creating new deal");
      createDealMutation.mutate(data);
    }
  };

  // Edit deal handler
  const handleEditDeal = (deal: Deal) => {
    setEditingDeal(deal);
    form.reset({
      title: deal.title,
      value: deal.value,
      stageId: deal.stageId || undefined,
      contactId: deal.contactId || undefined,
      productId: deal.productId || undefined,
      interestLevelId: deal.interestLevelId || undefined,
      expectedCloseDate: deal.expectedCloseDate ? deal.expectedCloseDate.split('T')[0] : "",
      notes: deal.notes || "",
    });
    setShowNewDealModal(true);
  };

  // Auto-populate from product selection
  const handleProductChange = (productId: string) => {
    if (productId === "none") {
      form.setValue("productId", undefined);
      return;
    }
    
    const selectedProduct = (products as Product[]).find((p: Product) => p.id === parseInt(productId));
    if (selectedProduct) {
      form.setValue("productId", selectedProduct.id);
      form.setValue("value", selectedProduct.salePrice);
      if (!form.getValues("title")) {
        form.setValue("title", selectedProduct.name);
      }
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Deals</h2>
        <Button onClick={() => {
          setEditingDeal(null);
          form.reset();
          setShowNewDealModal(true);
        }}>
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
            <div className="text-2xl font-bold">{(deals as Deal[]).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(deals as Deal[]).reduce((sum, deal) => sum + parseFloat(deal.value), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>All Deals</CardTitle>
            <CardDescription>Manage your sales pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            {dealsLoading ? (
              <div className="text-center py-8">Loading deals...</div>
            ) : (deals as Deal[]).length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No deals found</h3>
                <p className="text-slate-500 mb-4">Create your first deal to get started</p>
                <Button onClick={() => setShowNewDealModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Deal
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {(deals as Deal[]).map((deal) => {
                  const contact = (contacts as Contact[]).find((c: Contact) => c.id === deal.contactId);
                  const product = (products as Product[]).find((p: Product) => p.id === deal.productId);
                  const stage = (dealStages as DealStage[]).find((s: DealStage) => s.id === deal.stageId);
                  const interestLevel = (interestLevels as InterestLevel[]).find((i: InterestLevel) => i.id === deal.interestLevelId);
                  
                  return (
                    <div key={deal.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-medium">{deal.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              ${deal.value} • {stage?.title || 'No Stage'}
                            </p>
                          </div>
                          {contact && (
                            <div className="text-sm">
                              <span className="font-medium">{contact.firstName} {contact.lastName}</span>
                              <p className="text-muted-foreground">{contact.email}</p>
                            </div>
                          )}
                          {product && (
                            <div className="text-sm">
                              <span className="font-medium">{product.name}</span>
                            </div>
                          )}
                          {interestLevel && (
                            <div className="text-sm">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {interestLevel.level}
                              </span>
                            </div>
                          )}
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
      </div>

      {/* New/Edit Deal Modal */}
      <Dialog open={showNewDealModal || !!editingDeal} onOpenChange={(open) => {
        if (!open) {
          setShowNewDealModal(false);
          setEditingDeal(null);
          form.reset();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingDeal ? "Edit Deal" : "Create New Deal"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product/Service</FormLabel>
                      <Select
                        onValueChange={handleProductChange}
                        value={field.value?.toString() || "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Custom Deal (No Product)</SelectItem>
                          {(products as Product[]).map((product) => (
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
                        <Input placeholder="0.00" type="number" step="0.01" {...field} />
                      </FormControl>
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
                      <Select
                        onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))}
                        value={field.value?.toString() || "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select contact" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No Contact</SelectItem>
                          {(contacts as Contact[]).map((contact) => (
                            <SelectItem key={contact.id} value={contact.id.toString()}>
                              {contact.firstName} {contact.lastName} ({contact.email})
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
                  name="stageId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deal Stage</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))}
                        value={field.value?.toString() || "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No Stage</SelectItem>
                          {(dealStages as DealStage[]).map((stage) => (
                            <SelectItem key={stage.id} value={stage.id.toString()}>
                              {stage.title}
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
                      <Select
                        onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))}
                        value={field.value?.toString() || "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select interest level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No Interest Level</SelectItem>
                          {(interestLevels as InterestLevel[]).map((level) => (
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

                <FormField
                  control={form.control}
                  name="expectedCloseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Close Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
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
                      <Textarea placeholder="Additional notes about the deal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowNewDealModal(false);
                    setEditingDeal(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createDealMutation.isPending || updateDealMutation.isPending}
                  onClick={() => {
                    console.log("Save Deal button clicked");
                    console.log("Form is valid:", form.formState.isValid);
                    console.log("Form values:", form.getValues());
                  }}
                >
                  {createDealMutation.isPending || updateDealMutation.isPending ? "Saving..." : "Save Deal"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}