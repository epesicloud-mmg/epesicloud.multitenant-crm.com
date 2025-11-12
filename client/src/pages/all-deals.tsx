import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { NewContactModal } from "@/components/modals/new-contact-modal";
import { ProductSetupModal } from "@/components/modals/product-setup-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertDealSchema, type Deal, type Contact, type Product, type SalesStage, type InterestLevel } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MainLayout } from "@/components/layout/main-layout";

const dealFormSchema = insertDealSchema.omit({ tenantId: true }).extend({
  stageId: z.number(),
  contactId: z.number(),
  productId: z.number(),
  probability: z.number(),
});

type DealFormData = z.infer<typeof dealFormSchema>;

export default function AllDeals() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [contactFilter, setContactFilter] = useState<string>("all");
  const [interestLevelFilter, setInterestLevelFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState('sales-operations');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleWorkspaceChange = (workspace: string) => {
    setCurrentWorkspace(workspace);
  };

  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ["/api/deals"],
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["/api/contacts"],
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: stages = [] } = useQuery({
    queryKey: ["/api/sales-stages"],
  });

  const { data: interestLevels = [] } = useQuery({
    queryKey: ["/api/interest-levels"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: DealFormData) => {
      const payload = { ...data, tenantId: 1 };
      return apiRequest("POST", "/api/deals", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Deal created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create deal",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: number } & Partial<DealFormData>) => {
      const { id, ...updateData } = data;
      const payload = { ...updateData, tenantId: 1 };
      const response = await apiRequest("PUT", `/api/deals/${id}`, payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      setEditingDeal(null);
      setIsCreateDialogOpen(false);
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

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/deals/${id}`);
      return response.json();
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

  const form = useForm<DealFormData>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: {
      title: "",
      value: "",
      probability: 50,
    },
  });

  // Filter deals based on search, stage, contact, and interest level
  const filteredDeals = deals.filter((deal: Deal) => {
    const matchesSearch = deal.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === "all" || deal.stageId?.toString() === stageFilter;
    const matchesContact = contactFilter === "all" || deal.contactId?.toString() === contactFilter;
    const matchesInterestLevel = interestLevelFilter === "all" || deal.interestLevelId?.toString() === interestLevelFilter;
    return matchesSearch && matchesStage && matchesContact && matchesInterestLevel;
  });

  const onSubmit = (data: DealFormData) => {
    console.log("Form submitted:", data);
    console.log("Editing deal:", editingDeal);
    if (editingDeal) {
      updateMutation.mutate({ id: editingDeal.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getContactName = (contactId: number) => {
    const contact = contacts.find((c: Contact) => c.id === contactId);
    return contact ? `${contact.firstName} ${contact.lastName}` : "Unassigned";
  };

  const getProductName = (productId: number | null | undefined) => {
    if (!productId) return "-";
    const product = products.find((p: Product) => p.id === productId);
    return product ? product.name : "-";
  };

  const getStageInfo = (stageId: number) => {
    const stage = stages.find((s: SalesStage) => s.id === stageId);
    if (!stage) return { name: "Unknown", color: "gray" };
    
    // Map stage names to colors
    const colorMap: Record<string, string> = {
      "Prospecting": "blue",
      "Lead Generation": "blue",
      "Initial Contact": "purple",
      "Qualification": "orange",
      "Technical Review": "yellow",
      "Proposal": "indigo",
      "Negotiation": "pink",
      "Contract Review": "green",
      "Closed Won": "green",
      "Closed Lost": "red",
    };
    
    return {
      name: stage.title,
      color: colorMap[stage.title] || "gray"
    };
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  if (dealsLoading) {
    return (
      <MainLayout 
        showWorkspaceSelector={true} 
        currentWorkspace={currentWorkspace}
        onWorkspaceChange={handleWorkspaceChange}
      >
        <div className="p-6">
          <div className="text-center">Loading deals...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      showWorkspaceSelector={true} 
      currentWorkspace={currentWorkspace}
      onWorkspaceChange={handleWorkspaceChange}
    >
      <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">All Deals</h1>
              <p className="text-sm text-slate-600 mt-1">
                Manage and track all sales opportunities
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) {
                setEditingDeal(null);
                form.reset({
                  title: "",
                  value: "",
                  probability: 50,
                  stageId: undefined,
                  contactId: undefined,
                  productId: undefined,
                  interestLevelId: undefined,
                });
              }
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingDeal(null);
                  form.reset({
                    title: "",
                    value: "",
                    probability: 50,
                    stageId: undefined,
                    contactId: undefined,
                    productId: undefined,
                    interestLevelId: undefined,
                  });
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Deal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingDeal ? "Edit Deal" : "Create New Deal"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="productId"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>Product *</FormLabel>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={() => setShowProductModal(true)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Product
                            </Button>
                          </div>
                          <Select 
                            onValueChange={(value) => {
                              const productId = parseInt(value);
                              field.onChange(productId);
                              // Auto-populate value and title from product
                              const product = (products as Product[]).find(p => p.id === productId);
                              if (product) {
                                form.setValue('value', product.salePrice);
                                form.setValue('title', `${product.name} Deal`);
                              }
                            }} 
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a product" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(products as Product[]).filter(product => product.id).map((product: Product) => (
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
                      name="contactId"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>Contact *</FormLabel>
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
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a contact" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(contacts as Contact[]).filter(contact => contact.id).map((contact: Contact) => (
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

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="value"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Deal Value</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                placeholder="Auto-filled from product"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="probability"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Probability (%)</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" max="100" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="stageId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stage *</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a stage" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(stages as SalesStage[]).map((stage: SalesStage) => (
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
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deal Title (optional - auto-generated from product)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Auto-generated from product" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => {
                        setIsCreateDialogOpen(false);
                        setEditingDeal(null);
                      }}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                        {createMutation.isPending || updateMutation.isPending ? "Saving..." : (editingDeal ? "Update Deal" : "Create Deal")}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Quick Add Modals */}
          <NewContactModal 
            open={showContactModal} 
            onOpenChange={setShowContactModal}
            onContactCreated={() => {
              queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
              setShowContactModal(false);
            }}
          />
          
          <ProductSetupModal 
            open={showProductModal} 
            onOpenChange={setShowProductModal}
            onProductCreated={() => {
              queryClient.invalidateQueries({ queryKey: ["/api/products"] });
              setShowProductModal(false);
            }}
          />

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            {/* Header */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Deals Overview</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Track and manage your sales opportunities
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search deals..."
                      className="w-64 pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={stageFilter} onValueChange={setStageFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Stages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stages</SelectItem>
                      {stages.map((stage: SalesStage) => (
                        <SelectItem key={stage.id} value={stage.id.toString()}>
                          {stage.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={contactFilter} onValueChange={setContactFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Contacts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Contacts</SelectItem>
                      {contacts.filter(contact => contact.id).map((contact: Contact) => (
                        <SelectItem key={contact.id} value={contact.id.toString()}>
                          {contact.firstName} {contact.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={interestLevelFilter} onValueChange={setInterestLevelFilter}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="All Interest Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Interest Levels</SelectItem>
                      {interestLevels.filter(level => level.id).map((level: InterestLevel) => (
                        <SelectItem key={level.id} value={level.id.toString()}>
                          {level.level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Probability</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeals.map((deal: Deal) => {
                    const stageInfo = getStageInfo(deal.stageId || 0);
                    return (
                      <TableRow key={deal.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{deal.title}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getContactName(deal.contactId || 0)}</TableCell>
                        <TableCell>{getProductName(deal.productId)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`bg-${stageInfo.color}-50 text-${stageInfo.color}-700 border-${stageInfo.color}-200`}>
                            {stageInfo.name}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(deal.value || 0)}</TableCell>
                        <TableCell>{deal.probability || 0}%</TableCell>
                        <TableCell>{new Date(deal.createdAt || '').toLocaleDateString()}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setEditingDeal(deal);
                                form.reset({
                                  title: deal.title,
                                  value: deal.value,
                                  stageId: deal.stageId || undefined,
                                  contactId: deal.contactId || undefined,
                                  productId: deal.productId || undefined,
                                  interestLevelId: deal.interestLevelId || undefined,
                                  probability: deal.probability || 50,
                                });
                                setIsCreateDialogOpen(true);
                              }}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this deal?')) {
                                    deleteMutation.mutate(deal.id);
                                  }
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {filteredDeals.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No deals found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
    </MainLayout>
  );
}