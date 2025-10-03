import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, MoreVertical, GitBranch, DollarSign, Target, Users } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Deal, Contact, SalesPipeline } from "@shared/schema";

// Deal stage type
type DealStage = {
  id: number;
  salePipelineId: number;
  title: string;
  description: string;
  order: number;
  tenantId: number;
};

export default function Pipelines() {
  const [selectedPipelineId, setSelectedPipelineId] = useState<number>(1);
  const [currentWorkspace] = useState("sales-operations");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data queries
  const { data: pipelines = [] as SalesPipeline[] } = useQuery({
    queryKey: ["/api/sales-pipelines"],
  });

  const { data: dealStages = [] as DealStage[] } = useQuery({
    queryKey: ["/api/deal-stages"],
  });

  const { data: deals = [] as Deal[], isLoading: dealsLoading } = useQuery({
    queryKey: ["/api/deals"],
  });

  const { data: contacts = [] as Contact[] } = useQuery({
    queryKey: ["/api/contacts"],
  });

  // Update deal stage mutation
  const updateDealMutation = useMutation({
    mutationFn: async (data: { id: number; stageId: number }) => {
      return apiRequest("PUT", `/api/deals/${data.id}`, { stageId: data.stageId });
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

  // Get stages for the selected pipeline, sorted by order
  const pipelineStages = dealStages
    .filter(stage => stage.salePipelineId === selectedPipelineId)
    .sort((a, b) => a.order - b.order);

  // Filter deals by pipeline stages
  const pipelineDeals = deals.filter(deal => 
    pipelineStages.some(stage => stage.id === deal.stageId)
  );

  // Handle drag and drop
  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const dealId = parseInt(draggableId);
    const newStageId = parseInt(destination.droppableId);

    updateDealMutation.mutate({ id: dealId, stageId: newStageId });
  };

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(numValue);
  };

  const getContactName = (contactId: number) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact ? `${contact.firstName} ${contact.lastName}` : 'No contact';
  };

  const handleWorkspaceChange = (workspace: string) => {
    // Handle workspace change
  };

  // Calculate stage metrics
  const getStageMetrics = (stageId: number) => {
    const stageDeals = pipelineDeals.filter(deal => deal.stageId === stageId);
    const stageValue = stageDeals.reduce((sum, deal) => sum + parseFloat(deal.value), 0);
    return { count: stageDeals.length, value: stageValue, deals: stageDeals };
  };

  const totalPipelineValue = pipelineDeals.reduce((sum, deal) => sum + parseFloat(deal.value), 0);

  return (
    <MainLayout 
      showWorkspaceSelector={true} 
      currentWorkspace={currentWorkspace}
      onWorkspaceChange={handleWorkspaceChange}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <GitBranch className="w-4 h-4 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Sales Pipeline</h1>
              </div>

              {pipelines.length > 1 && (
                <Select value={selectedPipelineId.toString()} onValueChange={(value) => setSelectedPipelineId(parseInt(value))}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select pipeline" />
                  </SelectTrigger>
                  <SelectContent>
                    {pipelines.map((pipeline) => (
                      <SelectItem key={pipeline.id} value={pipeline.id.toString()}>
                        {pipeline.title}
                        {pipeline.isDefault && (
                          <Badge variant="secondary" className="ml-2">Default</Badge>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-600">
                <span className="font-medium">{pipelineDeals.length}</span> deals • 
                <span className="font-medium text-green-600 ml-1">{formatCurrency(totalPipelineValue)}</span>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Deal
              </Button>
            </div>
          </div>
        </div>

        {/* Pipeline Content */}
        <div className="flex-1 overflow-hidden">
          {dealsLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600">Loading pipeline...</p>
              </div>
            </div>
          ) : pipelineStages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <GitBranch className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No Pipeline Stages</h3>
                <p className="text-slate-500">Configure stages for this pipeline to get started.</p>
              </div>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="h-full overflow-x-auto">
                <div className="flex space-x-6 p-6 min-w-max h-full">
                  {pipelineStages.map((stage) => {
                    const metrics = getStageMetrics(stage.id);
                    
                    return (
                      <div key={stage.id} className="flex-shrink-0 w-80">
                        {/* Stage Header */}
                        <div className="bg-slate-50 rounded-t-lg p-4 border-x border-t">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-slate-900">{stage.title}</h3>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">
                              {metrics.count} deals
                            </span>
                            <span className="font-medium text-green-600">
                              {formatCurrency(metrics.value)}
                            </span>
                          </div>
                        </div>

                        {/* Stage Column */}
                        <Droppable droppableId={stage.id.toString()}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`min-h-[600px] bg-slate-25 border-x border-b rounded-b-lg p-4 space-y-3 ${
                                snapshot.isDraggingOver ? 'bg-blue-50 border-blue-200' : 'bg-slate-25'
                              }`}
                            >
                              {metrics.deals.map((deal, index) => (
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
                                        snapshot.isDragging ? 'shadow-lg rotate-1 scale-105' : 'hover:shadow-md'
                                      }`}
                                    >
                                      <CardContent className="p-4">
                                        <div className="space-y-3">
                                          {/* Deal Header */}
                                          <div className="flex items-start justify-between">
                                            <h4 className="font-medium text-sm text-slate-900 line-clamp-2 flex-1 pr-2">
                                              {deal.title}
                                            </h4>
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0">
                                              <MoreVertical className="h-3 w-3" />
                                            </Button>
                                          </div>
                                          
                                          {/* Deal Value */}
                                          <div className="flex items-center justify-between">
                                            <span className="font-semibold text-green-600 text-lg">
                                              {formatCurrency(deal.value)}
                                            </span>
                                            <Badge variant="outline" className="text-xs">
                                              {deal.probability || 50}%
                                            </Badge>
                                          </div>
                                          
                                          {/* Contact */}
                                          <div className="flex items-center space-x-2 text-xs text-slate-600">
                                            <Users className="w-3 h-3" />
                                            <span>{getContactName(deal.contactId || 0)}</span>
                                          </div>
                                          
                                          {/* Expected Close Date */}
                                          {deal.expectedCloseDate && (
                                            <div className="flex items-center space-x-2 text-xs text-slate-500">
                                              <Target className="w-3 h-3" />
                                              <span>
                                                Due: {new Date(deal.expectedCloseDate).toLocaleDateString()}
                                              </span>
                                            </div>
                                          )}

                                          {/* Notes Preview */}
                                          {deal.notes && (
                                            <div className="text-xs text-slate-500 line-clamp-2">
                                              {deal.notes}
                                            </div>
                                          )}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                              
                              {/* Empty State */}
                              {metrics.deals.length === 0 && (
                                <div className="flex items-center justify-center py-12 text-center">
                                  <div>
                                    <DollarSign className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-sm text-slate-500">No deals in this stage</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    );
                  })}
                </div>
              </div>
            </DragDropContext>
          )}
        </div>
      </div>
    </MainLayout>
  );
}