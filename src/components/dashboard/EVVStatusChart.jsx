import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function EVVStatusChart({ evvEvents }) {
  const statusCounts = {
    valid: evvEvents.filter(e => e.verification_status === 'valid').length,
    valid_with_attestation: evvEvents.filter(e => e.verification_status === 'valid_with_attestation').length,
    pending: evvEvents.filter(e => e.verification_status === 'pending').length,
    rejected: evvEvents.filter(e => e.verification_status === 'rejected').length,
  };

  const total = evvEvents.length || 1;

  const statuses = [
    { 
      key: 'valid', 
      label: 'Verified', 
      count: statusCounts.valid, 
      color: 'bg-green-500', 
      icon: CheckCircle2,
      iconColor: 'text-green-600'
    },
    { 
      key: 'valid_with_attestation', 
      label: 'Attested', 
      count: statusCounts.valid_with_attestation, 
      color: 'bg-blue-500', 
      icon: CheckCircle2,
      iconColor: 'text-blue-600'
    },
    { 
      key: 'pending', 
      label: 'Pending', 
      count: statusCounts.pending, 
      color: 'bg-yellow-500', 
      icon: Clock,
      iconColor: 'text-yellow-600'
    },
    { 
      key: 'rejected', 
      label: 'Rejected', 
      count: statusCounts.rejected, 
      color: 'bg-red-500', 
      icon: AlertCircle,
      iconColor: 'text-red-600'
    },
  ];

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="w-5 h-5 text-teal-600" />
          EVV Status
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {statuses.map((status) => {
            const StatusIcon = status.icon;
            const percentage = (status.count / total) * 100;
            
            return (
              <div key={status.key}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-4 h-4 ${status.iconColor}`} />
                    <span className="text-sm font-medium text-slate-700">{status.label}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{status.count}</span>
                </div>
                <Progress value={percentage} className="h-2" indicatorClassName={status.color} />
                <p className="text-xs text-slate-500 mt-1">{percentage.toFixed(1)}%</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}