import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, TrendingUp, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertDealSchema, type Deal } from "@shared/schema";
import { z } from "zod";

const dealFormSchema = insertDealSchema.omit({ tenantId: true });
type DealFormData = z.infer<typeof dealFormSchema>;

export default function DealsSimple() {
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: deals = [], isLoading } = useQuery<Deal[]>({
    queryKey: ["/api/deals"],
  });

  const form = useForm<DealFormData>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: {
      title: "",
      value: "",
      stageId: null,
      contactId: null,
      productId: null,
      interestLevelId: null,
      expectedCloseDate: null,
      notes: "",
    },
  });

  const createDealMutation = useMutation({
    mutationFn: async (data: DealFormData) => {
      console.log("Creating deal with data:", data);
      const payload = { ...data, tenantId: 1 };
      console.log("Payload with tenantId:", payload);
      const response = await apiRequest("POST", "/api/deals", payload);
      console.log("Create deal response:", response);
      return response.json();
    },
    onSuccess: (result) => {
      console.log("Create deal success:", result);
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      setShowNewDealModal(false);
      form.reset();
      toast({
        title: "Success",
        description: "Deal created successfully",
      });
    },
    onError: (error) => {
      console.error("Create deal error:", error);
      toast({
        title: "Error",
        description: "Failed to create deal",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DealFormData) => {
    console.log("Form submitted with data:", data);
    createDealMutation.mutate(data);
  };

  const openNewDealModal = () => {
    form.reset({
      title: "",
      value: "",
      stageId: null,
      contactId: null,
      productId: null,
      interestLevelId: null,
      expectedCloseDate: null,
      notes: "",
    });
    setShowNewDealModal(true);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Deals (Simple)</h2>
        <Button onClick={openNewDealModal}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Deal
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deals.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-muted-foreground">Loading deals...</div>
            </div>
          ) : deals.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No deals yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Create your first deal to get started</p>
              <Button onClick={openNewDealModal}>
                <Plus className="mr-2 h-4 w-4" />
                Create Deal
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {deals.map((deal) => (
                <div
                  key={deal.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="space-y-1">
                    <h4 className="font-medium">{deal.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-medium text-green-600">${parseFloat(deal.value).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Deal Modal */}
      <Dialog open={showNewDealModal} onOpenChange={setShowNewDealModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Deal</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deal Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter deal title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deal Value</FormLabel>
                    <FormControl>
                      <Input placeholder="0.00" type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewDealModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createDealMutation.isPending}
                >
                  {createDealMutation.isPending ? "Saving..." : "Save Deal"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}