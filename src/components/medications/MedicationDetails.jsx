
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Edit, Clock, Calendar, AlertTriangle, User, FileText, Trash2, Pill, Activity, Package } from "lucide-react";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdministrationLog from "./AdministrationLog";
import RefillTracker from "./RefillTracker";
import UpdateRefillForm from "./UpdateRefillForm";

export default function MedicationDetails({ medication, client, onClose, onEdit, onDelete }) {
  const [activeTab, setActiveTab] = useState("details");
  const [showRefillForm, setShowRefillForm] = useState(false);
  const queryClient = useQueryClient();

  // Fetch administrations related to this specific medication
  const { data: administrations = [] } = useQuery({
    queryKey: ['medicationAdministrations', medication.id],
    queryFn: async () => {
      const response = await base44.entities.MedicationAdministration.list({
        filter: { medication_schedule_id: medication.id },
        sort: '-actual_time',
      });
      return response.data;
    },
    enabled: !!medication.id, // Only run query if medication.id exists
  });

  const { data: caregivers = [] } = useQuery({
    queryKey: ['caregivers'],
    queryFn: () => base44.entities.Caregiver.list(),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
  });

  const createAdministrationMutation = useMutation({
    mutationFn: (data) => base44.entities.MedicationAdministration.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['medicationAdministrations', medication.id]);
    },
  });

  const updateMedicationMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MedicationSchedule.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['medications']); // Invalidate the main medications list
      queryClient.invalidateQueries(['medication', medication.id]); // Invalidate this specific medication
      setShowRefillForm(false);
    },
  });

  const statusConfig = {
    active: { color: "bg-green-100 text-green-700 border-green-200", label: "Active" },
    paused: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Paused" },
    discontinued: { color: "bg-slate-100 text-slate-700 border-slate-200", label: "Discontinued" },
  };

  const routeConfig = {
    oral: "Oral",
    topical: "Topical",
    injection: "Injection",
    inhalation: "Inhalation",
    other: "Other",
  };

  const status = statusConfig[medication.status] || statusConfig.active;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{medication.medication_name}</CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge className={`${status.color} border`}>
                  {status.label}
                </Badge>
                <Badge variant="outline">
                  {medication.dosage}
                </Badge>
                <Badge variant="outline">
                  {routeConfig[medication.route]}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onEdit(medication)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Details
              </TabsTrigger>
              <TabsTrigger value="administration" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Administration Log
              </TabsTrigger>
              <TabsTrigger value="refills" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Refill Tracking
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              {/* Client Information */}
              {client && (
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Client
                  </h3>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="font-medium text-slate-900">
                      {client.first_name} {client.last_name}
                    </p>
                    {client.phone && (
                      <p className="text-sm text-slate-600 mt-1">{client.phone}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Dosage Information */}
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-purple-600" />
                  Dosage & Frequency
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Dosage</p>
                    <p className="font-medium">{medication.dosage}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Frequency</p>
                    <p className="font-medium">{medication.frequency}</p>
                  </div>
                  {medication.schedule_times && medication.schedule_times.length > 0 && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-500 mb-2">Schedule Times</p>
                      <div className="flex flex-wrap gap-2">
                        {medication.schedule_times.map((time, idx) => (
                          <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Medical Information */}
              {(medication.purpose || medication.prescribing_doctor) && (
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Medical Information
                  </h3>
                  <div className="space-y-3">
                    {medication.purpose && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-500">Purpose</p>
                        <p className="font-medium">{medication.purpose}</p>
                      </div>
                    )}
                    {medication.prescribing_doctor && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-500">Prescribing Doctor</p>
                        <p className="font-medium">{medication.prescribing_doctor}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Dates */}
              {(medication.start_date || medication.end_date) && (
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-teal-600" />
                    Schedule Dates
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {medication.start_date && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-500">Start Date</p>
                        <p className="font-medium">
                          {format(new Date(medication.start_date), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    )}
                    {medication.end_date && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-500">End Date</p>
                        <p className="font-medium">
                          {format(new Date(medication.end_date), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Special Instructions */}
              {medication.special_instructions && (
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    Special Instructions
                  </h3>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-slate-700 whitespace-pre-wrap">{medication.special_instructions}</p>
                  </div>
                </div>
              )}

              {/* Side Effects */}
              {medication.side_effects_to_monitor && (
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Side Effects to Monitor
                  </h3>
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-slate-700 whitespace-pre-wrap">{medication.side_effects_to_monitor}</p>
                  </div>
                </div>
              )}

              {/* Photo */}
              {medication.photo_url && (
                <div>
                  <h3 className="font-semibold text-lg mb-4">Medication Photo</h3>
                  <img
                    src={medication.photo_url}
                    alt={medication.medication_name}
                    className="w-full max-w-md rounded-lg border border-slate-200"
                  />
                </div>
              )}

              {/* Delete Button */}
              <div className="pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={() => onDelete(medication.id)}
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Medication
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="administration">
              <AdministrationLog
                medication={medication}
                administrations={administrations.filter(admin => admin.medication_schedule_id === medication.id)}
                clients={clients}
                caregivers={caregivers}
                onRecordNew={(data) => createAdministrationMutation.mutate(data)}
                isLoading={createAdministrationMutation.isPending}
              />
            </TabsContent>

            <TabsContent value="refills">
              <RefillTracker
                medication={medication}
                onUpdateRefill={() => setShowRefillForm(true)}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Update Refill Form */}
      {showRefillForm && (
        <UpdateRefillForm
          medication={medication}
          onSubmit={(data) => updateMedicationMutation.mutate({ id: medication.id, data })}
          onCancel={() => setShowRefillForm(false)}
          isLoading={updateMedicationMutation.isPending}
        />
      )}
    </div>
  );
}
