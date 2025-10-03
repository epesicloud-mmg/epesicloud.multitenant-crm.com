import express from 'express';
import { db } from '../db';
import { 
  transactions, 
  transactionLines, 
  ledgerAccounts, 
  bankAccounts,
  bills,
  creditNotes
} from '@shared/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { TransactionService } from '../transaction-service';

const router = express.Router();

// Transaction Trail API - comprehensive transaction reporting
router.get('/transactions', async (req, res) => {
  try {
    const { startDate, endDate, source, search } = req.query;
    const tenantId = req.tenantId;

    let conditions = [eq(transactions.tenantId, tenantId)];

    // Add date range filters
    if (startDate) {
      conditions.push(gte(transactions.date, new Date(startDate as string)));
    }
    if (endDate) {
      conditions.push(lte(transactions.date, new Date(endDate as string)));
    }

    // Add source filter
    if (source && source !== 'all') {
      conditions.push(eq(transactions.source, source as string));
    }

    const transactionList = await db
      .select()
      .from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.date), desc(transactions.id));

    // Filter by search term if provided
    let filteredTransactions = transactionList;
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredTransactions = transactionList.filter((t: any) =>
        t.description?.toLowerCase().includes(searchTerm) ||
        t.transactionNumber?.toLowerCase().includes(searchTerm) ||
        t.reference?.toLowerCase().includes(searchTerm)
      );
    }

    res.json(filteredTransactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Ledger Accounts API
router.get('/ledger-accounts', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    const accounts = await db
      .select()
      .from(ledgerAccounts)
      .where(eq(ledgerAccounts.tenantId, tenantId))
      .orderBy(ledgerAccounts.accountCode);

    res.json(accounts);
  } catch (error) {
    console.error('Error fetching ledger accounts:', error);
    res.status(500).json({ error: 'Failed to fetch ledger accounts' });
  }
});

router.post('/ledger-accounts', async (req, res) => {
  try {
    const { accountCode, accountName, accountType, description } = req.body;
    const tenantId = req.tenantId;

    const [account] = await db
      .insert(ledgerAccounts)
      .values({
        tenantId,
        accountCode,
        accountName,
        accountType,
        description,
        isActive: true,
        currentBalance: '0.00',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    res.status(201).json(account);
  } catch (error) {
    console.error('Error creating ledger account:', error);
    res.status(500).json({ error: 'Failed to create ledger account' });
  }
});

// Bank Accounts API
router.get('/bank-accounts', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    const accounts = await db
      .select()
      .from(bankAccounts)
      .where(eq(bankAccounts.tenantId, tenantId))
      .orderBy(bankAccounts.accountName);

    res.json(accounts);
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    res.status(500).json({ error: 'Failed to fetch bank accounts' });
  }
});

router.post('/bank-accounts', async (req, res) => {
  try {
    const { accountName, accountNumber, bankName, accountType, currency, currentBalance } = req.body;
    const tenantId = req.tenantId;

    const [account] = await db
      .insert(bankAccounts)
      .values({
        tenantId,
        accountName,
        accountNumber,
        bankName,
        accountType,
        currency: currency || 'USD',
        currentBalance: currentBalance || '0.00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    res.status(201).json(account);
  } catch (error) {
    console.error('Error creating bank account:', error);
    res.status(500).json({ error: 'Failed to create bank account' });
  }
});

// Bills API with Transaction Integration
router.get('/bills', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    const billsList = await db
      .select()
      .from(bills)
      .where(eq(bills.tenantId, tenantId))
      .orderBy(desc(bills.billDate));

    res.json(billsList);
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

router.post('/bills', async (req, res) => {
  try {
    const { 
      vendorId, 
      billNumber, 
      referenceNumber, 
      billDate, 
      dueDate, 
      subtotal, 
      taxAmount, 
      totalAmount,
      currency
    } = req.body;
    const tenantId = req.tenantId;

    const [bill] = await db
      .insert(bills)
      .values({
        tenantId,
        vendorId,
        billNumber,
        referenceNumber,
        billDate: new Date(billDate),
        dueDate: new Date(dueDate),
        subtotal,
        taxAmount: taxAmount || '0.00',
        totalAmount,
        balanceAmount: totalAmount,
        currency: currency || 'USD',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    // Create transaction through centralized system
    await TransactionService.createBillTransaction(bill.id, tenantId);

    res.status(201).json(bill);
  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(500).json({ error: 'Failed to create bill' });
  }
});

// Credit Notes API with Transaction Integration
router.get('/credit-notes', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    const creditNotesList = await db
      .select()
      .from(creditNotes)
      .where(eq(creditNotes.tenantId, tenantId))
      .orderBy(desc(creditNotes.issueDate));

    res.json(creditNotesList);
  } catch (error) {
    console.error('Error fetching credit notes:', error);
    res.status(500).json({ error: 'Failed to fetch credit notes' });
  }
});

router.post('/credit-notes', async (req, res) => {
  try {
    const { 
      customerId, 
      creditNoteNumber, 
      issueDate, 
      amount, 
      currency, 
      reason, 
      description 
    } = req.body;
    const tenantId = req.tenantId;

    const [creditNote] = await db
      .insert(creditNotes)
      .values({
        tenantId,
        customerId,
        creditNoteNumber,
        issueDate: new Date(issueDate),
        amount,
        currency: currency || 'USD',
        reason,
        description,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    // Create transaction through centralized system
    await TransactionService.createCreditNoteTransaction(creditNote.id, tenantId);

    res.status(201).json(creditNote);
  } catch (error) {
    console.error('Error creating credit note:', error);
    res.status(500).json({ error: 'Failed to create credit note' });
  }
});

// Transaction Reports API
router.get('/reports/transaction-trail', async (req, res) => {
  try {
    const { startDate, endDate, source } = req.query;
    const tenantId = req.tenantId;

    let conditions = [eq(transactions.tenantId, tenantId)];

    if (startDate) {
      conditions.push(gte(transactions.date, new Date(startDate as string)));
    }
    if (endDate) {
      conditions.push(lte(transactions.date, new Date(endDate as string)));
    }
    if (source && source !== 'all') {
      conditions.push(eq(transactions.source, source as string));
    }

    const transactionTrail = await db
      .select({
        id: transactions.id,
        transactionNumber: transactions.transactionNumber,
        date: transactions.date,
        source: transactions.source,
        sourceReference: transactions.sourceReference,
        description: transactions.description,
        totalAmount: transactions.totalAmount,
        currency: transactions.currency,
        status: transactions.status,
        reconciled: transactions.reconciled,
        debitAccountId: transactions.debitAccountId,
        creditAccountId: transactions.creditAccountId
      })
      .from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.date), desc(transactions.id))
      .limit(1000); // Limit for performance

    // Get account details for the transactions
    const accountIds = [
      ...new Set([
        ...transactionTrail.map(t => t.debitAccountId),
        ...transactionTrail.map(t => t.creditAccountId)
      ].filter(Boolean))
    ];

    const accounts = accountIds.length > 0 ? await db
      .select()
      .from(ledgerAccounts)
      .where(and(
        eq(ledgerAccounts.tenantId, tenantId),
        // @ts-ignore - drizzle typing issue
        ledgerAccounts.id.in(accountIds)
      )) : [];

    const accountLookup = accounts.reduce((acc: any, account: any) => {
      acc[account.id] = account;
      return acc;
    }, {});

    const enrichedTransactions = transactionTrail.map(transaction => ({
      ...transaction,
      debitAccount: accountLookup[transaction.debitAccountId],
      creditAccount: accountLookup[transaction.creditAccountId]
    }));

    res.json(enrichedTransactions);
  } catch (error) {
    console.error('Error generating transaction trail report:', error);
    res.status(500).json({ error: 'Failed to generate transaction trail report' });
  }
});

export default router;