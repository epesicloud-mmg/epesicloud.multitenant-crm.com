import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Percent, Calendar, Package } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const productOfferSchema = z.object({
  productId: z.number().min(1, "Product is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  discountType: z.enum(["percentage", "fixed_amount"]),
  discountValue: z.number().min(0, "Discount value must be positive"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean(),
});

type ProductOfferForm = z.infer<typeof productOfferSchema>;

interface ProductOffer {
  id: number;
  productId: number;
  name: string;
  description?: string;
  discountType: "percentage" | "fixed_amount";
  discountValue: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  product?: {
    id: number;
    name: string;
    salePrice: number;
  };
}

interface Product {
  id: number;
  name: string;
  salePrice: number;
}

export default function ProductOffersPage() {
  const [open, setOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<ProductOffer | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: offers = [], isLoading } = useQuery<ProductOffer[]>({
    queryKey: ["/api/product-offers"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const form = useForm<ProductOfferForm>({
    resolver: zodResolver(productOfferSchema),
    defaultValues: {
      productId: 0,
      name: "",
      description: "",
      discountType: "percentage",
      discountValue: 0,
      startDate: "",
      endDate: "",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: ProductOfferForm) =>
      apiRequest("POST", "/api/product-offers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/product-offers"] });
      setOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Product offer created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create product offer",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductOfferForm }) =>
      apiRequest("PATCH", `/api/product-offers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/product-offers"] });
      setOpen(false);
      setEditingOffer(null);
      form.reset();
      toast({
        title: "Success",
        description: "Product offer updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update product offer",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/product-offers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/product-offers"] });
      toast({
        title: "Success",
        description: "Product offer deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete product offer",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductOfferForm) => {
    if (editingOffer) {
      updateMutation.mutate({ id: editingOffer.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (offer: ProductOffer) => {
    setEditingOffer(offer);
    form.reset({
      productId: offer.productId,
      name: offer.name,
      description: offer.description || "",
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      startDate: offer.startDate ? offer.startDate.split('T')[0] : "",
      endDate: offer.endDate ? offer.endDate.split('T')[0] : "",
      isActive: offer.isActive,
    });
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product offer?")) {
      deleteMutation.mutate(id);
    }
  };

  const calculateDiscountedPrice = (originalPrice: number, discountType: string, discountValue: number) => {
    if (discountType === "percentage") {
      return originalPrice - (originalPrice * discountValue / 100);
    } else {
      return originalPrice - discountValue;
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading product offers...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Product Offers & Deals</h1>
          <p className="text-slate-600 mt-2">
            Manage promotions, discounts, and special deals for your products
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingOffer(null);
              form.reset({
                productId: 0,
                name: "",
                description: "",
                discountType: "percentage",
                discountValue: 0,
                startDate: "",
                endDate: "",
                isActive: true,
              });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Offer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingOffer ? "Edit Product Offer" : "Create Product Offer"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name} - ${product.salePrice}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Offer Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Summer Sale, Black Friday Deal" {...field} />
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
                          placeholder="Describe this offer..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="discountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="discountValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Value</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Active Offer</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Make this offer available to customers
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
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
                    {editingOffer ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => {
          const product = products.find(p => p.id === offer.productId);
          const discountedPrice = product ? calculateDiscountedPrice(
            product.salePrice, 
            offer.discountType, 
            offer.discountValue
          ) : 0;

          return (
            <Card key={offer.id} className={`${offer.isActive ? 'border-green-200' : 'border-gray-200'}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <Percent className="w-5 h-5 text-green-600" />
                    <CardTitle className="text-lg">{offer.name}</CardTitle>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(offer)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(offer.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {product && (
                  <div className="mb-3 p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Package className="w-3 h-3" />
                      <span>{product.name}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-lg font-semibold text-green-600">
                        ${discountedPrice.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500 line-through ml-2">
                        ${product.salePrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="mb-3">
                  <Badge variant={offer.discountType === 'percentage' ? 'default' : 'secondary'}>
                    {offer.discountType === 'percentage' 
                      ? `${offer.discountValue}% OFF` 
                      : `$${offer.discountValue} OFF`
                    }
                  </Badge>
                  <Badge 
                    variant={offer.isActive ? 'default' : 'secondary'}
                    className="ml-2"
                  >
                    {offer.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {offer.description && (
                  <p className="text-sm text-slate-600 mb-3">{offer.description}</p>
                )}

                {(offer.startDate || offer.endDate) && (
                  <div className="text-xs text-gray-500 space-y-1">
                    {offer.startDate && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Starts: {format(new Date(offer.startDate), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                    {offer.endDate && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Ends: {format(new Date(offer.endDate), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {offers.length === 0 && (
        <Card className="mt-8">
          <CardContent className="text-center py-8">
            <p className="text-slate-500 mb-4">No product offers found</p>
            <p className="text-sm text-slate-400">
              Create your first offer to start promoting your products
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}