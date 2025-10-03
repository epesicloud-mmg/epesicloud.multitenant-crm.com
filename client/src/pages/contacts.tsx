import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { NewContactModal } from "@/components/modals/new-contact-modal";
import { AIInsightsModal } from "@/components/modals/ai-insights-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Search, Filter, Edit, Eye, Trash2, Plus, Brain, TrendingUp, Zap, Target } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Contact, Company } from "@shared/schema";

export default function Contacts() {
  const [showNewContactModal, setShowNewContactModal] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentWorkspace, setCurrentWorkspace] = useState('sales-operations');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleWorkspaceChange = (workspace: string) => {
    setCurrentWorkspace(workspace);
  };

  const { data: contacts, isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Success",
        description: "Contact deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
    },
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "lead":
        return "secondary";
      case "prospect":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatTimeAgo = (date: string | null) => {
    if (!date) return "Never";
    const now = new Date();
    const contactDate = new Date(date);
    const diffInDays = Math.floor((now.getTime() - contactDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return `${Math.floor(diffInDays / 7)} weeks ago`;
  };

  const filteredContacts = contacts?.filter(contact =>
    contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <MainLayout 
      showWorkspaceSelector={true} 
      currentWorkspace={currentWorkspace}
      onWorkspaceChange={handleWorkspaceChange}
    >
        
        <div className="p-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            {/* Header */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">All Contacts</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Manage your contacts and customer relationships
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search contacts..."
                      className="w-64 pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAIInsights(true)}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100"
                  >
                    <Brain className="w-4 h-4 mr-2 text-blue-600" />
                    AI Mode
                  </Button>
                  <NewContactModal onContactCreated={() => {
                    queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
                  }} />
                </div>
              </div>
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-8 text-center text-slate-500">
                  Loading contacts...
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  {searchTerm ? "No contacts found matching your search." : "No contacts yet. Create your first contact to get started."}
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Job Title
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Last Contact
                      </th>
                      <th className="text-right py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredContacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-slate-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-medium text-slate-600">
                                {getInitials(contact.firstName, contact.lastName)}
                              </span>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-slate-900">
                                {contact.firstName} {contact.lastName}
                              </p>
                              <p className="text-xs text-slate-500">ID: {contact.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-600">
                          {(contact as any).company?.name || "—"}
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-600">{contact.email}</td>
                        <td className="py-4 px-6 text-sm text-slate-600">{contact.phone || "—"}</td>
                        <td className="py-4 px-6 text-sm text-slate-600">{contact.jobTitle || "—"}</td>
                        <td className="py-4 px-6">
                          <Badge variant={getStatusVariant(contact.status)}>
                            {contact.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-600">
                          {formatTimeAgo(contact.lastContactDate ? contact.lastContactDate.toString() : null)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteContactMutation.mutate(contact.id)}
                              disabled={deleteContactMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            {/* Pagination */}
            {filteredContacts.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Showing <span className="font-medium">{filteredContacts.length}</span> contacts
                </p>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" disabled>
                    Previous
                  </Button>
                  <Button size="sm">1</Button>
                  <Button variant="ghost" size="sm" disabled>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

      <NewContactModal 
        open={showNewContactModal}
        onOpenChange={setShowNewContactModal}
      />

      <AIInsightsModal 
        open={showAIInsights}
        onOpenChange={setShowAIInsights}
        pageType="contacts"
        pageTitle="Contacts"
        contextData={contacts}
      />
    </MainLayout>
  );
}
