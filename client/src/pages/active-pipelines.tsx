import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, MoreVertical, ChevronLeft, ChevronRight, GitBranch } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { MainLayout } from "@/components/layout/main-layout";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Deal, SalesStage, SalesPipeline, Contact } from "@shared/schema";

export default function ActivePipelines() {
  const [selectedPipelineId, setSelectedPipelineId] = useState<number | null>(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pipelines = [] as SalesPipeline[], isLoading: pipelinesLoading } = useQuery({
    queryKey: ["/api/sales-pipelines"],
  });

  const { data: deals = [] as Deal[], isLoading: dealsLoading } = useQuery({
    queryKey: ["/api/deals"],
  });

  const { data: contacts = [] as Contact[] } = useQuery({
    queryKey: ["/api/contacts"],
  });

  const updateDealMutation = useMutation({
    mutationFn: async (data: { id: number; stageId: number }) => {
      await apiRequest("PUT", `/api/deals/${data.id}`, { stageId: data.stageId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      toast({
        title: "Success",
        description: "Deal moved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to move deal",
        variant: "destructive",
      });
    },
  });

  // Get default pipeline or first pipeline
  const activePipeline = selectedPipelineId 
    ? pipelines.find((p: SalesPipeline) => p.id === selectedPipelineId)
    : pipelines.find((p: SalesPipeline) => p.isDefault) || pipelines[0];

  // Get stages for the active pipeline
  const pipelineStages = activePipeline?.stages || [];

  // Filter deals by active pipeline stages
  const pipelineDeals = deals.filter((deal: Deal) => 
    pipelineStages.some((stage: SalesStage) => stage.id === deal.stageId)
  );

  const getContactName = (contactId: number) => {
    const contact = contacts.find((c: Contact) => c.id === contactId);
    return contact ? `${contact.firstName} ${contact.lastName}` : "Unassigned";
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const dealId = parseInt(result.draggableId);
    const newStageId = parseInt(result.destination.droppableId);

    updateDealMutation.mutate({ id: dealId, stageId: newStageId });
  };

  // Navigation functions
  const sortedStages = pipelineStages.sort((a: SalesStage, b: SalesStage) => a.order - b.order);
  
  const canGoBack = currentStageIndex > 0;
  const canGoForward = currentStageIndex < sortedStages.length - 1;

  const goToPreviousStage = () => {
    if (canGoBack) {
      setCurrentStageIndex(currentStageIndex - 1);
    }
  };

  const goToNextStage = () => {
    if (canGoForward) {
      setCurrentStageIndex(currentStageIndex + 1);
    }
  };

  // Reset stage index when pipeline changes
  const handlePipelineChange = (value: string) => {
    setSelectedPipelineId(parseInt(value));
    setCurrentStageIndex(0);
  };

  if (pipelinesLoading || dealsLoading) {
    return (
      <MainLayout showWorkspaceSelector={true}>
        <div className="p-6">
          <div className="text-center">Loading pipelines...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showWorkspaceSelector={true}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Active Pipelines</h1>
            <p className="text-sm text-slate-600 mt-1">
              Visual pipeline management and deal tracking
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Select 
              value={activePipeline?.id?.toString() || ""} 
              onValueChange={handlePipelineChange}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select Pipeline" />
              </SelectTrigger>
              <SelectContent>
                {(pipelines as SalesPipeline[]).map((pipeline: SalesPipeline) => (
                  <SelectItem key={pipeline.id} value={pipeline.id.toString()}>
                    {pipeline.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            {/* Header */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {activePipeline?.title || "No Pipeline Selected"}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {activePipeline?.description || "Select a pipeline to view deals"}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  {sortedStages.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPreviousStage}
                        disabled={!canGoBack}
                        className="h-8"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back
                      </Button>
                      <span className="text-sm text-slate-600 px-2">
                        Stage {currentStageIndex + 1} of {sortedStages.length}
                        {sortedStages[currentStageIndex] && ` - ${sortedStages[currentStageIndex].title}`}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextStage}
                        disabled={!canGoForward}
                        className="h-8"
                      >
                        Forward
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600">
                      {pipelineDeals.length} deals • ${pipelineDeals.reduce((sum: number, deal: any) => sum + (parseFloat(deal.value?.toString() || "0")), 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {activePipeline ? (
                pipelineStages.length > 0 ? (
                  <DragDropContext onDragEnd={onDragEnd}>
                    <div className="max-w-4xl mx-auto">
                      {sortedStages.length > 0 && sortedStages[currentStageIndex] && (() => {
                        const stage = sortedStages[currentStageIndex];
                        const stageDeals = pipelineDeals.filter((deal: Deal) => deal.stageId === stage.id);
                        const stageValue = stageDeals.reduce((sum: number, deal: any) => sum + (parseFloat(deal.value?.toString() || "0")), 0);

                        return (
                          <div className="bg-slate-50 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                              <div>
                                <h4 className="text-xl font-semibold text-slate-900">{stage.title}</h4>
                                <p className="text-sm text-slate-600 mt-1">
                                  {stageDeals.length} deals • {formatCurrency(stageValue)}
                                </p>
                              </div>
                              <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                                <Plus className="h-5 w-5" />
                              </Button>
                            </div>

                            <Droppable droppableId={stage.id.toString()}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[400px] ${
                                    snapshot.isDraggingOver ? 'bg-blue-50 rounded-md p-4' : ''
                                  }`}
                                >
                                  {stageDeals.map((deal: Deal, index: number) => (
                                    <Draggable
                                      key={deal.id}
                                      draggableId={deal.id.toString()}
                                      index={index}
                                    >
                                      {(provided, snapshot) => (
                                        <Card
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className={`cursor-grab active:cursor-grabbing transition-all ${
                                            snapshot.isDragging ? 'shadow-lg rotate-3 scale-105' : 'hover:shadow-md'
                                          }`}
                                        >
                                          <CardContent className="p-4">
                                            <div className="space-y-3">
                                              <div className="flex items-start justify-between">
                                                <h5 className="font-medium text-sm text-slate-900 line-clamp-2 flex-1 pr-2">
                                                  {deal.title}
                                                </h5>
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0">
                                                  <MoreVertical className="h-3 w-3" />
                                                </Button>
                                              </div>
                                              
                                              <div className="flex items-center justify-between">
                                                <span className="font-semibold text-green-600">
                                                  {formatCurrency(deal.value || 0)}
                                                </span>
                                                <Badge variant="outline" className="text-xs">
                                                  {deal.probability || 0}%
                                                </Badge>
                                              </div>
                                              
                                              <div className="text-xs text-slate-600">
                                                {getContactName(deal.contactId || 0)}
                                              </div>
                                              
                                              {deal.expectedCloseDate && (
                                                <div className="text-xs text-slate-500">
                                                  Due: {new Date(deal.expectedCloseDate).toLocaleDateString()}
                                                </div>
                                              )}
                                            </div>
                                          </CardContent>
                                        </Card>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                  {stageDeals.length === 0 && (
                                    <div className="col-span-full text-center py-12">
                                      <p className="text-slate-500">No deals in this stage</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </Droppable>
                          </div>
                        );
                      })()}
                    </div>
                  </DragDropContext>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-slate-400 mb-4">
                      <GitBranch className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-600 mb-2">
                      No Stages Available
                    </h3>
                    <p className="text-slate-500">
                      This pipeline doesn't have any stages configured yet.
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <div className="text-slate-400 mb-4">
                    <GitBranch className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-600 mb-2">
                    No Pipeline Selected
                  </h3>
                  <p className="text-slate-500">
                    Please select a pipeline to view and manage deals.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
    </MainLayout>
  );
}