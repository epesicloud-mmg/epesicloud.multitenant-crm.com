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
 * SYNCS ALL FINANCIAL OPERATIONS through transaction module
 */
export class TransactionService {
  
  /**
   * Create a new financial transaction with double-entry bookkeeping
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
      debitAccountId: data.debitAccountId,
      creditAccountId: data.creditAccountId,
      amount: data.amount.toString(),
      date: new Date(),
      status: 'posted',
      reconciled: false,
      createdAt: new Date(),
      updatedAt: new Date()
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

    console.log(`✓ Transaction recorded: ${transaction.transactionNumber} - ${data.source} (${data.amount} ${data.currency || 'USD'})`);
    return transaction;
  }

  /**
   * INVOICE TRANSACTION INTEGRATION - Syncs through transaction module
   */
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
      currency: invoice.currency || 'USD'
    });
  }

  /**
   * BILL TRANSACTION INTEGRATION - Syncs through transaction module
   */
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

  /**
   * PAYMENT TRANSACTION INTEGRATION - Syncs through transaction module
   */
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
      currency: payment.currency || 'USD'
    });
  }

  /**
   * CREDIT NOTE TRANSACTION INTEGRATION - Syncs through transaction module
   */
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
      currency: creditNote.currency || 'USD'
    });
  }

  /**
   * EXPENSE TRANSACTION INTEGRATION - Syncs through transaction module
   */
  static async createExpenseTransaction(expenseId: number, tenantId: number, expenseData: any) {
    // Get expense (500) and cash/payable (110/210) accounts
    const [expenseAccount] = await db.select().from(ledgerAccounts).where(eq(ledgerAccounts.accountCode, '500'));
    const [cashAccount] = await db.select().from(ledgerAccounts).where(eq(ledgerAccounts.accountCode, '110'));

    if (!expenseAccount || !cashAccount) {
      throw new Error('Required accounts not found for expense transaction');
    }

    return await this.createTransaction({
      description: `Expense: ${expenseData.description || 'General expense'}`,
      amount: parseFloat(expenseData.amount || '0'),
      source: 'expense',
      sourceId: expenseId,
      sourceReference: expenseData.reference,
      debitAccountId: expenseAccount.id, // Expense (Debit)
      creditAccountId: cashAccount.id, // Cash (Credit)
      tenantId,
      currency: expenseData.currency || 'USD'
    });
  }

  /**
   * Generate unique transaction numbers
   */
  private static async generateTransactionNumber(tenantId: number): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `TXN-${year}-`;
    
    // Get the count of transactions for this tenant and year
    const count = await db.select().from(transactions).where(eq(transactions.tenantId, tenantId));
    const nextNumber = count.length + 1;
    
    return `${prefix}${nextNumber.toString().padStart(6, '0')}`;
  }
}

/**
 * Auto-sync hooks for ALL financial operations
 * Ensures every financial transaction goes through the centralized transaction module
 */
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
  },

  // Expense creation hooks
  onExpenseCreate: async (expenseId: number, tenantId: number, expenseData: any) => {
    await TransactionService.createExpenseTransaction(expenseId, tenantId, expenseData);
  }
};