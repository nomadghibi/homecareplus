import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import { formatVisitDate, formatVisitTime } from "@/utils/dateHelpers";

export default function UpcomingShifts({ visits, clients, caregivers }) {
  const getClient = (clientId) => clients.find(c => c.id === clientId);
  const getCaregiver = (caregiverId) => caregivers.find(c => c.id === caregiverId);

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="w-5 h-5 text-blue-600" />
          Upcoming Shifts
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {visits.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No upcoming shifts</p>
            </div>
          ) : (
            visits.map((visit) => {
              const client = getClient(visit.client_id);
              const caregiver = getCaregiver(visit.caregiver_id);

              return (
                <div key={visit.id} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-slate-900 text-sm">
                      {client ? `${client.first_name} ${client.last_name}` : 'Unknown'}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {formatVisitDate(visit, 'MMM d')}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatVisitTime(visit)}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {caregiver ? `${caregiver.first_name} ${caregiver.last_name}` : 'Unassigned'}
                    </div>
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