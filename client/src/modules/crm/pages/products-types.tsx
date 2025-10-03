import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Package } from 'lucide-react';

const mockProductTypes = [
  { id: 1, name: 'Software License', description: 'Software products and licenses', count: 12, active: true },
  { id: 2, name: 'Hardware', description: 'Physical hardware products', count: 8, active: true },
  { id: 3, name: 'Service', description: 'Professional services', count: 15, active: true },
  { id: 4, name: 'Subscription', description: 'Recurring subscription products', count: 6, active: true },
  { id: 5, name: 'Training', description: 'Training and education services', count: 4, active: false }
];

export default function ProductTypesPage() {
  const [types, setTypes] = useState(mockProductTypes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Product Types</h1>
          <p className="text-muted-foreground">Manage product type categories</p>
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
              <DialogTitle>Create Product Type</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Type Name</Label>
                <Input placeholder="e.g., Consulting" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Brief description..." />
              </div>
              <Button className="w-full" onClick={() => setIsDialogOpen(false)}>
                Create Type
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{types.reduce((sum, t) => sum + t.count, 0)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Product Types</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Product Count</TableHead>
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