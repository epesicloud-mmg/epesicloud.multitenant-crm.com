import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Target, Edit, Trash2, Save, X } from "lucide-react";
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

const leadSourceCategorySchema = z.object({
  categoryTitle: z.string().min(1, "Lead source category title is required"),
  description: z.string().min(1, "Description is required"),
});

type LeadSourceCategoryFormData = z.infer<typeof leadSourceCategorySchema>;

interface LeadSourceCategory {
  id: number;
  categoryTitle: string;
  description: string;
  createdAt: string;
}

export default function LeadSourceCategories() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<LeadSourceCategory | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leadSourceCategories = [], isLoading } = useQuery<LeadSourceCategory[]>({
    queryKey: ["/api/lead-source-categories"],
  });

  const form = useForm<LeadSourceCategoryFormData>({
    resolver: zodResolver(leadSourceCategorySchema),
    defaultValues: {
      categoryTitle: "",
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: LeadSourceCategoryFormData) => {
      const response = await apiRequest("POST", "/api/lead-source-categories", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lead-source-categories"] });
      queryClient.refetchQueries({ queryKey: ["/api/lead-source-categories"] });
      setIsModalOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Lead source category created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create lead source category",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: LeadSourceCategoryFormData) => {
      if (!editingCategory) throw new Error("No lead source category to update");
      const response = await apiRequest("PATCH", `/api/lead-source-categories/${editingCategory.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lead-source-categories"] });
      queryClient.refetchQueries({ queryKey: ["/api/lead-source-categories"] });
      setIsModalOpen(false);
      setEditingCategory(null);
      form.reset();
      toast({
        title: "Success",
        description: "Lead source category updated successfully",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/lead-source-categories/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lead-source-categories"] });
      queryClient.refetchQueries({ queryKey: ["/api/lead-source-categories"] });
      toast({
        title: "Success",
        description: "Lead source category deleted successfully",
      });
    },
  });

  const onSubmit = (data: LeadSourceCategoryFormData) => {
    if (editingCategory) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (category: LeadSourceCategory) => {
    setEditingCategory(category);
    form.reset({
      categoryTitle: category.categoryTitle,
      description: category.description,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this lead source category?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleNewCategory = () => {
    setEditingCategory(null);
    form.reset({
      categoryTitle: "",
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    form.handleSubmit(onSubmit)();
  };

  const handleNew = () => {
    form.reset({
      categoryTitle: "",
      description: "",
    });
    setEditingCategory(null);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    form.reset();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex bg-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <TopBar title="Setup" />
          <div className="p-6">Loading lead source categories...</div>
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
                  <h3 className="text-lg font-semibold text-slate-900">Lead Source Category</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    View/Edit Lead source categories
                  </p>
                </div>
                <Button onClick={handleNewCategory}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Lead Source Category
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {leadSourceCategories.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="mx-auto h-12 w-12 text-slate-400" />
                  <h3 className="mt-2 text-sm font-semibold text-slate-900">No lead source categories</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Get started by creating your first lead source category.
                  </p>
                  <div className="mt-6">
                    <Button onClick={handleNewCategory}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Lead Source Category
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {leadSourceCategories.map((category) => (
                    <Card key={category.id} className="relative group">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <Target className="h-5 w-5 text-blue-600" />
                            <CardTitle className="text-lg">{category.categoryTitle}</CardTitle>
                          </div>
                          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(category)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(category.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-600 mb-3">
                          {category.description}
                        </p>
                        <span className="text-xs text-slate-500">
                          ID: {category.id}
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
                Lead Source Category
              </DialogTitle>
              <p className="text-sm text-slate-600">
                View/Edit Lead source categories
              </p>
            </DialogHeader>

            <Form {...form}>
              <div className="space-y-6 py-4">
                {/* Form Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="categoryTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lead_source_category Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Lead_source_category Title" {...field} />
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
                            placeholder="Enter Description"
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