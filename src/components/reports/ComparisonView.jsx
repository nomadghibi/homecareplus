import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, DollarSign, Calendar, CheckCircle2, Percent } from "lucide-react";

export default function ComparisonView({ currentMetrics, comparisonMetrics, currentLabel, comparisonLabel }) {
  const calculateChange = (current, previous) => {
    if (previous === 0) return { value: 0, percentage: 0, trend: 'neutral' };
    const diff = current - previous;
    const percentage = (diff / previous) * 100;
    const trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral';
    return { value: diff, percentage, trend };
  };

  const metrics = [
    {
      label: "Total Visits",
      current: currentMetrics.totalVisits,
      previous: comparisonMetrics.totalVisits,
      icon: Calendar,
      format: (val) => val.toString(),
      color: "from-blue-500 to-cyan-500"
    },
    {
      label: "Completion Rate",
      current: currentMetrics.completionRate,
      previous: comparisonMetrics.completionRate,
      icon: CheckCircle2,
      format: (val) => `${val.toFixed(1)}%`,
      color: "from-green-500 to-emerald-500"
    },
    {
      label: "Total Revenue",
      current: currentMetrics.totalRevenue,
      previous: comparisonMetrics.totalRevenue,
      icon: DollarSign,
      format: (val) => `$${val.toFixed(0)}`,
      color: "from-purple-500 to-pink-500"
    },
    {
      label: "Collection Rate",
      current: currentMetrics.collectionRate,
      previous: comparisonMetrics.collectionRate,
      icon: Percent,
      format: (val) => `${val.toFixed(1)}%`,
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle>Period Comparison</CardTitle>
        <div className="flex gap-4 text-sm mt-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Current: {currentLabel}
          </Badge>
          <Badge variant="outline" className="bg-slate-50 text-slate-700">
            vs {comparisonLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, idx) => {
            const change = calculateChange(metric.current, metric.previous);
            const Icon = metric.icon;
            const TrendIcon = change.trend === 'up' ? TrendingUp : change.trend === 'down' ? TrendingDown : Minus;
            const trendColor = change.trend === 'up' ? 'text-green-600' : change.trend === 'down' ? 'text-red-600' : 'text-slate-600';

            return (
              <div key={idx} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 bg-gradient-to-r ${metric.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-600">{metric.label}</span>
                </div>
                
                <div>
                  <div className="text-2xl font-bold text-slate-900 mb-1">
                    {metric.format(metric.current)}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendIcon className={`w-4 h-4 ${trendColor}`} />
                    <span className={trendColor}>
                      {change.percentage > 0 ? '+' : ''}{change.percentage.toFixed(1)}%
                    </span>
                    <span className="text-slate-500">
                      ({change.value > 0 ? '+' : ''}{metric.format(change.value)})
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="text-xs text-slate-500">Previous Period</div>
                  <div className="font-semibold text-slate-700">{metric.format(metric.previous)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}