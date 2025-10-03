import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCompanySchema } from "@shared/schema";
import { Search, Building2, Plus, Edit, Trash2, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Company } from "@shared/schema";
import { z } from "zod";

const companyFormSchema = insertCompanySchema.omit({ tenantId: true }).extend({
  website: z.string().url().optional().or(z.literal("")),
});

type CompanyFormData = z.infer<typeof companyFormSchema>;

export default function Companies() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewCompanyModal, setShowNewCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [currentWorkspace, setCurrentWorkspace] = useState('sales-operations');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleWorkspaceChange = (workspace: string) => {
    setCurrentWorkspace(workspace);
  };

  const { data: companies = [], isLoading } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      console.log("Creating company with data:", data);
      const payload = { ...data, tenantId: 1 };
      console.log("Payload with tenantId:", payload);
      const response = await apiRequest("POST", "/api/companies", payload);
      console.log("Create company response:", response);
      return response.json();
    },
    onSuccess: (result) => {
      console.log("Create company success:", result);
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      setShowNewCompanyModal(false);
      form.reset();
      toast({
        title: "Success",
        description: "Company created successfully",
      });
    },
    onError: (error) => {
      console.error("Create company error:", error);
      toast({
        title: "Error",
        description: "Failed to create company",
        variant: "destructive",
      });
    },
  });

  const updateCompanyMutation = useMutation({
    mutationFn: async (data: CompanyFormData & { id: number }) => {
      const { id, ...updateData } = data;
      const payload = { ...updateData, tenantId: 1 };
      return apiRequest("PUT", `/api/companies/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      setEditingCompany(null);
      setShowNewCompanyModal(false);
      form.reset();
      toast({
        title: "Success",
        description: "Company updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update company",
        variant: "destructive",
      });
    },
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/companies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "Success",
        description: "Company deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete company",
        variant: "destructive",
      });
    },
  });

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      industry: "",
      website: "",
      phone: "",
      address: "",
    },
  });

  const onSubmit = (data: CompanyFormData) => {
    console.log("Form submitted with data:", data);
    console.log("Editing company:", editingCompany);
    if (editingCompany) {
      updateCompanyMutation.mutate({ ...data, id: editingCompany.id });
    } else {
      createCompanyMutation.mutate(data);
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    form.reset({
      name: company.name,
      industry: company.industry || "",
      website: company.website || "",
      phone: company.phone || "",
      address: company.address || "",
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this company?")) {
      deleteCompanyMutation.mutate(id);
    }
  };

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.industry && company.industry.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openNewCompanyModal = () => {
    setEditingCompany(null);
    form.reset({
      name: "",
      industry: "",
      website: "",
      phone: "",
      address: "",
    });
    setShowNewCompanyModal(true);
  };

  return (
    <MainLayout 
      showWorkspaceSelector={true} 
      currentWorkspace={currentWorkspace}
      onWorkspaceChange={handleWorkspaceChange}
    >
      <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-slate-900">Companies</h1>
                <Button onClick={openNewCompanyModal}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Company
                </Button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Companies Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-slate-200 rounded"></div>
                        <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCompanies.map((company: Company) => (
                  <Card key={company.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{company.name}</CardTitle>
                            {company.industry && (
                              <p className="text-sm text-slate-500">{company.industry}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(company)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(company.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {company.website && (
                          <p className="text-sm text-slate-600">
                            <a 
                              href={company.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {company.website}
                            </a>
                          </p>
                        )}
                        {company.phone && (
                          <p className="text-sm text-slate-600">{company.phone}</p>
                        )}
                        {company.address && (
                          <p className="text-sm text-slate-600">{company.address}</p>
                        )}
                        <div className="flex items-center text-sm text-slate-500 pt-2">
                          <Users className="w-4 h-4 mr-1" />
                          <span>0 contacts</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredCompanies.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No companies found</h3>
                <p className="text-slate-500 mb-4">
                  {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first company"}
                </p>
                {!searchTerm && (
                  <Button onClick={openNewCompanyModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Company
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

      {/* New/Edit Company Modal */}
      <Dialog open={showNewCompanyModal || !!editingCompany} onOpenChange={(open) => {
        if (!open) {
          setShowNewCompanyModal(false);
          setEditingCompany(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCompany ? "Edit Company" : "Add New Company"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corporation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Input placeholder="Technology" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St, City, State 12345" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowNewCompanyModal(false);
                    setEditingCompany(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createCompanyMutation.isPending || updateCompanyMutation.isPending}
                >
                  {createCompanyMutation.isPending || updateCompanyMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}