import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, User, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  status: z.string().default("todo"),
  priority: z.string().default("medium"),
  assignee: z.string().min(1, "Assignee is required"),
  dueDate: z.string().min(1, "Due date is required"),
  project: z.string().min(1, "Project is required"),
});

type CreateTaskForm = z.infer<typeof createTaskSchema>;

function CreateTaskDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateTaskForm>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      status: "todo",
      priority: "medium",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: CreateTaskForm) => {
      const response = await apiRequest("/api/workflows/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Id": "1"
        },
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows/tasks"] });
      toast({
        title: "Task Created",
        description: "New task has been created successfully.",
      });
      setOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateTaskForm) => {
    createTaskMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Task
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Task description..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assignee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignee</FormLabel>
                  <FormControl>
                    <Input placeholder="Assignee name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="project"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <FormControl>
                    <Input placeholder="Project name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createTaskMutation.isPending}>
                {createTaskMutation.isPending ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function TasksPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use API data instead of mock data
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["/api/workflows/tasks"],
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/workflows/tasks/${id}`, {
        method: "DELETE",
        headers: {
          "X-Tenant-Id": "1"
        }
      });
      if (!response.ok) throw new Error('Failed to delete task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows/tasks"] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    },
  });

  const mockTasks = [
    {
      id: 1,
      title: 'Design homepage mockups',
      description: 'Create wireframes and mockups for the new homepage design',
      status: 'todo',
      priority: 'high',
      assignee: 'Sarah Johnson',
      dueDate: '2024-08-15',
      project: 'Website Redesign'
    },
    {
      id: 2,
      title: 'Implement user authentication',
      description: 'Set up OAuth and JWT authentication system',
      status: 'in-progress',
      priority: 'high',
      assignee: 'Mike Chen',
      dueDate: '2024-08-18',
      project: 'Mobile App Development'
    },
    {
      id: 3,
      title: 'Database schema optimization',
      description: 'Optimize database queries and indexes for better performance',
      status: 'review',
      priority: 'medium',
      assignee: 'Alex Rodriguez',
      dueDate: '2024-08-12',
      project: 'API Integration'
    },
    {
      id: 4,
      title: 'Write API documentation',
      description: 'Complete documentation for all API endpoints',
      status: 'completed',
      priority: 'medium',
      assignee: 'Emily Davis',
      dueDate: '2024-08-10',
      project: 'API Integration'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
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
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Tasks</h2>
          <p className="text-slate-600 dark:text-slate-400">Track and manage individual tasks</p>
        </div>
        <CreateTaskDialog />
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <Card><CardContent className="p-6 text-center">Loading tasks...</CardContent></Card>
        ) : tasks.length === 0 ? (
          <Card><CardContent className="p-6 text-center">No tasks found. Use mock data as fallback.</CardContent></Card>
        ) : null}
        {(tasks.length > 0 ? tasks : mockTasks).map((task: any) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {task.title}
                    </h3>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace('-', ' ')}
                    </Badge>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                  
                  <p className="text-slate-600 dark:text-slate-400 mb-3">
                    {task.description}
                  </p>
                  
                  <div className="flex items-center space-x-6 text-sm text-slate-500">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {task.assignee}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                    <div className="text-blue-600 font-medium">
                      {task.project}
                    </div>
                  </div>
                </div>
                
                <div className="ml-4 flex items-center space-x-2">
                  {task.status === 'completed' ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <Button variant="outline" size="sm">
                      Update Status
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deleteTaskMutation.mutate(task.id)}
                    disabled={deleteTaskMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}