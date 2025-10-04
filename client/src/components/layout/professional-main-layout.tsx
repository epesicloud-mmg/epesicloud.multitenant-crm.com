import { useState } from "react";
import { ProfessionalSidebar } from "./professional-sidebar";
import { ProfessionalHeader } from "./professional-header";

interface ProfessionalMainLayoutProps {
  children: React.ReactNode;
}

export function ProfessionalMainLayout({ children }: ProfessionalMainLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <ProfessionalSidebar isCollapsed={isSidebarCollapsed} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ProfessionalHeader 
          onToggleSidebar={handleToggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
