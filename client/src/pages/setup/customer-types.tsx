import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Users, Edit, Trash2, Save, X } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

const customerTypeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

type CustomerTypeFormData = z.infer<typeof customerTypeSchema>;

interface CustomerType {
  id: number;
  title: string;
  description?: string;
  createdAt: string;
}

export default function CustomerTypes() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<CustomerType | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customerTypes = [], isLoading } = useQuery<CustomerType[]>({
    queryKey: ["/api/customer-types"],
  });

  const form = useForm<CustomerTypeFormData>({
    resolver: zodResolver(customerTypeSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CustomerTypeFormData) => {
      const response = await apiRequest("POST", "/api/customer-types", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-types"] });
      queryClient.refetchQueries({ queryKey: ["/api/customer-types"] });
      setIsModalOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Customer type created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create customer type",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: CustomerTypeFormData) => {
      if (!editingType) throw new Error("No customer type to update");
      const response = await apiRequest("PATCH", `/api/customer-types/${editingType.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-types"] });
      queryClient.refetchQueries({ queryKey: ["/api/customer-types"] });
      setIsModalOpen(false);
      setEditingType(null);
      form.reset();
      toast({
        title: "Success",
        description: "Customer type updated successfully",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/customer-types/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-types"] });
      queryClient.refetchQueries({ queryKey: ["/api/customer-types"] });
      toast({
        title: "Success",
        description: "Customer type deleted successfully",
      });
    },
  });

  const onSubmit = (data: CustomerTypeFormData) => {
    if (editingType) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (type: CustomerType) => {
    setEditingType(type);
    form.reset({
      title: type.title,
      description: type.description || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this customer type?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleNewType = () => {
    setEditingType(null);
    form.reset({
      title: "",
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    form.handleSubmit(onSubmit)();
  };

  const handleNew = () => {
    form.reset({
      title: "",
      description: "",
    });
    setEditingType(null);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingType(null);
    form.reset();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex bg-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <TopBar title="Setup" />
          <div className="p-6">Loading customer types...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <TopBar title="Setup" />
        
        <div className="p-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            {/* Header */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Customer Types</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Manage customer types for your CRM system
                  </p>
                </div>
                <Button onClick={handleNewType}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Customer Type
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {customerTypes.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-slate-400" />
                  <h3 className="mt-2 text-sm font-semibold text-slate-900">No customer types</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Get started by creating your first customer type.
                  </p>
                  <div className="mt-6">
                    <Button onClick={handleNewType}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Customer Type
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customerTypes.map((type) => (
                    <Card key={type.id} className="relative group">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            <CardTitle className="text-lg">{type.title}</CardTitle>
                          </div>
                          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(type)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(type.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {type.description && (
                          <p className="text-sm text-slate-600 mb-3">
                            {type.description}
                          </p>
                        )}
                        <span className="text-xs text-slate-500">
                          ID: {type.id}
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-slate-900">
                Customer Type
              </DialogTitle>
              <p className="text-sm text-slate-600">
                Manage Customer types
              </p>
            </DialogHeader>

            <Form {...form}>
              <div className="space-y-6 py-4">
                {/* Form Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Title" {...field} />
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
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter Description (Optional)"
                            className="min-h-[100px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                  <Button
                    type="button"
                    variant="default"
                    onClick={handleSave}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNew}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    New
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleClose}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                </div>
              </div>
            </Form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}