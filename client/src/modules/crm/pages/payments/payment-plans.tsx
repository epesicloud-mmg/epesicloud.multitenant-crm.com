import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, Search, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { PaymentPlan } from "@shared/schema";
import { format } from "date-fns";

export default function PaymentPlans() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: plans = [], isLoading } = useQuery<PaymentPlan[]>({
    queryKey: ["/api/payments/plans"],
  });

  const filteredPlans = plans.filter((plan) => {
    return plan.planName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive", label: string }> = {
      active: { variant: "default", label: "Active" },
      completed: { variant: "secondary", label: "Completed" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };
    
    const config = statusMap[status] || { variant: "secondary" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const calculateProgress = (paid: string, total: string) => {
    const paidAmount = parseFloat(paid);
    const totalAmount = parseFloat(total);
    return totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payment Plans</h1>
          <p className="text-slate-600">Manage installment plans and schedules</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          placeholder="Search payment plans..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          data-testid="input-search"
        />
      </div>

      {/* Payment Plans List */}
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
      ) : filteredPlans.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No payment plans found</p>
            <p className="text-sm text-slate-400 mt-2">
              {searchTerm ? "Try adjusting your search" : "Payment plans will appear here once created"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPlans.map((plan) => {
            const progress = calculateProgress(plan.paidAmount, plan.totalAmount);
            
            return (
              <Card key={plan.id} className="hover:shadow-md transition-shadow" data-testid={`card-plan-${plan.id}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{plan.planName}</h3>
                        {getStatusBadge(plan.status)}
                      </div>
                      <p className="text-sm text-slate-500">
                        {plan.numberOfInstallments} installments • {plan.frequency}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Total Amount</p>
                      <p className="text-2xl font-bold text-slate-900" data-testid={`text-total-${plan.id}`}>
                        ${parseFloat(plan.totalAmount).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Paid: ${parseFloat(plan.paidAmount).toLocaleString()}</span>
                      <span className="text-slate-600">Balance: ${parseFloat(plan.balanceAmount).toLocaleString()}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{progress.toFixed(1)}% paid</span>
                      <span>Per installment: ${parseFloat(plan.installmentAmount).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-4 pt-4 border-t text-sm">
                    <div>
                      <p className="text-slate-500">Start Date</p>
                      <p className="font-medium text-slate-900">
                        <Calendar className="inline w-3 h-3 mr-1" />
                        {format(new Date(plan.startDate), "MMM dd, yyyy")}
                      </p>
                    </div>
                    {plan.endDate && (
                      <div>
                        <p className="text-slate-500">End Date</p>
                        <p className="font-medium text-slate-900">
                          <Calendar className="inline w-3 h-3 mr-1" />
                          {format(new Date(plan.endDate), "MMM dd, yyyy")}
                        </p>
                      </div>
                    )}
                  </div>

                  {plan.notes && (
                    <p className="text-sm text-slate-600 mt-3 pt-3 border-t italic">{plan.notes}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
