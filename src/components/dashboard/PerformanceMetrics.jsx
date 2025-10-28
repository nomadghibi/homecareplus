import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Award
} from "lucide-react";

export default function PerformanceMetrics({ visits, evvEvents, claims }) {
  // Calculate metrics
  const totalVisits = visits.length || 1;
  const completedVisits = visits.filter(v => v.status === 'completed').length;
  const completionRate = (completedVisits / totalVisits) * 100;

  const totalEVV = evvEvents.length || 1;
  const validEVV = evvEvents.filter(e => e.verification_status === 'valid' || e.verification_status === 'valid_with_attestation').length;
  const evvMatchRate = (validEVV / totalEVV) * 100;

  const totalClaims = claims.length || 1;
  const acceptedClaims = claims.filter(c => c.claim_status === 'accepted' || c.claim_status === 'paid').length;
  const acceptanceRate = (acceptedClaims / totalClaims) * 100;

  const totalBilled = claims.reduce((sum, c) => sum + (c.total_charge || 0), 0);
  const totalPaid = claims.reduce((sum, c) => sum + (c.paid_amount || 0), 0);
  const collectionRate = totalBilled > 0 ? (totalPaid / totalBilled) * 100 : 0;

  const metrics = [
    {
      title: "Visit Completion",
      value: `${completionRate.toFixed(1)}%`,
      target: 95,
      current: completionRate,
      icon: Award,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "EVV Match Rate",
      value: `${evvMatchRate.toFixed(1)}%`,
      target: 98,
      current: evvMatchRate,
      icon: Target,
      color: "from-teal-500 to-cyan-500"
    },
    {
      title: "Claim Acceptance",
      value: `${acceptanceRate.toFixed(1)}%`,
      target: 97,
      current: acceptanceRate,
      icon: Award,
      color: "from-blue-500 to-indigo-500"
    },
    {
      title: "Collection Rate",
      value: `${collectionRate.toFixed(1)}%`,
      target: 95,
      current: collectionRate,
      icon: Target,
      color: "from-purple-500 to-pink-500"
    }
  ];

  const getTrendIcon = (current, target) => {
    if (current >= target) return TrendingUp;
    if (current >= target * 0.9) return Minus;
    return TrendingDown;
  };

  const getTrendColor = (current, target) => {
    if (current >= target) return "text-green-600";
    if (current >= target * 0.9) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatus = (current, target) => {
    if (current >= target) return { label: "On Target", color: "bg-green-100 text-green-700" };
    if (current >= target * 0.9) return { label: "Close", color: "bg-yellow-100 text-yellow-700" };
    return { label: "Below Target", color: "bg-red-100 text-red-700" };
  };

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-600" />
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-4">
          {metrics.map((metric, idx) => {
            const TrendIcon = getTrendIcon(metric.current, metric.target);
            const trendColor = getTrendColor(metric.current, metric.target);
            const status = getStatus(metric.current, metric.target);
            const MetricIcon = metric.icon;

            return (
              <div key={idx} className="p-4 bg-slate-50 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${metric.color} rounded-lg flex items-center justify-center`}>
                    <MetricIcon className="w-5 h-5 text-white" />
                  </div>
                  <Badge className={`${status.color} border-none`}>
                    {status.label}
                  </Badge>
                </div>
                <h4 className="text-sm font-medium text-slate-600 mb-1">{metric.title}</h4>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold text-slate-900">{metric.value}</span>
                  <TrendIcon className={`w-4 h-4 ${trendColor}`} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Target: {metric.target}%</span>
                  <span className={`font-semibold ${trendColor}`}>
                    {metric.current >= metric.target ? '+' : ''}{(metric.current - metric.target).toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}