import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, MapPin, Clock, Smartphone, CheckCircle2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function EVVEventDetails({ event, visit, client, caregiver, onClose }) {
  const statusConfig = {
    valid: { color: "bg-green-100 text-green-700 border-green-200", label: "Valid" },
    valid_with_attestation: { color: "bg-blue-100 text-blue-700 border-blue-200", label: "Valid (Attested)" },
    pending: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Pending Review" },
    rejected: { color: "bg-red-100 text-red-700 border-red-200", label: "Rejected" },
  };

  const status = statusConfig[event.verification_status] || statusConfig.pending;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">EVV Event Details</CardTitle>
              <Badge className={`${status.color} border mt-2`}>
                {status.label}
              </Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Event Information */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Event Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Event Type</p>
                <p className="font-medium capitalize">{event.event_type.replace('_', ' ')}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Timestamp
                </p>
                <p className="font-medium">{format(new Date(event.timestamp), 'MMM d, yyyy h:mm:ss a')}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                  <Smartphone className="w-3 h-3" />
                  Verification Method
                </p>
                <p className="font-medium uppercase">{event.verification_method}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Device ID</p>
                <p className="font-medium text-xs">{event.device_id || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* People */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Participants</h3>
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-600 font-medium mb-1">Caregiver</p>
                <p className="font-semibold text-slate-900">
                  {caregiver ? `${caregiver.first_name} ${caregiver.last_name}` : 'Unknown'}
                </p>
                {caregiver?.employee_id && (
                  <p className="text-sm text-slate-600">ID: {caregiver.employee_id}</p>
                )}
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-sm text-purple-600 font-medium mb-1">Client</p>
                <p className="font-semibold text-slate-900">
                  {client ? `${client.first_name} ${client.last_name}` : 'Unknown'}
                </p>
                {client?.address && (
                  <p className="text-sm text-slate-600 mt-1">{client.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location Data */}
          {(event.latitude || event.longitude) && (
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-600" />
                Location Data
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Latitude</p>
                  <p className="font-medium font-mono text-sm">{event.latitude?.toFixed(6)}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Longitude</p>
                  <p className="font-medium font-mono text-sm">{event.longitude?.toFixed(6)}</p>
                </div>
                {event.location_accuracy && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500 mb-1">GPS Accuracy</p>
                    <p className="font-medium">{event.location_accuracy}m</p>
                  </div>
                )}
                {event.distance_from_client !== undefined && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500 mb-1">Distance from Client</p>
                    <p className="font-medium">{event.distance_from_client}m</p>
                  </div>
                )}
              </div>
              {event.geofence_match !== undefined && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg flex items-center gap-2">
                  {event.geofence_match ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-700">Location matches client geofence</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-700">Location outside client geofence</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Integrity Flags */}
          {event.integrity_flags && event.integrity_flags.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Integrity Issues
              </h3>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex flex-wrap gap-2">
                  {event.integrity_flags.map((flag, idx) => (
                    <Badge key={idx} className="bg-red-100 text-red-700 border-red-300">
                      {flag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Attestation Note */}
          {event.attestation_note && (
            <div>
              <h3 className="font-semibold text-lg mb-4">Supervisor Attestation</h3>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-slate-700">{event.attestation_note}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}