import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X, Banknote, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Commission } from "@shared/schema";
import { format } from "date-fns";

export default function PendingApproval() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: commissions = [], isLoading } = useQuery<Commission[]>({
    queryKey: ["/api/commissions"],
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/commissions/${id}/approve`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/commissions"] });
      toast({
        title: "Success",
        description: "Commission approved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve commission",
        variant: "destructive",
      });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/commissions/${id}/verify`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/commissions"] });
      toast({
        title: "Success",
        description: "Commission verified successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to verify commission",
        variant: "destructive",
      });
    },
  });

  const pendingCommissions = commissions.filter((commission) => {
    const isPending = commission.status === 'pending' || commission.status === 'verified';
    const matchesSearch = commission.commissionNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return isPending && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      pending: { variant: "secondary", label: "Pending Verification" },
      verified: { variant: "outline", label: "Pending Approval" },
    };
    
    const config = statusMap[status] || { variant: "outline" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pending Approvals</h1>
          <p className="text-slate-600">Review and approve commission requests</p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {pendingCommissions.length} Pending
        </Badge>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          placeholder="Search pending commissions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          data-testid="input-search"
        />
      </div>

      {/* Pending Commission List */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : pendingCommissions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Banknote className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No pending approvals</p>
            <p className="text-sm text-slate-400 mt-2">
              {searchTerm ? "Try adjusting your search" : "All commissions have been processed"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pendingCommissions.map((commission) => (
            <Card key={commission.id} className="hover:shadow-md transition-shadow border-l-4 border-l-amber-500" data-testid={`card-commission-${commission.id}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-slate-900" data-testid={`text-number-${commission.id}`}>
                        Commission #{commission.commissionNumber}
                      </h3>
                      {getStatusBadge(commission.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-slate-500">Total Amount</p>
                        <p className="font-bold text-green-600 text-xl" data-testid={`text-amount-${commission.id}`}>
                          ${parseFloat(commission.totalAmount).toLocaleString()}
                        </p>
                      </div>
                      {commission.commissionRate && (
                        <div>
                          <p className="text-slate-500">Commission Rate</p>
                          <p className="font-medium text-slate-900">{parseFloat(commission.commissionRate).toFixed(2)}%</p>
                        </div>
                      )}
                      <div>
                        <p className="text-slate-500">Created</p>
                        <p className="font-medium text-slate-900">
                          {format(new Date(commission.createdAt), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                    {commission.notes && (
                      <p className="text-sm text-slate-600 mb-4 italic bg-slate-50 p-3 rounded">{commission.notes}</p>
                    )}
                    <div className="flex gap-3">
                      {commission.status === 'pending' && (
                        <Button 
                          size="sm"
                          onClick={() => verifyMutation.mutate(commission.id)}
                          disabled={verifyMutation.isPending}
                          className="flex items-center gap-2"
                          data-testid={`button-verify-${commission.id}`}
                        >
                          <Check className="w-4 h-4" />
                          {verifyMutation.isPending ? "Verifying..." : "Verify"}
                        </Button>
                      )}
                      {commission.status === 'verified' && (
                        <Button 
                          size="sm"
                          onClick={() => approveMutation.mutate(commission.id)}
                          disabled={approveMutation.isPending}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                          data-testid={`button-approve-${commission.id}`}
                        >
                          <Check className="w-4 h-4" />
                          {approveMutation.isPending ? "Approving..." : "Approve"}
                        </Button>
                      )}
                      <Button 
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
