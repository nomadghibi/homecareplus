import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function IncidentForm({ incident, clients, caregivers, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    incident_number: '',
    incident_type: 'fall',
    severity: 'moderate',
    status: 'reported',
    incident_date: '',
    reported_date: new Date().toISOString(),
    client_id: '',
    caregiver_id: '',
    visit_id: '',
    location: '',
    description: '',
    witnesses: [],
    immediate_action_taken: '',
    injuries_sustained: '',
    medical_attention_required: false,
    medical_attention_details: '',
    emergency_services_called: false,
    emergency_services_details: '',
    family_notified: false,
    family_notification_date: '',
    family_notification_method: 'phone',
    regulatory_notification_required: false,
    regulatory_agencies_notified: [],
    investigation_findings: '',
    root_cause: '',
    contributing_factors: [],
    corrective_actions: [],
    preventive_measures: '',
    follow_up_required: false,
    follow_up_date: '',
    reported_by: '',
    investigated_by: '',
    reviewed_by: '',
    notes: '',
    ...incident
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await base44.auth.me();
        if (!incident && user) {
          setFormData(prev => ({ ...prev, reported_by: user.email }));
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, [incident]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddWitness = () => {
    setFormData(prev => ({
      ...prev,
      witnesses: [...prev.witnesses, { name: '', contact: '', statement: '' }]
    }));
  };

  const handleRemoveWitness = (index) => {
    setFormData(prev => ({
      ...prev,
      witnesses: prev.witnesses.filter((_, i) => i !== index)
    }));
  };

  const handleWitnessChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      witnesses: prev.witnesses.map((w, i) => i === index ? { ...w, [field]: value } : w)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <CardTitle>{incident ? 'Edit Incident' : 'Report New Incident'}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Incident Number *</Label>
                  <Input
                    value={formData.incident_number}
                    onChange={(e) => handleChange('incident_number', e.target.value)}
                    placeholder="Auto-generated if empty"
                  />
                </div>
                <div>
                  <Label>Incident Type *</Label>
                  <Select value={formData.incident_type} onValueChange={(value) => handleChange('incident_type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fall">Fall</SelectItem>
                      <SelectItem value="medication_error">Medication Error</SelectItem>
                      <SelectItem value="injury">Injury</SelectItem>
                      <SelectItem value="abuse_allegation">Abuse Allegation</SelectItem>
                      <SelectItem value="complaint">Complaint</SelectItem>
                      <SelectItem value="equipment_failure">Equipment Failure</SelectItem>
                      <SelectItem value="security_breach">Security Breach</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Severity *</Label>
                  <Select value={formData.severity} onValueChange={(value) => handleChange('severity', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minor">Minor</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="serious">Serious</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reported">Reported</SelectItem>
                      <SelectItem value="under_investigation">Under Investigation</SelectItem>
                      <SelectItem value="action_taken">Action Taken</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Incident Date & Time *</Label>
                  <Input
                    type="datetime-local"
                    value={formData.incident_date ? new Date(formData.incident_date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleChange('incident_date', new Date(e.target.value).toISOString())}
                  />
                </div>
                <div>
                  <Label>Client (if applicable)</Label>
                  <Select value={formData.client_id} onValueChange={(value) => handleChange('client_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>None</SelectItem>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.first_name} {client.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Caregiver (if applicable)</Label>
                  <Select value={formData.caregiver_id} onValueChange={(value) => handleChange('caregiver_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select caregiver" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>None</SelectItem>
                      {caregivers.map(caregiver => (
                        <SelectItem key={caregiver.id} value={caregiver.id}>
                          {caregiver.first_name} {caregiver.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="Where did this occur?"
                  />
                </div>
              </div>
              <div>
                <Label>Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Detailed description of what happened..."
                  rows={4}
                />
              </div>
            </div>

            {/* Immediate Response */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Immediate Response</h3>
              <div>
                <Label>Immediate Action Taken</Label>
                <Textarea
                  value={formData.immediate_action_taken}
                  onChange={(e) => handleChange('immediate_action_taken', e.target.value)}
                  placeholder="What was done immediately?"
                  rows={3}
                />
              </div>
              <div>
                <Label>Injuries Sustained</Label>
                <Textarea
                  value={formData.injuries_sustained}
                  onChange={(e) => handleChange('injuries_sustained', e.target.value)}
                  placeholder="Describe any injuries..."
                  rows={2}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.medical_attention_required}
                      onChange={(e) => handleChange('medical_attention_required', e.target.checked)}
                      className="rounded"
                    />
                    Medical Attention Required
                  </Label>
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.emergency_services_called}
                      onChange={(e) => handleChange('emergency_services_called', e.target.checked)}
                      className="rounded"
                    />
                    Emergency Services Called
                  </Label>
                </div>
              </div>
              {formData.medical_attention_required && (
                <div>
                  <Label>Medical Attention Details</Label>
                  <Textarea
                    value={formData.medical_attention_details}
                    onChange={(e) => handleChange('medical_attention_details', e.target.value)}
                    placeholder="Details of medical treatment..."
                    rows={2}
                  />
                </div>
              )}
            </div>

            {/* Witnesses */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Witnesses</h3>
                <Button type="button" variant="outline" size="sm" onClick={handleAddWitness}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Witness
                </Button>
              </div>
              {formData.witnesses.map((witness, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium">Witness {index + 1}</h4>
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveWitness(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={witness.name}
                        onChange={(e) => handleWitnessChange(index, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Contact</Label>
                      <Input
                        value={witness.contact}
                        onChange={(e) => handleWitnessChange(index, 'contact', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Statement</Label>
                      <Textarea
                        value={witness.statement}
                        onChange={(e) => handleWitnessChange(index, 'statement', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Family Notification */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Family Notification</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.family_notified}
                      onChange={(e) => handleChange('family_notified', e.target.checked)}
                      className="rounded"
                    />
                    Family Notified
                  </Label>
                </div>
                {formData.family_notified && (
                  <>
                    <div>
                      <Label>Notification Date</Label>
                      <Input
                        type="datetime-local"
                        value={formData.family_notification_date ? new Date(formData.family_notification_date).toISOString().slice(0, 16) : ''}
                        onChange={(e) => handleChange('family_notification_date', new Date(e.target.value).toISOString())}
                      />
                    </div>
                    <div>
                      <Label>Notification Method</Label>
                      <Select value={formData.family_notification_method} onValueChange={(value) => handleChange('family_notification_method', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="in_person">In Person</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <Label>Additional Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Any additional information..."
                rows={3}
              />
            </div>
          </CardContent>

          <div className="flex justify-end gap-3 p-6 border-t sticky bottom-0 bg-white">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-red-500 to-orange-600">
              {isLoading ? 'Saving...' : incident ? 'Update Incident' : 'Report Incident'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}