import { useState } from "react";
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
  salesPipeline: z.string().min(1, "Sales pipeline is required"),
  projectName: z.string().min(1, "Project name is required"),
  projectDescription: z.string().min(1, "Project description is required"),
  whyClients: z.string().min(1, "Why clients should buy is required"),
  offerDetails: z.string().min(1, "Offer details are required"),
  shortDescription: z.string().min(1, "Short description is required"),
  marketingList: z.string().min(1, "Marketing list is required"),
});

type SetupProductFormData = z.infer<typeof setupProductSchema>;

interface ProductSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductSetupModal({ open, onOpenChange }: ProductSetupModalProps) {
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
      salesPipeline: "",
      projectName: "",
      projectDescription: "",
      whyClients: "",
      offerDetails: "",
      shortDescription: "",
      marketingList: "",
    },
  });

  const createProductSetupMutation = useMutation({
    mutationFn: async (data: SetupProductFormData) => {
      // For now, just simulate saving the product setup
      // In a real app, this would save to a products_setup table
      const response = await apiRequest("POST", "/api/products", {
        name: data.projectName,
        description: data.projectDescription,
        salePrice: "0", // Default price, can be updated later
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      form.reset();
      setUploadedFiles({ prod1: null, prod2: null, prod3: null, prod4: null });
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Product setup saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save product setup",
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
            Product Setup Configuration
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
                name="salesPipeline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sales Pipeline</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Sales Pipeline" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="default">Default Pipeline</SelectItem>
                        <SelectItem value="enterprise">Enterprise Pipeline</SelectItem>
                        <SelectItem value="startup">Startup Pipeline</SelectItem>
                        <SelectItem value="smb">SMB Pipeline</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Project Name */}
              <FormField
                control={form.control}
                name="projectName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Project Name" {...field} />
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

              {/* Short Description */}
              <FormField
                control={form.control}
                name="shortDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Short Description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Text Areas Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Project Description */}
              <FormField
                control={form.control}
                name="projectDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter Project Description"
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
                    <FormLabel>Why clients should buy into this service or this project?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter Why clients should buy into this service or this project?"
                        className="min-h-[100px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Marketing List */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="marketingList"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marketing List</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Real Estate Companies" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="real-estate">Real Estate Companies</SelectItem>
                        <SelectItem value="tech-startups">Tech Startups</SelectItem>
                        <SelectItem value="healthcare">Healthcare Providers</SelectItem>
                        <SelectItem value="finance">Financial Services</SelectItem>
                        <SelectItem value="retail">Retail Businesses</SelectItem>
                      </SelectContent>
                    </Select>
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