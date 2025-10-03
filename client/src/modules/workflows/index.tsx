import React from 'react';
import { Route } from 'wouter';
import WorkflowsLayout from './layouts/WorkflowsLayout';
import WorkflowsDashboard from './pages/WorkflowsDashboard';
import ProjectsPage from './pages/ProjectsPage';
import TasksPage from './pages/TasksPage';
import WorkflowsPage from './pages/WorkflowsPage';

export default function WorkflowsModule() {
  return (
    <WorkflowsLayout>
      <Route path="/workflows" component={WorkflowsDashboard} />
      <Route path="/workflows/projects" component={ProjectsPage} />
      <Route path="/workflows/tasks" component={TasksPage} />
      <Route path="/workflows/workflows" component={WorkflowsPage} />
    </WorkflowsLayout>
  );
}