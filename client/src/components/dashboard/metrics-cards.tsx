import { Users, Handshake, DollarSign, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";

interface MetricsCardsProps {
  metrics: {
    totalContacts: number;
    activeDeals: number;
    pipelineRevenue: number;
    conversionRate: number;
  };
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards = [
    {
      title: "Total Contacts",
      value: metrics.totalContacts.toLocaleString(),
      change: "+12%",
      changeType: "positive" as const,
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Active Deals",
      value: metrics.activeDeals.toString(),
      change: "+8%",
      changeType: "positive" as const,
      icon: Handshake,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      title: "Revenue Pipeline",
      value: `$${Math.round(metrics.pipelineRevenue / 1000)}K`,
      change: "-3%",
      changeType: "negative" as const,
      icon: DollarSign,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      title: "Conversion Rate",
      value: `${metrics.conversionRate}%`,
      change: "+5%",
      changeType: "positive" as const,
      icon: TrendingUp,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div key={card.title} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">{card.title}</p>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              <p className={`text-sm flex items-center mt-1 ${
                card.changeType === "positive" ? "text-emerald-600" : "text-red-600"
              }`}>
                {card.changeType === "positive" ? (
                  <ArrowUp className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDown className="w-3 h-3 mr-1" />
                )}
                <span>{card.change}</span>
                <span className="text-slate-500 ml-1">vs last month</span>
              </p>
            </div>
            <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}>
              <card.icon className={`w-6 h-6 ${card.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
