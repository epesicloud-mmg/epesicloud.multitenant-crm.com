import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Edit, Trash2, Plus, Database, Users, Building, DollarSign, FileText, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const entities = [
  { 
    key: 'contacts', 
    name: 'Contacts', 
    icon: Users, 
    endpoint: '/api/contacts',
    fields: ['firstName', 'lastName', 'email', 'phone', 'status'],
    displayField: 'firstName'
  },
  { 
    key: 'companies', 
    name: 'Companies', 
    icon: Building, 
    endpoint: '/api/companies',
    fields: ['name', 'industry', 'website', 'size', 'status'],
    displayField: 'name'
  },
  { 
    key: 'deals', 
    name: 'Deals', 
    icon: DollarSign, 
    endpoint: '/api/deals',
    fields: ['title', 'value', 'stage', 'probability', 'closeDate'],
    displayField: 'title'
  },
  { 
    key: 'activities', 
    name: 'Activities', 
    icon: Activity, 
    endpoint: '/api/activities',
    fields: ['type', 'subject', 'description', 'status', 'dueDate'],
    displayField: 'subject'
  },
  { 
    key: 'invoices', 
    name: 'Invoices', 
    icon: FileText, 
    endpoint: '/api/finance/invoices',
    fields: ['invoiceNumber', 'amount', 'status', 'dueDate', 'customerId'],
    displayField: 'invoiceNumber'
  },
  { 
    key: 'expenses', 
    name: 'Expenses', 
    icon: DollarSign, 
    endpoint: '/api/finance/expenses',
    fields: ['description', 'amount', 'category', 'date', 'status'],
    displayField: 'description'
  }
];

export default function DataManager() {
  const [selectedEntity, setSelectedEntity] = useState(entities[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch data for selected entity
  const { data: records = [], isLoading, refetch } = useQuery({
    queryKey: [selectedEntity.endpoint],
    enabled: !!selectedEntity
  });

  // Filter records based on search
  const filteredRecords = Array.isArray(records) ? records.filter((record: any) => {
    if (!searchTerm) return true;
    return selectedEntity.fields.some(field => 
      record[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) : [];

  // Update record mutation
  const updateRecordMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`${selectedEntity.endpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': '1'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update record');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [selectedEntity.endpoint] });
      setIsEditDialogOpen(false);
      setEditingRecord(null);
      toast({
        title: "Success",
        description: "Record updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update record",
        variant: "destructive",
      });
    }
  });

  // Delete record mutation
  const deleteRecordMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${selectedEntity.endpoint}/${id}`, {
        method: 'DELETE',
        headers: {
          'X-Tenant-Id': '1'
        }
      });
      if (!response.ok) throw new Error('Failed to delete record');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [selectedEntity.endpoint] });
      toast({
        title: "Success",
        description: "Record deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete record",
        variant: "destructive",
      });
    }
  });

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setIsEditDialogOpen(true);
  };

  const handleSave = () => {
    if (editingRecord) {
      updateRecordMutation.mutate({
        id: editingRecord.id,
        data: editingRecord
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this record?")) {
      deleteRecordMutation.mutate(id);
    }
  };

  const formatFieldValue = (value: any, field: string) => {
    if (value === null || value === undefined) return '-';
    if (field.includes('Date') && value) {
      return new Date(value).toLocaleDateString();
    }
    if (field === 'value' || field === 'amount') {
      return typeof value === 'number' ? `$${value.toLocaleString()}` : value;
    }
    if (field === 'status') {
      return <Badge variant="outline">{value}</Badge>;
    }
    return value.toString();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Database className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Data Manager</h1>
            <p className="text-slate-500">View and edit records across all entities</p>
          </div>
        </div>
      </div>

      {/* Entity Selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {entities.map((entity) => {
          const IconComponent = entity.icon;
          return (
            <Card
              key={entity.key}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedEntity.key === entity.key ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedEntity(entity)}
            >
              <CardContent className="p-4 text-center">
                <IconComponent className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium">{entity.name}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <selectedEntity.icon className="h-5 w-5" />
              {selectedEntity.name}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {selectedEntity.fields.map((field) => (
                    <TableHead key={field} className="capitalize">
                      {field.replace(/([A-Z])/g, ' $1').trim()}
                    </TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record: any) => (
                  <TableRow key={record.id}>
                    {selectedEntity.fields.map((field) => (
                      <TableCell key={field}>
                        {formatFieldValue(record[field], field)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(record)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(record.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {filteredRecords.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <p className="text-gray-500">No records found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit {selectedEntity.name.slice(0, -1)}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {editingRecord && selectedEntity.fields.map((field) => (
              <div key={field}>
                <Label htmlFor={field} className="capitalize">
                  {field.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
                {field === 'description' ? (
                  <Textarea
                    id={field}
                    value={editingRecord[field] || ''}
                    onChange={(e) => setEditingRecord({
                      ...editingRecord,
                      [field]: e.target.value
                    })}
                    className="mt-1"
                  />
                ) : (
                  <Input
                    id={field}
                    type={field.includes('Date') ? 'date' : field === 'value' || field === 'amount' ? 'number' : 'text'}
                    value={editingRecord[field] || ''}
                    onChange={(e) => setEditingRecord({
                      ...editingRecord,
                      [field]: e.target.value
                    })}
                    className="mt-1"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={updateRecordMutation.isPending}
            >
              {updateRecordMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}