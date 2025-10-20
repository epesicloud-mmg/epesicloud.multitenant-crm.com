import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Users, Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCustomerTypeSchema, type CustomerType } from "@shared/schema";
import { z } from "zod";

type CustomerTypeFormData = z.infer<typeof insertCustomerTypeSchema>;

export default function CustomerTypes() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<CustomerType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customerTypes = [], isLoading } = useQuery<CustomerType[]>({
    queryKey: ["/api/customer-types"],
  });

  const form = useForm<CustomerTypeFormData>({
    resolver: zodResolver(insertCustomerTypeSchema),
    defaultValues: {
      typeName: "",
      description: "",
      tenantId: 1,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CustomerTypeFormData) => {
      return apiRequest("/api/customer-types", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-types"] });
      setIsModalOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Activity type created successfully",
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
    mutationFn: async (data: CustomerTypeFormData & { id: number }) => {
      return apiRequest(`/api/customer-types/${data.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-types"] });
      setIsModalOpen(false);
      setEditingType(null);
      form.reset();
      toast({
        title: "Success",
        description: "Activity type updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update customer type",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/customer-types/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-types"] });
      toast({
        title: "Success",
        description: "Activity type deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete customer type",
        variant: "destructive",
      });
    },
  });

  const openModal = (type?: CustomerType) => {
    if (type) {
      setEditingType(type);
      form.reset({
        typeName: type.typeName,
        description: type.description || "",
        tenantId: type.tenantId,
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

  const onSubmit = (data: CustomerTypeFormData) => {
    if (editingType) {
      updateMutation.mutate({ ...data, id: editingType.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this customer type?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Customer Types</h1>
            <p className="text-slate-600">Manage customer types including Call, Email, Meeting, and Note</p>
          </div>
          <Button onClick={() => openModal()} className="flex items-center space-x-2" data-testid="button-add-customer-type">
            <Plus className="w-4 h-4" />
            <span>Add Customer Type</span>
          </Button>
        </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search customer types..."
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
              {customerTypes.filter(type => 
                type.typeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                type.description?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((type) => (
                <Card key={type.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <CardTitle className="text-lg">{type.typeName}</CardTitle>
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

          {customerTypes.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No customer types found</h3>
              <p className="text-slate-500 mb-4">Get started by adding your first customer type</p>
              <Button onClick={() => openModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Customer Type
              </Button>
            </div>
          )}
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingType ? "Edit Customer Type" : "Add New Customer Type"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="typeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Call, Email, Meeting" {...field} />
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
                        placeholder="Brief description of this customer type..."
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