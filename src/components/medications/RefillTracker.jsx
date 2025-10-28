import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  Calendar, 
  Pill,
  Phone,
  CheckCircle2,
  Clock
} from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";

export default function RefillTracker({ medication, onUpdateRefill }) {
  const hasRefillInfo = medication.refill_quantity || medication.next_refill_date;
  
  if (!hasRefillInfo) {
    return (
      <Card className="border-none shadow-md">
        <CardContent className="p-6 text-center">
          <Pill className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm text-slate-500 mb-4">No refill information tracked for this medication</p>
          <Button variant="outline" onClick={onUpdateRefill}>
            Add Refill Tracking
          </Button>
        </CardContent>
      </Card>
    );
  }

  const quantity = medication.refill_quantity || 0;
  const threshold = medication.refill_threshold || 7;
  const needsRefill = quantity <= threshold;
  const outOfStock = quantity === 0;

  let daysUntilRefill = null;
  let refillUrgency = 'normal';
  
  if (medication.next_refill_date) {
    daysUntilRefill = differenceInDays(parseISO(medication.next_refill_date), new Date());
    if (daysUntilRefill <= 0) {
      refillUrgency = 'critical';
    } else if (daysUntilRefill <= 3) {
      refillUrgency = 'urgent';
    } else if (daysUntilRefill <= 7) {
      refillUrgency = 'warning';
    }
  }

  const urgencyConfig = {
    critical: { 
      color: "bg-red-100 text-red-700 border-red-200", 
      bgCard: "bg-red-50 border-red-200",
      label: "Overdue" 
    },
    urgent: { 
      color: "bg-orange-100 text-orange-700 border-orange-200", 
      bgCard: "bg-orange-50 border-orange-200",
      label: "Urgent" 
    },
    warning: { 
      color: "bg-yellow-100 text-yellow-700 border-yellow-200", 
      bgCard: "bg-yellow-50 border-yellow-200",
      label: "Soon" 
    },
    normal: { 
      color: "bg-green-100 text-green-700 border-green-200", 
      bgCard: "bg-green-50 border-green-200",
      label: "On Track" 
    },
  };

  const urgency = urgencyConfig[refillUrgency];
  const percentRemaining = Math.max(0, Math.min(100, (quantity / (threshold * 2)) * 100));

  return (
    <div className="space-y-4">
      <Card className={`border-2 ${urgency.bgCard}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Pill className="w-5 h-5" />
              Refill Status
            </CardTitle>
            <Badge className={`${urgency.color} border`}>
              {urgency.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quantity Remaining */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Doses Remaining</span>
              <span className={`font-bold text-lg ${outOfStock ? 'text-red-600' : needsRefill ? 'text-orange-600' : 'text-green-600'}`}>
                {quantity}
              </span>
            </div>
            <Progress value={percentRemaining} className="h-3" />
            <p className="text-xs text-slate-500 mt-1">
              Alert threshold: {threshold} doses
            </p>
          </div>

          {/* Next Refill Date */}
          {medication.next_refill_date && (
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border">
              <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700">Next Refill Due</p>
                <p className="text-lg font-bold text-slate-900">
                  {format(parseISO(medication.next_refill_date), 'MMM d, yyyy')}
                </p>
                {daysUntilRefill !== null && (
                  <p className={`text-sm mt-1 ${daysUntilRefill <= 0 ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                    {daysUntilRefill <= 0 
                      ? `Overdue by ${Math.abs(daysUntilRefill)} day${Math.abs(daysUntilRefill) !== 1 ? 's' : ''}`
                      : `${daysUntilRefill} day${daysUntilRefill !== 1 ? 's' : ''} remaining`
                    }
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Last Refill */}
          {medication.last_refill_date && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4" />
              <span>Last refilled: {format(parseISO(medication.last_refill_date), 'MMM d, yyyy')}</span>
            </div>
          )}

          {/* Pharmacy Info */}
          {(medication.pharmacy_name || medication.pharmacy_phone) && (
            <div className="p-3 bg-white rounded-lg border">
              <p className="text-sm font-medium text-slate-700 mb-2">Pharmacy Information</p>
              {medication.pharmacy_name && (
                <p className="text-sm text-slate-900">{medication.pharmacy_name}</p>
              )}
              {medication.pharmacy_phone && (
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <a href={`tel:${medication.pharmacy_phone}`} className="text-sm text-blue-600 hover:underline">
                    {medication.pharmacy_phone}
                  </a>
                </div>
              )}
              {medication.prescription_number && (
                <p className="text-xs text-slate-500 mt-1">
                  Rx #: {medication.prescription_number}
                </p>
              )}
            </div>
          )}

          {/* Alert Messages */}
          {outOfStock && (
            <div className="flex items-start gap-2 p-3 bg-red-100 border border-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-medium">Out of Stock</p>
                <p>This medication needs immediate refill attention.</p>
              </div>
            </div>
          )}

          {!outOfStock && needsRefill && (
            <div className="flex items-start gap-2 p-3 bg-orange-100 border border-orange-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-orange-800">
                <p className="font-medium">Refill Needed Soon</p>
                <p>Schedule refill to avoid running out.</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onUpdateRefill}
            >
              Update Refill Info
            </Button>
            {medication.pharmacy_phone && (
              <Button 
                variant="outline"
                onClick={() => window.location.href = `tel:${medication.pharmacy_phone}`}
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Pharmacy
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}