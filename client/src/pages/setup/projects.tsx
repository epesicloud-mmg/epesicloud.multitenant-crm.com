import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Target, Plus, Edit, Trash2, Building, Users, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock project schema since we don't have it in shared/schema yet
const projectFormSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  status: z.enum(["active", "inactive", "completed", "on-hold"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.coerce.number().min(0).optional(),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

// Mock project type
interface Project {
  id: number;
  name: string;
  description?: string;
  status: "active" | "inactive" | "completed" | "on-hold";
  priority: "low" | "medium" | "high" | "critical";
  startDate?: string;
  endDate?: string;
  budget?: number;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsSetup() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [currentWorkspace, setCurrentWorkspace] = useState('sales-operations');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleWorkspaceChange = (workspace: string) => {
    setCurrentWorkspace(workspace);
  };

  // Mock data for projects
  const mockProjects: Project[] = [
    {
      id: 1,
      name: "CRM Implementation",
      description: "Implementation of new CRM system for sales team",
      status: "active",
      priority: "high",
      startDate: "2024-01-01",
      endDate: "2024-06-30",
      budget: 50000,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z"
    },
    {
      id: 2,
      name: "Website Redesign",
      description: "Complete redesign of company website",
      status: "active",
      priority: "medium",
      startDate: "2024-02-01",
      endDate: "2024-04-30",
      budget: 25000,
      createdAt: "2024-02-01T00:00:00Z",
      updatedAt: "2024-02-10T00:00:00Z"
    },
    {
      id: 3,
      name: "Marketing Campaign Q1",
      description: "Q1 marketing campaign for new product launch",
      status: "completed",
      priority: "high",
      startDate: "2024-01-01",
      endDate: "2024-03-31",
      budget: 75000,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-03-31T00:00:00Z"
    }
  ];

  const { data: projects = mockProjects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/setup/projects"],
    queryFn: () => Promise.resolve(mockProjects), // Using mock data
  });

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "active",
      priority: "medium",
      startDate: "",
      endDate: "",
      budget: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      // Mock creation
      console.log("Creating project with data:", data);
      return Promise.resolve({ id: Date.now(), ...data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/setup/projects"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Project created successfully",
      });
    },
    onError: (error) => {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      if (!editingProject) throw new Error("No project to update");
      // Mock update
      console.log("Updating project with data:", data);
      return Promise.resolve({ ...editingProject, ...data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/setup/projects"] });
      setEditingProject(null);
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Project updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      // Mock deletion
      console.log("Deleting project with id:", id);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/setup/projects"] });
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    if (editingProject) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    form.reset({
      name: project.name,
      description: project.description || "",
      status: project.status,
      priority: project.priority,
      startDate: project.startDate || "",
      endDate: project.endDate || "",
      budget: project.budget || 0,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleNewProject = () => {
    setEditingProject(null);
    form.reset({
      name: "",
      description: "",
      status: "active",
      priority: "medium",
      startDate: "",
      endDate: "",
      budget: 0,
    });
    setIsDialogOpen(true);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "completed": return "secondary";
      case "on-hold": return "outline";
      case "inactive": return "destructive";
      default: return "secondary";
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "critical": return "destructive";
      case "high": return "default";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "secondary";
    }
  };

  const filteredProjects = projects?.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <MainLayout 
        showWorkspaceSelector={true} 
        currentWorkspace={currentWorkspace}
        onWorkspaceChange={handleWorkspaceChange}
      >
        <div className="p-6">Loading projects...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      showWorkspaceSelector={true} 
      currentWorkspace={currentWorkspace}
      onWorkspaceChange={handleWorkspaceChange}
    >
      <div className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          {/* Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Projects Setup</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Manage your projects and track progress
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search projects..."
                    className="w-64 pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={handleNewProject}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(project)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(project.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {project.description && (
                        <p className="text-sm text-slate-600">{project.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusVariant(project.status)}>
                          {project.status}
                        </Badge>
                        <Badge variant={getPriorityVariant(project.priority)}>
                          {project.priority}
                        </Badge>
                      </div>

                      {project.budget && (
                        <div className="flex items-center text-sm text-slate-600">
                          <span className="font-medium">Budget: ${project.budget.toLocaleString()}</span>
                        </div>
                      )}

                      {(project.startDate || project.endDate) && (
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          {project.startDate && (
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>{new Date(project.startDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          {project.endDate && (
                            <div className="flex items-center">
                              <span>→ {new Date(project.endDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No projects found</h3>
                <p className="text-slate-600 mb-4">
                  {searchTerm ? "No projects match your search." : "Get started by creating your first project."}
                </p>
                {!searchTerm && (
                  <Button onClick={handleNewProject}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Project Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? "Edit Project" : "New Project"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter project name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="on-hold">On Hold</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter project description"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingProject ? "Update" : "Create"} Project
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}