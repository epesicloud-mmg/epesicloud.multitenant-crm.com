import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Brain, TrendingUp, AlertTriangle, Target, Lightbulb, Zap, Sparkles, X } from "lucide-react";

interface AIInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'recommendation' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  suggestedActions?: string[];
}

interface DashboardAIData {
  insights: AIInsight[];
  predictions: {
    revenue: {
      nextMonth: number;
      nextQuarter: number;
      confidence: number;
    };
    deals: {
      likelyToClose: any[];
      atRisk: any[];
    };
    opportunities: {
      highValue: string[];
      quickWins: string[];
    };
  };
  intelligentSummary: string;
}

interface AIDashboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIDashboardModal({ open, onOpenChange }: AIDashboardModalProps) {
  const { data: aiInsights, isLoading: aiLoading, refetch: refetchAI } = useQuery<DashboardAIData>({
    queryKey: ['/api/ai/dashboard-insights'],
    enabled: open, // Only fetch when modal is open
    refetchInterval: open ? 30000 : false, // Only auto-refresh when modal is open
  });

  const { data: deals } = useQuery({
    queryKey: ['/api/deals'],
    enabled: open,
  });

  const { data: dealStages } = useQuery({
    queryKey: ['/api/deal-stages'],
    enabled: open,
  });

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'risk': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'recommendation': return <Lightbulb className="h-4 w-4 text-blue-600" />;
      case 'prediction': return <Target className="h-4 w-4 text-purple-600" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Process deals data for charts
  const revenueData = deals ? dealStages?.map((stage: any) => ({
    name: stage.name,
    revenue: deals.filter((deal: any) => deal.stageId === stage.id)
      .reduce((sum: number, deal: any) => sum + parseFloat(deal.value), 0)
  })) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-auto" aria-describedby="ai-dashboard-description">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Brain className="h-6 w-6 mr-2 text-blue-600" />
            AI-Powered Dashboard
          </DialogTitle>
        </DialogHeader>
        <div id="ai-dashboard-description" className="sr-only">
          Comprehensive AI analysis of your CRM data with intelligent insights and predictions
        </div>
        
        <div className="space-y-6">
          {/* AI Executive Summary */}
          <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Brain className="h-5 w-5 text-blue-600 mr-2" />
              <CardTitle className="text-lg font-semibold text-blue-900">AI Executive Summary</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-auto"
                onClick={() => refetchAI()}
                disabled={aiLoading}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                {aiLoading ? 'Analyzing...' : 'Refresh AI'}
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 leading-relaxed">
                {aiInsights?.intelligentSummary || "AI is analyzing your CRM data to provide intelligent insights..."}
              </p>
            </CardContent>
          </Card>

          {/* AI Predictions Row */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                  Next Month Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">
                  ${(aiInsights?.predictions.revenue.nextMonth || 0).toLocaleString()}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Progress 
                    value={(aiInsights?.predictions.revenue.confidence || 0) * 100} 
                    className="flex-1 h-2" 
                  />
                  <span className="text-xs text-muted-foreground">
                    {((aiInsights?.predictions.revenue.confidence || 0) * 100).toFixed(0)}% confidence
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Target className="h-4 w-4 mr-2 text-purple-600" />
                  Next Quarter Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-700">
                  ${(aiInsights?.predictions.revenue.nextQuarter || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  AI-powered projection
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-orange-600" />
                  Quick Wins Available
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-700">
                  {aiInsights?.predictions.opportunities.quickWins.length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Immediate opportunities
                </p>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights and Revenue Chart */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-blue-600" />
                  AI Insights & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-80 overflow-y-auto">
                {aiInsights?.insights?.slice(0, 4).map((insight) => (
                  <div key={insight.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getInsightIcon(insight.type)}
                        <span className="font-medium text-sm">{insight.title}</span>
                      </div>
                      <Badge className={getPriorityColor(insight.priority)}>
                        {insight.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      <Progress value={insight.confidence * 100} className="flex-1 h-2 mr-2" />
                      <span className="text-xs text-muted-foreground">
                        {(insight.confidence * 100).toFixed(0)}% confident
                      </span>
                    </div>
                    {insight.suggestedActions && insight.suggestedActions.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs font-medium text-gray-700 mb-1">Suggested Actions:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {insight.suggestedActions.map((action, index) => (
                            <li key={index} className="flex items-center">
                              <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )) || (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">AI is analyzing your data...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Stage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Bar dataKey="revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Deal Intelligence */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-green-700">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Likely to Close
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {aiInsights?.predictions.deals.likelyToClose?.slice(0, 3).map((deal) => (
                    <div key={deal.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <p className="font-medium text-sm">{deal.title}</p>
                        <p className="text-xs text-gray-600">${parseFloat(deal.value).toLocaleString()}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">High Probability</Badge>
                    </div>
                  )) || (
                    <p className="text-sm text-gray-500 text-center py-4">No deals identified yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-red-700">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  At-Risk Deals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {aiInsights?.predictions.deals.atRisk?.slice(0, 3).map((deal) => (
                    <div key={deal.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div>
                        <p className="font-medium text-sm">{deal.title}</p>
                        <p className="text-xs text-gray-600">${parseFloat(deal.value).toLocaleString()}</p>
                      </div>
                      <Badge className="bg-red-100 text-red-800">Needs Attention</Badge>
                    </div>
                  )) || (
                    <p className="text-sm text-gray-500 text-center py-4">No at-risk deals identified</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}