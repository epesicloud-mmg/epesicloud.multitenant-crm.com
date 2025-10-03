import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Package } from "lucide-react";
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

const productCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

type ProductCategoryForm = z.infer<typeof productCategorySchema>;

interface ProductCategory {
  id: number;
  name: string;
  description?: string;
  color: string;
  icon: string;
  createdAt: string;
}

const iconOptions = [
  { name: "Package", value: "Package" },
  { name: "Smartphone", value: "Smartphone" },
  { name: "Laptop", value: "Laptop" },
  { name: "Car", value: "Car" },
  { name: "Home", value: "Home" },
  { name: "Shirt", value: "Shirt" },
  { name: "Book", value: "Book" },
  { name: "Coffee", value: "Coffee" },
];

const colorOptions = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#10b981" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Pink", value: "#ec4899" },
  { name: "Yellow", value: "#eab308" },
  { name: "Teal", value: "#14b8a6" },
];

export default function ProductCategoriesPage() {
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery<ProductCategory[]>({
    queryKey: ["/api/product-categories"],
  });

  const form = useForm<ProductCategoryForm>({
    resolver: zodResolver(productCategorySchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#3b82f6",
      icon: "Package",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: ProductCategoryForm) =>
      apiRequest("POST", "/api/product-categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/product-categories"] });
      setOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Product category created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create product category",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductCategoryForm }) =>
      apiRequest("PATCH", `/api/product-categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/product-categories"] });
      setOpen(false);
      setEditingCategory(null);
      form.reset();
      toast({
        title: "Success",
        description: "Product category updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update product category",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/product-categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/product-categories"] });
      toast({
        title: "Success",
        description: "Product category deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete product category",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductCategoryForm) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (category: ProductCategory) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      description: category.description || "",
      color: category.color,
      icon: category.icon,
    });
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product category?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading product categories...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Product Categories</h1>
          <p className="text-slate-600 mt-2">
            Organize your products into visual categories with colors and icons
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingCategory(null);
              form.reset({ name: "", description: "", color: "#3b82f6", icon: "Package" });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Product Category" : "Create Product Category"}
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
                        <Input placeholder="e.g., Electronics, Clothing, Books" {...field} />
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
                          placeholder="Describe this category..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            className={`w-8 h-8 rounded-full border-2 ${
                              field.value === color.value ? "border-gray-800" : "border-gray-300"
                            }`}
                            style={{ backgroundColor: color.value }}
                            onClick={() => field.onChange(color.value)}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon</FormLabel>
                      <div className="grid grid-cols-4 gap-2">
                        {iconOptions.map((icon) => (
                          <button
                            key={icon.value}
                            type="button"
                            className={`p-2 border rounded ${
                              field.value === icon.value ? "border-blue-500 bg-blue-50" : "border-gray-300"
                            }`}
                            onClick={() => field.onChange(icon.value)}
                          >
                            <Package className="w-6 h-6 mx-auto" />
                            <span className="text-xs">{icon.name}</span>
                          </button>
                        ))}
                      </div>
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
                    {editingCategory ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="border-l-4" style={{ borderLeftColor: category.color }}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: category.color }}
                  >
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {category.description && (
                <p className="text-sm text-slate-600 mb-3">{category.description}</p>
              )}
              <div className="flex justify-between items-center">
                <Badge variant="secondary" className="text-xs">
                  ID: {category.id}
                </Badge>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-xs text-slate-500">{category.icon}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <Card className="mt-8">
          <CardContent className="text-center py-8">
            <p className="text-slate-500 mb-4">No product categories found</p>
            <p className="text-sm text-slate-400">
              Create your first category to organize your products visually
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}