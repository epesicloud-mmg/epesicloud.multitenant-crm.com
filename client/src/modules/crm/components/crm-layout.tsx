import { CRMSidebar } from "./crm-sidebar";
import { TopBar } from "@/components/layout/topbar";

interface CRMLayoutProps {
  children: React.ReactNode;
  title?: string;
  showWorkspaceSelector?: boolean;
  currentWorkspace?: string;
  onWorkspaceChange?: (workspace: string) => void;
  onNewContact?: () => void;
}

export function CRMLayout({ 
  children, 
  title, 
  showWorkspaceSelector = false,
  currentWorkspace,
  onWorkspaceChange,
  onNewContact 
}: CRMLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <CRMSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title={title || "CRM Dashboard"}
          showWorkspaceSelector={showWorkspaceSelector}
          currentWorkspace={currentWorkspace}
          onWorkspaceChange={onWorkspaceChange}
          onNewContact={onNewContact}
        />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}