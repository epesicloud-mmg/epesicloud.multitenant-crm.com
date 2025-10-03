import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, Clock, Target } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import type { Deal, DealStage } from "@shared/schema";

export default function PipelineAnalysis() {
  const { data: deals } = useQuery({ queryKey: ["/api/deals"] });
  const { data: dealStages } = useQuery({ queryKey: ["/api/deal-stages"] });

  const dealsData = (deals as Deal[]) || [];
  const stagesData = (dealStages as DealStage[]) || [];

  // Calculate pipeline metrics
  const totalPipelineValue = dealsData.reduce((sum, deal) => sum + parseFloat(deal.value), 0);
  const avgDealValue = dealsData.length > 0 ? totalPipelineValue / dealsData.length : 0;

  // Group deals by stage
  const dealsByStage = stagesData.map(stage => {
    const stageDeals = dealsData.filter(deal => deal.stageId === stage.id);
    const stageValue = stageDeals.reduce((sum, deal) => sum + parseFloat(deal.value), 0);
    
    return {
      stage: stage.name,
      count: stageDeals.length,
      value: stageValue,
      percentage: dealsData.length > 0 ? Math.round((stageDeals.length / dealsData.length) * 100) : 0
    };
  });

  // Calculate conversion rates between stages
  const conversionRates = stagesData.slice(0, -1).map((stage, index) => {
    const currentStageDeals = dealsData.filter(deal => deal.stageId === stage.id).length;
    const nextStageDeals = dealsData.filter(deal => deal.stageId === stagesData[index + 1]?.id).length;
    const rate = currentStageDeals > 0 ? Math.round((nextStageDeals / currentStageDeals) * 100) : 0;
    
    return {
      from: stage.name,
      to: stagesData[index + 1]?.name || 'Closed',
      rate: rate,
      deals: currentStageDeals
    };
  });

  // Time-based analysis
  const dealAges = dealsData.map(deal => {
    const daysSinceCreated = Math.floor((Date.now() - new Date(deal.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceCreated;
  });

  const avgDealAge = dealAges.length > 0 ? Math.round(dealAges.reduce((sum, age) => sum + age, 0) / dealAges.length) : 0;
  const oldestDeal = dealAges.length > 0 ? Math.max(...dealAges) : 0;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Pipeline Analysis</h1>
          <p className="text-slate-600">
            Detailed analysis of your sales pipeline and deal progression
          </p>
        </div>

        {/* Key Pipeline Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalPipelineValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total opportunity value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dealsData.length}</div>
              <p className="text-xs text-muted-foreground">
                Currently in pipeline
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${avgDealValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Average opportunity size
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Age</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgDealAge} days</div>
              <p className="text-xs text-muted-foreground">
                Average time in pipeline
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Pipeline Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Distribution</CardTitle>
              <CardDescription>Deals by stage</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dealsByStage}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ stage, percentage }) => `${stage} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {dealsByStage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Stage Progression */}
          <Card>
            <CardHeader>
              <CardTitle>Stage Details</CardTitle>
              <CardDescription>Deals and value by stage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dealsByStage.map((stage, index) => (
                  <div key={stage.stage} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{stage.stage}</span>
                      <span>{stage.count} deals</span>
                    </div>
                    <Progress value={stage.percentage} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      ${stage.value.toLocaleString()} value
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Health</CardTitle>
              <CardDescription>Overall pipeline status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Active Deals</span>
                  <span className="font-medium">{dealsData.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Value</span>
                  <span className="font-medium">${totalPipelineValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Oldest Deal</span>
                  <span className="font-medium">{oldestDeal} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Stalled Deals ({'>'}30 days)</span>
                  <span className="font-medium text-amber-600">
                    {dealAges.filter(age => age > 30).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Rates */}
        {conversionRates.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Stage Conversion Rates</CardTitle>
              <CardDescription>Conversion between pipeline stages</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={conversionRates}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="from" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="rate" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}