import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Zap, Edit, Trash2, Search } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

const leadSourceSchema = z.object({
  sourceName: z.string().min(1, "Source name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  tenantId: z.number(),
});

type LeadSourceFormData = z.infer<typeof leadSourceSchema>;

interface LeadSource {
  id: number;
  sourceName: string;
  description: string | null;
  category: string;
  isActive: boolean;
  createdAt: string;
}

export default function LeadSources() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<LeadSource | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<LeadSourceFormData>({
    resolver: zodResolver(leadSourceSchema),
    defaultValues: {
      sourceName: "",
      description: "",
      category: "",
      tenantId: 1,
    },
  });

  const { data: leadSources = [], isLoading } = useQuery({
    queryKey: ["/api/lead-sources"],
  });

  const createMutation = useMutation({
    mutationFn: (data: LeadSourceFormData) => apiRequest("/api/lead-sources", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lead-sources"] });
      closeModal();
      toast({
        title: "Success",
        description: "Lead source created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create lead source",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: LeadSourceFormData }) => 
      apiRequest(`/api/lead-sources/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lead-sources"] });
      closeModal();
      toast({
        title: "Success",
        description: "Lead source updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update lead source",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/lead-sources/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lead-sources"] });
      toast({
        title: "Success",
        description: "Lead source deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete lead source",
        variant: "destructive",
      });
    },
  });

  const openModal = (source?: LeadSource) => {
    if (source) {
      setEditingSource(source);
      form.reset({
        sourceName: source.sourceName,
        description: source.description || "",
        category: source.category,
        tenantId: 1,
      });
    } else {
      setEditingSource(null);
      form.reset({
        sourceName: "",
        description: "",
        category: "",
        tenantId: 1,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSource(null);
    form.reset();
  };

  const onSubmit = (data: LeadSourceFormData) => {
    if (editingSource) {
      updateMutation.mutate({ id: editingSource.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this lead source?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredSources = leadSources.filter((source: LeadSource) =>
    source.sourceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    source.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    source.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group sources by category
  const groupedSources = filteredSources.reduce((acc: Record<string, LeadSource[]>, source: LeadSource) => {
    if (!acc[source.category]) {
      acc[source.category] = [];
    }
    acc[source.category].push(source);
    return acc;
  }, {});

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <TopBar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Lead Sources</h1>
              <p className="text-slate-600">Manage lead sources and acquisition channels</p>
            </div>
            <Button onClick={() => openModal()} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Lead Source</span>
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search lead sources..."
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
                    <div className="h-3 bg-slate-200 rounded w-full mb-4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedSources).map(([category, sources]) => (
                <div key={category}>
                  <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <Badge variant="outline" className="mr-2">{category}</Badge>
                    <span className="text-sm text-slate-500">({sources.length} sources)</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sources.map((source) => (
                      <Card key={source.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Zap className="w-4 h-4 text-blue-600" />
                              </div>
                              <CardTitle className="text-base">{source.sourceName}</CardTitle>
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openModal(source)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(source.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {source.description && (
                            <p className="text-sm text-slate-600 mb-3">{source.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <Badge variant={source.isActive ? "default" : "secondary"}>
                              {source.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <span className="text-xs text-slate-400">
                              {new Date(source.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal */}
          <Dialog open={isModalOpen} onOpenChange={closeModal}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingSource ? "Edit Lead Source" : "Add Lead Source"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="sourceName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Website Contact Form" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Digital Marketing" {...field} />
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
                            placeholder="Describe this lead source..."
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={closeModal}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {editingSource ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}