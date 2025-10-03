import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface InvoiceEditDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (invoice: Invoice) => void;
}

export function InvoiceEditDialog({ invoice, open, onOpenChange, onSave }: InvoiceEditDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Invoice | null>(null);

  useEffect(() => {
    if (invoice) {
      setFormData({ ...invoice });
    }
  }, [invoice]);

  if (!formData) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setFormData(prev => {
      if (!prev) return null;
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Recalculate total for the item
      if (field === 'quantity' || field === 'unitPrice') {
        newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
      }
      
      // Recalculate invoice total
      const newAmount = newItems.reduce((sum, item) => sum + item.total, 0);
      
      return { ...prev, items: newItems, amount: newAmount };
    });
  };

  const addItem = () => {
    setFormData(prev => {
      if (!prev) return null;
      const newItem = {
        id: Date.now(),
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0
      };
      return { ...prev, items: [...prev.items, newItem] };
    });
  };

  const removeItem = (index: number) => {
    setFormData(prev => {
      if (!prev) return null;
      const newItems = prev.items.filter((_, i) => i !== index);
      const newAmount = newItems.reduce((sum, item) => sum + item.total, 0);
      return { ...prev, items: newItems, amount: newAmount };
    });
  };

  const handleSave = () => {
    if (!formData) return;
    
    // Validation
    if (!formData.customerName.trim()) {
      toast({
        title: "Validation Error",
        description: "Customer name is required",
        variant: "destructive"
      });
      return;
    }

    if (formData.items.length === 0) {
      toast({
        title: "Validation Error", 
        description: "At least one item is required",
        variant: "destructive"
      });
      return;
    }

    onSave(formData);
    toast({
      title: "Success",
      description: "Invoice updated successfully"
    });
    onOpenChange(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Edit Invoice {formData.invoiceNumber}</DialogTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Invoice Number</Label>
              <Input 
                value={formData.invoiceNumber}
                onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Customer & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Bill To</h3>
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <Input 
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">Invoice Details</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Issue Date</Label>
                  <Input 
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => handleInputChange('issueDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input 
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Invoice Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Items & Services</h3>
              <Button size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3">Description</th>
                    <th className="text-center p-3">Qty</th>
                    <th className="text-right p-3">Unit Price</th>
                    <th className="text-right p-3">Total</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-2">
                        <Input 
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          placeholder="Item description"
                        />
                      </td>
                      <td className="p-2">
                        <Input 
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                          className="text-center"
                          min="1"
                        />
                      </td>
                      <td className="p-2">
                        <Input 
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="text-right"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="p-2 text-right font-medium">
                        {formatCurrency(item.total)}
                      </td>
                      <td className="p-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice Total */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2 p-4 bg-muted/30 rounded-lg">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Amount:</span>
                <span>{formatCurrency(formData.amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Paid Amount:</span>
                <Input 
                  type="number"
                  value={formData.paidAmount}
                  onChange={(e) => handleInputChange('paidAmount', parseFloat(e.target.value) || 0)}
                  className="w-24 text-right"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex justify-between font-medium">
                <span>Balance Due:</span>
                <span>{formatCurrency(formData.amount - formData.paidAmount)}</span>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea 
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Internal notes..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Terms & Conditions</Label>
              <Textarea 
                value={formData.terms || ''}
                onChange={(e) => handleInputChange('terms', e.target.value)}
                placeholder="Payment terms and conditions..."
                rows={3}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}