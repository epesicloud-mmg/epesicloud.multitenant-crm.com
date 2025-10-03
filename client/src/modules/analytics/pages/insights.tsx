import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, Brain, Zap, Target, Users } from 'lucide-react';

export default function InsightsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: insights, isLoading } = useQuery({
    queryKey: ['/api/analytics/insights'],
  });

  const mockInsights = [
    {
      id: 1,
      title: 'Revenue Growth Opportunity',
      description: 'Enterprise customers show 45% higher lifetime value. Focus sales efforts on this segment.',
      category: 'revenue',
      priority: 'high',
      impact: 'high',
      confidence: 92,
      generatedAt: '2024-01-15T10:30:00Z',
      actionable: true,
      tags: ['sales', 'enterprise', 'growth']
    },
    {
      id: 2,
      title: 'User Engagement Pattern',
      description: 'Users who complete onboarding within first 24 hours have 3x higher retention.',
      category: 'user_experience',
      priority: 'medium',
      impact: 'high',
      confidence: 87,
      generatedAt: '2024-01-15T09:15:00Z',
      actionable: true,
      tags: ['onboarding', 'retention', 'ux']
    },
    {
      id: 3,
      title: 'Cost Optimization Alert',
      description: 'Server costs increased 23% last month due to inefficient queries in user analytics module.',
      category: 'operational',
      priority: 'high',
      impact: 'medium',
      confidence: 95,
      generatedAt: '2024-01-15T08:45:00Z',
      actionable: true,
      tags: ['costs', 'performance', 'optimization']
    },
    {
      id: 4,
      title: 'Market Trend Analysis',
      description: 'Industry adoption of AI features increased 67% this quarter. Consider accelerating AI roadmap.',
      category: 'market',
      priority: 'medium',
      impact: 'high',
      confidence: 78,
      generatedAt: '2024-01-15T07:20:00Z',
      actionable: false,
      tags: ['ai', 'market-trends', 'strategy']
    },
    {
      id: 5,
      title: 'Customer Support Efficiency',
      description: 'Response time improved 34% after implementing chatbot. Consider expanding to more use cases.',
      category: 'customer_success',
      priority: 'low',
      impact: 'medium',
      confidence: 89,
      generatedAt: '2024-01-14T16:10:00Z',
      actionable: true,
      tags: ['support', 'automation', 'efficiency']
    }
  ];

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: { color: 'bg-red-100 text-red-800', label: 'High Priority' },
      medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium Priority' },
      low: { color: 'bg-green-100 text-green-800', label: 'Low Priority' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || 
                   { color: 'bg-gray-100 text-gray-800', label: priority };
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getImpactBadge = (impact: string) => {
    const impactConfig = {
      high: { color: 'bg-purple-100 text-purple-800', label: 'High Impact' },
      medium: { color: 'bg-blue-100 text-blue-800', label: 'Medium Impact' },
      low: { color: 'bg-gray-100 text-gray-800', label: 'Low Impact' }
    };
    
    const config = impactConfig[impact as keyof typeof impactConfig] || 
                   { color: 'bg-gray-100 text-gray-800', label: impact };
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      revenue: TrendingUp,
      user_experience: Users,
      operational: AlertTriangle,
      market: Target,
      customer_success: CheckCircle
    };
    
    const Icon = icons[category as keyof typeof icons] || Lightbulb;
    return <Icon className="h-5 w-5" />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Business Insights</h1>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI-Powered Business Insights</h1>
          <p className="text-muted-foreground">Discover actionable insights from your business data</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Brain className="h-4 w-4 mr-2" />
            Generate New Insights
          </Button>
        </div>
      </div>

      {/* Insights Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Lightbulb className="h-4 w-4 inline mr-2" />
              Total Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockInsights.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Generated this week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Zap className="h-4 w-4 inline mr-2" />
              Actionable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockInsights.filter(i => i.actionable).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Require immediate action</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              High Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockInsights.filter(i => i.priority === 'high').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Need immediate attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <CheckCircle className="h-4 w-4 inline mr-2" />
              Avg Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(mockInsights.reduce((sum, i) => sum + i.confidence, 0) / mockInsights.length)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">AI confidence score</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All Insights
            </Button>
            <Button
              variant={selectedCategory === 'revenue' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('revenue')}
            >
              Revenue
            </Button>
            <Button
              variant={selectedCategory === 'user_experience' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('user_experience')}
            >
              User Experience
            </Button>
            <Button
              variant={selectedCategory === 'operational' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('operational')}
            >
              Operational
            </Button>
            <Button
              variant={selectedCategory === 'market' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('market')}
            >
              Market
            </Button>
            <Button
              variant={selectedCategory === 'customer_success' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('customer_success')}
            >
              Customer Success
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Insights List */}
      <div className="space-y-4">
        {mockInsights
          .filter(insight => selectedCategory === 'all' || insight.category === selectedCategory)
          .map((insight) => (
            <Card key={insight.id} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {getCategoryIcon(insight.category)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {insight.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className={`text-sm font-medium ${getConfidenceColor(insight.confidence)}`}>
                      {insight.confidence}% confidence
                    </div>
                    {insight.actionable && (
                      <Badge className="bg-green-100 text-green-800">
                        <Zap className="h-3 w-3 mr-1" />
                        Actionable
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getPriorityBadge(insight.priority)}
                    {getImpactBadge(insight.impact)}
                    <div className="flex flex-wrap gap-1">
                      {insight.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Generated {new Date(insight.generatedAt).toLocaleDateString()}
                  </div>
                </div>
                
                {insight.actionable && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-blue-900">
                        Recommended Action
                      </div>
                      <Button size="sm" variant="outline">
                        Take Action
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
      </div>

      {mockInsights.filter(insight => selectedCategory === 'all' || insight.category === selectedCategory).length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No insights found for the selected category.</p>
            <p className="text-sm mt-2">Try selecting a different category or generate new insights.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}