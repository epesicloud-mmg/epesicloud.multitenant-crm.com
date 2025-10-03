import React from 'react';
import { Route, Switch } from 'wouter';
import { FinanceLayout } from './components/finance-layout';

// Financial management pages
import FinanceDashboard from './pages/finance-dashboard-clean';
import InvoicesPage from './pages/invoices';
import PaymentsPage from './pages/payments';
import ExpensesPage from './pages/expenses';
import BudgetPage from './pages/budget';


// Enhanced finance pages
import TransactionsPage from './pages/transactions-simple';
import BillsPage from './pages/bills-new';
import CreditNotesPage from './pages/credit-notes-new';
import ChartOfAccountsPage from './pages/chart-of-accounts-new';
import BankAccountsPage from './pages/bank-accounts-new';
import FinancialReportsPage from './pages/financial-reports-new';

export function FinanceModule() {
  return (
    <FinanceLayout>
      <Switch>
        <Route path="/finance" component={FinanceDashboard} />
        <Route path="/finance/dashboard" component={FinanceDashboard} />
        
        {/* Core Finance Operations */}
        <Route path="/finance/transactions" component={TransactionsPage} />
        <Route path="/finance/invoices" component={InvoicesPage} />
        <Route path="/finance/payments" component={PaymentsPage} />
        <Route path="/finance/bills" component={BillsPage} />
        <Route path="/finance/credit-notes" component={CreditNotesPage} />
        
        {/* Financial Management */}
        <Route path="/finance/expenses" component={ExpensesPage} />
        <Route path="/finance/budget" component={BudgetPage} />
        <Route path="/finance/chart-of-accounts" component={ChartOfAccountsPage} />
        <Route path="/finance/bank-accounts" component={BankAccountsPage} />
        
        {/* Reports */}
        <Route path="/finance/reports" component={FinancialReportsPage} />
        <Route path="/finance/transaction-trail" component={FinancialReportsPage} />
        

        
        {/* Default fallback */}
        <Route component={FinanceDashboard} />
      </Switch>
    </FinanceLayout>
  );
}