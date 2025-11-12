import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, DollarSign, Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertPaymentItemSchema, type PaymentItem } from "@shared/schema";
import { z } from "zod";

type PaymentItemFormData = z.infer<typeof insertPaymentItemSchema>;

export default function PaymentItems() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<PaymentItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: paymentItems = [], isLoading } = useQuery<PaymentItem[]>({
    queryKey: ["/api/payment-items"],
  });

  const form = useForm<PaymentItemFormData>({
    resolver: zodResolver(insertPaymentItemSchema),
    defaultValues: {
      itemName: "",
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: PaymentItemFormData) => {
      const response = await apiRequest("POST", "/api/payment-items", data);
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/payment-items"] });
      await queryClient.refetchQueries({ queryKey: ["/api/payment-items"] });
      setIsModalOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Payment item created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create payment item",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: PaymentItemFormData & { id: number }) => {
      const response = await apiRequest("PATCH", `/api/payment-items/${data.id}`, data);
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/payment-items"] });
      await queryClient.refetchQueries({ queryKey: ["/api/payment-items"] });
      setIsModalOpen(false);
      setEditingType(null);
      form.reset();
      toast({
        title: "Success",
        description: "Payment item updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update payment item",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/payment-items/${id}`);
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/payment-items"] });
      await queryClient.refetchQueries({ queryKey: ["/api/payment-items"] });
      toast({
        title: "Success",
        description: "Payment item deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete payment item",
        variant: "destructive",
      });
    },
  });

  const openModal = (type?: PaymentItem) => {
    if (type) {
      setEditingType(type);
      form.reset({
        itemName: type.itemName,
        description: type.description || "",
      });
    } else {
      setEditingType(null);
      form.reset();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingType(null);
    form.reset();
  };

  const onSubmit = (data: PaymentItemFormData) => {
    if (editingType) {
      updateMutation.mutate({ ...data, id: editingType.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this payment item?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Payment Items</h1>
            <p className="text-slate-600">Define billable items and services for invoicing</p>
          </div>
          <Button onClick={() => openModal()} className="flex items-center space-x-2" data-testid="button-add-payment-item">
            <Plus className="w-4 h-4" />
            <span>Add Payment Item</span>
          </Button>
        </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search payment items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paymentItems.filter(type => 
                type.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                type.description?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((type) => (
                <Card key={type.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <DollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                        <CardTitle className="text-lg">{type.itemName}</CardTitle>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openModal(type)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(type.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-slate-600">{type.description}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      Created: {new Date(type.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {paymentItems.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No payment items found</h3>
              <p className="text-slate-500 mb-4">Get started by adding your first payment item</p>
              <Button onClick={() => openModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Item
              </Button>
            </div>
          )}
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingType ? "Edit Payment Item" : "Add New Payment Item"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="itemName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Consultation Fee, Setup Fee, Monthly Subscription" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of this payment item..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}