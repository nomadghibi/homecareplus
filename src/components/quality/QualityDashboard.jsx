import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Award, Star } from "lucide-react";

export default function QualityDashboard({ audits, surveys, clients, caregivers }) {
  // Calculate trends
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  
  const recentAudits = audits.filter(a => new Date(a.audit_date) >= lastMonth);
  const recentSurveys = surveys.filter(s => new Date(s.survey_date) >= lastMonth);

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle>Recent Quality Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">Audit Results (Last 30 Days)</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Total Audits</span>
                  <Badge variant="outline">{recentAudits.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Pass Rate</span>
                  <Badge className="bg-green-100 text-green-700">
                    {recentAudits.length > 0 ? 
                      `${((recentAudits.filter(a => a.pass_fail === 'pass').length / recentAudits.length) * 100).toFixed(0)}%` 
                      : 'N/A'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Avg Score</span>
                  <Badge variant="outline">
                    {recentAudits.length > 0 ?
                      `${(recentAudits.reduce((sum, a) => sum + (a.overall_score || 0), 0) / recentAudits.length).toFixed(1)}%`
                      : 'N/A'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">Client Satisfaction (Last 30 Days)</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Surveys Completed</span>
                  <Badge variant="outline">{recentSurveys.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Avg Satisfaction</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">
                      {recentSurveys.length > 0 ?
                        `${(recentSurveys.reduce((sum, s) => sum + (s.overall_satisfaction || 0), 0) / recentSurveys.length).toFixed(1)}/5`
                        : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Would Recommend</span>
                  <Badge className="bg-green-100 text-green-700">
                    {recentSurveys.length > 0 ?
                      `${((recentSurveys.filter(s => s.would_recommend).length / recentSurveys.length) * 100).toFixed(0)}%`
                      : 'N/A'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-slate-500">
        <Award className="w-16 h-16 mx-auto mb-4 text-slate-300" />
        <p>Complete audits and surveys to see more detailed analytics</p>
      </div>
    </div>
  );
}