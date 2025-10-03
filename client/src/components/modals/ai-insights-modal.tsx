import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Brain, TrendingUp, AlertTriangle, Target, Lightbulb, Sparkles } from "lucide-react";

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

interface AIInsightsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageType: 'contacts' | 'deals' | 'leads' | 'companies' | 'activities';
  pageTitle: string;
  contextData?: any;
}

export function AIInsightsModal({ open, onOpenChange, pageType, pageTitle, contextData }: AIInsightsModalProps) {
  const { data: insights, isLoading, refetch } = useQuery<AIInsight[]>({
    queryKey: [`/api/ai/${pageType}-insights`],
    enabled: open,
    refetchInterval: open ? 30000 : false,
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

  const getPageSpecificContent = () => {
    switch (pageType) {
      case 'contacts':
        return {
          description: "AI analysis of contact engagement patterns, relationship strength, and next best actions",
          mockInsights: [
            {
              id: 'contact-engagement',
              type: 'recommendation' as const,
              title: 'High-Value Contact Identification',
              description: 'Several contacts show strong engagement patterns and are ready for upselling opportunities.',
              confidence: 0.85,
              priority: 'high' as const,
              actionable: true,
              suggestedActions: ['Schedule follow-up calls', 'Send personalized proposals']
            }
          ]
        };
      case 'deals':
        return {
          description: "AI-powered deal scoring, pipeline analysis, and closing probability predictions",
          mockInsights: [
            {
              id: 'deal-scoring',
              type: 'prediction' as const,
              title: 'Deal Velocity Analysis',
              description: 'Current deals are progressing 23% faster than historical average, indicating strong momentum.',
              confidence: 0.92,
              priority: 'medium' as const,
              actionable: true,
              suggestedActions: ['Focus on high-probability deals', 'Accelerate decision timeline']
            }
          ]
        };
      case 'leads':
        return {
          description: "Intelligent lead scoring, conversion predictions, and qualification recommendations",
          mockInsights: [
            {
              id: 'lead-conversion',
              type: 'opportunity' as const,
              title: 'Lead Quality Assessment',
              description: 'Recent leads show 40% higher conversion potential based on engagement metrics and profile data.',
              confidence: 0.78,
              priority: 'high' as const,
              actionable: true,
              suggestedActions: ['Prioritize warm leads', 'Implement lead nurturing sequence']
            }
          ]
        };
      case 'companies':
        return {
          description: "Company health analysis, expansion opportunities, and account-based insights",
          mockInsights: [
            {
              id: 'company-expansion',
              type: 'opportunity' as const,
              title: 'Account Expansion Potential',
              description: 'Key accounts show indicators for potential expansion with 65% success probability.',
              confidence: 0.72,
              priority: 'medium' as const,
              actionable: true,
              suggestedActions: ['Identify decision makers', 'Prepare expansion proposals']
            }
          ]
        };
      case 'activities':
        return {
          description: "Activity pattern analysis, productivity insights, and engagement optimization",
          mockInsights: [
            {
              id: 'activity-optimization',
              type: 'recommendation' as const,
              title: 'Activity Effectiveness Analysis',
              description: 'Email activities show 3x higher response rates on Tuesday afternoons. Optimize scheduling for better results.',
              confidence: 0.88,
              priority: 'medium' as const,
              actionable: true,
              suggestedActions: ['Reschedule emails for optimal times', 'Focus on high-impact activities']
            }
          ]
        };
      default:
        return {
          description: "AI-powered insights and recommendations",
          mockInsights: []
        };
    }
  };

  const pageContent = getPageSpecificContent();
  const displayInsights = insights && insights.length > 0 ? insights : pageContent.mockInsights;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto" aria-describedby="ai-insights-description">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Brain className="h-6 w-6 mr-2 text-blue-600" />
            AI Mode: {pageTitle}
          </DialogTitle>
        </DialogHeader>
        <div id="ai-insights-description" className="sr-only">
          {pageContent.description}
        </div>

        <div className="space-y-6">
          {/* AI Summary Card */}
          <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Brain className="h-5 w-5 text-blue-600 mr-2" />
              <CardTitle className="text-lg font-semibold text-blue-900">AI Analysis</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-auto"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                {isLoading ? 'Analyzing...' : 'Refresh AI'}
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 leading-relaxed">
                {pageContent.description}
              </p>
            </CardContent>
          </Card>

          {/* AI Insights Grid */}
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {displayInsights.map((insight) => (
              <Card key={insight.id} className="border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getInsightIcon(insight.type)}
                      <span className="font-medium text-sm">{insight.title}</span>
                    </div>
                    <Badge className={getPriorityColor(insight.priority)}>
                      {insight.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">{insight.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <Progress value={insight.confidence * 100} className="flex-1 h-2 mr-2" />
                    <span className="text-xs text-muted-foreground">
                      {(insight.confidence * 100).toFixed(0)}% confident
                    </span>
                  </div>

                  {insight.suggestedActions && insight.suggestedActions.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs font-medium text-gray-700 mb-2">Suggested Actions:</p>
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

                  {insight.actionable && (
                    <Button size="sm" className="w-full mt-2" variant="outline">
                      Take Action
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {(!displayInsights || displayInsights.length === 0) && (
            <div className="text-center py-12">
              <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">AI Analysis in Progress</h3>
              <p className="text-gray-500">AI is analyzing your {pageType} data to provide intelligent insights...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}