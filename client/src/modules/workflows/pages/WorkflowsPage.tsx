import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Play, Pause, Settings, Activity } from 'lucide-react';

export default function WorkflowsPage() {
  const workflows = [
    {
      id: 1,
      name: 'Project Onboarding',
      description: 'Automated workflow for new project setup and team assignment',
      status: 'active',
      triggers: 3,
      executions: 47,
      lastRun: '2024-08-11T10:30:00Z'
    },
    {
      id: 2,
      name: 'Task Assignment',
      description: 'Automatically assign tasks based on team member availability',
      status: 'active',
      triggers: 8,
      executions: 156,
      lastRun: '2024-08-11T14:15:00Z'
    },
    {
      id: 3,
      name: 'Progress Reporting',
      description: 'Weekly progress reports sent to stakeholders',
      status: 'paused',
      triggers: 1,
      executions: 24,
      lastRun: '2024-08-04T09:00:00Z'
    },
    {
      id: 4,
      name: 'Deadline Alerts',
      description: 'Send notifications when tasks are approaching deadlines',
      status: 'active',
      triggers: 5,
      executions: 89,
      lastRun: '2024-08-11T16:45:00Z'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Workflows</h2>
          <p className="text-slate-600 dark:text-slate-400">Automate your business processes</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-semibold mb-1">
                    {workflow.name}
                  </CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {workflow.description}
                  </p>
                </div>
                <Badge className={getStatusColor(workflow.status)}>
                  {workflow.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {workflow.triggers}
                  </div>
                  <div className="text-xs text-slate-500">Triggers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {workflow.executions}
                  </div>
                  <div className="text-xs text-slate-500">Executions</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {new Date(workflow.lastRun).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-slate-500">Last Run</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex space-x-2">
                  {workflow.status === 'active' ? (
                    <Button variant="outline" size="sm">
                      <Pause className="w-4 h-4 mr-1" />
                      Pause
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm">
                      <Play className="w-4 h-4 mr-1" />
                      Resume
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-1" />
                    Configure
                  </Button>
                </div>
                
                <Button variant="ghost" size="sm">
                  <Activity className="w-4 h-4 mr-1" />
                  View Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}