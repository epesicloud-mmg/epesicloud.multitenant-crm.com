import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Thermometer, Edit, Trash2, Search } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

const interestLevelSchema = z.object({
  level: z.string().min(1, "Interest level is required"),
  description: z.string().min(1, "Description is required"),
  color: z.string().min(1, "Color is required"),
  tenantId: z.number(),
});

type InterestLevelFormData = z.infer<typeof interestLevelSchema>;

interface InterestLevel {
  id: number;
  level: string;
  description: string;
  color: string;
  createdAt: string;
}

export default function InterestLevels() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<InterestLevel | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: interestLevels = [], isLoading } = useQuery<InterestLevel[]>({
    queryKey: ["/api/interest-levels"],
  });

  const form = useForm<InterestLevelFormData>({
    resolver: zodResolver(interestLevelSchema),
    defaultValues: {
      level: "",
      description: "",
      color: "#3b82f6",
      tenantId: 1,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InterestLevelFormData) => {
      return apiRequest("/api/interest-levels", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interest-levels"] });
      setIsModalOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Interest level created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create interest level",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InterestLevelFormData & { id: number }) => {
      return apiRequest(`/api/interest-levels/${data.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interest-levels"] });
      setIsModalOpen(false);
      setEditingLevel(null);
      form.reset();
      toast({
        title: "Success",
        description: "Interest level updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update interest level",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/interest-levels/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interest-levels"] });
      toast({
        title: "Success",
        description: "Interest level deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete interest level",
        variant: "destructive",
      });
    },
  });

  const openModal = (level?: InterestLevel) => {
    if (level) {
      setEditingLevel(level);
      form.reset({
        level: level.level,
        description: level.description,
        color: level.color,
        tenantId: 1,
      });
    } else {
      setEditingLevel(null);
      form.reset();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLevel(null);
    form.reset();
  };

  const onSubmit = (data: InterestLevelFormData) => {
    if (editingLevel) {
      updateMutation.mutate({ ...data, id: editingLevel.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this interest level?")) {
      deleteMutation.mutate(id);
    }
  };

  const getColorBadge = (color: string, level: string) => {
    return (
      <Badge 
        className="text-white border-0" 
        style={{ backgroundColor: color }}
      >
        {level}
      </Badge>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <TopBar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Interest Levels</h1>
              <p className="text-slate-600">Manage interest levels: Hot, Warm, Cool, Cold</p>
            </div>
            <Button onClick={() => openModal()} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Interest Level</span>
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search interest levels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {interestLevels.filter(level => 
                level.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
                level.description?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((level) => (
                <Card key={level.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-slate-100 rounded-lg">
                          <Thermometer className="w-5 h-5 text-slate-600" />
                        </div>
                        <CardTitle className="text-lg">{getColorBadge(level.color, level.level)}</CardTitle>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openModal(level)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(level.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-slate-600">{level.description}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      Created: {new Date(level.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {interestLevels.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Thermometer className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No interest levels found</h3>
              <p className="text-slate-500 mb-4">Get started by adding your first interest level</p>
              <Button onClick={() => openModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Interest Level
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingLevel ? "Edit Interest Level" : "Add New Interest Level"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interest Level</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Hot, Warm, Cool, Cold" {...field} />
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
                        placeholder="Brief description of this interest level..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-3">
                        <Input 
                          type="color" 
                          className="w-16 h-10 rounded cursor-pointer"
                          {...field}
                        />
                        <Input 
                          placeholder="#3b82f6" 
                          className="flex-1"
                          {...field}
                        />
                      </div>
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
    </div>
  );
}