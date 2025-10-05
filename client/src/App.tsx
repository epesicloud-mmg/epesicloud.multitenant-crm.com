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

// Pages
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import CRMDashboard from "@/modules/crm/pages/crm-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* CRM Application Routes (Protected) */}
      <Route path="/crm" component={CRMDashboard} nest />
      
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
