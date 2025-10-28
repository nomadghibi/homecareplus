import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MedicationForm({ medication, clients, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState(medication || {
    client_id: "",
    medication_name: "",
    dosage: "",
    route: "oral",
    frequency: "",
    schedule_times: [],
    purpose: "",
    prescribing_doctor: "",
    start_date: "",
    end_date: "",
    status: "active",
    special_instructions: "",
    side_effects_to_monitor: "",
    photo_url: ""
  });

  const [newTime, setNewTime] = useState("");

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addScheduleTime = () => {
    if (newTime && !formData.schedule_times.includes(newTime)) {
      handleChange('schedule_times', [...formData.schedule_times, newTime].sort());
      setNewTime("");
    }
  };

  const removeScheduleTime = (timeToRemove) => {
    handleChange('schedule_times', formData.schedule_times.filter(t => t !== timeToRemove));
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
            <CardTitle>{medication ? 'Edit Medication' : 'Add New Medication'}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-6">
            {/* Client Selection */}
            <div>
              <Label htmlFor="client_id">Client *</Label>
              <Select 
                value={formData.client_id} 
                onValueChange={(value) => handleChange('client_id', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.filter(c => c.status === 'active').map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.first_name} {client.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Basic Information */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Medication Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="medication_name">Medication Name *</Label>
                  <Input
                    id="medication_name"
                    value={formData.medication_name}
                    onChange={(e) => handleChange('medication_name', e.target.value)}
                    placeholder="e.g., Lisinopril"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dosage">Dosage *</Label>
                  <Input
                    id="dosage"
                    value={formData.dosage}
                    onChange={(e) => handleChange('dosage', e.target.value)}
                    placeholder="e.g., 10mg, 2 tablets"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="route">Route of Administration</Label>
                  <Select 
                    value={formData.route} 
                    onValueChange={(value) => handleChange('route', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oral">Oral</SelectItem>
                      <SelectItem value="topical">Topical</SelectItem>
                      <SelectItem value="injection">Injection</SelectItem>
                      <SelectItem value="inhalation">Inhalation</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Input
                    id="frequency"
                    value={formData.frequency}
                    onChange={(e) => handleChange('frequency', e.target.value)}
                    placeholder="e.g., twice daily, every 6 hours"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Schedule Times */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Schedule Times</h3>
              <div className="flex gap-2 mb-3">
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" onClick={addScheduleTime} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Time
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.schedule_times.map((time, idx) => (
                  <Badge key={idx} variant="secondary" className="flex items-center gap-2">
                    {time}
                    <button
                      type="button"
                      onClick={() => removeScheduleTime(time)}
                      className="hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Medical Information */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Medical Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purpose">Purpose</Label>
                  <Input
                    id="purpose"
                    value={formData.purpose}
                    onChange={(e) => handleChange('purpose', e.target.value)}
                    placeholder="What is this medication for?"
                  />
                </div>
                <div>
                  <Label htmlFor="prescribing_doctor">Prescribing Doctor</Label>
                  <Input
                    id="prescribing_doctor"
                    value={formData.prescribing_doctor}
                    onChange={(e) => handleChange('prescribing_doctor', e.target.value)}
                    placeholder="Dr. Smith"
                  />
                </div>
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleChange('start_date', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date (if temporary)</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleChange('end_date', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="discontinued">Discontinued</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="photo_url">Medication Photo URL</Label>
                  <Input
                    id="photo_url"
                    value={formData.photo_url}
                    onChange={(e) => handleChange('photo_url', e.target.value)}
                    placeholder="Optional: Photo for identification"
                  />
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Additional Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="special_instructions">Special Instructions</Label>
                  <Textarea
                    id="special_instructions"
                    value={formData.special_instructions}
                    onChange={(e) => handleChange('special_instructions', e.target.value)}
                    placeholder="e.g., Take with food, avoid grapefruit"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="side_effects_to_monitor">Side Effects to Monitor</Label>
                  <Textarea
                    id="side_effects_to_monitor"
                    value={formData.side_effects_to_monitor}
                    onChange={(e) => handleChange('side_effects_to_monitor', e.target.value)}
                    placeholder="e.g., Dizziness, nausea, low blood pressure"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-t flex justify-end gap-3 sticky bottom-0 bg-white">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-purple-500 to-pink-600">
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Medication'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}