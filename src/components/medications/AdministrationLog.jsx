import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  User,
  Calendar,
  FileText,
  Eye,
  Plus
} from "lucide-react";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import RecordAdministration from "./RecordAdministration";

export default function AdministrationLog({ medication, administrations, clients, caregivers, onRecordNew }) {
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const statusConfig = {
    administered: { 
      color: "bg-green-100 text-green-700 border-green-200", 
      label: "Administered", 
      icon: CheckCircle2 
    },
    refused: { 
      color: "bg-red-100 text-red-700 border-red-200", 
      label: "Refused", 
      icon: XCircle 
    },
    missed: { 
      color: "bg-orange-100 text-orange-700 border-orange-200", 
      label: "Missed", 
      icon: AlertTriangle 
    },
    held: { 
      color: "bg-yellow-100 text-yellow-700 border-yellow-200", 
      label: "Held", 
      icon: Clock 
    },
  };

  // Filter administrations for this medication
  const medAdministrations = administrations
    .filter(a => a.medication_schedule_id === medication.id)
    .sort((a, b) => new Date(b.actual_time) - new Date(a.actual_time));

  // Calculate stats
  const last7Days = medAdministrations.filter(a => {
    const adminDate = new Date(a.actual_time);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return adminDate >= weekAgo;
  });

  const adherenceRate = last7Days.length > 0
    ? (last7Days.filter(a => a.status === 'administered').length / last7Days.length) * 100
    : 0;

  const getCaregiver = (id) => caregivers.find(c => c.id === id);
  const client = clients.find(c => c.id === medication.client_id);

  return (
    <div className="space-y-6">
      {/* Stats & Record Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Administration History</h3>
          <div className="flex gap-4 mt-2 text-sm text-slate-600">
            <div>
              <span className="font-medium">7-Day Adherence:</span> 
              <span className={`ml-2 font-bold ${adherenceRate >= 90 ? 'text-green-600' : adherenceRate >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                {adherenceRate.toFixed(0)}%
              </span>
            </div>
            <div>
              <span className="font-medium">Last 7 Days:</span> 
              <span className="ml-2">{last7Days.filter(a => a.status === 'administered').length} / {last7Days.length} doses</span>
            </div>
          </div>
        </div>
        <Button 
          onClick={() => setShowRecordForm(true)}
          className="bg-gradient-to-r from-green-500 to-emerald-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Record Administration
        </Button>
      </div>

      {/* Administration List */}
      <Card className="border-none shadow-md">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Recent Administrations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            {medAdministrations.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No administration records yet</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowRecordForm(true)}
                >
                  Record First Administration
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {medAdministrations.map((admin) => {
                  const status = statusConfig[admin.status] || statusConfig.administered;
                  const StatusIcon = status.icon;
                  const caregiver = getCaregiver(admin.caregiver_id);

                  return (
                    <div 
                      key={admin.id}
                      onClick={() => setSelectedAdmin(admin)}
                      className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${status.color} flex items-center justify-center`}>
                            <StatusIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge className={`${status.color} border`}>
                                {status.label}
                              </Badge>
                              {admin.scheduled_time && (
                                <span className="text-sm text-slate-500">
                                  Scheduled: {admin.scheduled_time}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 mt-1">
                              {format(parseISO(admin.actual_time), 'MMM d, yyyy h:mm a')}
                              <span className="text-slate-400 ml-2">
                                ({formatDistanceToNow(parseISO(admin.actual_time), { addSuffix: true })})
                              </span>
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        {caregiver && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <User className="w-4 h-4 text-slate-400" />
                            {caregiver.first_name} {caregiver.last_name}
                          </div>
                        )}
                        {admin.dosage_given && (
                          <div className="text-slate-600">
                            <span className="font-medium">Dosage:</span> {admin.dosage_given}
                          </div>
                        )}
                        {admin.administration_method && (
                          <div className="text-slate-600 capitalize">
                            <span className="font-medium">Method:</span> {admin.administration_method.replace(/_/g, ' ')}
                          </div>
                        )}
                      </div>

                      {admin.status === 'refused' && admin.reason_for_refusal && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-sm text-red-800">
                            <span className="font-medium">Reason for Refusal:</span> {admin.reason_for_refusal}
                          </p>
                        </div>
                      )}

                      {admin.status === 'held' && admin.reason_for_hold && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-sm text-yellow-800">
                            <span className="font-medium">Reason Held:</span> {admin.reason_for_hold}
                          </p>
                        </div>
                      )}

                      {admin.side_effects_observed && (
                        <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <p className="text-sm text-orange-800">
                            <span className="font-medium">Side Effects:</span> {admin.side_effects_observed}
                          </p>
                        </div>
                      )}

                      {admin.notes && (
                        <div className="mt-3 text-sm text-slate-600">
                          <span className="font-medium">Notes:</span> {admin.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Record Administration Form */}
      {showRecordForm && (
        <RecordAdministration
          medication={medication}
          client={client}
          caregivers={caregivers}
          onSubmit={(data) => {
            onRecordNew(data);
            setShowRecordForm(false);
          }}
          onCancel={() => setShowRecordForm(false)}
        />
      )}
    </div>
  );
}