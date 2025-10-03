import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Building, Users, DollarSign, Clock, ArrowRight } from "lucide-react";
import type { Deal, Contact, Company, Activity } from "@shared/schema";
import { useLocation } from "wouter";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch all data for search
  const { data: deals = [] } = useQuery<Deal[]>({ queryKey: ["/api/deals"] });
  const { data: contacts = [] } = useQuery<Contact[]>({ queryKey: ["/api/contacts"] });
  const { data: companies = [] } = useQuery<Company[]>({ queryKey: ["/api/companies"] });
  const { data: activities = [] } = useQuery<Activity[]>({ queryKey: ["/api/activities"] });

  // Filter results based on search query
  const filteredDeals = deals.filter(deal => 
    deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  const filteredContacts = contacts.filter(contact =>
    `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  const filteredActivities = activities.filter(activity =>
    activity.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.type.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  // Focus input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSelect = (type: string, id: number) => {
    onOpenChange(false);
    setSearchQuery("");
    
    switch (type) {
      case 'deal':
        setLocation('/deals');
        break;
      case 'contact':
        setLocation('/contacts');
        break;
      case 'company':
        setLocation('/companies');
        break;
      case 'activity':
        setLocation('/activities');
        break;
    }
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(parseFloat(value));
  };

  const hasResults = filteredDeals.length > 0 || filteredContacts.length > 0 || 
                   filteredCompanies.length > 0 || filteredActivities.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <Command className="rounded-lg border shadow-md">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              ref={inputRef}
              placeholder="Search deals, contacts, companies, activities..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0"
            />
          </div>
          <CommandList className="max-h-96">
            {!hasResults && searchQuery && (
              <CommandEmpty>No results found for "{searchQuery}"</CommandEmpty>
            )}
            
            {filteredDeals.length > 0 && (
              <CommandGroup heading="Deals">
                {filteredDeals.map((deal) => (
                  <CommandItem
                    key={deal.id}
                    onSelect={() => handleSelect('deal', deal.id)}
                    className="flex items-center justify-between cursor-pointer hover:bg-slate-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{deal.title}</div>
                        <div className="text-sm text-slate-500">{formatCurrency(deal.value)}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {filteredContacts.length > 0 && (
              <CommandGroup heading="Contacts">
                {filteredContacts.map((contact) => (
                  <CommandItem
                    key={contact.id}
                    onSelect={() => handleSelect('contact', contact.id)}
                    className="flex items-center justify-between cursor-pointer hover:bg-slate-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{contact.firstName} {contact.lastName}</div>
                        <div className="text-sm text-slate-500">{contact.email}</div>
                        {contact.jobTitle && (
                          <div className="text-xs text-slate-400">{contact.jobTitle}</div>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {filteredCompanies.length > 0 && (
              <CommandGroup heading="Companies">
                {filteredCompanies.map((company) => (
                  <CommandItem
                    key={company.id}
                    onSelect={() => handleSelect('company', company.id)}
                    className="flex items-center justify-between cursor-pointer hover:bg-slate-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Building className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">{company.name}</div>
                        {company.industry && (
                          <div className="text-sm text-slate-500">{company.industry}</div>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {filteredActivities.length > 0 && (
              <CommandGroup heading="Activities">
                {filteredActivities.map((activity) => (
                  <CommandItem
                    key={activity.id}
                    onSelect={() => handleSelect('activity', activity.id)}
                    className="flex items-center justify-between cursor-pointer hover:bg-slate-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium">{activity.subject}</div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {activity.type}
                          </Badge>
                          <span className="text-sm text-slate-500">
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}