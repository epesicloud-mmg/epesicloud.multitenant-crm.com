import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Receipt, Eye, Edit, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const createBillSchema = z.object({
  vendorId: z.number().min(1, "Vendor is required"),
  amount: z.string().min(1, "Amount is required"),
  dueDate: z.string().min(1, "Due date is required"),
  description: z.string().min(1, "Description is required"),
  status: z.string().default("draft"),
});

type CreateBillForm = z.infer<typeof createBillSchema>;

function BillStatusBadge({ status }: { status: string }) {
  const variants = {
    draft: "secondary",
    pending: "outline",
    approved: "default",
    paid: "success",
  } as const;

  return (
    <Badge variant={variants[status as keyof typeof variants] || "default"}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function CreateBillDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateBillForm>({
    resolver: zodResolver(createBillSchema),
    defaultValues: {
      status: "draft",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    },
  });

  const { data: vendors } = useQuery({
    queryKey: ["/api/finance/vendors"],
  });

  const createBillMutation = useMutation({
    mutationFn: async (data: CreateBillForm) => {
      const response = await apiRequest("/api/finance/bills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Id": "1"
        },
        body: JSON.stringify({
          ...data,
          amount: parseFloat(data.amount),
        }),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance/bills"] });
      toast({
        title: "Bill Created",
        description: "New bill has been created successfully.",
      });
      setOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create bill. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateBillForm) => {
    createBillMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Bill
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Bill</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="vendorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vendor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vendors?.map((vendor: any) => (
                        <SelectItem key={vendor.id} value={vendor.id.toString()}>
                          {vendor.name}
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input placeholder="0.00" {...field} />
                  </FormControl>
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
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Bill description..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createBillMutation.isPending}>
                {createBillMutation.isPending ? "Creating..." : "Create Bill"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function BillsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bills = [], isLoading } = useQuery({
    queryKey: ["/api/finance/bills"],
  });

  const deleteBillMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/finance/bills/${id}`, {
        method: "DELETE",
        headers: {
          "X-Tenant-Id": "1"
        }
      });
      if (!response.ok) throw new Error('Failed to delete bill');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance/bills"] });
      toast({
        title: "Success",
        description: "Bill deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete bill",
        variant: "destructive",
      });
    },
  });

  const filteredBills = bills.filter((bill: any) =>
    bill.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.vendor?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalAmount = bills.reduce((sum: any, bill: any) => sum + parseFloat(bill.amount || 0), 0);
  const pendingAmount = bills.filter((bill: any) => bill.status === 'pending').reduce((sum: any, bill: any) => sum + parseFloat(bill.amount || 0), 0);
  const overdueCount = bills.filter((bill: any) => {
    return bill.status !== 'paid' && new Date(bill.dueDate) < new Date();
  }).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bills</h1>
          <p className="text-muted-foreground">Manage vendor bills and payments</p>
        </div>
        <CreateBillDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">{bills.length} bills</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bills.length}</div>
            <p className="text-xs text-muted-foreground">New bills</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Receipt className="h-5 w-5" />
            <span>Bill List</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill #</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Loading bills...</TableCell>
                </TableRow>
              ) : filteredBills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">No bills found</TableCell>
                </TableRow>
              ) : (
                filteredBills.map((bill: any) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-mono">{bill.billNumber || `BILL-${bill.id}`}</TableCell>
                    <TableCell className="font-medium">{bill.vendor?.name || bill.vendorName}</TableCell>
                    <TableCell className="text-muted-foreground">{bill.description}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(parseFloat(bill.amount || 0))}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(parseISO(bill.dueDate), 'MMM dd, yyyy')}
                      </div>
                      {new Date(bill.dueDate) < new Date() && bill.status !== 'paid' && (
                        <div className="text-xs text-red-600">Overdue</div>
                      )}
                    </TableCell>
                    <TableCell><BillStatusBadge status={bill.status} /></TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => deleteBillMutation.mutate(bill.id)}
                          disabled={deleteBillMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}