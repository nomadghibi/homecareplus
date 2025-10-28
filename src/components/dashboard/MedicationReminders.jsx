import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Pill, 
  Clock, 
  AlertTriangle, 
  Calendar,
  User,
  ArrowRight,
  Package,
  Phone
} from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";

export default function MedicationReminders({ medications, clients }) {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // Get upcoming doses in next 2 hours
  const upcomingDoses = [];
  medications
    .filter(med => med.status === 'active')
    .forEach(med => {
      if (med.schedule_times && med.schedule_times.length > 0) {
        med.schedule_times.forEach(time => {
          const [hours, minutes] = time.split(':').map(Number);
          const doseTime = new Date();
          doseTime.setHours(hours, minutes, 0, 0);
          
          const diffMinutes = (doseTime - now) / (1000 * 60);
          
          if (diffMinutes > 0 && diffMinutes <= 120) {
            const client = clients.find(c => c.id === med.client_id);
            upcomingDoses.push({
              time,
              minutesUntil: Math.round(diffMinutes),
              medication: med,
              client
            });
          }
        });
      }
    });

  // Get medications needing refill
  const needsRefill = medications.filter(med => {
    if (med.status !== 'active') return false;
    
    const quantity = med.refill_quantity || 0;
    const threshold = med.refill_threshold || 7;
    
    if (quantity === 0) return true; // Out of stock
    if (quantity <= threshold) return true; // Below threshold
    
    if (med.next_refill_date) {
      const daysUntil = differenceInDays(parseISO(med.next_refill_date), now);
      if (daysUntil <= 3) return true; // Due in 3 days or less
    }
    
    return false;
  });

  // Get overdue refills
  const overdueRefills = medications.filter(med => {
    if (med.status !== 'active' || !med.next_refill_date) return false;
    const daysUntil = differenceInDays(parseISO(med.next_refill_date), now);
    return daysUntil < 0;
  });

  const totalAlerts = upcomingDoses.length + needsRefill.length;

  if (totalAlerts === 0) {
    return (
      <Card className="border-none shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-purple-600" />
              Medication Reminders
            </CardTitle>
            <Badge className="bg-green-100 text-green-700">All Clear</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
            <Pill className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-sm text-slate-600">No upcoming doses or refills needed</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-purple-600" />
            Medication Reminders
          </CardTitle>
          <Badge className="bg-orange-100 text-orange-700 border-orange-200">
            {totalAlerts} Alert{totalAlerts !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {/* Upcoming Doses */}
          {upcomingDoses.slice(0, 3).map((dose, idx) => {
            const urgency = dose.minutesUntil <= 30 ? 'urgent' : 'soon';
            const urgencyConfig = {
              urgent: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Due Soon!' },
              soon: { color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Upcoming' }
            };
            const config = urgencyConfig[urgency];

            return (
              <div key={idx} className="p-3 bg-orange-50 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="font-bold text-slate-900">{dose.time}</span>
                    <Badge className={`${config.color} border text-xs`}>
                      {config.label}
                    </Badge>
                  </div>
                  <span className="text-xs text-orange-700 font-medium">
                    in {dose.minutesUntil} min
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Pill className="w-3 h-3 text-slate-400" />
                    <span className="font-medium text-slate-900">
                      {dose.medication.medication_name}
                    </span>
                    <span className="text-slate-500">• {dose.medication.dosage}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>
                      {dose.client ? `${dose.client.first_name} ${dose.client.last_name}` : 'Unknown Client'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Refill Reminders */}
          {needsRefill.slice(0, 3).map((med, idx) => {
            const client = clients.find(c => c.id === med.client_id);
            const quantity = med.refill_quantity || 0;
            const isOutOfStock = quantity === 0;
            const daysUntil = med.next_refill_date 
              ? differenceInDays(parseISO(med.next_refill_date), now)
              : null;

            return (
              <div key={idx} className="p-3 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-red-600" />
                    <Badge className={`${isOutOfStock ? 'bg-red-100 text-red-700 border-red-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'} border text-xs`}>
                      {isOutOfStock ? 'Out of Stock!' : 'Low Supply'}
                    </Badge>
                  </div>
                  {quantity > 0 && (
                    <span className="text-xs font-bold text-red-700">
                      {quantity} dose{quantity !== 1 ? 's' : ''} left
                    </span>
                  )}
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Pill className="w-3 h-3 text-slate-400" />
                    <span className="font-medium text-slate-900">
                      {med.medication_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>
                      {client ? `${client.first_name} ${client.last_name}` : 'Unknown Client'}
                    </span>
                  </div>
                  {daysUntil !== null && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>
                        {daysUntil < 0 
                          ? `Overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''}`
                          : `Due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`
                        }
                      </span>
                    </div>
                  )}
                  {med.pharmacy_phone && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 w-full"
                      onClick={() => window.location.href = `tel:${med.pharmacy_phone}`}
                    >
                      <Phone className="w-3 h-3 mr-2" />
                      Call {med.pharmacy_name || 'Pharmacy'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Show more indicator */}
          {(upcomingDoses.length > 3 || needsRefill.length > 3) && (
            <p className="text-xs text-center text-slate-500 pt-2">
              +{Math.max(upcomingDoses.length - 3, 0) + Math.max(needsRefill.length - 3, 0)} more reminder{Math.max(upcomingDoses.length - 3, 0) + Math.max(needsRefill.length - 3, 0) !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* View All Button */}
        <Link to={createPageUrl("Medications")}>
          <Button variant="outline" className="w-full mt-4">
            View All Medications
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}