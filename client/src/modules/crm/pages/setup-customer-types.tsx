import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Users } from 'lucide-react';

const mockCustomerTypes = [
  { id: 1, name: 'Enterprise', description: 'Large enterprise clients', count: 45, active: true, color: '#8B5CF6' },
  { id: 2, name: 'SMB', description: 'Small to medium business', count: 128, active: true, color: '#10B981' },
  { id: 3, name: 'Startup', description: 'Early stage companies', count: 67, active: true, color: '#F59E0B' },
  { id: 4, name: 'Non-Profit', description: 'Non-profit organizations', count: 23, active: true, color: '#EF4444' },
  { id: 5, name: 'Government', description: 'Government agencies', count: 12, active: false, color: '#6B7280' }
];

export default function CustomerTypesPage() {
  const [types, setTypes] = useState(mockCustomerTypes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customer Types</h1>
          <p className="text-muted-foreground">Manage customer type categories</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Customer Type</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Type Name</Label>
                <Input placeholder="e.g., Partner" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Brief description..." />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <Input type="color" defaultValue="#3B82F6" />
              </div>
              <Button className="w-full" onClick={() => setIsDialogOpen(false)}>
                Create Type
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{types.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{types.filter(t => t.active).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{types.reduce((sum, t) => sum + t.count, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">SMB</div>
            <p className="text-xs text-muted-foreground">128 customers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Customer Types</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Customer Count</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {types.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell className="text-muted-foreground">{type.description}</TableCell>
                  <TableCell>{type.count}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: type.color }}
                      ></div>
                      <span className="text-sm">{type.color}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={type.active ? "default" : "secondary"}>
                      {type.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}