import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { X, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertContactSchema, insertCompanySchema, type Company } from "@shared/schema";
import { useTenant } from "@/lib/tenant-context";
import { z } from "zod";

const contactFormSchema = insertContactSchema.omit({ tenantId: true });

type ContactFormData = z.infer<typeof contactFormSchema>;

interface NewContactModalProps {
  onContactCreated?: () => void;
}

export function NewContactModal({ onContactCreated }: NewContactModalProps) {
  const [open, setOpen] = useState(false);
  const [showQuickCompany, setShowQuickCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  const { data: companies } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      jobTitle: "",
      status: "lead",
      notes: "",
      companyId: undefined,
    },
  });

  const createContactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await apiRequest("POST", "/api/contacts", {
        ...data,
        tenantId: 1,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Success",
        description: "Contact created successfully",
      });
      form.reset();
      setOpen(false);
      onContactCreated?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create contact",
        variant: "destructive",
      });
    },
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest("POST", "/api/companies", {
        name,
        tenantId,
      });
    },
    onSuccess: (newCompany) => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      form.setValue("companyId", newCompany.id);
      setShowQuickCompany(false);
      setNewCompanyName("");
      toast({
        title: "Success",
        description: "Company created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create company",
        variant: "destructive",
      });
    },
  });

  const handleQuickAddCompany = () => {
    if (newCompanyName.trim()) {
      createCompanyMutation.mutate(newCompanyName.trim());
    }
  };

  const onSubmit = (data: ContactFormData) => {
    createContactMutation.mutate(data);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Add Contact
      </Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    {!showQuickCompany ? (
                      <div className="space-y-2">
                        <Select onValueChange={(value) => {
                          if (value === "add_new") {
                            setShowQuickCompany(true);
                          } else {
                            field.onChange(value === "none" ? undefined : parseInt(value));
                          }
                        }} value={field.value?.toString() || "none"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a company" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No Company</SelectItem>
                            <SelectItem value="add_new" className="text-blue-600 font-medium">
                              <Plus className="w-4 h-4 inline mr-2" />
                              Add New Company
                            </SelectItem>
                            {companies?.map((company) => (
                              <SelectItem key={company.id} value={company.id.toString()}>
                                {company.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter company name"
                            value={newCompanyName}
                            onChange={(e) => setNewCompanyName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleQuickAddCompany();
                              }
                            }}
                          />
                          <Button
                            type="button"
                            onClick={handleQuickAddCompany}
                            disabled={!newCompanyName.trim() || createCompanyMutation.isPending}
                            size="sm"
                          >
                            {createCompanyMutation.isPending ? "Adding..." : "Add"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowQuickCompany(false);
                              setNewCompanyName("");
                            }}
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="prospect">Prospect</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Textarea
                      placeholder="Add any additional notes..."
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={createContactMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createContactMutation.isPending}
              >
                {createContactMutation.isPending ? "Creating..." : "Create Contact"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
    </>
  );
}
