import { useQuery } from "@tanstack/react-query";
import { Phone, Handshake, Mail, Calendar } from "lucide-react";
import type { Activity } from "@shared/schema";

export function RecentActivity() {
  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "call":
        return { icon: Phone, bg: "bg-blue-100", color: "text-blue-600" };
      case "email":
        return { icon: Mail, bg: "bg-purple-100", color: "text-purple-600" };
      case "meeting":
        return { icon: Calendar, bg: "bg-amber-100", color: "text-amber-600" };
      default:
        return { icon: Handshake, bg: "bg-emerald-100", color: "text-emerald-600" };
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
      </div>
      <div className="p-6 space-y-4">
        {activities?.length ? (
          activities.slice(0, 4).map((activity) => {
            const { icon: Icon, bg, color } = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 ${bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900">
                    <span className="font-medium">User</span> {activity.subject}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatTimeAgo(activity.createdAt!)}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-slate-500 py-8">
            No recent activities
          </div>
        )}

        <div className="pt-4 border-t border-slate-200">
          <button className="text-sm text-primary hover:text-primary/80 font-medium">
            View All Activities
          </button>
        </div>
      </div>
    </div>
  );
}
