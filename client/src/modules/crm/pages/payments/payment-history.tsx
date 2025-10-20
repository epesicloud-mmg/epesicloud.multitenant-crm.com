import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, Search, Filter, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Payment } from "@shared/schema";
import { format } from "date-fns";

export default function PaymentHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: payments = [], isLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = 
      payment.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionReference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.amount.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      completed: { variant: "default", label: "Completed" },
      pending: { variant: "secondary", label: "Pending" },
      failed: { variant: "destructive", label: "Failed" },
    };
    
    const config = statusMap[status] || { variant: "outline" as const, label: status };
    return <Badge variant={config.variant} data-testid={`badge-status-${status}`}>{config.label}</Badge>;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payment History</h1>
          <p className="text-slate-600">View all payment transactions and receipts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center space-x-2" data-testid="button-export">
            <Calendar className="w-4 h-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search by receipt number, transaction reference, or amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger data-testid="select-status-filter">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payment List */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPayments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No payments found</p>
            <p className="text-sm text-slate-400 mt-2">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your filters" 
                : "Payments will appear here once collected"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPayments.map((payment) => (
            <Card key={payment.id} className="hover:shadow-md transition-shadow" data-testid={`card-payment-${payment.id}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900" data-testid={`text-receipt-${payment.id}`}>
                        Receipt #{payment.receiptNumber}
                      </h3>
                      {getStatusBadge(payment.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Amount</p>
                        <p className="font-medium text-slate-900" data-testid={`text-amount-${payment.id}`}>
                          ${parseFloat(payment.amount).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Payment Date</p>
                        <p className="font-medium text-slate-900">
                          {format(new Date(payment.paymentDate), "MMM dd, yyyy")}
                        </p>
                      </div>
                      {payment.transactionReference && (
                        <div>
                          <p className="text-slate-500">Transaction Ref</p>
                          <p className="font-medium text-slate-900">{payment.transactionReference}</p>
                        </div>
                      )}
                      {payment.bankName && (
                        <div>
                          <p className="text-slate-500">Bank</p>
                          <p className="font-medium text-slate-900">{payment.bankName}</p>
                        </div>
                      )}
                    </div>
                    {payment.notes && (
                      <p className="text-sm text-slate-600 mt-3 italic">{payment.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Created</p>
                    <p className="text-xs text-slate-600">
                      {format(new Date(payment.createdAt), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {filteredPayments.length > 0 && (
        <Card className="mt-6 bg-slate-50">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Payments</p>
                <p className="text-2xl font-bold text-slate-900">{filteredPayments.length}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">
                  ${filteredPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredPayments.filter(p => p.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
