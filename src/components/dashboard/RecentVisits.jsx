import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, Calendar, User } from "lucide-react";
import { formatVisitDate, formatVisitTime } from "@/utils/dateHelpers";

export default function RecentVisits({ visits, clients, caregivers }) {
  const getClient = (clientId) => clients.find(c => c.id === clientId);
  const getCaregiver = (caregiverId) => caregivers.find(c => c.id === caregiverId);

  const statusConfig = {
    completed: { icon: CheckCircle2, color: "bg-green-100 text-green-700 border-green-200", label: "Completed" },
    in_progress: { icon: Clock, color: "bg-blue-100 text-blue-700 border-blue-200", label: "In Progress" },
    scheduled: { icon: Calendar, color: "bg-slate-100 text-slate-700 border-slate-200", label: "Scheduled" },
    cancelled: { icon: XCircle, color: "bg-red-100 text-red-700 border-red-200", label: "Cancelled" },
    missed: { icon: XCircle, color: "bg-orange-100 text-orange-700 border-orange-200", label: "Missed" },
  };

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-600" />
          Recent Visits
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {visits.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No visits recorded yet</p>
            </div>
          ) : (
            visits.map((visit) => {
              const client = getClient(visit.client_id);
              const caregiver = getCaregiver(visit.caregiver_id);
              const status = statusConfig[visit.status] || statusConfig.scheduled;
              const StatusIcon = status.icon;

              return (
                <div key={visit.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-slate-900 truncate">
                          {client ? `${client.first_name} ${client.last_name}` : 'Unknown Client'}
                        </h4>
                        <Badge className={`${status.color} border`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {caregiver ? `${caregiver.first_name} ${caregiver.last_name}` : 'Unassigned'}
                        </span>
                        <span>
                          {formatVisitDate(visit)}
                        </span>
                        <span>
                          {formatVisitTime(visit)}
                        </span>
                      </div>
                      {visit.visit_type && (
                        <p className="text-xs text-slate-500 mt-1 capitalize">
                          {visit.visit_type.replace(/_/g, ' ')}
                        </p>
                      )}
                    </div>
                    {visit.evv_verified && (
                      <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                        EVV ✓
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}