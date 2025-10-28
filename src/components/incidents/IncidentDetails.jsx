import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Edit2, Calendar, User, MapPin, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function IncidentDetails({ incident, clients, caregivers, onClose, onEdit }) {
  const client = clients.find(c => c.id === incident.client_id);
  const caregiver = caregivers.find(c => c.id === incident.caregiver_id);

  const severityConfig = {
    minor: { color: "bg-blue-100 text-blue-700", label: "Minor" },
    moderate: { color: "bg-yellow-100 text-yellow-700", label: "Moderate" },
    serious: { color: "bg-orange-100 text-orange-700", label: "Serious" },
    critical: { color: "bg-red-100 text-red-700", label: "Critical" }
  };

  const statusConfig = {
    reported: { color: "bg-slate-100 text-slate-700", label: "Reported" },
    under_investigation: { color: "bg-blue-100 text-blue-700", label: "Under Investigation" },
    action_taken: { color: "bg-purple-100 text-purple-700", label: "Action Taken" },
    resolved: { color: "bg-green-100 text-green-700", label: "Resolved" },
    closed: { color: "bg-slate-100 text-slate-500", label: "Closed" }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">
                Incident #{incident.incident_number || incident.id.slice(0, 8)}
              </CardTitle>
              <div className="flex gap-2 flex-wrap">
                <Badge className={severityConfig[incident.severity]?.color}>
                  {severityConfig[incident.severity]?.label}
                </Badge>
                <Badge className={statusConfig[incident.status]?.color}>
                  {statusConfig[incident.status]?.label}
                </Badge>
                {incident.medical_attention_required && (
                  <Badge className="bg-red-100 text-red-700">Medical Attention Required</Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => onEdit(incident)}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <ScrollArea className="flex-1">
          <CardContent className="p-6 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Incident Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Type</p>
                  <p className="font-medium capitalize">{incident.incident_type?.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Incident Date</p>
                  <p className="font-medium">{format(new Date(incident.incident_date), 'MMM d, yyyy h:mm a')}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Reported Date</p>
                  <p className="font-medium">{format(new Date(incident.reported_date), 'MMM d, yyyy h:mm a')}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Location</p>
                  <p className="font-medium">{incident.location || 'N/A'}</p>
                </div>
                {client && (
                  <div>
                    <p className="text-sm text-slate-500">Client</p>
                    <p className="font-medium">{client.first_name} {client.last_name}</p>
                  </div>
                )}
                {caregiver && (
                  <div>
                    <p className="text-sm text-slate-500">Caregiver</p>
                    <p className="font-medium">{caregiver.first_name} {caregiver.last_name}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-slate-500">Reported By</p>
                  <p className="font-medium">{incident.reported_by}</p>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 whitespace-pre-wrap">{incident.description}</p>
              </CardContent>
            </Card>

            {/* Immediate Response */}
            {incident.immediate_action_taken && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Immediate Action Taken</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap">{incident.immediate_action_taken}</p>
                </CardContent>
              </Card>
            )}

            {/* Injuries */}
            {incident.injuries_sustained && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Injuries Sustained</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap">{incident.injuries_sustained}</p>
                </CardContent>
              </Card>
            )}

            {/* Witnesses */}
            {incident.witnesses && incident.witnesses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Witnesses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {incident.witnesses.map((witness, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-slate-900">{witness.name}</p>
                        <span className="text-sm text-slate-500">{witness.contact}</span>
                      </div>
                      {witness.statement && (
                        <p className="text-sm text-slate-600">{witness.statement}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Family Notification */}
            {incident.family_notified && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Family Notification</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Notification Date</p>
                    <p className="font-medium">
                      {incident.family_notification_date ? 
                        format(new Date(incident.family_notification_date), 'MMM d, yyyy h:mm a') : 
                        'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Method</p>
                    <p className="font-medium capitalize">{incident.family_notification_method?.replace(/_/g, ' ')}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {incident.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap">{incident.notes}</p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}