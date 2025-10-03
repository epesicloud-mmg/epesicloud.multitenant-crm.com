import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Package, Edit, Trash2, DollarSign, Search, Filter, Settings } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { ProductSetupModal } from "@/components/modals/product-setup-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertProductSchema, type Product } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const productFormSchema = insertProductSchema.omit({ tenantId: true }).extend({
  salePrice: z.string().min(1, "Price is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 0,
    { message: "Price must be a valid non-negative number" }
  ),
});

type ProductFormData = z.infer<typeof productFormSchema>;

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showProductSetup, setShowProductSetup] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentWorkspace, setCurrentWorkspace] = useState('sales-operations');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleWorkspaceChange = (workspace: string) => {
    setCurrentWorkspace(workspace);
  };

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      console.log("Creating product with data:", data);
      const payload = { ...data, tenantId: 1 };
      const response = await apiRequest("POST", "/api/products", payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Product created successfully",
      });
    },
    onError: (error) => {
      console.error("Error creating product:", error);
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      if (!editingProduct) throw new Error("No product to update");
      const payload = { ...data, tenantId: 1 };
      const response = await apiRequest("PATCH", `/api/products/${editingProduct.id}`, payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsDialogOpen(false);
      setEditingProduct(null);
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/products/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    },
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      title: "",
      description: "",
      salePrice: "",
    },
  });

  const onSubmit = (data: ProductFormData) => {
    console.log("Form submitted with data:", data);
    console.log("Form errors:", form.formState.errors);
    
    // Validate required fields
    if (!data.name || !data.title || !data.salePrice) {
      console.error("Missing required fields:", { name: data.name, title: data.title, salePrice: data.salePrice });
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (name, title, price)",
        variant: "destructive",
      });
      return;
    }
    
    if (editingProduct) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      title: product.title || "",
      description: product.description || "",
      salePrice: product.salePrice.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    form.reset({
      name: "",
      title: "",
      description: "",
      salePrice: "",
    });
    setIsDialogOpen(true);
  };

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <MainLayout 
        showWorkspaceSelector={true} 
        currentWorkspace={currentWorkspace}
        onWorkspaceChange={handleWorkspaceChange}
      >
        <div className="p-6">Loading products...</div>
      </MainLayout>
    );
  }

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
                  <h3 className="text-lg font-semibold text-slate-900">Product Catalog</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Manage your products and services
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search products..."
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
                    onClick={() => setShowProductSetup(true)}
                    className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:from-purple-100 hover:to-pink-100"
                  >
                    <Settings className="w-4 h-4 mr-2 text-purple-600" />
                    Product Setup
                  </Button>
                  <Button onClick={handleNewProduct}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        No products found. Add your first product to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                              <Package className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{product.name}</div>
                              <div className="text-sm text-slate-500">ID: {product.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm text-slate-600 truncate">
                              {product.description || "No description"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-900">
                              {product.salePrice.toLocaleString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Regular Product Modal */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
              <DialogDescription>
                {editingProduct 
                  ? "Update the product information below." 
                  : "Fill in the details to add a new product to your catalog."
                }
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product title" {...field} />
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
                          placeholder="Enter product description"
                          className="resize-none"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sale Price</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    onClick={(e) => {
                      console.log("Create Product button clicked!");
                      console.log("Form valid:", form.formState.isValid);
                      console.log("Form errors:", form.formState.errors);
                      console.log("Form values:", form.getValues());
                    }}
                  >
                    {editingProduct ? "Update" : "Create"} Product
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Product Setup Modal */}
        <ProductSetupModal 
          open={showProductSetup} 
          onOpenChange={setShowProductSetup}
        />
    </MainLayout>
  );
}