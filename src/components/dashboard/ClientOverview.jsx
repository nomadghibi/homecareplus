import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, TrendingUp, Heart, Activity } from "lucide-react";

export default function ClientOverview({ clients }) {
  const activeClients = clients.filter(c => c.status === 'active').length;
  const inactiveClients = clients.filter(c => c.status === 'inactive').length;
  const pendingClients = clients.filter(c => c.status === 'pending').length;

  const careLevels = {
    basic: clients.filter(c => c.care_level === 'basic').length,
    moderate: clients.filter(c => c.care_level === 'moderate').length,
    intensive: clients.filter(c => c.care_level === 'intensive').length
  };

  const totalClients = clients.length || 1;

  const stats = [
    {
      label: "Active",
      count: activeClients,
      percentage: (activeClients / totalClients) * 100,
      color: "bg-green-500",
      bgColor: "bg-green-100",
      textColor: "text-green-700"
    },
    {
      label: "Pending",
      count: pendingClients,
      percentage: (pendingClients / totalClients) * 100,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-700"
    },
    {
      label: "Inactive",
      count: inactiveClients,
      percentage: (inactiveClients / totalClients) * 100,
      color: "bg-slate-500",
      bgColor: "bg-slate-100",
      textColor: "text-slate-700"
    }
  ];

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-600" />
          Client Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Status Breakdown */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Client Status</h4>
            <div className="space-y-3">
              {stats.map((stat, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">{stat.label}</span>
                    <Badge className={`${stat.bgColor} ${stat.textColor} border-none`}>
                      {stat.count} ({stat.percentage.toFixed(0)}%)
                    </Badge>
                  </div>
                  <Progress value={stat.percentage} className="h-2" indicatorClassName={stat.color} />
                </div>
              ))}
            </div>
          </div>

          {/* Care Level Breakdown */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Care Level Distribution</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {careLevels.basic}
                </div>
                <div className="text-xs text-slate-600">Basic</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {careLevels.moderate}
                </div>
                <div className="text-xs text-slate-600">Moderate</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {careLevels.intensive}
                </div>
                <div className="text-xs text-slate-600">Intensive</div>
              </div>
            </div>
          </div>

          {/* Quick Stat */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-teal-600" />
                <span className="text-sm font-medium text-slate-700">Total Clients</span>
              </div>
              <span className="text-2xl font-bold text-teal-600">{totalClients}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}