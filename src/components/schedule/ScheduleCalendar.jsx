import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay } from "date-fns";
import { Clock, User, Heart } from "lucide-react";

export default function ScheduleCalendar({ 
  view, 
  currentDate, 
  weekDays, 
  visits, 
  clients, 
  caregivers,
  onVisitClick 
}) {
  const getClient = (clientId) => clients.find(c => c.id === clientId);
  const getCaregiver = (caregiverId) => caregivers.find(c => c.id === caregiverId);

  const statusColors = {
    scheduled: "bg-blue-100 text-blue-700 border-blue-200",
    in_progress: "bg-yellow-100 text-yellow-700 border-yellow-200",
    completed: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
    missed: "bg-orange-100 text-orange-700 border-orange-200",
  };

  const visitTypeColors = {
    personal_care: "bg-purple-50 border-l-4 border-purple-500",
    companionship: "bg-blue-50 border-l-4 border-blue-500",
    medication_management: "bg-green-50 border-l-4 border-green-500",
    skilled_nursing: "bg-red-50 border-l-4 border-red-500",
    physical_therapy: "bg-orange-50 border-l-4 border-orange-500",
  };

  if (view === "day") {
    const dayVisits = visits.sort((a, b) => 
      a.scheduled_start_time.localeCompare(b.scheduled_start_time)
    );

    return (
      <Card className="border-none shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-3">
            {dayVisits.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No visits scheduled for this day</p>
              </div>
            ) : (
              dayVisits.map((visit) => {
                const client = getClient(visit.client_id);
                const caregiver = getCaregiver(visit.caregiver_id);
                const statusColor = statusColors[visit.status] || statusColors.scheduled;
                const typeColor = visitTypeColors[visit.visit_type] || visitTypeColors.personal_care;

                return (
                  <div
                    key={visit.id}
                    onClick={() => onVisitClick(visit)}
                    className={`p-4 rounded-lg cursor-pointer hover:shadow-md transition-all ${typeColor}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span className="font-semibold">
                          {visit.scheduled_start_time} - {visit.scheduled_end_time}
                        </span>
                      </div>
                      <Badge className={statusColor}>
                        {visit.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 font-medium">
                        <Heart className="w-4 h-4 text-red-500" />
                        {client ? `${client.first_name} ${client.last_name}` : 'Unknown Client'}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <User className="w-4 h-4" />
                        {caregiver ? `${caregiver.first_name} ${caregiver.last_name}` : 'Unassigned'}
                      </div>
                      <p className="text-slate-500 capitalize">
                        {visit.visit_type?.replace(/_/g, ' ')}
                      </p>
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

  // Week view
  return (
    <div className="grid grid-cols-7 gap-4">
      {weekDays.map((day) => {
        const dayVisits = visits.filter(v => 
          isSameDay(new Date(v.scheduled_date), day)
        ).sort((a, b) => 
          a.scheduled_start_time.localeCompare(b.scheduled_start_time)
        );

        const isToday = isSameDay(day, new Date());

        return (
          <Card key={day.toISOString()} className={`border-none shadow-md ${isToday ? 'ring-2 ring-teal-500' : ''}`}>
            <CardContent className="p-4">
              <div className="mb-3">
                <div className={`text-sm font-medium ${isToday ? 'text-teal-600' : 'text-slate-500'}`}>
                  {format(day, 'EEE')}
                </div>
                <div className={`text-2xl font-bold ${isToday ? 'text-teal-600' : 'text-slate-900'}`}>
                  {format(day, 'd')}
                </div>
              </div>
              <div className="space-y-2">
                {dayVisits.map((visit) => {
                  const client = getClient(visit.client_id);
                  const statusColor = statusColors[visit.status] || statusColors.scheduled;

                  return (
                    <div
                      key={visit.id}
                      onClick={() => onVisitClick(visit)}
                      className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer text-xs transition-colors"
                    >
                      <div className="font-medium truncate mb-1">
                        {client ? `${client.first_name} ${client.last_name}` : 'Unknown'}
                      </div>
                      <div className="text-slate-500">
                        {visit.scheduled_start_time}
                      </div>
                      <Badge className={`${statusColor} text-xs mt-1`}>
                        {visit.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}