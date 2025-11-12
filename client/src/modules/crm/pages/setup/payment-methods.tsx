import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, CreditCard, Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertPaymentMethodSchema, type PaymentMethod } from "@shared/schema";
import { z } from "zod";

type PaymentMethodFormData = z.infer<typeof insertPaymentMethodSchema>;

export default function PaymentMethods() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<PaymentMethod | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: paymentMethods = [], isLoading } = useQuery<PaymentMethod[]>({
    queryKey: ["/api/payment-methods"],
  });

  const form = useForm<PaymentMethodFormData>({
    resolver: zodResolver(insertPaymentMethodSchema),
    defaultValues: {
      methodName: "",
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: PaymentMethodFormData) => {
      const response = await apiRequest("POST", "/api/payment-methods", data);
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      await queryClient.refetchQueries({ queryKey: ["/api/payment-methods"] });
      setIsModalOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Payment method created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create payment method",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: PaymentMethodFormData & { id: number }) => {
      const response = await apiRequest("PATCH", `/api/payment-methods/${data.id}`, data);
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      await queryClient.refetchQueries({ queryKey: ["/api/payment-methods"] });
      setIsModalOpen(false);
      setEditingType(null);
      form.reset();
      toast({
        title: "Success",
        description: "Payment method updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update payment method",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/payment-methods/${id}`);
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      await queryClient.refetchQueries({ queryKey: ["/api/payment-methods"] });
      toast({
        title: "Success",
        description: "Payment method deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete payment method",
        variant: "destructive",
      });
    },
  });

  const openModal = (type?: PaymentMethod) => {
    if (type) {
      setEditingType(type);
      form.reset({
        methodName: type.methodName,
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

  const onSubmit = (data: PaymentMethodFormData) => {
    if (editingType) {
      updateMutation.mutate({ ...data, id: editingType.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this payment method?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Payment Methods</h1>
            <p className="text-slate-600">Configure available payment methods for transactions</p>
          </div>
          <Button onClick={() => openModal()} className="flex items-center space-x-2" data-testid="button-add-payment-method">
            <Plus className="w-4 h-4" />
            <span>Add Payment Method</span>
          </Button>
        </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search payment methods..."
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
              {paymentMethods.filter(type => 
                type.methodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                type.description?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((type) => (
                <Card key={type.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                        </div>
                        <CardTitle className="text-lg">{type.methodName}</CardTitle>
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

          {paymentMethods.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No payment methods found</h3>
              <p className="text-slate-500 mb-4">Get started by adding your first payment method</p>
              <Button onClick={() => openModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </div>
          )}
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingType ? "Edit Payment Method" : "Add New Payment Method"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="methodName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Method Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Credit Card, Cash, Bank Transfer, PayPal" {...field} />
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
                        placeholder="Brief description of this payment method..."
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