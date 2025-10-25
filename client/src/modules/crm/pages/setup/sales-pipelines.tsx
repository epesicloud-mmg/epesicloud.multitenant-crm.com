import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, GitBranch, Edit, Trash2, ArrowUp, ArrowDown, Star, Search } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertSalesPipelineSchema, insertSalesStageSchema, type SalesPipeline, type SalesStage } from "@shared/schema";
import { z } from "zod";

type SalesPipelineFormData = z.infer<typeof insertSalesPipelineSchema>;
type SalesStageFormData = z.infer<typeof insertSalesStageSchema>;

interface SalesPipelineWithStages extends SalesPipeline {
  stages: SalesStage[];
}

export default function SalesPipelines() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState<SalesPipelineWithStages | null>(null);
  const [stages, setStages] = useState<Omit<SalesStageFormData, 'salePipelineId' | 'tenantId'>[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pipelines = [], isLoading } = useQuery<SalesPipelineWithStages[]>({
    queryKey: ["/api/pipelines"],
  });

  const form = useForm<SalesPipelineFormData>({
    resolver: zodResolver(insertSalesPipelineSchema),
    defaultValues: {
      title: "",
      description: "",
      isDefault: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { pipeline: SalesPipelineFormData; stages: Omit<SalesStageFormData, 'salePipelineId' | 'tenantId'>[] }) => {
      console.log('Creating pipeline with data:', data);
      const response = await apiRequest("POST", "/api/pipelines", data);
      console.log('Pipeline creation response:', response);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pipelines"] });
      setIsModalOpen(false);
      form.reset();
      setStages([]);
      toast({
        title: "Success",
        description: "Sales pipeline created successfully",
      });
    },
    onError: (error: any) => {
      console.error('Pipeline creation error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create sales pipeline",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { pipeline: SalesPipelineFormData & { id: number }; stages: (SalesStageFormData | Omit<SalesStageFormData, 'salePipelineId' | 'tenantId'>)[] }) => {
      return apiRequest("PATCH", `/api/pipelines/${data.pipeline.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pipelines"] });
      setIsModalOpen(false);
      setEditingPipeline(null);
      form.reset();
      setStages([]);
      toast({
        title: "Success",
        description: "Sales pipeline updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update sales pipeline",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/pipelines/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pipelines"] });
      toast({
        title: "Success",
        description: "Sales pipeline deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete sales pipeline",
        variant: "destructive",
      });
    },
  });

  const openModal = (pipeline?: SalesPipelineWithStages) => {
    if (pipeline) {
      setEditingPipeline(pipeline);
      form.reset({
        title: pipeline.title,
        description: pipeline.description || "",
        isDefault: pipeline.isDefault,
      });
      setStages(pipeline.stages.map(stage => ({
        title: stage.title,
        description: stage.description || "",
        order: stage.order,
      })));
    } else {
      setEditingPipeline(null);
      form.reset();
      setStages([
        { title: "Prospecting", description: "Identifying potential customers", order: 1 },
        { title: "Qualification", description: "Qualifying the lead", order: 2 },
        { title: "Proposal", description: "Preparing and presenting proposal", order: 3 },
        { title: "Negotiation", description: "Negotiating terms and conditions", order: 4 },
        { title: "Closed Won", description: "Successfully closed deal", order: 5 },
        { title: "Closed Lost", description: "Deal was lost", order: 6 },
      ]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPipeline(null);
    form.reset();
    setStages([]);
  };

  const addStage = () => {
    setStages([...stages, {
      title: "",
      description: "",
      order: stages.length + 1,
    }]);
  };

  const removeStage = (index: number) => {
    const newStages = stages.filter((_, i) => i !== index);
    setStages(newStages.map((stage, i) => ({ ...stage, order: i + 1 })));
  };

  const moveStage = (index: number, direction: 'up' | 'down') => {
    const newStages = [...stages];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < stages.length) {
      [newStages[index], newStages[newIndex]] = [newStages[newIndex], newStages[index]];
      setStages(newStages.map((stage, i) => ({ ...stage, order: i + 1 })));
    }
  };

  const updateStage = (index: number, field: keyof typeof stages[0], value: string) => {
    const newStages = [...stages];
    newStages[index] = { ...newStages[index], [field]: value };
    setStages(newStages);
  };

  const onSubmit = (data: SalesPipelineFormData) => {
    if (stages.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one stage to the pipeline",
        variant: "destructive",
      });
      return;
    }

    if (editingPipeline) {
      updateMutation.mutate({ pipeline: { ...data, id: editingPipeline.id }, stages });
    } else {
      createMutation.mutate({ pipeline: data, stages });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this sales pipeline? This will affect all associated products.")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <TopBar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Sales Pipelines</h1>
              <p className="text-slate-600">Manage sales pipelines and their stages</p>
            </div>
            <Button onClick={() => openModal()} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Pipeline</span>
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search sales pipelines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-full mb-4"></div>
                    <div className="space-y-2">
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="h-3 bg-slate-200 rounded w-1/2"></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pipelines.filter(pipeline => 
                pipeline.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pipeline.description?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((pipeline) => (
                <Card key={pipeline.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <GitBranch className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <span>{pipeline.title}</span>
                            {pipeline.isDefault && (
                              <Badge variant="secondary" className="flex items-center space-x-1">
                                <Star className="w-3 h-3" />
                                <span>Default</span>
                              </Badge>
                            )}
                          </CardTitle>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openModal(pipeline)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {!pipeline.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(pipeline.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-slate-600 mb-4">{pipeline.description}</p>
                    <div className="space-y-2">
                      <h4 className="font-medium text-slate-900">Stages ({pipeline.stages.length}):</h4>
                      <div className="flex flex-wrap gap-2">
                        {pipeline.stages.map((stage) => (
                          <Badge key={stage.id} variant="outline" className="text-xs">
                            {stage.order}. {stage.title}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-4">
                      Created: {new Date(pipeline.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {pipelines.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <GitBranch className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No sales pipelines found</h3>
              <p className="text-slate-500 mb-4">Get started by creating your first sales pipeline</p>
              <Button onClick={() => openModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Pipeline
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPipeline ? "Edit Sales Pipeline" : "Add New Sales Pipeline"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Pipeline Details */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pipeline Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., General Pipeline" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Default Pipeline</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Use as default for new products
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of this sales pipeline..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Stages Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Pipeline Stages</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addStage}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Stage
                  </Button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {stages.map((stage, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="flex flex-col space-y-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => moveStage(index, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => moveStage(index, 'down')}
                          disabled={index === stages.length - 1}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <Input
                          placeholder="Stage title"
                          value={stage.title}
                          onChange={(e) => updateStage(index, 'title', e.target.value)}
                        />
                        <Input
                          placeholder="Stage description"
                          value={stage.description}
                          onChange={(e) => updateStage(index, 'description', e.target.value)}
                        />
                      </div>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStage(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Pipeline"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}