import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, GripVertical, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Stage {
  id?: number;
  title: string;
  description: string;
  order: number;
}

interface Pipeline {
  id?: number;
  title: string;
  description: string;
  offerDetails: string;
  valueProposition: string;
  isDefault: boolean;
  stages: Stage[];
}

export default function SalesPipelinesSetup() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);
  const [formData, setFormData] = useState<Pipeline>({
    title: "",
    description: "",
    offerDetails: "",
    valueProposition: "",
    isDefault: false,
    stages: []
  });

  const { data: pipelines = [], isLoading } = useQuery({
    queryKey: ["/api/pipelines"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/pipelines", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pipelines"] });
      toast({
        title: "Success",
        description: "Pipeline created successfully",
      });
      closeModal();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create pipeline",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/pipelines/${id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pipelines"] });
      toast({
        title: "Success",
        description: "Pipeline updated successfully",
      });
      closeModal();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update pipeline",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/pipelines/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pipelines"] });
      toast({
        title: "Success",
        description: "Pipeline deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete pipeline",
        variant: "destructive",
      });
    },
  });

  const openCreateModal = () => {
    setEditingPipeline(null);
    setFormData({
      title: "",
      description: "",
      offerDetails: "",
      valueProposition: "",
      isDefault: false,
      stages: [
        { title: "Closed Lost", description: "Closed Lost - Lost Deal", order: 0 },
        { title: "Closed Won", description: "Closed Won", order: 1 },
        { title: "Negotiation", description: "Negotiate & Pending Decision", order: 2 },
        { title: "Initial Presentation of Solution", description: "Product Demonstrations and Presentations", order: 3 },
        { title: "Qualification - Opportunity Assessed", description: "Opportunity Assessed After Appointment", order: 4 },
        { title: "Initial Contact - Book Appointment", description: "Initial Contact Made - Call, Email or Walk-ins", order: 5 },
        { title: "Research/Discovery", description: "Prospect Identification", order: 6 },
      ]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pipeline: any) => {
    setEditingPipeline(pipeline);
    setFormData({
      title: pipeline.title || "",
      description: pipeline.description || "",
      offerDetails: pipeline.offerDetails || "",
      valueProposition: pipeline.valueProposition || "",
      isDefault: pipeline.isDefault || false,
      stages: pipeline.stages || []
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPipeline(null);
    setFormData({
      title: "",
      description: "",
      offerDetails: "",
      valueProposition: "",
      isDefault: false,
      stages: []
    });
  };

  const handleAddStage = () => {
    setFormData({
      ...formData,
      stages: [
        ...formData.stages,
        { title: "", description: "", order: formData.stages.length }
      ]
    });
  };

  const handleRemoveStage = (index: number) => {
    const newStages = formData.stages.filter((_, i) => i !== index);
    const reorderedStages = newStages.map((stage, i) => ({ ...stage, order: i }));
    setFormData({ ...formData, stages: reorderedStages });
  };

  const handleStageChange = (index: number, field: keyof Stage, value: string) => {
    const newStages = [...formData.stages];
    newStages[index] = { ...newStages[index], [field]: value };
    setFormData({ ...formData, stages: newStages });
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Pipeline name is required",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      offerDetails: formData.offerDetails,
      valueProposition: formData.valueProposition,
      isDefault: formData.isDefault,
      stages: formData.stages.filter(s => s.title.trim() !== "")
    };

    if (editingPipeline?.id) {
      updateMutation.mutate({ id: editingPipeline.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this pipeline?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" data-testid="text-page-title">
            Sales Pipeline Setup
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage your sales pipelines and stages
          </p>
        </div>
        <Button 
          onClick={openCreateModal}
          className="bg-primary hover:bg-primary/90"
          data-testid="button-create-pipeline"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Pipeline
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-600">Loading pipelines...</div>
        </div>
      ) : pipelines.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <p className="text-slate-600 mb-4">No pipelines found</p>
          <Button onClick={openCreateModal} variant="outline" data-testid="button-create-first-pipeline">
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Pipeline
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pipeline Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Stages</TableHead>
                <TableHead>Default</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pipelines.map((pipeline: any) => (
                <TableRow key={pipeline.id} data-testid={`row-pipeline-${pipeline.id}`}>
                  <TableCell className="font-medium">{pipeline.title}</TableCell>
                  <TableCell className="text-slate-600">
                    {pipeline.description || "No description"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {pipeline.stages?.length || 0} stages
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {pipeline.isDefault && (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Default
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(pipeline)}
                        data-testid={`button-edit-pipeline-${pipeline.id}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(pipeline.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        data-testid={`button-delete-pipeline-${pipeline.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPipeline ? "Edit Pipeline" : "Create New Pipeline"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pipeline-name">Pipeline Name *</Label>
                <Input
                  id="pipeline-name"
                  placeholder="EpesiRealty Sales Pipeline"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  data-testid="input-pipeline-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  placeholder="EpesiRealty Sales Pipeline"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  data-testid="input-pipeline-description"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="offer-details">Offer Details *</Label>
                <Textarea
                  id="offer-details"
                  placeholder="Enter Offer Details"
                  value={formData.offerDetails}
                  onChange={(e) => setFormData({ ...formData, offerDetails: e.target.value })}
                  rows={3}
                  data-testid="input-offer-details"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="value-proposition">Value Proposition</Label>
                <Textarea
                  id="value-proposition"
                  placeholder="Enter Value Proposition"
                  value={formData.valueProposition}
                  onChange={(e) => setFormData({ ...formData, valueProposition: e.target.value })}
                  rows={3}
                  data-testid="input-value-proposition"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is-default"
                checked={formData.isDefault}
                onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
                data-testid="switch-is-default"
              />
              <Label htmlFor="is-default" className="cursor-pointer">
                Set as Default Pipeline
              </Label>
            </div>

            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Pipeline Stages</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddStage}
                  data-testid="button-add-stage"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Sale_Stage
                </Button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-2 text-sm font-medium text-slate-600 px-2">
                  <div className="col-span-5">Stage Name</div>
                  <div className="col-span-6">Description</div>
                  <div className="col-span-1 text-center">Action</div>
                </div>

                {formData.stages.map((stage, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-md"
                    data-testid={`stage-row-${index}`}
                  >
                    <div className="col-span-5">
                      <Input
                        placeholder="Stage Name"
                        value={stage.title}
                        onChange={(e) => handleStageChange(index, "title", e.target.value)}
                        data-testid={`input-stage-name-${index}`}
                      />
                    </div>
                    <div className="col-span-6">
                      <Input
                        placeholder="Description"
                        value={stage.description}
                        onChange={(e) => handleStageChange(index, "description", e.target.value)}
                        data-testid={`input-stage-description-${index}`}
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveStage(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                        data-testid={`button-delete-stage-${index}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              data-testid="button-close-modal"
            >
              Close
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-pipeline"
              >
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-next-pipeline"
              >
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Next"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
