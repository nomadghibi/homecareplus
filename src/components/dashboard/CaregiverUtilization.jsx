import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UserCheck, TrendingUp, Clock } from "lucide-react";

export default function CaregiverUtilization({ caregivers, visits }) {
  const activeCaregivers = caregivers.filter(c => c.status === 'active');
  
  // Calculate utilization for each caregiver
  const utilizationData = activeCaregivers.map(caregiver => {
    const caregiverVisits = visits.filter(v => 
      v.caregiver_id === caregiver.id && 
      v.status !== 'cancelled'
    );
    
    // Calculate total hours from visits
    const totalHours = caregiverVisits.reduce((sum, visit) => {
      return sum + (visit.billable_hours || 2); // Default 2 hours if not specified
    }, 0);
    
    const maxHours = caregiver.max_hours_per_week || 40;
    const utilization = (totalHours / maxHours) * 100;
    
    return {
      id: caregiver.id,
      name: `${caregiver.first_name} ${caregiver.last_name}`,
      hours: totalHours,
      maxHours: maxHours,
      utilization: Math.min(utilization, 100),
      rate: caregiver.hourly_rate || 0
    };
  }).sort((a, b) => b.utilization - a.utilization).slice(0, 6);

  const avgUtilization = utilizationData.length > 0
    ? utilizationData.reduce((sum, c) => sum + c.utilization, 0) / utilizationData.length
    : 0;

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-purple-600" />
            Caregiver Utilization
          </CardTitle>
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            Avg: {avgUtilization.toFixed(0)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {utilizationData.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <UserCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No utilization data available</p>
            </div>
          ) : (
            utilizationData.map((caregiver) => (
              <div key={caregiver.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-900">{caregiver.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">
                      {caregiver.hours.toFixed(1)}h / {caregiver.maxHours}h
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`
                        ${caregiver.utilization >= 90 ? 'bg-green-50 text-green-700' : 
                          caregiver.utilization >= 70 ? 'bg-yellow-50 text-yellow-700' : 
                          'bg-slate-50 text-slate-700'}
                      `}
                    >
                      {caregiver.utilization.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
                <Progress value={caregiver.utilization} className="h-2" />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}