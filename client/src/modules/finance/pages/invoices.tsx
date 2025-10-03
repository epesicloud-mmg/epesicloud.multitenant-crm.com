import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, FileText, DollarSign, Calendar, Search, Filter, Eye, Edit, Printer, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InvoiceViewDialog } from "../components/invoice-view-dialog";
import { InvoiceEditDialog } from "../components/invoice-edit-dialog";

const createInvoiceSchema = z.object({
  customerId: z.number().min(1, "Customer is required"),
  dealId: z.number().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  subtotal: z.string().min(1, "Subtotal is required"),
  taxAmount: z.string().default("0.00"),
  discountAmount: z.string().default("0.00"),
  totalAmount: z.string().min(1, "Total amount is required"),
  currency: z.string().default("USD"),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

type CreateInvoiceForm = z.infer<typeof createInvoiceSchema>;

function InvoiceStatusBadge({ status }: { status: string }) {
  const variants = {
    draft: "secondary",
    sent: "default",
    paid: "success",
    overdue: "destructive",
    cancelled: "outline"
  } as const;

  return (
    <Badge variant={variants[status as keyof typeof variants] || "default"}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function CreateInvoiceDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateInvoiceForm>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      currency: "USD",
      taxAmount: "0.00",
      discountAmount: "0.00",
    },
  });

  // Get customers for dropdown
  const { data: customers } = useQuery({
    queryKey: ["/api/finance/customers"],
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: CreateInvoiceForm) => {
      const response = await apiRequest("/api/finance/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Id": "1"
        },
        body: JSON.stringify({
          ...data,
          subtotal: parseFloat(data.subtotal),
          taxAmount: parseFloat(data.taxAmount),
          discountAmount: parseFloat(data.discountAmount),
          totalAmount: parseFloat(data.totalAmount),
        }),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance/invoices"] });
      toast({
        title: "Invoice Created",
        description: "New invoice has been created successfully.",
      });
      setOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateInvoiceForm) => {
    createInvoiceMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers?.map((customer: any) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.customerNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="subtotal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtotal</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="taxAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="discountAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Invoice notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Terms</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Payment terms and conditions..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createInvoiceMutation.isPending}>
                {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function InvoicesPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["/api/finance/invoices"],
    queryFn: async () => {
      const response = await fetch("/api/finance/invoices", {
        headers: {
          "X-Tenant-Id": "1"
        }
      });
      return response.json();
    }
  });

  const handleViewInvoice = (invoice: any) => {
    // Transform the invoice data to match expected interface
    const transformedInvoice = {
      ...invoice,
      customerName: `Customer ${invoice.customerId}`,
      items: [
        {
          id: 1,
          description: 'Professional Services',
          quantity: 1,
          unitPrice: parseFloat(invoice.totalAmount || '0'),
          total: parseFloat(invoice.totalAmount || '0')
        }
      ],
      notes: invoice.notes || '',
      terms: invoice.terms || 'Payment due within 30 days'
    };
    setSelectedInvoice(transformedInvoice);
    setViewDialogOpen(true);
  };

  const handleEditInvoice = (invoice: any) => {
    const transformedInvoice = {
      ...invoice,
      customerName: `Customer ${invoice.customerId}`,
      items: [
        {
          id: 1,
          description: 'Professional Services',
          quantity: 1,
          unitPrice: parseFloat(invoice.totalAmount || '0'),
          total: parseFloat(invoice.totalAmount || '0')
        }
      ],
      notes: invoice.notes || '',
      terms: invoice.terms || 'Payment due within 30 days'
    };
    setSelectedInvoice(transformedInvoice);
    setEditDialogOpen(true);
  };

  const handleSaveInvoice = (updatedInvoice: any) => {
    // Here you would normally update via API
    console.log('Saving invoice:', updatedInvoice);
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const filteredInvoices = invoices?.filter((invoice: any) => {
    const matchesSearch = invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `Customer ${invoice.customerId}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Invoices</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-slate-500 mt-2">
            Manage and track your customer invoices and billing.
          </p>
        </div>
        <CreateInvoiceDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices?.filter((inv: any) => inv.status === 'sent').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices?.filter((inv: any) => inv.status === 'paid').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {invoices?.reduce((sum: number, inv: any) => sum + parseFloat(inv.totalAmount || 0), 0).toFixed(2) || "0.00"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices found</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first invoice.</p>
              <CreateInvoiceDialog />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Invoice #</th>
                    <th className="text-left py-3 px-4 font-medium">Customer</th>
                    <th className="text-left py-3 px-4 font-medium">Issue Date</th>
                    <th className="text-left py-3 px-4 font-medium">Due Date</th>
                    <th className="text-left py-3 px-4 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice: any) => (
                    <tr key={invoice.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{invoice.invoiceNumber}</td>
                      <td className="py-3 px-4">Customer {invoice.customerId}</td>
                      <td className="py-3 px-4">{formatDate(invoice.issueDate || new Date().toISOString())}</td>
                      <td className="py-3 px-4">{formatDate(invoice.dueDate || new Date().toISOString())}</td>
                      <td className="py-3 px-4">{formatCurrency(invoice.totalAmount || 0)}</td>
                      <td className="py-3 px-4">
                        <InvoiceStatusBadge status={invoice.status || 'draft'} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewInvoice(invoice)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditInvoice(invoice)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}>
                                <Printer className="h-4 w-4 mr-2" />
                                Print
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* View and Edit Dialogs */}
      <InvoiceViewDialog
        invoice={selectedInvoice}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        onEdit={handleEditInvoice}
      />
      
      <InvoiceEditDialog
        invoice={selectedInvoice}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveInvoice}
      />
    </div>
  );
}