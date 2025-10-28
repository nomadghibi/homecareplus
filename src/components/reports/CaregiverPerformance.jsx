import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Star, TrendingUp, Clock, MapPin, Award } from "lucide-react";

export default function CaregiverPerformance({ caregivers, visits, evvEvents }) {
  // Calculate detailed performance for each caregiver
  const caregiverScores = caregivers.map(caregiver => {
    const caregiverVisits = visits.filter(v => v.caregiver_id === caregiver.id);
    const completedVisits = caregiverVisits.filter(v => v.status === 'completed');
    const caregiverEVV = evvEvents.filter(e => e.caregiver_id === caregiver.id);
    
    // Completion rate
    const completionRate = caregiverVisits.length > 0 
      ? (completedVisits.length / caregiverVisits.length) * 100 
      : 0;
    
    // EVV compliance rate
    const evvCompliance = caregiverEVV.length > 0
      ? (caregiverEVV.filter(e => e.verification_status === 'valid').length / caregiverEVV.length) * 100
      : 0;
    
    // On-time rate (assuming if completed = on time for this demo)
    const onTimeRate = completionRate;
    
    // Documentation quality (based on visit notes presence)
    const docQuality = completedVisits.length > 0
      ? (completedVisits.filter(v => v.visit_notes && v.visit_notes.length > 50).length / completedVisits.length) * 100
      : 0;
    
    // Total hours
    const totalHours = caregiverVisits.reduce((sum, v) => sum + (v.billable_hours || 0), 0);
    
    // Overall score (weighted average)
    const overallScore = (
      completionRate * 0.30 +
      evvCompliance * 0.25 +
      onTimeRate * 0.25 +
      docQuality * 0.20
    );

    return {
      id: caregiver.id,
      name: `${caregiver.first_name} ${caregiver.last_name}`,
      employeeId: caregiver.employee_id,
      completionRate,
      evvCompliance,
      onTimeRate,
      docQuality,
      totalHours,
      totalVisits: caregiverVisits.length,
      completedVisits: completedVisits.length,
      overallScore,
      rating: overallScore >= 90 ? 5 : overallScore >= 80 ? 4 : overallScore >= 70 ? 3 : overallScore >= 60 ? 2 : 1
    };
  }).filter(c => c.totalVisits > 0).sort((a, b) => b.overallScore - a.overallScore);

  const topPerformers = caregiverScores.slice(0, 3);
  const avgOverallScore = caregiverScores.length > 0
    ? caregiverScores.reduce((sum, c) => sum + c.overallScore, 0) / caregiverScores.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Performers Highlight */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Award className="w-6 h-6" />
            Top Performers This Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {topPerformers.map((caregiver, idx) => (
              <div key={caregiver.id} className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-white/30 text-white border-white/50">
                    #{idx + 1}
                  </Badge>
                  <div className="flex gap-1">
                    {[...Array(caregiver.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                    ))}
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-1">{caregiver.name}</h3>
                <p className="text-sm opacity-90 mb-2">{caregiver.employeeId}</p>
                <div className="text-3xl font-bold">{caregiver.overallScore.toFixed(1)}</div>
                <p className="text-sm opacity-90">Overall Score</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-none shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Avg Overall Score</span>
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{avgOverallScore.toFixed(1)}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Active Caregivers</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{caregiverScores.length}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">5-Star Performers</span>
              <Star className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {caregiverScores.filter(c => c.rating === 5).length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Total Hours Worked</span>
              <Clock className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {caregiverScores.reduce((sum, c) => sum + c.totalHours, 0).toFixed(0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Scorecard */}
      <Card className="border-none shadow-lg">
        <CardHeader className="border-b">
          <CardTitle>Detailed Performance Scorecards</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-slate-700">Caregiver</th>
                  <th className="text-center p-4 text-sm font-semibold text-slate-700">Overall Score</th>
                  <th className="text-center p-4 text-sm font-semibold text-slate-700">Completion</th>
                  <th className="text-center p-4 text-sm font-semibold text-slate-700">EVV Compliance</th>
                  <th className="text-center p-4 text-sm font-semibold text-slate-700">On-Time</th>
                  <th className="text-center p-4 text-sm font-semibold text-slate-700">Documentation</th>
                  <th className="text-right p-4 text-sm font-semibold text-slate-700">Total Visits</th>
                  <th className="text-center p-4 text-sm font-semibold text-slate-700">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {caregiverScores.map((caregiver) => (
                  <tr key={caregiver.id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <div className="font-medium text-slate-900">{caregiver.name}</div>
                      <div className="text-sm text-slate-500">{caregiver.employeeId}</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="font-bold text-2xl text-purple-600">{caregiver.overallScore.toFixed(1)}</div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">{caregiver.completionRate.toFixed(0)}%</span>
                        </div>
                        <Progress value={caregiver.completionRate} className="h-2" />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">{caregiver.evvCompliance.toFixed(0)}%</span>
                        </div>
                        <Progress value={caregiver.evvCompliance} className="h-2" />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">{caregiver.onTimeRate.toFixed(0)}%</span>
                        </div>
                        <Progress value={caregiver.onTimeRate} className="h-2" />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">{caregiver.docQuality.toFixed(0)}%</span>
                        </div>
                        <Progress value={caregiver.docQuality} className="h-2" />
                      </div>
                    </td>
                    <td className="p-4 text-right font-semibold text-slate-900">{caregiver.totalVisits}</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-0.5">
                        {[...Array(caregiver.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}