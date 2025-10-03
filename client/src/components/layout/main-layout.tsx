import { Sidebar } from "./sidebar";
import { TopBar } from "./topbar";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  showWorkspaceSelector?: boolean;
  currentWorkspace?: string;
  onWorkspaceChange?: (workspace: string) => void;
  onNewContact?: () => void;
}

export function MainLayout({ 
  children, 
  title, 
  showWorkspaceSelector = false,
  currentWorkspace,
  onWorkspaceChange,
  onNewContact 
}: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title={title || "Dashboard"}
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