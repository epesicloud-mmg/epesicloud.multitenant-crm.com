import { FinanceSidebar } from "./finance-sidebar";
import { FinanceTopBar } from "./finance-topbar";

interface FinanceLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function FinanceLayout({ children, title }: FinanceLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <FinanceSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <FinanceTopBar title={title || "Finance Dashboard"} />
        <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900">
          {children}
        </main>
      </div>
    </div>
  );
}