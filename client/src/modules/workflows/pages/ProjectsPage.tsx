import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Users, MoreHorizontal } from 'lucide-react';

export default function ProjectsPage() {
  const projects = [
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website with modern design',
      status: 'in-progress',
      progress: 75,
      dueDate: '2024-09-15',
      teamSize: 5,
      priority: 'high'
    },
    {
      id: 2,
      name: 'Mobile App Development',
      description: 'Native iOS and Android application development',
      status: 'in-progress',
      progress: 45,
      dueDate: '2024-10-30',
      teamSize: 8,
      priority: 'medium'
    },
    {
      id: 3,
      name: 'API Integration',
      description: 'Third-party API integration for enhanced functionality',
      status: 'review',
      progress: 90,
      dueDate: '2024-08-20',
      teamSize: 3,
      priority: 'high'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Projects</h2>
          <p className="text-slate-600 dark:text-slate-400">Manage and track your projects</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold">{project.name}</CardTitle>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {project.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <Badge className={getStatusColor(project.status)}>
                  {project.status.replace('-', ' ')}
                </Badge>
                <Badge className={getPriorityColor(project.priority)}>
                  {project.priority}
                </Badge>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <div className="flex items-center text-slate-600 dark:text-slate-400">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(project.dueDate).toLocaleDateString()}
                </div>
                <div className="flex items-center text-slate-600 dark:text-slate-400">
                  <Users className="w-4 h-4 mr-1" />
                  {project.teamSize} members
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}