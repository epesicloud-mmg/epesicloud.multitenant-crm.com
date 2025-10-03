import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Clock, Calendar as CalendarIcon, Users, TrendingUp, CheckCircle, XCircle, AlertTriangle, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  totalHours?: number;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';
  notes?: string;
}

interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  appliedDate: string;
}

export default function AttendancePage() {
  const [selectedTab, setSelectedTab] = useState<'attendance' | 'leaves' | 'reports'>('attendance');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [attendanceForm, setAttendanceForm] = useState({
    employeeId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    clockIn: '',
    clockOut: '',
    status: '',
    notes: ''
  });
  const [leaveForm, setLeaveForm] = useState({
    employeeId: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ['/api/hr/attendance', format(selectedDate, 'yyyy-MM-dd')],
  });

  const { data: leaveRequests = [] } = useQuery({
    queryKey: ['/api/hr/leave-requests'],
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['/api/hr/employees'],
  });

  const { data: attendanceStats } = useQuery({
    queryKey: ['/api/hr/attendance/stats'],
  });

  const recordAttendanceMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/hr/attendance', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/attendance'] });
      setIsAttendanceDialogOpen(false);
      resetAttendanceForm();
      toast({ title: 'Success', description: 'Attendance recorded successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const submitLeaveRequestMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/hr/leave-requests', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/leave-requests'] });
      setIsLeaveDialogOpen(false);
      resetLeaveForm();
      toast({ title: 'Success', description: 'Leave request submitted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const approveLeaveRequestMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      apiRequest(`/api/hr/leave-requests/${id}/status`, { method: 'PUT', body: { status } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/leave-requests'] });
      toast({ title: 'Success', description: 'Leave request updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const resetAttendanceForm = () => {
    setAttendanceForm({
      employeeId: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      clockIn: '',
      clockOut: '',
      status: '',
      notes: ''
    });
  };

  const resetLeaveForm = () => {
    setLeaveForm({
      employeeId: '',
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: ''
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      present: { color: 'bg-green-100 text-green-800', label: 'Present', icon: CheckCircle },
      absent: { color: 'bg-red-100 text-red-800', label: 'Absent', icon: XCircle },
      late: { color: 'bg-yellow-100 text-yellow-800', label: 'Late', icon: AlertTriangle },
      half_day: { color: 'bg-blue-100 text-blue-800', label: 'Half Day', icon: Clock },
      on_leave: { color: 'bg-purple-100 text-purple-800', label: 'On Leave', icon: CalendarIcon },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { color: 'bg-gray-100 text-gray-800', label: status };
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const calculateHours = (clockIn: string, clockOut: string) => {
    if (!clockIn || !clockOut) return 0;
    const start = new Date(`1970-01-01T${clockIn}:00`);
    const end = new Date(`1970-01-01T${clockOut}:00`);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Attendance Management</h1>
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
          <h1 className="text-2xl font-bold">Attendance Management</h1>
          <p className="text-muted-foreground">Track employee attendance and manage leave requests</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Record Attendance
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Attendance</DialogTitle>
                <DialogDescription>Record attendance for an employee</DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); recordAttendanceMutation.mutate(attendanceForm); }}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee">Employee</Label>
                    <Select value={attendanceForm.employeeId} onValueChange={(value) => setAttendanceForm({ ...attendanceForm, employeeId: value })}>
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
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={attendanceForm.date}
                      onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clockIn">Clock In</Label>
                      <Input
                        id="clockIn"
                        type="time"
                        value={attendanceForm.clockIn}
                        onChange={(e) => setAttendanceForm({ ...attendanceForm, clockIn: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clockOut">Clock Out</Label>
                      <Input
                        id="clockOut"
                        type="time"
                        value={attendanceForm.clockOut}
                        onChange={(e) => setAttendanceForm({ ...attendanceForm, clockOut: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={attendanceForm.status} onValueChange={(value) => setAttendanceForm({ ...attendanceForm, status: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                        <SelectItem value="half_day">Half Day</SelectItem>
                        <SelectItem value="on_leave">On Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      placeholder="Optional notes"
                      value={attendanceForm.notes}
                      onChange={(e) => setAttendanceForm({ ...attendanceForm, notes: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAttendanceDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={recordAttendanceMutation.isPending}>
                    Record Attendance
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Leave Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Leave Request</DialogTitle>
                <DialogDescription>Submit a new leave request for an employee</DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); submitLeaveRequestMutation.mutate(leaveForm); }}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="leaveEmployee">Employee</Label>
                    <Select value={leaveForm.employeeId} onValueChange={(value) => setLeaveForm({ ...leaveForm, employeeId: value })}>
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
                    <Label htmlFor="leaveType">Leave Type</Label>
                    <Select value={leaveForm.leaveType} onValueChange={(value) => setLeaveForm({ ...leaveForm, leaveType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="annual">Annual Leave</SelectItem>
                        <SelectItem value="sick">Sick Leave</SelectItem>
                        <SelectItem value="personal">Personal Leave</SelectItem>
                        <SelectItem value="maternity">Maternity Leave</SelectItem>
                        <SelectItem value="paternity">Paternity Leave</SelectItem>
                        <SelectItem value="emergency">Emergency Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={leaveForm.startDate}
                        onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={leaveForm.endDate}
                        onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Input
                      id="reason"
                      placeholder="Reason for leave"
                      value={leaveForm.reason}
                      onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsLeaveDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitLeaveRequestMutation.isPending}>
                    Submit Request
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Attendance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <CheckCircle className="h-4 w-4 inline mr-2" />
              Present Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats?.presentToday || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {attendanceStats?.attendanceRate || 0}% attendance rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <XCircle className="h-4 w-4 inline mr-2" />
              Absent Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats?.absentToday || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Employees absent</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <CalendarIcon className="h-4 w-4 inline mr-2" />
              On Leave
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats?.onLeave || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Employees on leave</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Clock className="h-4 w-4 inline mr-2" />
              Average Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats?.averageHours || 0}h</div>
            <p className="text-xs text-muted-foreground mt-1">Per employee today</p>
          </CardContent>
        </Card>
      </div>

      {/* Date Selector */}
      <div className="flex items-center space-x-4">
        <Label>Select Date:</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <CalendarIcon className="h-4 w-4 mr-2" />
              {format(selectedDate, 'PPP')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b">
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            selectedTab === 'attendance'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setSelectedTab('attendance')}
        >
          Daily Attendance
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            selectedTab === 'leaves'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setSelectedTab('leaves')}
        >
          Leave Requests
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            selectedTab === 'reports'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setSelectedTab('reports')}
        >
          Reports
        </button>
      </div>

      {/* Tab Content */}
      {selectedTab === 'attendance' && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Attendance - {format(selectedDate, 'MMMM dd, yyyy')}</CardTitle>
            <CardDescription>Employee attendance records for the selected date</CardDescription>
          </CardHeader>
          <CardContent>
            {attendance.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No attendance records found for this date.</p>
                <p className="text-sm mt-2">Record attendance for employees to get started.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.map((record: AttendanceRecord) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.employeeName}</TableCell>
                        <TableCell>{record.department}</TableCell>
                        <TableCell>{record.clockIn || '-'}</TableCell>
                        <TableCell>{record.clockOut || '-'}</TableCell>
                        <TableCell>
                          {record.totalHours ? `${record.totalHours.toFixed(1)}h` : 
                           (record.clockIn && record.clockOut) ? 
                           `${calculateHours(record.clockIn, record.clockOut).toFixed(1)}h` : '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell>{record.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedTab === 'leaves' && (
        <Card>
          <CardHeader>
            <CardTitle>Leave Requests</CardTitle>
            <CardDescription>Employee leave requests and approvals</CardDescription>
          </CardHeader>
          <CardContent>
            {leaveRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No leave requests found.</p>
                <p className="text-sm mt-2">Submit leave requests to get started.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveRequests.map((request: LeaveRequest) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.employeeName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{request.leaveType}</Badge>
                        </TableCell>
                        <TableCell>{format(new Date(request.startDate), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{format(new Date(request.endDate), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{request.days}</TableCell>
                        <TableCell>{request.reason}</TableCell>
                        <TableCell>{format(new Date(request.appliedDate), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-right">
                          {request.status === 'pending' && (
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => approveLeaveRequestMutation.mutate({ id: request.id, status: 'approved' })}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => approveLeaveRequestMutation.mutate({ id: request.id, status: 'rejected' })}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
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

      {selectedTab === 'reports' && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance Reports</CardTitle>
            <CardDescription>Comprehensive attendance analytics and reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Attendance reporting coming soon.</p>
              <p className="text-sm mt-2">Generate detailed attendance reports and analytics.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}