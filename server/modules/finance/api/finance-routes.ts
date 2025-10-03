import { Router } from "express";
import { db } from "../../../db";
import { 
  invoices, 
  invoiceItems, 
  expenses, 
  expenseCategories, 
  payments, 
  customers, 
  vendors,
  accounts,
  accountCategories,
  budgets,
  budgetItems,
  transactions,
  transactionLines,
  insertInvoiceSchema,
  insertInvoiceItemSchema,
  insertExpenseSchema,
  insertExpenseCategorySchema,
  insertPaymentSchema,
  insertCustomerSchema,
  insertVendorSchema,
  insertAccountSchema,
  insertAccountCategorySchema,
  insertBudgetSchema,
  insertBudgetItemSchema,
  insertTransactionSchema,
  insertTransactionLineSchema
} from "../../../../shared/schema";
import { eq, desc, and, sum, count, sql } from "drizzle-orm";
import { z } from "zod";

const financeRouter = Router();

// Middleware for tenant ID (using mock for development)
function getTenantId(req: any) {
  return parseInt(req.headers['x-tenant-id'] || '1');
}

// Health check
financeRouter.get("/health", (req, res) => {
  res.json({
    module: "Finance",
    status: "healthy",
    timestamp: new Date().toISOString(),
    features: ["invoicing", "expenses", "reporting", "budgeting", "payments", "chart-of-accounts"]
  });
});

// Finance dashboard stats
financeRouter.get("/stats", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    
    // Get real stats from database
    const [invoiceStats] = await db
      .select({
        totalRevenue: sum(invoices.totalAmount),
        outstandingCount: count(invoices.id)
      })
      .from(invoices)
      .where(and(
        eq(invoices.tenantId, tenantId),
        eq(invoices.status, 'sent')
      ));

    const [expenseStats] = await db
      .select({
        totalExpenses: sum(expenses.amount)
      })
      .from(expenses)
      .where(and(
        eq(expenses.tenantId, tenantId),
        sql`EXTRACT(MONTH FROM expense_date) = EXTRACT(MONTH FROM CURRENT_DATE)`
      ));

    const stats = {
      totalRevenue: Number(invoiceStats?.totalRevenue || 0),
      outstandingInvoices: invoiceStats?.outstandingCount || 0,
      monthlyExpenses: Number(expenseStats?.totalExpenses || 0),
      profitMargin: 73, // Calculate based on revenue - expenses
      revenueGrowth: 20.1,
      expenseGrowth: 5.2
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Finance stats error:', error);
    res.status(500).json({ error: "Failed to fetch finance stats" });
  }
});

// CUSTOMERS API
financeRouter.get("/customers", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const customerList = await db
      .select()
      .from(customers)
      .where(eq(customers.tenantId, tenantId))
      .orderBy(desc(customers.createdAt));
    
    res.json(customerList);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

financeRouter.post("/customers", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const validatedData = insertCustomerSchema.parse({
      ...req.body,
      tenantId,
      customerNumber: `CUST-${Date.now()}`
    });
    
    const [newCustomer] = await db
      .insert(customers)
      .values(validatedData)
      .returning();
    
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(400).json({ error: "Failed to create customer" });
  }
});

// VENDORS API
financeRouter.get("/vendors", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const vendorList = await db
      .select()
      .from(vendors)
      .where(eq(vendors.tenantId, tenantId))
      .orderBy(desc(vendors.createdAt));
    
    res.json(vendorList);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch vendors" });
  }
});

financeRouter.post("/vendors", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const validatedData = insertVendorSchema.parse({
      ...req.body,
      tenantId,
      vendorNumber: `VEND-${Date.now()}`
    });
    
    const [newVendor] = await db
      .insert(vendors)
      .values(validatedData)
      .returning();
    
    res.status(201).json(newVendor);
  } catch (error) {
    res.status(400).json({ error: "Failed to create vendor" });
  }
});

// INVOICES API
financeRouter.get("/invoices", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const invoiceList = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        customerId: invoices.customerId,
        status: invoices.status,
        issueDate: invoices.issueDate,
        dueDate: invoices.dueDate,
        totalAmount: invoices.totalAmount,
        currency: invoices.currency,
        customer: {
          id: customers.id,
          customerNumber: customers.customerNumber,
          contactId: customers.contactId
        }
      })
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .where(eq(invoices.tenantId, tenantId))
      .orderBy(desc(invoices.createdAt));
    
    res.json(invoiceList);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

financeRouter.post("/invoices", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const validatedData = insertInvoiceSchema.parse({
      ...req.body,
      tenantId,
      invoiceNumber: `INV-${Date.now()}`
    });
    
    const [newInvoice] = await db
      .insert(invoices)
      .values(validatedData)
      .returning();
    
    res.status(201).json(newInvoice);
  } catch (error) {
    res.status(400).json({ error: "Failed to create invoice" });
  }
});

// EXPENSES API
financeRouter.get("/expenses", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const expenseList = await db
      .select({
        id: expenses.id,
        expenseNumber: expenses.expenseNumber,
        description: expenses.description,
        amount: expenses.amount,
        currency: expenses.currency,
        expenseDate: expenses.expenseDate,
        status: expenses.status,
        paymentMethod: expenses.paymentMethod,
        category: {
          id: expenseCategories.id,
          name: expenseCategories.name
        },
        vendor: {
          id: vendors.id,
          name: vendors.name
        }
      })
      .from(expenses)
      .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
      .leftJoin(vendors, eq(expenses.vendorId, vendors.id))
      .where(eq(expenses.tenantId, tenantId))
      .orderBy(desc(expenses.createdAt));
    
    res.json(expenseList);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

financeRouter.post("/expenses", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const validatedData = insertExpenseSchema.parse({
      ...req.body,
      tenantId,
      expenseNumber: `EXP-${Date.now()}`
    });
    
    const [newExpense] = await db
      .insert(expenses)
      .values(validatedData)
      .returning();
    
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(400).json({ error: "Failed to create expense" });
  }
});

// EXPENSE CATEGORIES API
financeRouter.get("/expense-categories", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const categories = await db
      .select()
      .from(expenseCategories)
      .where(eq(expenseCategories.tenantId, tenantId))
      .orderBy(expenseCategories.name);
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch expense categories" });
  }
});

financeRouter.post("/expense-categories", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const validatedData = insertExpenseCategorySchema.parse({
      ...req.body,
      tenantId
    });
    
    const [newCategory] = await db
      .insert(expenseCategories)
      .values(validatedData)
      .returning();
    
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ error: "Failed to create expense category" });
  }
});

// PAYMENTS API
financeRouter.get("/payments", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const paymentList = await db
      .select({
        id: payments.id,
        paymentNumber: payments.paymentNumber,
        amount: payments.amount,
        currency: payments.currency,
        paymentDate: payments.paymentDate,
        paymentMethod: payments.paymentMethod,
        reference: payments.reference,
        status: payments.status,
        invoice: {
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber
        },
        customer: {
          id: customers.id,
          customerNumber: customers.customerNumber
        }
      })
      .from(payments)
      .leftJoin(invoices, eq(payments.invoiceId, invoices.id))
      .leftJoin(customers, eq(payments.customerId, customers.id))
      .where(eq(payments.tenantId, tenantId))
      .orderBy(desc(payments.createdAt));
    
    res.json(paymentList);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

financeRouter.post("/payments", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const validatedData = insertPaymentSchema.parse({
      ...req.body,
      tenantId,
      paymentNumber: `PAY-${Date.now()}`
    });
    
    const [newPayment] = await db
      .insert(payments)
      .values(validatedData)
      .returning();
    
    res.status(201).json(newPayment);
  } catch (error) {
    res.status(400).json({ error: "Failed to create payment" });
  }
});

// CHART OF ACCOUNTS API
financeRouter.get("/accounts", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const accountList = await db
      .select({
        id: accounts.id,
        code: accounts.code,
        name: accounts.name,
        balance: accounts.balance,
        isActive: accounts.isActive,
        description: accounts.description,
        category: {
          id: accountCategories.id,
          name: accountCategories.name,
          type: accountCategories.type
        }
      })
      .from(accounts)
      .leftJoin(accountCategories, eq(accounts.categoryId, accountCategories.id))
      .where(eq(accounts.tenantId, tenantId))
      .orderBy(accounts.code);
    
    res.json(accountList);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chart of accounts" });
  }
});

financeRouter.get("/account-categories", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const categories = await db
      .select()
      .from(accountCategories)
      .where(eq(accountCategories.tenantId, tenantId))
      .orderBy(accountCategories.name);
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch account categories" });
  }
});

// BUDGETS API
financeRouter.get("/budgets", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const budgetList = await db
      .select()
      .from(budgets)
      .where(eq(budgets.tenantId, tenantId))
      .orderBy(desc(budgets.year));
    
    res.json(budgetList);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch budgets" });
  }
});

financeRouter.post("/budgets", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const validatedData = insertBudgetSchema.parse({
      ...req.body,
      tenantId
    });
    
    const [newBudget] = await db
      .insert(budgets)
      .values(validatedData)
      .returning();
    
    res.status(201).json(newBudget);
  } catch (error) {
    res.status(400).json({ error: "Failed to create budget" });
  }
});

// FINANCIAL REPORTS API
financeRouter.get("/reports/profit-loss", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const { startDate, endDate } = req.query;
    
    // Get revenue from invoices
    const [revenueResult] = await db
      .select({
        totalRevenue: sum(invoices.totalAmount)
      })
      .from(invoices)
      .where(and(
        eq(invoices.tenantId, tenantId),
        eq(invoices.status, 'paid')
      ));

    // Get expenses
    const [expenseResult] = await db
      .select({
        totalExpenses: sum(expenses.amount)
      })
      .from(expenses)
      .where(and(
        eq(expenses.tenantId, tenantId),
        eq(expenses.status, 'paid')
      ));

    const revenue = Number(revenueResult?.totalRevenue || 0);
    const expensesTotal = Number(expenseResult?.totalExpenses || 0);
    const netIncome = revenue - expensesTotal;

    res.json({
      period: { startDate, endDate },
      revenue,
      expenses: expensesTotal,
      netIncome,
      profitMargin: revenue > 0 ? (netIncome / revenue) * 100 : 0
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate P&L report" });
  }
});

financeRouter.get("/reports/cash-flow", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    
    // Cash inflows (payments received)
    const [inflowResult] = await db
      .select({
        totalInflow: sum(payments.amount)
      })
      .from(payments)
      .where(and(
        eq(payments.tenantId, tenantId),
        eq(payments.status, 'completed')
      ));

    // Cash outflows (expenses paid)
    const [outflowResult] = await db
      .select({
        totalOutflow: sum(expenses.amount)
      })
      .from(expenses)
      .where(and(
        eq(expenses.tenantId, tenantId),
        eq(expenses.status, 'paid')
      ));

    const inflow = Number(inflowResult?.totalInflow || 0);
    const outflow = Number(outflowResult?.totalOutflow || 0);
    const netCashFlow = inflow - outflow;

    res.json({
      cashInflow: inflow,
      cashOutflow: outflow,
      netCashFlow
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate cash flow report" });
  }
});

export default financeRouter;