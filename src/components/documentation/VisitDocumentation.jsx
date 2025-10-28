import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Calendar, User, Heart, CheckCircle2, XCircle, Activity, FileText } from "lucide-react";
import { format } from "date-fns";

export default function VisitDocumentation({ visit, client, caregiver, onClose }) {
  const statusConfig = {
    completed: { color: "bg-green-100 text-green-700", label: "Completed" },
    in_progress: { color: "bg-blue-100 text-blue-700", label: "In Progress" },
    scheduled: { color: "bg-slate-100 text-slate-700", label: "Scheduled" },
    cancelled: { color: "bg-red-100 text-red-700", label: "Cancelled" },
  };

  const status = statusConfig[visit.status] || statusConfig.scheduled;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Visit Documentation</CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge className={status.color}>
                  {status.label}
                </Badge>
                {visit.evv_verified && (
                  <Badge className="bg-teal-100 text-teal-700">
                    EVV Verified
                  </Badge>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Visit Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Visit Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium mb-1 flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  Client
                </p>
                <p className="font-semibold text-slate-900">
                  {client ? `${client.first_name} ${client.last_name}` : 'Unknown'}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 font-medium mb-1 flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Caregiver
                </p>
                <p className="font-semibold text-slate-900">
                  {caregiver ? `${caregiver.first_name} ${caregiver.last_name}` : 'Unknown'}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Scheduled
                </p>
                <p className="font-medium">
                  {format(new Date(visit.scheduled_date), 'MMM d, yyyy')}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  {visit.scheduled_start_time} - {visit.scheduled_end_time}
                </p>
              </div>
              {(visit.actual_start_time || visit.actual_end_time) && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Actual Time</p>
                  {visit.actual_start_time && (
                    <p className="text-sm">
                      Start: {format(new Date(visit.actual_start_time), 'h:mm a')}
                    </p>
                  )}
                  {visit.actual_end_time && (
                    <p className="text-sm">
                      End: {format(new Date(visit.actual_end_time), 'h:mm a')}
                    </p>
                  )}
                </div>
              )}
              {visit.visit_type && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Visit Type</p>
                  <p className="font-medium capitalize">{visit.visit_type.replace(/_/g, ' ')}</p>
                </div>
              )}
              {visit.billable_hours && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Billable Hours</p>
                  <p className="font-medium">{visit.billable_hours} hours</p>
                </div>
              )}
            </div>
          </div>

          {/* Tasks */}
          {visit.tasks_completed && visit.tasks_completed.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Tasks Completed
              </h3>
              <div className="space-y-2">
                {visit.tasks_completed.map((task, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg flex items-start gap-3">
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{task.task}</p>
                      {task.notes && (
                        <p className="text-sm text-slate-600 mt-1">{task.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vitals */}
          {visit.vitals && Object.keys(visit.vitals).length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-600" />
                Vital Signs
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {visit.vitals.blood_pressure && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-sm text-red-600 font-medium mb-1">Blood Pressure</p>
                    <p className="font-semibold text-slate-900">{visit.vitals.blood_pressure}</p>
                  </div>
                )}
                {visit.vitals.heart_rate && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-sm text-red-600 font-medium mb-1">Heart Rate</p>
                    <p className="font-semibold text-slate-900">{visit.vitals.heart_rate} bpm</p>
                  </div>
                )}
                {visit.vitals.temperature && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-sm text-red-600 font-medium mb-1">Temperature</p>
                    <p className="font-semibold text-slate-900">{visit.vitals.temperature}°F</p>
                  </div>
                )}
                {visit.vitals.oxygen_saturation && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-sm text-red-600 font-medium mb-1">Oxygen Saturation</p>
                    <p className="font-semibold text-slate-900">{visit.vitals.oxygen_saturation}%</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Visit Notes */}
          {visit.visit_notes && (
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Visit Notes
              </h3>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-700 whitespace-pre-wrap">{visit.visit_notes}</p>
              </div>
            </div>
          )}

          {/* Signatures */}
          {(visit.client_signature || visit.caregiver_signature) && (
            <div>
              <h3 className="font-semibold text-lg mb-4">Signatures</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {visit.client_signature && (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600 mb-2">Client Signature</p>
                    <div className="h-24 bg-white rounded border border-slate-200 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                )}
                {visit.caregiver_signature && (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600 mb-2">Caregiver Signature</p>
                    <div className="h-24 bg-white rounded border border-slate-200 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cancellation */}
          {visit.status === 'cancelled' && visit.cancellation_reason && (
            <div>
              <h3 className="font-semibold text-lg mb-4">Cancellation Details</h3>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-600 font-medium mb-1">Reason</p>
                <p className="text-slate-700">{visit.cancellation_reason}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}