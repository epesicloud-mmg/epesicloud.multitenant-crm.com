import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, FileText, Users, Building, Target, Handshake } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";


type DataType = "leads" | "contacts" | "companies" | "deals";

interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  duplicates: number;
}

export default function ImportExport() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dataType, setDataType] = useState<DataType>("leads");
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async (type: DataType) => {
      const response = await fetch(`/api/export/${type}`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Export failed");
      }
      return response.json();
    },
    onSuccess: (data, type) => {
      // Convert data to CSV and download
      const csvContent = convertToCSV(data, type);
      downloadCSV(csvContent, `${type}_export_${new Date().toISOString().split('T')[0]}.csv`);
      toast({
        title: "Export Successful",
        description: `${type} data exported successfully`,
      });
    },
    onError: () => {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File; type: DataType }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Import failed");
      }

      return response.json() as Promise<ImportResult>;
    },
    onSuccess: (result) => {
      setIsImporting(false);
      setImportProgress(100);
      
      if (result.success) {
        toast({
          title: "Import Successful",
          description: `Imported ${result.imported} records. ${result.duplicates} duplicates skipped.`,
        });
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: [`/api/${dataType}`] });
      } else {
        toast({
          title: "Import Completed with Errors",
          description: `${result.errors.length} errors occurred during import.`,
          variant: "destructive",
        });
      }
    },
    onError: () => {
      setIsImporting(false);
      toast({
        title: "Import Failed",
        description: "Failed to import data. Please check file format and try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      setSelectedFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
    }
  };

  const handleImport = () => {
    if (!selectedFile) return;

    setIsImporting(true);
    setImportProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    importMutation.mutate({ file: selectedFile, type: dataType });
  };

  const handleExport = (type: DataType) => {
    exportMutation.mutate(type);
  };

  const convertToCSV = (data: any[], type: DataType): string => {
    if (!data.length) return "";

    const headers = getCSVHeaders(type);
    const csvRows = [headers.join(",")];

    data.forEach((item) => {
      const row = headers.map((header) => {
        const value = item[header.toLowerCase()] || "";
        // Escape commas and quotes in CSV
        return typeof value === "string" && (value.includes(",") || value.includes('"'))
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      });
      csvRows.push(row.join(","));
    });

    return csvRows.join("\n");
  };

  const getCSVHeaders = (type: DataType): string[] => {
    switch (type) {
      case "leads":
        return ["firstName", "lastName", "email", "phone", "company", "jobTitle", "source", "status", "notes"];
      case "contacts":
        return ["firstName", "lastName", "email", "phone", "jobTitle", "company"];
      case "companies":
        return ["name", "industry", "website", "phone", "address"];
      case "deals":
        return ["title", "value", "stage", "expectedCloseDate", "notes"];
      default:
        return [];
    }
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDataTypeIcon = (type: DataType) => {
    switch (type) {
      case "leads": return <Target className="w-5 h-5" />;
      case "contacts": return <Users className="w-5 h-5" />;
      case "companies": return <Building className="w-5 h-5" />;
      case "deals": return <Handshake className="w-5 h-5" />;
    }
  };

  // Get data counts for each type
  const { data: leadsData } = useQuery({ queryKey: ["/api/leads"] });
  const { data: contactsData } = useQuery({ queryKey: ["/api/contacts"] });
  const { data: companiesData } = useQuery({ queryKey: ["/api/companies"] });
  const { data: dealsData } = useQuery({ queryKey: ["/api/deals"] });

  const getDataTypeCount = (type: DataType) => {
    switch (type) {
      case "leads": return Array.isArray(leadsData) ? leadsData.length : 0;
      case "contacts": return Array.isArray(contactsData) ? contactsData.length : 0;
      case "companies": return Array.isArray(companiesData) ? companiesData.length : 0;
      case "deals": return Array.isArray(dealsData) ? dealsData.length : 0;
      default: return 0;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Import & Export</h1>
        <p className="text-slate-500 mt-2">
          Import data from CSV files or export your CRM data for backup and analysis.
        </p>
      </div>

      <Tabs defaultValue="export" className="space-y-6">
        <TabsList>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(["leads", "contacts", "companies", "deals"] as DataType[]).map((type) => (
              <Card key={type} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg capitalize">
                    {getDataTypeIcon(type)}
                    {type}
                  </CardTitle>
                  <CardDescription>
                    {getDataTypeCount(type)} records available
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleExport(type)}
                    disabled={exportMutation.isPending}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Export Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-slate-600">
                • Exported files are in CSV format and can be opened in Excel or Google Sheets
              </p>
              <p className="text-sm text-slate-600">
                • Data is exported based on your current role permissions
              </p>
              <p className="text-sm text-slate-600">
                • Files include all visible records and standard fields
              </p>
              <p className="text-sm text-slate-600">
                • Export files are timestamped for easy identification
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Import Data
              </CardTitle>
              <CardDescription>
                Upload a CSV file to import data into your CRM
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="dataType">Data Type</Label>
                  <Select value={dataType} onValueChange={(value) => setDataType(value as DataType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select data type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leads">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Leads
                        </div>
                      </SelectItem>
                      <SelectItem value="contacts">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Contacts
                        </div>
                      </SelectItem>
                      <SelectItem value="companies">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          Companies
                        </div>
                      </SelectItem>
                      <SelectItem value="deals">
                        <div className="flex items-center gap-2">
                          <Handshake className="w-4 h-4" />
                          Deals
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="file">CSV File</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                  />
                  {selectedFile && (
                    <p className="text-sm text-slate-600 mt-1">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>

                {isImporting && (
                  <div className="space-y-2">
                    <Label>Import Progress</Label>
                    <Progress value={importProgress} className="w-full" />
                    <p className="text-sm text-slate-600">{importProgress}% complete</p>
                  </div>
                )}

                <Button
                  onClick={handleImport}
                  disabled={!selectedFile || isImporting || importMutation.isPending}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isImporting ? "Importing..." : "Import Data"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CSV Format Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Leads CSV Format:</h4>
                <code className="text-xs bg-slate-100 p-2 rounded block">
                  firstName,lastName,email,phone,company,jobTitle,source,status,notes
                </code>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-2">Contacts CSV Format:</h4>
                <code className="text-xs bg-slate-100 p-2 rounded block">
                  firstName,lastName,email,phone,jobTitle,company
                </code>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-2">Companies CSV Format:</h4>
                <code className="text-xs bg-slate-100 p-2 rounded block">
                  name,industry,website,phone,address
                </code>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-2">Deals CSV Format:</h4>
                <code className="text-xs bg-slate-100 p-2 rounded block">
                  title,value,stage,expectedCloseDate,notes
                </code>
              </div>
              <div className="text-sm text-slate-600 space-y-1">
                <p>• First row must contain column headers</p>
                <p>• Dates should be in YYYY-MM-DD format</p>
                <p>• Duplicate records will be skipped based on email (leads/contacts) or name (companies/deals)</p>
                <p>• Invalid records will be reported in the import summary</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}