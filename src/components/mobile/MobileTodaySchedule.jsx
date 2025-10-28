import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User, CheckCircle2, Circle } from "lucide-react";

export default function MobileTodaySchedule({ visits, clients, onSelectVisit }) {
  const statusConfig = {
    scheduled: { color: "bg-blue-100 text-blue-700", icon: Circle, label: "Scheduled" },
    in_progress: { color: "bg-green-100 text-green-700", icon: Clock, label: "In Progress" },
    completed: { color: "bg-slate-100 text-slate-700", icon: CheckCircle2, label: "Completed" }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="w-5 h-5 text-teal-600" />
          Today's Schedule ({visits.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {visits.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>No visits scheduled for today</p>
          </div>
        ) : (
          visits.map((visit) => {
            const client = clients.find(c => c.id === visit.client_id);
            const status = statusConfig[visit.status] || statusConfig.scheduled;
            const StatusIcon = status.icon;

            return (
              <Card key={visit.id} className="border-l-4 border-l-teal-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-slate-400" />
                        <h4 className="font-bold">
                          {client ? `${client.first_name} ${client.last_name}` : 'Unknown Client'}
                        </h4>
                      </div>
                      {client?.address && (
                        <div className="flex items-start gap-2 text-xs text-slate-600 mb-2">
                          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>{client.address}</span>
                        </div>
                      )}
                    </div>
                    <Badge className={status.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{visit.scheduled_start_time}</span>
                    </div>
                    <span>-</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{visit.scheduled_end_time}</span>
                    </div>
                  </div>

                  {visit.service_type && (
                    <Badge variant="outline" className="mb-3">
                      {visit.service_type.replace('_', ' ')}
                    </Badge>
                  )}

                  <Button 
                    onClick={() => onSelectVisit(visit)}
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    size="sm"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}