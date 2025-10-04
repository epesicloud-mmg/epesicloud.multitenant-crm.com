import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Target, Edit, Trash2, Search, MoveVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import type { SalesStage, SalesPipeline } from "@shared/schema";

const salesStageSchema = z.object({
  salePipelineId: z.number().min(1, "Pipeline is required"),
  title: z.string().min(1, "Stage title is required"),
  position: z.number().min(0, "Position must be 0 or greater"),
  color: z.string().min(1, "Color is required"),
  probability: z.number().min(0).max(100),
  tenantId: z.number(),
});

type SalesStageFormData = z.infer<typeof salesStageSchema>;

export default function SalesStages() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<SalesStage | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: salesStages = [], isLoading } = useQuery<SalesStage[]>({
    queryKey: ["/api/deal-stages"],
  });

  const { data: pipelines = [] } = useQuery<SalesPipeline[]>({
    queryKey: ["/api/sales-pipelines"],
  });

  const form = useForm<SalesStageFormData>({
    resolver: zodResolver(salesStageSchema),
    defaultValues: {
      salePipelineId: 0,
      title: "",
      position: 0,
      color: "#3b82f6",
      probability: 50,
      tenantId: 1,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: SalesStageFormData) => {
      return apiRequest("POST", "/api/deal-stages", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deal-stages"] });
      setIsModalOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Sales stage created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create sales stage",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: SalesStageFormData & { id: number }) => {
      return apiRequest("PATCH", `/api/deal-stages/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deal-stages"] });
      setIsModalOpen(false);
      setEditingStage(null);
      form.reset();
      toast({
        title: "Success",
        description: "Sales stage updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update sales stage",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/deal-stages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deal-stages"] });
      toast({
        title: "Success",
        description: "Sales stage deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete sales stage",
        variant: "destructive",
      });
    },
  });

  const handleOpenModal = (stage?: SalesStage) => {
    if (stage) {
      setEditingStage(stage);
      form.reset({
        salePipelineId: stage.salePipelineId,
        title: stage.title,
        position: stage.position,
        color: stage.color,
        probability: stage.probability,
        tenantId: stage.tenantId,
      });
    } else {
      setEditingStage(null);
      form.reset({
        salePipelineId: pipelines[0]?.id || 0,
        title: "",
        position: 0,
        color: "#3b82f6",
        probability: 50,
        tenantId: 1,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (data: SalesStageFormData) => {
    if (editingStage) {
      updateMutation.mutate({ ...data, id: editingStage.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredStages = salesStages.filter(
    (stage) =>
      stage.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPipelineName = (pipelineId: number) => {
    const pipeline = pipelines.find((p) => p.id === pipelineId);
    return pipeline?.title || "Unknown Pipeline";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <Target className="w-8 h-8 text-blue-600" />
            Sales Stages
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage sales pipeline stages and their progression
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} data-testid="button-create-stage">
          <Plus className="w-4 h-4 mr-2" />
          Add Stage
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search stages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          data-testid="input-search-stages"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stage Title</TableHead>
              <TableHead>Pipeline</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Probability</TableHead>
              <TableHead>Color</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredStages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  No sales stages found
                </TableCell>
              </TableRow>
            ) : (
              filteredStages.map((stage) => (
                <TableRow key={stage.id} data-testid={`row-stage-${stage.id}`}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <MoveVertical className="w-4 h-4 text-slate-400" />
                      {stage.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getPipelineName(stage.salePipelineId)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{stage.position}</Badge>
                  </TableCell>
                  <TableCell>{stage.probability}%</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full border border-slate-200"
                        style={{ backgroundColor: stage.color }}
                      />
                      <span className="text-xs text-slate-600">{stage.color}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal(stage)}
                        data-testid={`button-edit-stage-${stage.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(stage.id)}
                        data-testid={`button-delete-stage-${stage.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md" data-testid="dialog-stage-form">
          <DialogHeader>
            <DialogTitle>
              {editingStage ? "Edit Sales Stage" : "Create Sales Stage"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="salePipelineId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pipeline</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-pipeline">
                          <SelectValue placeholder="Select pipeline" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {pipelines.map((pipeline) => (
                          <SelectItem key={pipeline.id} value={pipeline.id.toString()}>
                            {pipeline.title}
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
                    <FormLabel>Stage Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Qualification"
                        {...field}
                        data-testid="input-stage-title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position (Order)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        data-testid="input-stage-position"
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
                    <FormLabel>Win Probability (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        data-testid="input-stage-probability"
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
                      <Input
                        type="color"
                        {...field}
                        data-testid="input-stage-color"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit"
                >
                  {editingStage ? "Update" : "Create"} Stage
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
