import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pill, Clock, AlertTriangle, Calendar, Edit, User } from "lucide-react";
import { format } from "date-fns";

export default function MedicationCard({ medication, client, onClick, onEdit }) {
  const statusConfig = {
    active: { color: "bg-green-100 text-green-700 border-green-200", label: "Active" },
    paused: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Paused" },
    discontinued: { color: "bg-slate-100 text-slate-700 border-slate-200", label: "Discontinued" },
  };

  const routeConfig = {
    oral: { label: "Oral", icon: "💊" },
    topical: { label: "Topical", icon: "🧴" },
    injection: { label: "Injection", icon: "💉" },
    inhalation: { label: "Inhalation", icon: "🫁" },
    other: { label: "Other", icon: "📋" },
  };

  const status = statusConfig[medication.status] || statusConfig.active;
  const route = routeConfig[medication.route] || routeConfig.other;

  return (
    <Card 
      className="border-none shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 group-hover:text-purple-600 transition-colors flex items-center gap-2">
              <span className="text-2xl">{route.icon}</span>
              {medication.medication_name}
            </CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Badge className={`${status.color} border`}>
                {status.label}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {medication.dosage}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {route.label}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(medication);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock className="w-4 h-4 text-slate-400" />
          {medication.frequency}
        </div>
        
        {medication.schedule_times && medication.schedule_times.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {medication.schedule_times.map((time, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {time}
              </Badge>
            ))}
          </div>
        )}

        {medication.purpose && (
          <div className="text-sm text-slate-600">
            <span className="font-medium">Purpose:</span> {medication.purpose}
          </div>
        )}

        {medication.special_instructions && (
          <div className="flex items-start gap-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
            <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{medication.special_instructions}</span>
          </div>
        )}

        {medication.end_date && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-3 h-3" />
            Ends: {format(new Date(medication.end_date), 'MMM d, yyyy')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}