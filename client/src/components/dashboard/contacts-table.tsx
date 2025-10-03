import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Edit, Eye, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Contact } from "@shared/schema";

export function ContactsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: contacts, isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6">
          <div className="text-center text-slate-500">Loading contacts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Recent Contacts</h3>
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
            <Button variant="ghost" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
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
            {contacts?.filter(contact =>
              contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              contact.email.toLowerCase().includes(searchTerm.toLowerCase())
            ).slice(0, 10).map((contact) => (
              <tr key={contact.id} className="hover:bg-slate-50">
                <td className="py-4 px-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-slate-600">
                        {getInitials(contact.firstName, contact.lastName)}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-slate-900">
                        {contact.firstName} {contact.lastName}
                      </p>
                      <p className="text-xs text-slate-500">{contact.jobTitle}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-slate-900">
                  {(contact as any).company?.name || "—"}
                </td>
                <td className="py-4 px-6 text-sm text-slate-600">{contact.email}</td>
                <td className="py-4 px-6 text-sm text-slate-600">{contact.phone || "—"}</td>
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
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Showing <span className="font-medium">1</span> to{" "}
          <span className="font-medium">10</span> of{" "}
          <span className="font-medium">{contacts?.length || 0}</span> contacts
        </p>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            Previous
          </Button>
          <Button size="sm">1</Button>
          <Button variant="ghost" size="sm">
            2
          </Button>
          <Button variant="ghost" size="sm">
            3
          </Button>
          <Button variant="ghost" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
