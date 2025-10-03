import { lazy, Suspense } from 'react';
import { Route, Switch } from 'wouter';
import { HRLayout } from './layouts/hr-layout';

// Lazy load HR pages for better performance
const HRDashboard = lazy(() => import('./pages/dashboard').then(m => ({ default: m.HRDashboard })));
const EmployeesPage = lazy(() => import('./pages/employees').then(m => ({ default: m.EmployeesPage })));
const LeaveRequestsPage = lazy(() => import('./pages/leave-requests').then(m => ({ default: m.LeaveRequestsPage })));
const DepartmentsPage = lazy(() => import('./pages/departments'));
const PayrollPage = lazy(() => import('./pages/payroll'));
const PerformancePage = lazy(() => import('./pages/performance'));
const TrainingPage = lazy(() => import('./pages/training'));
const AttendancePage = lazy(() => import('./pages/attendance'));

// Loading component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

export function HRModule() {
  return (
    <HRLayout>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/hr" component={HRDashboard} />
          <Route path="/hr/employees" component={EmployeesPage} />
          <Route path="/hr/leave-requests" component={LeaveRequestsPage} />
          
          {/* Complete HR feature routes */}
          <Route path="/hr/departments" component={DepartmentsPage} />
          <Route path="/hr/payroll" component={PayrollPage} />
          <Route path="/hr/performance" component={PerformancePage} />
          <Route path="/hr/training" component={TrainingPage} />
          <Route path="/hr/attendance" component={AttendancePage} />
          
          <Route>
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
              <p className="text-gray-600">The requested HR page was not found.</p>
            </div>
          </Route>
        </Switch>
      </Suspense>
    </HRLayout>
  );
}