import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  Users, 
  Building2, 
  Calculator, 
  TrendingUp, 
  ArrowRight,
  Briefcase,
  PieChart,
  Shield,
  BarChart3,
  Workflow,
  Database
} from "lucide-react";

interface Module {
  id: string;
  name: string;
  description: string;
  route: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  features: string[];
}

const modules: Module[] = [
  {
    id: "crm",
    name: "CRM",
    description: "Customer Relationship Management",
    route: "/crm",
    icon: Users,
    color: "bg-blue-500 hover:bg-blue-600",
    features: []
  },
  {
    id: "finance",
    name: "Finance",
    description: "Financial Management & Accounting",
    route: "/finance", 
    icon: Calculator,
    color: "bg-green-500 hover:bg-green-600",
    features: []
  },
  {
    id: "workflows",
    name: "Projects & Workflows",
    description: "Task Management & Workflow Automation",
    route: "/workflows",
    icon: Workflow,
    color: "bg-orange-500 hover:bg-orange-600",
    features: []
  },
  {
    id: "hr",
    name: "HR",
    description: "Human Resources Management",
    route: "/hr",
    icon: Building2,
    color: "bg-purple-500 hover:bg-purple-600",
    features: []
  },
  {
    id: "analytics",
    name: "AI & Analytics",
    description: "AI-Driven Analytics & Business Intelligence",
    route: "/analytics",
    icon: BarChart3,
    color: "bg-indigo-500 hover:bg-indigo-600",
    features: []
  },
  {
    id: "aam",
    name: "AAM",
    description: "Advanced Access Manager",
    route: "/aam",
    icon: Shield,
    color: "bg-red-500 hover:bg-red-600",
    features: []
  },
  {
    id: "data-manager",
    name: "Data Manager",
    description: "View & Edit All Records",
    route: "/data-manager",
    icon: Database,
    color: "bg-slate-500 hover:bg-slate-600",
    features: []
  }
];

export default function ModuleSelector() {
  const [, setLocation] = useLocation();

  const handleModuleSelect = (module: Module) => {
    setLocation(module.route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Briefcase className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100">
              Epesicloud Platform
            </h1>
          </div>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Select a module to get started with your business management workflow
          </p>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {modules.map((module) => {
            const IconComponent = module.icon;
            return (
              <Card 
                key={module.id} 
                className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 hover:border-blue-200 dark:hover:border-blue-700"
                onClick={() => handleModuleSelect(module)}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 rounded-full ${module.color} flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {module.name}
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-4">
                  {/* Action Button */}
                  <Button 
                    className={`w-full ${module.color} text-white transition-all duration-200 group-hover:shadow-lg`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleModuleSelect(module);
                    }}
                  >
                    Launch {module.name}
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats or Additional Info */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center">
              <TrendingUp className="w-8 h-8 text-blue-600 mb-2" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Scalable</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Each module scales independently
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Building2 className="w-8 h-8 text-green-600 mb-2" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Integrated</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Seamless data flow between modules
              </p>
            </div>
            <div className="flex flex-col items-center">
              <PieChart className="w-8 h-8 text-purple-600 mb-2" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Analytics</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                AI-powered insights across all modules
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}