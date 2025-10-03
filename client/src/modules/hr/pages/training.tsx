import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Plus, Play, Users, Calendar, Clock, Award, Eye, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface TrainingProgram {
  id: number;
  title: string;
  description: string;
  category: string;
  duration: number; // in hours
  enrolledCount: number;
  completedCount: number;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  instructor: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

interface TrainingEnrollment {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  programId: number;
  programTitle: string;
  enrolledDate: string;
  completedDate?: string;
  progress: number;
  status: 'enrolled' | 'in_progress' | 'completed' | 'cancelled';
  score?: number;
  certificateIssued: boolean;
}

export default function TrainingPage() {
  const [selectedTab, setSelectedTab] = useState<'programs' | 'enrollments' | 'certificates'>('programs');
  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [programForm, setProgramForm] = useState({
    title: '',
    description: '',
    category: '',
    duration: '',
    instructor: '',
    level: ''
  });
  const [enrollForm, setEnrollForm] = useState({
    employeeId: '',
    programId: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['/api/hr/training/programs'],
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['/api/hr/training/enrollments'],
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['/api/hr/employees'],
  });

  const { data: trainingStats } = useQuery({
    queryKey: ['/api/hr/training/stats'],
  });

  const createProgramMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/hr/training/programs', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/training/programs'] });
      setIsProgramDialogOpen(false);
      resetProgramForm();
      toast({ title: 'Success', description: 'Training program created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const enrollEmployeeMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/hr/training/enrollments', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/training/enrollments'] });
      setIsEnrollDialogOpen(false);
      resetEnrollForm();
      toast({ title: 'Success', description: 'Employee enrolled successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const resetProgramForm = () => {
    setProgramForm({
      title: '',
      description: '',
      category: '',
      duration: '',
      instructor: '',
      level: ''
    });
  };

  const resetEnrollForm = () => {
    setEnrollForm({
      employeeId: '',
      programId: ''
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
      archived: { color: 'bg-red-100 text-red-800', label: 'Archived' },
      enrolled: { color: 'bg-blue-100 text-blue-800', label: 'Enrolled' },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { color: 'bg-gray-100 text-gray-800', label: status };
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getLevelBadge = (level: string) => {
    const levelColors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={levelColors[level as keyof typeof levelColors] || 'bg-gray-100 text-gray-800'}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Training & Development</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
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
          <h1 className="text-2xl font-bold">Training & Development</h1>
          <p className="text-muted-foreground">Manage employee training programs and development</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isProgramDialogOpen} onOpenChange={setIsProgramDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Program
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Training Program</DialogTitle>
                <DialogDescription>Add a new training program to your catalog</DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createProgramMutation.mutate(programForm); }}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Program Title</Label>
                    <Input
                      id="title"
                      value={programForm.title}
                      onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={programForm.description}
                      onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={programForm.category} onValueChange={(value) => setProgramForm({ ...programForm, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">Technical Skills</SelectItem>
                          <SelectItem value="leadership">Leadership</SelectItem>
                          <SelectItem value="communication">Communication</SelectItem>
                          <SelectItem value="compliance">Compliance</SelectItem>
                          <SelectItem value="safety">Safety</SelectItem>
                          <SelectItem value="soft-skills">Soft Skills</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="level">Level</Label>
                      <Select value={programForm.level} onValueChange={(value) => setProgramForm({ ...programForm, level: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (hours)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        value={programForm.duration}
                        onChange={(e) => setProgramForm({ ...programForm, duration: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instructor">Instructor</Label>
                      <Input
                        id="instructor"
                        value={programForm.instructor}
                        onChange={(e) => setProgramForm({ ...programForm, instructor: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsProgramDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createProgramMutation.isPending}>
                    Create Program
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Enroll Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enroll Employee</DialogTitle>
                <DialogDescription>Enroll an employee in a training program</DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); enrollEmployeeMutation.mutate(enrollForm); }}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee">Employee</Label>
                    <Select value={enrollForm.employeeId} onValueChange={(value) => setEnrollForm({ ...enrollForm, employeeId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee: any) => (
                          <SelectItem key={employee.id} value={employee.id.toString()}>
                            {employee.name} - {employee.department}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="program">Training Program</Label>
                    <Select value={enrollForm.programId} onValueChange={(value) => setEnrollForm({ ...enrollForm, programId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select program" />
                      </SelectTrigger>
                      <SelectContent>
                        {programs.filter((p: TrainingProgram) => p.status === 'active').map((program: TrainingProgram) => (
                          <SelectItem key={program.id} value={program.id.toString()}>
                            {program.title} ({program.duration}h)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEnrollDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={enrollEmployeeMutation.isPending}>
                    Enroll Employee
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Training Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <BookOpen className="h-4 w-4 inline mr-2" />
              Active Programs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainingStats?.activePrograms || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Training programs</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Users className="h-4 w-4 inline mr-2" />
              Total Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainingStats?.totalEnrollments || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">This year</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Award className="h-4 w-4 inline mr-2" />
              Completions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainingStats?.completions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {trainingStats?.completionRate || 0}% completion rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Clock className="h-4 w-4 inline mr-2" />
              Training Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainingStats?.totalHours || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">This year</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b">
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            selectedTab === 'programs'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setSelectedTab('programs')}
        >
          Training Programs
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            selectedTab === 'enrollments'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setSelectedTab('enrollments')}
        >
          Enrollments
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            selectedTab === 'certificates'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setSelectedTab('certificates')}
        >
          Certificates
        </button>
      </div>

      {/* Tab Content */}
      {selectedTab === 'programs' && (
        <Card>
          <CardHeader>
            <CardTitle>Training Programs</CardTitle>
            <CardDescription>Manage your training program catalog</CardDescription>
          </CardHeader>
          <CardContent>
            {programs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No training programs found.</p>
                <p className="text-sm mt-2">Create your first training program to get started.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Program</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Enrolled</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {programs.map((program: TrainingProgram) => (
                      <TableRow key={program.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{program.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {program.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{program.category}</Badge>
                        </TableCell>
                        <TableCell>{getLevelBadge(program.level)}</TableCell>
                        <TableCell>{program.duration}h</TableCell>
                        <TableCell>{program.instructor}</TableCell>
                        <TableCell>{program.enrolledCount}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>{program.completedCount}</span>
                            <div className="text-sm text-muted-foreground">
                              ({program.enrolledCount > 0 ? Math.round((program.completedCount / program.enrolledCount) * 100) : 0}%)
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(program.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedTab === 'enrollments' && (
        <Card>
          <CardHeader>
            <CardTitle>Training Enrollments</CardTitle>
            <CardDescription>Employee training enrollments and progress</CardDescription>
          </CardHeader>
          <CardContent>
            {enrollments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No enrollments found.</p>
                <p className="text-sm mt-2">Enroll employees in training programs to get started.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Enrolled Date</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Certificate</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((enrollment: TrainingEnrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-medium">{enrollment.employeeName}</TableCell>
                        <TableCell>{enrollment.department}</TableCell>
                        <TableCell>{enrollment.programTitle}</TableCell>
                        <TableCell>{format(new Date(enrollment.enrolledDate), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress value={enrollment.progress} className="w-16" />
                            <span className="text-sm">{enrollment.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                        <TableCell>
                          {enrollment.score ? (
                            <div className="flex items-center">
                              {enrollment.score}%
                              {enrollment.score >= 80 && <Award className="h-4 w-4 ml-1 text-yellow-500" />}
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {enrollment.certificateIssued ? (
                            <Badge className="bg-green-100 text-green-800">Issued</Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedTab === 'certificates' && (
        <Card>
          <CardHeader>
            <CardTitle>Training Certificates</CardTitle>
            <CardDescription>Issued training certificates and achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Certificate management coming soon.</p>
              <p className="text-sm mt-2">View and manage issued training certificates.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}