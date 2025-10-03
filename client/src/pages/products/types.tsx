import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    return <div className="p-8">Loading product types...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Product Types</h1>
          <p className="text-slate-600 mt-2">
            Classify your products by their nature (physical, digital, service)
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingType(null);
              form.reset({ name: "", description: "" });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product Type
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
                        <Input placeholder="e.g., Physical, Digital, Service" {...field} />
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
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe this product type..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingType ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productTypes.map((type) => (
          <Card key={type.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{type.name}</CardTitle>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(type)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(type.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {type.description && (
                <p className="text-sm text-slate-600 mb-3">{type.description}</p>
              )}
              <Badge variant="secondary" className="text-xs">
                ID: {type.id}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {productTypes.length === 0 && (
        <Card className="mt-8">
          <CardContent className="text-center py-8">
            <p className="text-slate-500 mb-4">No product types found</p>
            <p className="text-sm text-slate-400">
              Create your first product type to organize your products
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}