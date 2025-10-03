import { db } from "./db";
import { roles, ledgerAccounts, bankAccounts } from "@shared/schema";

// Seed specific user roles for finance module
export async function seedSpecificRoles() {
  console.log("🎯 Seeding Finance-Specific User Roles...");

  const specificRoles = [
    {
      name: "Administrator",
      description: "Full system access with all administrative privileges",
      permissions: {
        modules: ["all"],
        actions: ["create", "read", "update", "delete", "admin"],
        financial: ["view_all_transactions", "manage_chart_of_accounts", "reconcile_accounts"]
      }
    },
    {
      name: "Accountant", 
      description: "Full financial management and accounting capabilities",
      permissions: {
        modules: ["finance", "crm"],
        actions: ["create", "read", "update", "delete"],
        financial: ["manage_transactions", "manage_invoices", "manage_bills", "reconcile_accounts", "view_reports"]
      }
    },
    {
      name: "Manager",
      description: "Department management with financial oversight",
      permissions: {
        modules: ["finance", "crm", "hr"],
        actions: ["create", "read", "update"],
        financial: ["view_reports", "approve_expenses", "manage_budgets"]
      }
    },
    {
      name: "Accounts Payable",
      description: "Vendor bill management and payment processing",
      permissions: {
        modules: ["finance"],
        actions: ["create", "read", "update"],
        financial: ["manage_bills", "manage_vendor_payments", "view_payable_reports"]
      }
    },
    {
      name: "Accounts Receivable",
      description: "Customer invoice and payment management",
      permissions: {
        modules: ["finance", "crm"],
        actions: ["create", "read", "update"],
        financial: ["manage_invoices", "manage_customer_payments", "view_receivable_reports"]
      }
    },
    {
      name: "Read-only User",
      description: "View-only access to financial data and reports",
      permissions: {
        modules: ["finance"],
        actions: ["read"],
        financial: ["view_reports", "view_transactions"]
      }
    }
  ];

  for (const role of specificRoles) {
    await db.insert(roles).values({
      name: role.name,
      description: role.description,
      level: 5, // Manager level
      permissions: Object.values(role.permissions.actions),
      modules: role.permissions.modules,
      tenantId: 1 // Default tenant
    }).onConflictDoNothing();
  }

  console.log("✅ Finance roles seeded successfully");
}

// Seed chart of accounts for proper financial tracking
export async function seedChartOfAccounts() {
  console.log("📊 Seeding Chart of Accounts...");

  const accounts = [
    // Assets
    { code: "1000", name: "Cash and Cash Equivalents", type: "asset", parent: null },
    { code: "1100", name: "Accounts Receivable", type: "asset", parent: null },
    { code: "1200", name: "Inventory", type: "asset", parent: null },
    { code: "1500", name: "Equipment", type: "asset", parent: null },
    
    // Liabilities
    { code: "2000", name: "Accounts Payable", type: "liability", parent: null },
    { code: "2100", name: "Accrued Expenses", type: "liability", parent: null },
    { code: "2200", name: "Short-term Loans", type: "liability", parent: null },
    
    // Equity
    { code: "3000", name: "Owner's Equity", type: "equity", parent: null },
    { code: "3100", name: "Retained Earnings", type: "equity", parent: null },
    
    // Income
    { code: "4000", name: "Sales Revenue", type: "income", parent: null },
    { code: "4100", name: "Service Revenue", type: "income", parent: null },
    { code: "4200", name: "Other Income", type: "income", parent: null },
    
    // Expenses
    { code: "5000", name: "Cost of Goods Sold", type: "expense", parent: null },
    { code: "6000", name: "Operating Expenses", type: "expense", parent: null },
    { code: "6100", name: "Office Expenses", type: "expense", parent: null },
    { code: "6200", name: "Travel Expenses", type: "expense", parent: null },
    { code: "6300", name: "Professional Services", type: "expense", parent: null }
  ];

  for (const account of accounts) {
    await db.insert(ledgerAccounts).values({
      accountCode: account.code,
      accountName: account.name,
      accountType: account.type,
      parentAccountId: account.parent,
      tenantId: 1 // Default tenant
    }).onConflictDoNothing();
  }

  console.log("✅ Chart of accounts seeded successfully");
}

// Seed sample bank accounts
export async function seedBankAccounts() {
  console.log("🏦 Seeding Sample Bank Accounts...");

  const bankAccountsData = [
    {
      accountName: "Business Checking Account",
      accountNumber: "****1234",
      bankName: "First National Bank",
      accountType: "checking",
      currency: "USD",
      currentBalance: "25000.00"
    },
    {
      accountName: "Business Savings Account", 
      accountNumber: "****5678",
      bankName: "First National Bank",
      accountType: "savings",
      currency: "USD",
      currentBalance: "75000.00"
    },
    {
      accountName: "Payroll Account",
      accountNumber: "****9012",
      bankName: "Second National Bank", 
      accountType: "checking",
      currency: "USD",
      currentBalance: "50000.00"
    }
  ];

  for (const account of bankAccountsData) {
    await db.insert(bankAccounts).values({
      ...account,
      tenantId: 1 // Default tenant
    }).onConflictDoNothing();
  }

  console.log("✅ Bank accounts seeded successfully");
}

// Main seeding function
export async function seedFinancialData() {
  try {
    await seedSpecificRoles();
    await seedChartOfAccounts();
    await seedBankAccounts();
    console.log("🎉 All financial data seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding financial data:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedFinancialData().then(() => process.exit(0));
}