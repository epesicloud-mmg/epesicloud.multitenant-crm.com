import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TenantProvider } from "@/lib/tenant-context";
import { PermissionsProvider } from "@/lib/permissions-context";
import { AuthProvider } from "@/lib/auth-context";
import { MultiChatFloatingAIOrb } from "@/components/ai/multi-chat-floating-ai-orb";
import { PageTrackingProvider } from "@/hooks/use-page-tracking";

// Module Selector and Module Components
import ModuleSelector from "@/pages/module-selector";
import CRMDashboard from "@/modules/crm/pages/crm-dashboard";
import { FinanceModule } from "@/modules/finance";
import { HRModule } from "@/modules/hr";
import { AAMModule } from "@/modules/aam";
import { AnalyticsModule } from "@/modules/analytics";
import WorkflowsModule from "@/modules/workflows";
import NotFound from "@/pages/not-found";
import DataManager from "@/pages/DataManager";

function Router() {
  return (
    <Switch>
      {/* Module Selector - Landing Page */}
      <Route path="/" component={ModuleSelector} />
      
      {/* CRM Module Routes */}
      <Route path="/crm" component={CRMDashboard} />
      <Route path="/crm/:rest*" component={CRMDashboard} />
      
      {/* Finance Module Routes */}
      <Route path="/finance" component={FinanceModule} />
      <Route path="/finance/:rest*" component={FinanceModule} />
      
      {/* Workflows Module Routes */}
      <Route path="/workflows" component={WorkflowsModule} />
      <Route path="/workflows/:rest*" component={WorkflowsModule} />
      
      {/* HR Module Routes */}
      <Route path="/hr" component={HRModule} />
      <Route path="/hr/:rest*" component={HRModule} />
      
      {/* Analytics Module Routes */}
      <Route path="/analytics" component={AnalyticsModule} />
      <Route path="/analytics/:rest*" component={AnalyticsModule} />
      
      {/* AAM Module Routes */}
      <Route path="/aam" component={AAMModule} />
      <Route path="/aam/:rest*" component={AAMModule} />
      
      {/* Data Manager */}
      <Route path="/data-manager" component={DataManager} />
      
      {/* 404 Not Found */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TenantProvider>
          <AuthProvider>
            <PermissionsProvider>
              <PageTrackingProvider>
                <Router />
                <MultiChatFloatingAIOrb />
                <Toaster />
              </PageTrackingProvider>
            </PermissionsProvider>
          </AuthProvider>
        </TenantProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
