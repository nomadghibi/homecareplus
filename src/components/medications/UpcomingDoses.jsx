import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Pill, AlertCircle } from "lucide-react";

export default function UpcomingDoses({ medications, clients }) {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const upcomingDoses = [];

  medications.forEach(med => {
    if (med.schedule_times && med.schedule_times.length > 0) {
      med.schedule_times
        .filter(time => time > currentTime)
        .forEach(time => {
          const client = clients.find(c => c.id === med.client_id);
          upcomingDoses.push({
            time,
            medication: med,
            client
          });
        });
    }
  });

  // Sort by time
  upcomingDoses.sort((a, b) => a.time.localeCompare(b.time));

  if (upcomingDoses.length === 0) return null;

  return (
    <Card className="border-none shadow-lg bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-l-orange-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-900">
          <AlertCircle className="w-5 h-5" />
          Upcoming Doses Today ({upcomingDoses.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingDoses.slice(0, 6).map((dose, idx) => (
            <div key={idx} className="p-4 bg-white rounded-lg shadow-sm border border-orange-100">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="font-bold text-orange-900">{dose.time}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {dose.medication.dosage}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <Pill className="w-3 h-3 text-slate-400" />
                  <span className="font-medium text-slate-900">{dose.medication.medication_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>{dose.client ? `${dose.client.first_name} ${dose.client.last_name}` : 'Unknown'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {upcomingDoses.length > 6 && (
          <p className="text-sm text-center text-slate-500 mt-4">
            +{upcomingDoses.length - 6} more doses scheduled
          </p>
        )}
      </CardContent>
    </Card>
  );
}