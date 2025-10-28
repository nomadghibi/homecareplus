
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function StatsCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  color = "blue", // Keeping default color here for safety if not explicitly provided
  target,
  description,
  unit = ""
}) {
  const colorConfig = {
    blue: "from-blue-500 to-blue-600",
    teal: "from-teal-500 to-teal-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
  };

  // Ensure 'color' prop maps to a valid key in colorConfig, defaulting to 'blue' if not found.
  const effectiveColorClass = colorConfig[color] || colorConfig.blue;
  
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  const progress = target ? (numericValue / target) * 100 : 0;

  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="flex items-start justify-between mb-2 lg:mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs lg:text-sm text-slate-500 mb-1 truncate">{title}</p>
            <div className="flex items-baseline gap-1">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 truncate">
                {value}
              </p>
              {unit && <span className="text-xs lg:text-sm text-slate-500">{unit}</span>}
            </div>
          </div>
          <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${effectiveColorClass} rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
        </div>

        {change && (
          <div className="flex items-center gap-1 mb-2 lg:mb-3">
            <Badge variant={trend === 'up' ? 'default' : 'destructive'} className="text-xs">
              {trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {change}
            </Badge>
          </div>
        )}

        {target && (
          <div className="space-y-1 lg:space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Target: {target}{unit}</span>
              <span className="text-xs font-semibold text-slate-700">{Math.min(progress, 100).toFixed(0)}%</span>
            </div>
            <Progress value={Math.min(progress, 100)} className="h-1.5 lg:h-2" />
          </div>
        )}

        {description && (
          <p className="text-xs text-slate-500 mt-2 truncate">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
