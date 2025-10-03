import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, MessageCircle, TrendingUp, Users, Zap, Brain } from 'lucide-react';

export default function CRMAssistantsPage() {
  const assistants = [
    {
      id: 1,
      name: 'Deal Assistant',
      description: 'AI-powered deal analysis and recommendations',
      icon: TrendingUp,
      status: 'active',
      color: 'bg-green-100 text-green-600',
      interactions: 248
    },
    {
      id: 2,
      name: 'Lead Qualifier',
      description: 'Automatically qualify and score incoming leads',
      icon: Users,
      status: 'active',
      color: 'bg-blue-100 text-blue-600',
      interactions: 156
    },
    {
      id: 3,
      name: 'Sales Coach',
      description: 'Personalized sales coaching and tips',
      icon: Brain,
      status: 'beta',
      color: 'bg-purple-100 text-purple-600',
      interactions: 89
    },
    {
      id: 4,
      name: 'Activity Optimizer',
      description: 'Optimize your daily activities for better results',
      icon: Zap,
      status: 'active',
      color: 'bg-orange-100 text-orange-600',
      interactions: 203
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">CRM Assistants</h1>
          <p className="text-muted-foreground">AI-powered tools to enhance your CRM workflow</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Assistants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assistants.filter(a => a.status === 'active').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assistants.reduce((sum, a) => sum + a.interactions, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-muted-foreground">New interactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">User satisfaction</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assistants.map((assistant) => {
          const Icon = assistant.icon;
          return (
            <Card key={assistant.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${assistant.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge variant={assistant.status === 'active' ? 'default' : 'secondary'}>
                    {assistant.status}
                  </Badge>
                </div>
                <div>
                  <CardTitle className="text-lg">{assistant.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{assistant.description}</p>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    <span>{assistant.interactions} interactions</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button className="flex-1">
                    <Bot className="h-4 w-4 mr-2" />
                    Open Assistant
                  </Button>
                  <Button variant="outline" size="icon">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Assistant Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">Deal Assistant analyzed 5 new opportunities</div>
                  <div className="text-sm text-muted-foreground">2 minutes ago</div>
                </div>
              </div>
              <Badge variant="outline">New</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">Lead Qualifier processed 12 new leads</div>
                  <div className="text-sm text-muted-foreground">15 minutes ago</div>
                </div>
              </div>
              <Badge variant="outline">Completed</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Brain className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-medium">Sales Coach provided 3 personalized tips</div>
                  <div className="text-sm text-muted-foreground">1 hour ago</div>
                </div>
              </div>
              <Badge variant="outline">Available</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}