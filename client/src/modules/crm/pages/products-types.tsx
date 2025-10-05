import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const productTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type ProductTypeForm = z.infer<typeof productTypeSchema>;

interface ProductType {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

export default function ProductTypesPage() {
  const [open, setOpen] = useState(false);
  const [editingType, setEditingType] = useState<ProductType | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: productTypes = [], isLoading } = useQuery<ProductType[]>({
    queryKey: ["/api/product-types"],
  });

  const form = useForm<ProductTypeForm>({
    resolver: zodResolver(productTypeSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: ProductTypeForm) =>
      apiRequest("POST", "/api/product-types", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/product-types"] });
      setOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Product type created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create product type",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductTypeForm }) =>
      apiRequest("PATCH", `/api/product-types/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/product-types"] });
      setOpen(false);
      setEditingType(null);
      form.reset();
      toast({
        title: "Success",
        description: "Product type updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update product type",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/product-types/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/product-types"] });
      toast({
        title: "Success",
        description: "Product type deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete product type",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductTypeForm) => {
    if (editingType) {
      updateMutation.mutate({ id: editingType.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (type: ProductType) => {
    setEditingType(type);
    form.reset({
      name: type.name,
      description: type.description || "",
    });
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product type?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-8">
          <div className="animate-pulse">Loading product types...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="heading-product-types">Product Types</h1>
            <p className="text-muted-foreground">Manage product type categories</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingType(null);
                  form.reset({ name: "", description: "" });
                }}
                data-testid="button-add-type"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingType ? "Edit Product Type" : "Create Product Type"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Two Bedroom" 
                            {...field} 
                            data-testid="input-type-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description of the product type"
                            {...field}
                            data-testid="input-type-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-submit-type"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "Saving..."
                      : editingType
                      ? "Update Product Type"
                      : "Create Product Type"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-types">
                {productTypes.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-active-types">
                {productTypes.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-products">45</div>
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
            {productTypes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No product types found. Create one to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productTypes.map((type) => (
                    <TableRow key={type.id} data-testid={`row-type-${type.id}`}>
                      <TableCell className="font-medium" data-testid={`text-type-name-${type.id}`}>
                        {type.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {type.description || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" data-testid={`badge-status-${type.id}`}>
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(type)}
                            data-testid={`button-edit-${type.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(type.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-${type.id}`}
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
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
