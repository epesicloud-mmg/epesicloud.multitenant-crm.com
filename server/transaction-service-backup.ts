import { db } from "./db";
import { transactions, transactionLines, ledgerAccounts, invoices, payments, bills, creditNotes } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface TransactionData {
  description: string;
  amount: number;
  currency?: string;
  source: 'invoice' | 'payment' | 'expense' | 'bill' | 'credit' | 'credit_note';
  sourceId: number;
  sourceReference?: string;
  debitAccountId: number;
  creditAccountId: number;
  tenantId: number;
  createdBy?: number;
}

/**
 * Centralized Transaction Service
 * Handles all financial transactions across the system
 * Implements double-entry accounting principles
 */
export class TransactionService {
  
  /**
   * Create a new financial transaction
   */
  static async createTransaction(data: TransactionData) {
    const transactionNumber = await this.generateTransactionNumber(data.tenantId);
    
    const [transaction] = await db.insert(transactions).values({
      transactionNumber,
      description: data.description,
      reference: data.sourceReference,
      totalAmount: data.amount.toString(),
      currency: data.currency || 'USD',
      source: data.source,
      sourceId: data.sourceId,
      sourceReference: data.sourceReference,
      tenantId: data.tenantId,
      createdBy: data.createdBy,
    }).returning();

    // Create double-entry transaction lines
    await db.insert(transactionLines).values([
      {
        transactionId: transaction.id,
        accountId: data.debitAccountId,
        debitAmount: data.amount.toString(),
        creditAmount: '0.00',
        description: `${data.source.toUpperCase()} - ${data.description}`,
        tenantId: data.tenantId,
      },
      {
        transactionId: transaction.id,
        accountId: data.creditAccountId,
        debitAmount: '0.00',
        creditAmount: data.amount.toString(),
        description: `${data.source.toUpperCase()} - ${data.description}`,
        tenantId: data.tenantId,
      }
    ]);

    return transaction;
  }

  /**
   * Sync ALL financial operations through centralized transaction system
   */
  
  // Invoice Transaction Integration
  static async createInvoiceTransaction(invoiceId: number, tenantId: number) {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, invoiceId));
    if (!invoice) throw new Error('Invoice not found');

    // Get accounts receivable (120) and sales revenue (400) accounts
    const [receivableAccount] = await db.select().from(ledgerAccounts).where(eq(ledgerAccounts.accountCode, '120'));
    const [salesAccount] = await db.select().from(ledgerAccounts).where(eq(ledgerAccounts.accountCode, '400'));

    if (!receivableAccount || !salesAccount) {
      throw new Error('Required accounts not found for invoice transaction');
    }

    return await this.createTransaction({
      description: `Invoice ${invoice.invoiceNumber} - Customer billing`,
      amount: parseFloat(invoice.totalAmount),
      source: 'invoice',
      sourceId: invoiceId,
      sourceReference: invoice.invoiceNumber,
      debitAccountId: receivableAccount.id, // Accounts Receivable (Debit)
      creditAccountId: salesAccount.id, // Sales Revenue (Credit)
      tenantId,
      currency: invoice.currency
    });
  }

  // Bill Transaction Integration  
  static async createBillTransaction(billId: number, tenantId: number) {
    const [bill] = await db.select().from(bills).where(eq(bills.id, billId));
    if (!bill) throw new Error('Bill not found');

    // Get accounts payable (210) and expense (500) accounts
    const [payableAccount] = await db.select().from(ledgerAccounts).where(eq(ledgerAccounts.accountCode, '210'));
    const [expenseAccount] = await db.select().from(ledgerAccounts).where(eq(ledgerAccounts.accountCode, '500'));

    if (!payableAccount || !expenseAccount) {
      throw new Error('Required accounts not found for bill transaction');
    }

    return await this.createTransaction({
      description: `Bill ${bill.billNumber} - Vendor expense`,
      amount: parseFloat(bill.totalAmount),
      source: 'bill',
      sourceId: billId,
      sourceReference: bill.billNumber,
      debitAccountId: expenseAccount.id, // Expense (Debit)
      creditAccountId: payableAccount.id, // Accounts Payable (Credit)
      tenantId,
      currency: bill.currency || 'USD'
    });
  }

  // Payment Transaction Integration
  static async createPaymentTransaction(paymentId: number, tenantId: number) {
    const [payment] = await db.select().from(payments).where(eq(payments.id, paymentId));
    if (!payment) throw new Error('Payment not found');

    // Get cash (110) and accounts receivable (120) accounts
    const [cashAccount] = await db.select().from(ledgerAccounts).where(eq(ledgerAccounts.accountCode, '110'));
    const [receivableAccount] = await db.select().from(ledgerAccounts).where(eq(ledgerAccounts.accountCode, '120'));

    if (!cashAccount || !receivableAccount) {
      throw new Error('Required accounts not found for payment transaction');
    }

    return await this.createTransaction({
      description: `Payment ${payment.paymentNumber} - Customer payment received`,
      amount: parseFloat(payment.amount),
      source: 'payment',
      sourceId: paymentId,
      sourceReference: payment.paymentNumber,
      debitAccountId: cashAccount.id, // Cash (Debit)
      creditAccountId: receivableAccount.id, // Accounts Receivable (Credit)
      tenantId,
      currency: payment.currency
    });
  }

  // Credit Note Transaction Integration
  static async createCreditNoteTransaction(creditNoteId: number, tenantId: number) {
    const [creditNote] = await db.select().from(creditNotes).where(eq(creditNotes.id, creditNoteId));
    if (!creditNote) throw new Error('Credit note not found');

    // Get sales returns (410) and accounts receivable (120) accounts
    const [returnsAccount] = await db.select().from(ledgerAccounts).where(eq(ledgerAccounts.accountCode, '410'));
    const [receivableAccount] = await db.select().from(ledgerAccounts).where(eq(ledgerAccounts.accountCode, '120'));

    if (!returnsAccount || !receivableAccount) {
      throw new Error('Required accounts not found for credit note transaction');
    }

    return await this.createTransaction({
      description: `Credit Note ${creditNote.creditNoteNumber} - Customer refund/credit`,
      amount: parseFloat(creditNote.amount),
      source: 'credit_note',
      sourceId: creditNoteId,
      sourceReference: creditNote.creditNoteNumber,
      debitAccountId: returnsAccount.id, // Sales Returns (Debit)
      creditAccountId: receivableAccount.id, // Accounts Receivable (Credit)
      tenantId,
      currency: creditNote.currency
    });
  }

  // Expense Transaction Integration (for expense module)
  static async createExpenseTransaction(expenseId: number, tenantId: number) {
    // This would integrate with expense module when available
    // For now, handle general expenses
    return await this.createTransaction({
      description: `Expense entry`,
      amount: 0,
      source: 'expense',
      sourceId: expenseId,
      debitAccountId: 1, // Expense account
      creditAccountId: 2, // Cash/Payable account  
      tenantId
    });
  }

  // Generate transaction numbers
  private static async generateTransactionNumber(tenantId: number): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `TXN-${year}-`;
    
    // Get the count of transactions for this tenant and year
    const count = await db.select().from(transactions).where(eq(transactions.tenantId, tenantId));
    const nextNumber = count.length + 1;
    
    return `${prefix}${nextNumber.toString().padStart(6, '0')}`;
  }
}

// Auto-trigger transaction creation for all financial operations
export const syncAllFinancialOperations = {
  // Invoice creation hooks
  onInvoiceCreate: async (invoiceId: number, tenantId: number) => {
    await TransactionService.createInvoiceTransaction(invoiceId, tenantId);
  },
  
  // Bill creation hooks  
  onBillCreate: async (billId: number, tenantId: number) => {
    await TransactionService.createBillTransaction(billId, tenantId);
  },
  
  // Payment creation hooks
  onPaymentCreate: async (paymentId: number, tenantId: number) => {
    await TransactionService.createPaymentTransaction(paymentId, tenantId);
  },
  
  // Credit note creation hooks
  onCreditNoteCreate: async (creditNoteId: number, tenantId: number) => {
    await TransactionService.createCreditNoteTransaction(creditNoteId, tenantId);
  }
};
      debitAccountId: cashAccount.id,
      creditAccountId: receivableAccount.id,
      tenantId,
      createdBy: payment.createdBy || undefined,
    });
  }

  /**
   * Create transaction when bill is created
   */
  static async createBillTransaction(billId: number, tenantId: number) {
    const [bill] = await db.select().from(bills).where(eq(bills.id, billId));
    if (!bill) throw new Error('Bill not found');

    // Get operating expenses and accounts payable accounts
    const [expenseAccount] = await db.select().from(ledgerAccounts)
      .where(eq(ledgerAccounts.accountCode, '6000')); // Operating Expenses
    const [payableAccount] = await db.select().from(ledgerAccounts)
      .where(eq(ledgerAccounts.accountCode, '2000')); // Accounts Payable

    if (!expenseAccount || !payableAccount) {
      throw new Error('Required accounts not found');
    }

    return await this.createTransaction({
      description: `Bill ${bill.billNumber}`,
      amount: parseFloat(bill.totalAmount),
      source: 'bill',
      sourceId: bill.id,
      sourceReference: bill.billNumber,
      debitAccountId: expenseAccount.id,
      creditAccountId: payableAccount.id,
      tenantId,
      createdBy: bill.createdBy || undefined,
    });
  }

  /**
   * Create transaction when credit note is issued
   */
  static async createCreditNoteTransaction(creditNoteId: number, tenantId: number) {
    const [creditNote] = await db.select().from(creditNotes).where(eq(creditNotes.id, creditNoteId));
    if (!creditNote) throw new Error('Credit note not found');

    // Get sales revenue and accounts receivable accounts
    const [revenueAccount] = await db.select().from(ledgerAccounts)
      .where(eq(ledgerAccounts.accountCode, '4000')); // Sales Revenue
    const [receivableAccount] = await db.select().from(ledgerAccounts)
      .where(eq(ledgerAccounts.accountCode, '1100')); // Accounts Receivable

    if (!revenueAccount || !receivableAccount) {
      throw new Error('Required accounts not found');
    }

    return await this.createTransaction({
      description: `Credit Note ${creditNote.creditNoteNumber}`,
      amount: parseFloat(creditNote.amount),
      source: 'credit',
      sourceId: creditNote.id,
      sourceReference: creditNote.creditNoteNumber,
      debitAccountId: revenueAccount.id, // Reverse the revenue
      creditAccountId: receivableAccount.id, // Reduce receivables
      tenantId,
      createdBy: creditNote.createdBy || undefined,
    });
  }

  /**
   * Generate unique transaction number
   */
  private static async generateTransactionNumber(tenantId: number): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    // Get count of transactions for this month
    const count = await db.select().from(transactions)
      .where(eq(transactions.tenantId, tenantId));
    
    const sequence = (count.length + 1).toString().padStart(4, '0');
    
    return `TXN-${year}${month}-${sequence}`;
  }

  /**
   * Get transaction summary for reporting
   */
  static async getTransactionSummary(tenantId: number, startDate?: Date, endDate?: Date) {
    // Implementation for transaction summary reporting
    // This would include balance calculations, account summaries, etc.
    return await db.select().from(transactions)
      .where(eq(transactions.tenantId, tenantId))
      .orderBy(transactions.date);
  }

  /**
   * Reconcile transaction
   */
  static async reconcileTransaction(transactionId: number, userId: number) {
    await db.update(transactions)
      .set({ 
        reconciled: true, 
        reconciledAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(transactions.id, transactionId));
  }
}