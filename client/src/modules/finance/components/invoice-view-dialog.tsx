import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Printer, Edit, Download, Mail } from 'lucide-react';

interface Invoice {
  id: number;
  invoiceNumber: string;
  customerId: number;
  customerName: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: Array<{
    id: number;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  notes?: string;
  terms?: string;
}

interface InvoiceViewDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (invoice: Invoice) => void;
}

export function InvoiceViewDialog({ invoice, open, onOpenChange, onEdit }: InvoiceViewDialogProps) {
  if (!invoice) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handlePrint = () => {
    const printContent = document.getElementById('invoice-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice ${invoice.invoiceNumber}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
                .invoice-details { margin-bottom: 20px; }
                .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .items-table th { background-color: #f2f2f2; }
                .total-section { margin-top: 20px; text-align: right; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Invoice {invoice.invoiceNumber}</DialogTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(invoice)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div id="invoice-content" className="space-y-6">
          {/* Invoice Header */}
          <div className="flex justify-between">
            <div>
              <h2 className="text-2xl font-bold">INVOICE</h2>
              <p className="text-muted-foreground">#{invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <Badge 
                variant={
                  invoice.status === 'paid' ? 'default' :
                  invoice.status === 'overdue' ? 'destructive' :
                  invoice.status === 'sent' ? 'secondary' : 'outline'
                }
                className="mb-2"
              >
                {invoice.status.toUpperCase()}
              </Badge>
              <div className="text-2xl font-bold">{formatCurrency(invoice.amount)}</div>
            </div>
          </div>

          <Separator />

          {/* Bill To & Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Bill To:</h3>
              <div className="text-sm space-y-1">
                <div className="font-medium">{invoice.customerName}</div>
                <div className="text-muted-foreground">Customer ID: {invoice.customerId}</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Invoice Details:</h3>
              <div className="text-sm space-y-1">
                <div><span className="font-medium">Issue Date:</span> {formatDate(invoice.issueDate)}</div>
                <div><span className="font-medium">Due Date:</span> {formatDate(invoice.dueDate)}</div>
                <div><span className="font-medium">Amount Due:</span> {formatCurrency(invoice.amount - invoice.paidAmount)}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Invoice Items */}
          <div>
            <h3 className="font-semibold mb-4">Items & Services</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3">Description</th>
                    <th className="text-center p-3">Quantity</th>
                    <th className="text-right p-3">Unit Price</th>
                    <th className="text-right p-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item, index) => (
                    <tr key={item.id || index} className="border-t">
                      <td className="p-3">{item.description}</td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="p-3 text-right font-medium">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice Totals */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (0%):</span>
                <span>{formatCurrency(0)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(invoice.amount)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Paid:</span>
                <span>{formatCurrency(invoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Amount Due:</span>
                <span>{formatCurrency(invoice.amount - invoice.paidAmount)}</span>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          {(invoice.notes || invoice.terms) && (
            <>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {invoice.notes && (
                  <div>
                    <h3 className="font-semibold mb-2">Notes:</h3>
                    <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                  </div>
                )}
                {invoice.terms && (
                  <div>
                    <h3 className="font-semibold mb-2">Terms & Conditions:</h3>
                    <p className="text-sm text-muted-foreground">{invoice.terms}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}