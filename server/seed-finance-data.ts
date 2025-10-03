import { db } from "./db";
import { 
  accountCategories, 
  accounts, 
  customers, 
  vendors, 
  expenseCategories, 
  invoices, 
  expenses, 
  payments,
  budgets
} from "../shared/schema";

async function seedFinanceData() {
  console.log("🌱 Seeding finance data...");

  const tenantId = 1; // Default tenant

  try {
    // 1. Seed Account Categories
    console.log("Creating account categories...");
    const accountCategoryData = [
      { name: "Assets", type: "asset", description: "Company assets", tenantId },
      { name: "Liabilities", type: "liability", description: "Company liabilities", tenantId },
      { name: "Equity", type: "equity", description: "Owner's equity", tenantId },
      { name: "Revenue", type: "revenue", description: "Income and revenue", tenantId },
      { name: "Expenses", type: "expense", description: "Operating expenses", tenantId }
    ];

    const createdCategories = await db.insert(accountCategories).values(accountCategoryData).returning();
    console.log(`✅ Created ${createdCategories.length} account categories`);

    // 2. Seed Chart of Accounts
    console.log("Creating chart of accounts...");
    const accountData = [
      { code: "1000", name: "Cash", categoryId: createdCategories[0].id, tenantId, balance: "25000.00" },
      { code: "1100", name: "Accounts Receivable", categoryId: createdCategories[0].id, tenantId, balance: "15000.00" },
      { code: "1200", name: "Inventory", categoryId: createdCategories[0].id, tenantId, balance: "8000.00" },
      { code: "2000", name: "Accounts Payable", categoryId: createdCategories[1].id, tenantId, balance: "5000.00" },
      { code: "2100", name: "Notes Payable", categoryId: createdCategories[1].id, tenantId, balance: "10000.00" },
      { code: "3000", name: "Owner's Equity", categoryId: createdCategories[2].id, tenantId, balance: "33000.00" },
      { code: "4000", name: "Sales Revenue", categoryId: createdCategories[3].id, tenantId, balance: "0.00" },
      { code: "5000", name: "Office Expenses", categoryId: createdCategories[4].id, tenantId, balance: "0.00" },
      { code: "5100", name: "Marketing Expenses", categoryId: createdCategories[4].id, tenantId, balance: "0.00" },
      { code: "5200", name: "Travel Expenses", categoryId: createdCategories[4].id, tenantId, balance: "0.00" }
    ];

    const createdAccounts = await db.insert(accounts).values(accountData).returning();
    console.log(`✅ Created ${createdAccounts.length} accounts`);

    // 3. Seed Customers
    console.log("Creating customers...");
    const customerData = [
      {
        customerNumber: "CUST-001",
        creditLimit: "10000.00",
        paymentTerms: 30,
        currency: "USD",
        billingAddress: { street: "123 Main St", city: "New York", state: "NY", zip: "10001" },
        tenantId
      },
      {
        customerNumber: "CUST-002", 
        creditLimit: "15000.00",
        paymentTerms: 15,
        currency: "USD",
        billingAddress: { street: "456 Oak Ave", city: "Los Angeles", state: "CA", zip: "90210" },
        tenantId
      },
      {
        customerNumber: "CUST-003",
        creditLimit: "5000.00", 
        paymentTerms: 45,
        currency: "USD",
        billingAddress: { street: "789 Pine St", city: "Chicago", state: "IL", zip: "60601" },
        tenantId
      }
    ];

    const createdCustomers = await db.insert(customers).values(customerData).returning();
    console.log(`✅ Created ${createdCustomers.length} customers`);

    // 4. Seed Vendors
    console.log("Creating vendors...");
    const vendorData = [
      {
        name: "Office Supplies Co.",
        vendorNumber: "VEND-001",
        email: "orders@officesupplies.com",
        phone: "(555) 123-4567",
        paymentTerms: 30,
        currency: "USD",
        address: { street: "111 Supply St", city: "Denver", state: "CO", zip: "80202" },
        tenantId
      },
      {
        name: "Marketing Solutions LLC",
        vendorNumber: "VEND-002", 
        email: "billing@marketingsolutions.com",
        phone: "(555) 987-6543",
        paymentTerms: 15,
        currency: "USD",
        address: { street: "222 Marketing Blvd", city: "Austin", state: "TX", zip: "73301" },
        tenantId
      },
      {
        name: "Tech Hardware Inc.",
        vendorNumber: "VEND-003",
        email: "invoices@techhardware.com", 
        phone: "(555) 456-7890",
        paymentTerms: 45,
        currency: "USD",
        address: { street: "333 Tech Dr", city: "Seattle", state: "WA", zip: "98101" },
        tenantId
      }
    ];

    const createdVendors = await db.insert(vendors).values(vendorData).returning();
    console.log(`✅ Created ${createdVendors.length} vendors`);

    // 5. Seed Expense Categories
    console.log("Creating expense categories...");
    const expenseCategoryData = [
      { name: "Office Supplies", description: "General office supplies and materials", accountId: createdAccounts.find(a => a.code === "5000")?.id, tenantId },
      { name: "Marketing & Advertising", description: "Marketing campaigns and advertising costs", accountId: createdAccounts.find(a => a.code === "5100")?.id, tenantId },
      { name: "Travel & Entertainment", description: "Business travel and client entertainment", accountId: createdAccounts.find(a => a.code === "5200")?.id, tenantId },
      { name: "Software & Subscriptions", description: "Software licenses and subscriptions", accountId: createdAccounts.find(a => a.code === "5000")?.id, tenantId },
      { name: "Utilities", description: "Office utilities and internet", accountId: createdAccounts.find(a => a.code === "5000")?.id, tenantId }
    ];

    const createdExpenseCategories = await db.insert(expenseCategories).values(expenseCategoryData).returning();
    console.log(`✅ Created ${createdExpenseCategories.length} expense categories`);

    // 6. Seed Invoices
    console.log("Creating invoices...");
    const today = new Date();
    const invoiceData = [
      {
        invoiceNumber: "INV-2024-001",
        customerId: createdCustomers[0].id,
        status: "sent",
        issueDate: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        dueDate: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        subtotal: "5000.00",
        taxAmount: "450.00",
        discountAmount: "0.00",
        totalAmount: "5450.00",
        currency: "USD",
        notes: "Monthly service agreement",
        terms: "Net 30 days",
        tenantId
      },
      {
        invoiceNumber: "INV-2024-002",
        customerId: createdCustomers[1].id,
        status: "paid",
        issueDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        dueDate: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        paidDate: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        subtotal: "3200.00",
        taxAmount: "288.00",
        discountAmount: "100.00",
        totalAmount: "3388.00",
        currency: "USD",
        notes: "Project completion payment",
        terms: "Net 15 days",
        tenantId
      },
      {
        invoiceNumber: "INV-2024-003",
        customerId: createdCustomers[2].id,
        status: "draft",
        issueDate: today,
        dueDate: new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        subtotal: "7500.00",
        taxAmount: "675.00",
        discountAmount: "0.00",
        totalAmount: "8175.00",
        currency: "USD",
        notes: "Quarterly consulting services",
        terms: "Net 45 days",
        tenantId
      }
    ];

    const createdInvoices = await db.insert(invoices).values(invoiceData).returning();
    console.log(`✅ Created ${createdInvoices.length} invoices`);

    // 7. Seed Expenses
    console.log("Creating expenses...");
    const expenseData = [
      {
        expenseNumber: "EXP-2024-001",
        categoryId: createdExpenseCategories[0].id, // Office Supplies
        vendorId: createdVendors[0].id,
        description: "Monthly office supplies order",
        amount: "234.56",
        currency: "USD",
        expenseDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        paymentMethod: "credit_card",
        status: "approved",
        isReimbursable: false,
        notes: "Pens, paper, and printer cartridges",
        tenantId
      },
      {
        expenseNumber: "EXP-2024-002",
        categoryId: createdExpenseCategories[1].id, // Marketing
        vendorId: createdVendors[1].id,
        description: "Google Ads campaign",
        amount: "1500.00",
        currency: "USD",
        expenseDate: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        paymentMethod: "bank_transfer",
        status: "paid",
        isReimbursable: false,
        notes: "Q1 digital marketing campaign",
        tenantId
      },
      {
        expenseNumber: "EXP-2024-003",
        categoryId: createdExpenseCategories[2].id, // Travel
        description: "Client meeting travel expenses",
        amount: "487.92",
        currency: "USD",
        expenseDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        paymentMethod: "credit_card",
        status: "pending",
        isReimbursable: true,
        notes: "Flight and hotel for client presentation",
        tenantId
      },
      {
        expenseNumber: "EXP-2024-004",
        categoryId: createdExpenseCategories[3].id, // Software
        vendorId: createdVendors[2].id,
        description: "Annual software licenses",
        amount: "2400.00",
        currency: "USD",
        expenseDate: new Date(today.getTime() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
        paymentMethod: "bank_transfer",
        status: "paid",
        isReimbursable: false,
        notes: "CRM and accounting software renewal",
        tenantId
      }
    ];

    const createdExpenses = await db.insert(expenses).values(expenseData).returning();
    console.log(`✅ Created ${createdExpenses.length} expenses`);

    // 8. Seed Payments
    console.log("Creating payments...");
    const paymentData = [
      {
        paymentNumber: "PAY-2024-001",
        invoiceId: createdInvoices[1].id, // Paid invoice
        customerId: createdCustomers[1].id,
        amount: "3388.00",
        currency: "USD",
        paymentDate: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        paymentMethod: "bank_transfer",
        reference: "TXN-ABC123456",
        status: "completed",
        notes: "Payment received for project completion",
        tenantId
      },
      {
        paymentNumber: "PAY-2024-002",
        customerId: createdCustomers[0].id,
        amount: "2500.00",
        currency: "USD",
        paymentDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        paymentMethod: "credit_card",
        reference: "CC-DEF789012",
        status: "completed",
        notes: "Partial payment on account",
        tenantId
      }
    ];

    const createdPayments = await db.insert(payments).values(paymentData).returning();
    console.log(`✅ Created ${createdPayments.length} payments`);

    // 9. Seed Budgets
    console.log("Creating budgets...");
    const budgetData = [
      {
        name: "Annual Budget 2024",
        year: 2024,
        startDate: new Date(2024, 0, 1), // January 1, 2024
        endDate: new Date(2024, 11, 31), // December 31, 2024
        totalBudget: "120000.00",
        status: "active",
        description: "Company annual budget for 2024",
        tenantId
      },
      {
        name: "Q1 Marketing Budget 2024",
        year: 2024,
        startDate: new Date(2024, 0, 1), // January 1, 2024
        endDate: new Date(2024, 2, 31), // March 31, 2024
        totalBudget: "25000.00",
        status: "closed",
        description: "First quarter marketing budget",
        tenantId
      }
    ];

    const createdBudgets = await db.insert(budgets).values(budgetData).returning();
    console.log(`✅ Created ${createdBudgets.length} budgets`);

    console.log("🎉 Finance data seeding completed successfully!");

    // Summary
    console.log("\n📊 Finance Data Summary:");
    console.log(`- Account Categories: ${createdCategories.length}`);
    console.log(`- Chart of Accounts: ${createdAccounts.length}`);
    console.log(`- Customers: ${createdCustomers.length}`);
    console.log(`- Vendors: ${createdVendors.length}`);
    console.log(`- Expense Categories: ${createdExpenseCategories.length}`);
    console.log(`- Invoices: ${createdInvoices.length}`);
    console.log(`- Expenses: ${createdExpenses.length}`);
    console.log(`- Payments: ${createdPayments.length}`);
    console.log(`- Budgets: ${createdBudgets.length}`);

  } catch (error) {
    console.error("❌ Error seeding finance data:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedFinanceData()
    .then(() => {
      console.log("Seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}

export { seedFinanceData };