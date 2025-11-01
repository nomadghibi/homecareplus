import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserCheck,
  Calendar,
  TrendingUp,
  AlertCircle,
  Crown,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { getUsageStats, checkTrialStatus } from "@/utils/resourceLimits";

export default function UsageStatsCard() {
  const [usage, setUsage] = useState(null);
  const [trialStatus, setTrialStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [usageData, trialData] = await Promise.all([
          getUsageStats(),
          checkTrialStatus()
        ]);
        setUsage(usageData);
        setTrialStatus(trialData);
      } catch (error) {
        console.error('Failed to load usage stats:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usage) {
    return null;
  }

  const getStatusColor = (percentage) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-orange-600";
    return "text-slate-600";
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-orange-500";
    return "bg-blue-500";
  };

  const resourceItems = [
    {
      icon: Users,
      label: "Clients",
      current: usage.clients.current,
      max: usage.clients.max,
      percentage: usage.clients.percentage,
      color: "text-teal-600"
    },
    {
      icon: UserCheck,
      label: "Caregivers",
      current: usage.caregivers.current,
      max: usage.caregivers.max,
      percentage: usage.caregivers.percentage,
      color: "text-purple-600"
    },
    {
      icon: Calendar,
      label: "Visits This Month",
      current: usage.visits.current,
      max: usage.visits.max,
      percentage: usage.visits.percentage,
      color: "text-blue-600"
    }
  ];

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-slate-600" />
            Plan Usage
          </CardTitle>
          <Badge
            variant={usage.isTrial ? "default" : "secondary"}
            className={usage.isTrial ? "bg-blue-100 text-blue-700 border-blue-200" : ""}
          >
            {usage.isTrial ? "Trial" : usage.plan.charAt(0).toUpperCase() + usage.plan.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Trial Warning */}
        {usage.isTrial && trialStatus && (
          <div className={`p-3 rounded-lg border-2 ${
            trialStatus.daysRemaining <= 3
              ? "bg-red-50 border-red-200"
              : trialStatus.daysRemaining <= 7
                ? "bg-orange-50 border-orange-200"
                : "bg-blue-50 border-blue-200"
          }`}>
            <div className="flex items-start gap-2">
              {trialStatus.daysRemaining <= 3 ? (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`font-semibold text-sm ${
                  trialStatus.daysRemaining <= 3
                    ? "text-red-900"
                    : trialStatus.daysRemaining <= 7
                      ? "text-orange-900"
                      : "text-blue-900"
                }`}>
                  {trialStatus.daysRemaining === 0
                    ? "Trial expires today!"
                    : trialStatus.daysRemaining === 1
                      ? "Trial expires tomorrow"
                      : `Trial ends in ${trialStatus.daysRemaining} days`
                  }
                </p>
                <p className={`text-xs mt-1 ${
                  trialStatus.daysRemaining <= 3
                    ? "text-red-700"
                    : trialStatus.daysRemaining <= 7
                      ? "text-orange-700"
                      : "text-blue-700"
                }`}>
                  Upgrade now to continue using all features
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Resource Usage */}
        <div className="space-y-4">
          {resourceItems.map((item) => {
            const Icon = item.icon;
            const isNearLimit = item.percentage >= 75;

            return (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-sm font-medium text-slate-700">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${getStatusColor(item.percentage)}`}>
                      {item.current} / {item.max}
                    </span>
                    {isNearLimit && (
                      <AlertCircle className={`w-4 h-4 ${getStatusColor(item.percentage)}`} />
                    )}
                  </div>
                </div>
                <div className="relative">
                  <Progress
                    value={item.percentage}
                    className="h-2"
                    indicatorClassName={getProgressColor(item.percentage)}
                  />
                </div>
                {item.percentage >= 90 && (
                  <p className="text-xs text-red-600 font-medium">
                    ⚠️ Approaching limit - consider upgrading
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Upgrade Button */}
        {(usage.isTrial || resourceItems.some(item => item.percentage >= 75)) && (
          <Button
            onClick={() => navigate(createPageUrl('Pricing'))}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Plan
          </Button>
        )}

        {/* Plan Details */}
        <div className="pt-3 border-t">
          <button
            onClick={() => navigate(createPageUrl('Billing'))}
            className="text-sm text-slate-600 hover:text-slate-900 font-medium"
          >
            View billing details →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
