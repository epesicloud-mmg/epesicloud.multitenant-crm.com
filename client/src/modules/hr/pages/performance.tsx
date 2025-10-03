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
import { Star, TrendingUp, Users, Target, Plus, Eye, Edit, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface PerformanceReview {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  reviewPeriod: string;
  overallScore: number;
  goals: number;
  competencies: number;
  feedback: string;
  status: 'draft' | 'submitted' | 'completed' | 'approved';
  reviewDate: string;
  nextReviewDate: string;
  managerId: number;
  managerName: string;
}

interface Goal {
  id: number;
  employeeId: number;
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  category: 'performance' | 'development' | 'project';
}

export default function PerformancePage() {
  const [selectedTab, setSelectedTab] = useState<'reviews' | 'goals' | 'analytics'>('reviews');
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    employeeId: '',
    reviewPeriod: '',
    overallScore: '',
    goals: '',
    competencies: '',
    feedback: '',
    nextReviewDate: ''
  });
  const [goalForm, setGoalForm] = useState({
    employeeId: '',
    title: '',
    description: '',
    targetDate: '',
    category: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['/api/hr/performance/reviews'],
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['/api/hr/performance/goals'],
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['/api/hr/employees'],
  });

  const { data: performanceStats } = useQuery({
    queryKey: ['/api/hr/performance/stats'],
  });

  const createReviewMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/hr/performance/reviews', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/performance/reviews'] });
      setIsReviewDialogOpen(false);
      resetReviewForm();
      toast({ title: 'Success', description: 'Performance review created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const createGoalMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/hr/performance/goals', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/performance/goals'] });
      setIsGoalDialogOpen(false);
      resetGoalForm();
      toast({ title: 'Success', description: 'Goal created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const resetReviewForm = () => {
    setReviewForm({
      employeeId: '',
      reviewPeriod: '',
      overallScore: '',
      goals: '',
      competencies: '',
      feedback: '',
      nextReviewDate: ''
    });
  };

  const resetGoalForm = () => {
    setGoalForm({
      employeeId: '',
      title: '',
      description: '',
      targetDate: '',
      category: ''
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      submitted: { color: 'bg-blue-100 text-blue-800', label: 'Submitted' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      not_started: { color: 'bg-gray-100 text-gray-800', label: 'Not Started' },
      in_progress: { color: 'bg-blue-100 text-blue-800', label: 'In Progress' },
      overdue: { color: 'bg-red-100 text-red-800', label: 'Overdue' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { color: 'bg-gray-100 text-gray-800', label: status };
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-blue-600';
    if (score >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderStarRating = (score: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= score
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className={`ml-2 font-medium ${getScoreColor(score)}`}>
          {score.toFixed(1)}
        </span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Performance Management</h1>
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
          <h1 className="text-2xl font-bold">Performance Management</h1>
          <p className="text-muted-foreground">Track employee performance, reviews, and goals</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Review
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Performance Review</DialogTitle>
                <DialogDescription>Conduct a performance review for an employee</DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createReviewMutation.mutate(reviewForm); }}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employee">Employee</Label>
                      <Select value={reviewForm.employeeId} onValueChange={(value) => setReviewForm({ ...reviewForm, employeeId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((employee: any) => (
                            <SelectItem key={employee.id} value={employee.id.toString()}>
                              {employee.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reviewPeriod">Review Period</Label>
                      <Input
                        id="reviewPeriod"
                        placeholder="e.g., Q1 2024"
                        value={reviewForm.reviewPeriod}
                        onChange={(e) => setReviewForm({ ...reviewForm, reviewPeriod: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="overallScore">Overall Score (1-5)</Label>
                      <Input
                        id="overallScore"
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={reviewForm.overallScore}
                        onChange={(e) => setReviewForm({ ...reviewForm, overallScore: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goals">Goals Score (1-5)</Label>
                      <Input
                        id="goals"
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={reviewForm.goals}
                        onChange={(e) => setReviewForm({ ...reviewForm, goals: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="competencies">Competencies Score (1-5)</Label>
                      <Input
                        id="competencies"
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={reviewForm.competencies}
                        onChange={(e) => setReviewForm({ ...reviewForm, competencies: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feedback">Feedback</Label>
                    <Textarea
                      id="feedback"
                      placeholder="Provide detailed feedback..."
                      value={reviewForm.feedback}
                      onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nextReviewDate">Next Review Date</Label>
                    <Input
                      id="nextReviewDate"
                      type="date"
                      value={reviewForm.nextReviewDate}
                      onChange={(e) => setReviewForm({ ...reviewForm, nextReviewDate: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createReviewMutation.isPending}>
                    Create Review
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Target className="h-4 w-4 mr-2" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Goal</DialogTitle>
                <DialogDescription>Set a new goal for an employee</DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createGoalMutation.mutate(goalForm); }}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="goalEmployee">Employee</Label>
                    <Select value={goalForm.employeeId} onValueChange={(value) => setGoalForm({ ...goalForm, employeeId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee: any) => (
                          <SelectItem key={employee.id} value={employee.id.toString()}>
                            {employee.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Goal Title</Label>
                    <Input
                      id="title"
                      value={goalForm.title}
                      onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={goalForm.description}
                      onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={goalForm.category} onValueChange={(value) => setGoalForm({ ...goalForm, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="performance">Performance</SelectItem>
                          <SelectItem value="development">Development</SelectItem>
                          <SelectItem value="project">Project</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="targetDate">Target Date</Label>
                      <Input
                        id="targetDate"
                        type="date"
                        value={goalForm.targetDate}
                        onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsGoalDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createGoalMutation.isPending}>
                    Create Goal
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <TrendingUp className="h-4 w-4 inline mr-2" />
              Average Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceStats?.averageScore ? performanceStats.averageScore.toFixed(1) : '0.0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Out of 5.0</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Users className="h-4 w-4 inline mr-2" />
              Reviews This Quarter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceStats?.reviewsThisQuarter || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed reviews</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Target className="h-4 w-4 inline mr-2" />
              Active Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceStats?.activeGoals || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">In progress</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Calendar className="h-4 w-4 inline mr-2" />
              Overdue Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{performanceStats?.overdueReviews || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b">
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            selectedTab === 'reviews'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setSelectedTab('reviews')}
        >
          Performance Reviews
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            selectedTab === 'goals'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setSelectedTab('goals')}
        >
          Goals & Objectives
        </button>
      </div>

      {/* Tab Content */}
      {selectedTab === 'reviews' && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Reviews</CardTitle>
            <CardDescription>Employee performance reviews and evaluations</CardDescription>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No performance reviews found.</p>
                <p className="text-sm mt-2">Create your first performance review to get started.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Overall Score</TableHead>
                      <TableHead>Goals</TableHead>
                      <TableHead>Competencies</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Review Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((review: PerformanceReview) => (
                      <TableRow key={review.id}>
                        <TableCell className="font-medium">{review.employeeName}</TableCell>
                        <TableCell>{review.department}</TableCell>
                        <TableCell>{review.reviewPeriod}</TableCell>
                        <TableCell>{renderStarRating(review.overallScore)}</TableCell>
                        <TableCell>{renderStarRating(review.goals)}</TableCell>
                        <TableCell>{renderStarRating(review.competencies)}</TableCell>
                        <TableCell>{getStatusBadge(review.status)}</TableCell>
                        <TableCell>{format(new Date(review.reviewDate), 'MMM dd, yyyy')}</TableCell>
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

      {selectedTab === 'goals' && (
        <Card>
          <CardHeader>
            <CardTitle>Goals & Objectives</CardTitle>
            <CardDescription>Employee goals and progress tracking</CardDescription>
          </CardHeader>
          <CardContent>
            {goals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No goals found.</p>
                <p className="text-sm mt-2">Set your first goal to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map((goal: Goal) => (
                  <Card key={goal.id} className="border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium">{goal.title}</h3>
                            {getStatusBadge(goal.status)}
                            <Badge variant="outline">{goal.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
                          <div className="flex items-center space-x-4">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">Progress</span>
                                <span className="text-sm text-muted-foreground">{goal.progress}%</span>
                              </div>
                              <Progress value={goal.progress} className="h-2" />
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Due: {format(new Date(goal.targetDate), 'MMM dd, yyyy')}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}