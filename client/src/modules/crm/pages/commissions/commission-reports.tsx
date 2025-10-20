import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Banknote, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Commission } from "@shared/schema";
import { format } from "date-fns";

export default function CommissionReports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: commissions = [], isLoading } = useQuery<Commission[]>({
    queryKey: ["/api/commissions"],
  });

  const filteredCommissions = commissions.filter((commission) => {
    const matchesSearch = commission.commissionNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || commission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      pending: { variant: "secondary", label: "Pending" },
      verified: { variant: "outline", label: "Verified" },
      approved: { variant: "default", label: "Approved" },
      paid: { variant: "default", label: "Paid" },
    };
    
    const config = statusMap[status] || { variant: "outline" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Commission Reports</h1>
          <p className="text-slate-600">View all commission transactions and approvals</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search by commission number..."
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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Commission List */}
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
      ) : filteredCommissions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Banknote className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No commissions found</p>
            <p className="text-sm text-slate-400 mt-2">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your filters" 
                : "Commissions will appear here once created"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCommissions.map((commission) => (
            <Card key={commission.id} className="hover:shadow-md transition-shadow" data-testid={`card-commission-${commission.id}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900" data-testid={`text-number-${commission.id}`}>
                        Commission #{commission.commissionNumber}
                      </h3>
                      {getStatusBadge(commission.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Total Amount</p>
                        <p className="font-medium text-green-600 text-lg" data-testid={`text-amount-${commission.id}`}>
                          ${parseFloat(commission.totalAmount).toLocaleString()}
                        </p>
                      </div>
                      {commission.commissionRate && (
                        <div>
                          <p className="text-slate-500">Rate</p>
                          <p className="font-medium text-slate-900">{parseFloat(commission.commissionRate).toFixed(2)}%</p>
                        </div>
                      )}
                      {commission.verifiedAt && (
                        <div>
                          <p className="text-slate-500">Verified</p>
                          <p className="font-medium text-slate-900">
                            {format(new Date(commission.verifiedAt), "MMM dd, yyyy")}
                          </p>
                        </div>
                      )}
                      {commission.paidAt && (
                        <div>
                          <p className="text-slate-500">Paid</p>
                          <p className="font-medium text-slate-900">
                            {format(new Date(commission.paidAt), "MMM dd, yyyy")}
                          </p>
                        </div>
                      )}
                    </div>
                    {commission.notes && (
                      <p className="text-sm text-slate-600 mt-3 italic">{commission.notes}</p>
                    )}
                    {commission.paymentReference && (
                      <p className="text-sm text-slate-500 mt-2">
                        Payment Ref: {commission.paymentReference}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Created</p>
                    <p className="text-xs text-slate-600">
                      {format(new Date(commission.createdAt), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {filteredCommissions.length > 0 && (
        <Card className="mt-6 bg-slate-50">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Commissions</p>
                <p className="text-2xl font-bold text-slate-900">{filteredCommissions.length}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">
                  ${filteredCommissions.reduce((sum, c) => sum + parseFloat(c.totalAmount), 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Approved</p>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredCommissions.filter(c => c.status === 'approved').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Paid</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {filteredCommissions.filter(c => c.status === 'paid').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
