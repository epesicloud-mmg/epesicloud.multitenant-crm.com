import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, Save, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

const setupProductSchema = z.object({
  salesPipelineId: z.number().optional(),
  name: z.string().min(1, "Product name is required"),
  title: z.string().min(1, "Product title is required"),
  description: z.string().min(1, "Product description is required"),
  salePrice: z.string().min(1, "Sale price is required").regex(/^\d+(\.\d{1,2})?$/, "Enter a valid price"),
  whyClients: z.string().optional(),
  offerDetails: z.string().optional(),
  shortDescription: z.string().optional(),
  categoryId: z.number().optional(),
  productTypeId: z.number().optional(),
  tenantId: z.number(),
});

type SetupProductFormData = z.infer<typeof setupProductSchema>;

interface Product {
  id?: number;
  name: string;
  title: string | null;
  description: string | null;
  salePrice: string | null;
  salesPipelineId?: number | null;
  categoryId?: number | null;
  productTypeId?: number | null;
}

interface ProductSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

export function ProductSetupModal({ open, onOpenChange, product }: ProductSetupModalProps) {
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File | null }>({
    prod1: null,
    prod2: null,
    prod3: null,
    prod4: null,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SetupProductFormData>({
    resolver: zodResolver(setupProductSchema),
    defaultValues: {
      salesPipelineId: undefined,
      name: "",
      title: "",
      description: "",
      salePrice: "",
      whyClients: "",
      offerDetails: "",
      shortDescription: "",
      categoryId: undefined,
      productTypeId: undefined,
      tenantId: Number(localStorage.getItem('tenantId')) || 1,
    },
  });

  useEffect(() => {
    if (open) {
      if (product) {
        form.reset({
          salesPipelineId: product.salesPipelineId ?? undefined,
          name: product.name,
          title: product.title ?? "",
          description: product.description ?? "",
          salePrice: product.salePrice ?? "",
          whyClients: "",
          offerDetails: "",
          shortDescription: "",
          categoryId: product.categoryId ?? undefined,
          productTypeId: product.productTypeId ?? undefined,
          tenantId: Number(localStorage.getItem('tenantId')) || 1,
        });
      } else {
        form.reset({
          salesPipelineId: undefined,
          name: "",
          title: "",
          description: "",
          salePrice: "",
          whyClients: "",
          offerDetails: "",
          shortDescription: "",
          categoryId: undefined,
          productTypeId: undefined,
          tenantId: Number(localStorage.getItem('tenantId')) || 1,
        });
      }
    }
  }, [open, product, form]);

  const createProductSetupMutation = useMutation({
    mutationFn: async (data: SetupProductFormData) => {
      const salePriceNum = parseFloat(data.salePrice);
      if (isNaN(salePriceNum)) {
        throw new Error("Invalid sale price");
      }
      
      const payload = {
        name: data.name,
        title: data.title,
        description: data.description || null,
        salePrice: salePriceNum,
        salesPipelineId: data.salesPipelineId ?? null,
        categoryId: data.categoryId ?? null,
        productTypeId: data.productTypeId ?? null,
        tenantId: data.tenantId,
      };
      
      if (product?.id) {
        const response = await apiRequest("PATCH", `/api/products/${product.id}`, payload);
        return response;
      } else {
        const response = await apiRequest("POST", "/api/products", payload);
        return response;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      form.reset();
      setUploadedFiles({ prod1: null, prod2: null, prod3: null, prod4: null });
      onOpenChange(false);
      toast({
        title: "Success",
        description: product?.id ? "Product updated successfully" : "Product created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || (product?.id ? "Failed to update product" : "Failed to create product"),
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (key: string, file: File | null) => {
    setUploadedFiles(prev => ({ ...prev, [key]: file }));
  };

  const onSubmit = (data: SetupProductFormData) => {
    createProductSetupMutation.mutate(data);
  };

  const FileUploadArea = ({ label, fileKey }: { label: string; fileKey: string }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-slate-400 transition-colors">
        <input
          type="file"
          id={fileKey}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            handleFileUpload(fileKey, file);
          }}
        />
        <label htmlFor={fileKey} className="cursor-pointer">
          <Upload className="mx-auto h-6 w-6 text-slate-400 mb-1" />
          <p className="text-xs text-slate-600">
            {uploadedFiles[fileKey] ? uploadedFiles[fileKey]?.name : "Choose file"}
          </p>
        </label>
        {uploadedFiles[fileKey] && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-1 h-6 px-2 text-xs"
            onClick={() => handleFileUpload(fileKey, null)}
          >
            <X className="w-3 h-3 mr-1" />
            Remove
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900">
            {product?.id ? "Edit Product" : "Product Setup Configuration"}
          </DialogTitle>
          <p className="text-sm text-slate-600">
            Configure your product setup with pipelines, descriptions, and marketing materials
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* File Upload Grid */}
            <div className="grid grid-cols-4 gap-4">
              <FileUploadArea label="Prod 1" fileKey="prod1" />
              <FileUploadArea label="Prod 2" fileKey="prod2" />
              <FileUploadArea label="Prod 3" fileKey="prod3" />
              <FileUploadArea label="Prod 4" fileKey="prod4" />
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-4 gap-4">
              {/* Sales Pipeline */}
              <FormField
                control={form.control}
                name="salesPipelineId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sales Pipeline</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Sales Pipeline" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Default Pipeline</SelectItem>
                        <SelectItem value="2">Enterprise Pipeline</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Product Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Product Name" {...field} data-testid="input-product-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Offer Details */}
              <FormField
                control={form.control}
                name="offerDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Offer Details</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Offer Details" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sale Price */}
              <FormField
                control={form.control}
                name="salePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sale Price *</FormLabel>
                    <FormControl>
                      <Input placeholder="0.00" type="text" {...field} data-testid="input-sale-price" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Text Areas Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Product Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Product Title" {...field} data-testid="input-product-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Short Description */}
              <FormField
                control={form.control}
                name="shortDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Short Description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Product Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter Product Description"
                        className="min-h-[100px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Why clients should buy */}
              <FormField
                control={form.control}
                name="whyClients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Why clients should buy this product?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter why clients should buy this product?"
                        className="min-h-[100px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createProductSetupMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={createProductSetupMutation.isPending}
              >
                Next
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={createProductSetupMutation.isPending}
              >
                {createProductSetupMutation.isPending ? "Saving..." : "Submit"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}