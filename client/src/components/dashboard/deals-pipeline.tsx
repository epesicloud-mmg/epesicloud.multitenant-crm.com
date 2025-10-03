import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { Deal, DealStage } from "@shared/schema";

export function DealsPipeline() {
  const { data: stages } = useQuery<DealStage[]>({
    queryKey: ["/api/deal-stages"],
  });

  const { data: deals } = useQuery<Deal[]>({
    queryKey: ["/api/deals"],
  });

  const getDealsForStage = (stageId: number) => {
    return deals?.filter(deal => deal.stageId === stageId) || [];
  };

  const getStageColor = (stageIndex: number) => {
    const colors = [
      "bg-slate-50 border-slate-200",
      "bg-amber-50 border-amber-200",
      "bg-blue-50 border-blue-200",
      "bg-emerald-50 border-emerald-200"
    ];
    return colors[stageIndex] || "bg-slate-50 border-slate-200";
  };

  if (!stages || !deals) {
    return (
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Sales Pipeline</h3>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center text-slate-500">Loading pipeline...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Sales Pipeline</h3>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stages.map((stage, index) => {
            const stageDeals = getDealsForStage(stage.id);
            return (
              <div key={stage.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-slate-700">{stage.name}</h4>
                  <span className="text-xs text-slate-500">{stageDeals.length}</span>
                </div>
                <div className="space-y-2">
                  {stageDeals.slice(0, 3).map((deal) => (
                    <div
                      key={deal.id}
                      className={`p-3 rounded-lg border cursor-move hover:shadow-sm transition-shadow ${getStageColor(index)}`}
                    >
                      <p className="text-sm font-medium text-slate-900">{deal.title}</p>
                      <p className="text-xs text-slate-600">${parseFloat(deal.value).toLocaleString()}</p>
                    </div>
                  ))}
                  {stageDeals.length > 3 && (
                    <div className="text-xs text-slate-500 text-center">
                      +{stageDeals.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
