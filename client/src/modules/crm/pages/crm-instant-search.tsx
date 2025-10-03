import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Users, Building2, Phone, Mail, Calendar, DollarSign } from 'lucide-react';

export default function CRMInstantSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const searchResults = {
    contacts: [
      { id: 1, name: 'John Smith', company: 'Tech Corp', email: 'john@techcorp.com', phone: '+1-555-0123' },
      { id: 2, name: 'Sarah Johnson', company: 'Innovation Ltd', email: 'sarah@innovation.com', phone: '+1-555-0124' },
    ],
    companies: [
      { id: 1, name: 'Tech Corp', industry: 'Technology', revenue: 2500000, employees: 50 },
      { id: 2, name: 'Innovation Ltd', industry: 'Software', revenue: 1800000, employees: 35 },
    ],
    deals: [
      { id: 1, title: 'Q1 Software License', company: 'Tech Corp', value: 50000, stage: 'Negotiation' },
      { id: 2, title: 'Annual Support Contract', company: 'Innovation Ltd', value: 25000, stage: 'Proposal' },
    ],
    activities: [
      { id: 1, type: 'Call', subject: 'Follow-up call with John Smith', date: '2025-01-10', contact: 'John Smith' },
      { id: 2, type: 'Meeting', subject: 'Demo presentation', date: '2025-01-12', contact: 'Sarah Johnson' },
    ]
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Instant Search</h1>
          <p className="text-muted-foreground">Search across all your CRM data instantly</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts, companies, deals, activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-lg py-6"
            />
          </div>
        </CardContent>
      </Card>

      {searchQuery && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Contacts ({searchResults.contacts.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {searchResults.contacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <div>
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-muted-foreground">{contact.company}</div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                        <Mail className="h-3 w-3" />
                        <span>{contact.email}</span>
                        <Phone className="h-3 w-3 ml-2" />
                        <span>{contact.phone}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Companies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Companies ({searchResults.companies.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {searchResults.companies.map((company) => (
                  <div key={company.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <div>
                      <div className="font-medium">{company.name}</div>
                      <div className="text-sm text-muted-foreground">{company.industry}</div>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                        <span>{formatCurrency(company.revenue)} revenue</span>
                        <span>{company.employees} employees</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Deals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Deals ({searchResults.deals.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {searchResults.deals.map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <div>
                      <div className="font-medium">{deal.title}</div>
                      <div className="text-sm text-muted-foreground">{deal.company}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{deal.stage}</Badge>
                        <span className="text-sm font-medium">{formatCurrency(deal.value)}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Activities ({searchResults.activities.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {searchResults.activities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <div>
                      <div className="font-medium">{activity.subject}</div>
                      <div className="text-sm text-muted-foreground">with {activity.contact}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{activity.type}</Badge>
                        <span className="text-xs text-muted-foreground">{activity.date}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">Searchable items</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Recent Searches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0.2s</div>
              <p className="text-xs text-muted-foreground">Search time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98%</div>
              <p className="text-xs text-muted-foreground">Find rate</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}