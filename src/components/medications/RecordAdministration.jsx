import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function RecordAdministration({ medication, client, caregivers, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    medication_schedule_id: medication.id,
    client_id: medication.client_id,
    caregiver_id: "",
    scheduled_time: "",
    actual_time: new Date().toISOString(),
    status: "administered",
    dosage_given: medication.dosage,
    administration_method: "caregiver_assisted",
    reason_for_refusal: "",
    reason_for_hold: "",
    side_effects_observed: "",
    client_response: "",
    notes: ""
  });

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        // Try to find caregiver matching user email
        const matchingCaregiver = caregivers.find(c => c.email === user.email);
        if (matchingCaregiver) {
          setFormData(prev => ({ ...prev, caregiver_id: matchingCaregiver.id }));
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, [caregivers]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <CardTitle>Record Medication Administration</CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="text-sm text-slate-600 mt-2">
            <p className="font-medium">{medication.medication_name} - {medication.dosage}</p>
            <p>Client: {client?.first_name} {client?.last_name}</p>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-6">
            {/* Status */}
            <div>
              <Label htmlFor="status">Administration Status *</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleChange('status', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administered">✅ Administered</SelectItem>
                  <SelectItem value="refused">❌ Refused</SelectItem>
                  <SelectItem value="missed">⏰ Missed</SelectItem>
                  <SelectItem value="held">⏸️ Held</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Times */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduled_time">Scheduled Time</Label>
                <Input
                  type="time"
                  id="scheduled_time"
                  value={formData.scheduled_time}
                  onChange={(e) => handleChange('scheduled_time', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="actual_time">Actual Time *</Label>
                <Input
                  type="datetime-local"
                  id="actual_time"
                  value={formData.actual_time.slice(0, 16)}
                  onChange={(e) => handleChange('actual_time', new Date(e.target.value).toISOString())}
                  required
                />
              </div>
            </div>

            {/* Caregiver */}
            <div>
              <Label htmlFor="caregiver_id">Administered By *</Label>
              <Select 
                value={formData.caregiver_id} 
                onValueChange={(value) => handleChange('caregiver_id', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select caregiver" />
                </SelectTrigger>
                <SelectContent>
                  {caregivers.filter(c => c.status === 'active').map((caregiver) => (
                    <SelectItem key={caregiver.id} value={caregiver.id}>
                      {caregiver.first_name} {caregiver.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.status === 'administered' && (
              <>
                {/* Dosage & Method */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dosage_given">Dosage Given</Label>
                    <Input
                      id="dosage_given"
                      value={formData.dosage_given}
                      onChange={(e) => handleChange('dosage_given', e.target.value)}
                      placeholder="e.g., 10mg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="administration_method">Administration Method</Label>
                    <Select 
                      value={formData.administration_method} 
                      onValueChange={(value) => handleChange('administration_method', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="self_administered">Self Administered</SelectItem>
                        <SelectItem value="caregiver_assisted">Caregiver Assisted</SelectItem>
                        <SelectItem value="fully_administered">Fully Administered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Client Response */}
                <div>
                  <Label htmlFor="client_response">Client Response</Label>
                  <Textarea
                    id="client_response"
                    value={formData.client_response}
                    onChange={(e) => handleChange('client_response', e.target.value)}
                    placeholder="How did client respond to medication?"
                    rows={2}
                  />
                </div>

                {/* Side Effects */}
                <div>
                  <Label htmlFor="side_effects_observed">Side Effects Observed</Label>
                  <Textarea
                    id="side_effects_observed"
                    value={formData.side_effects_observed}
                    onChange={(e) => handleChange('side_effects_observed', e.target.value)}
                    placeholder="Any adverse reactions or side effects noted?"
                    rows={2}
                  />
                </div>
              </>
            )}

            {formData.status === 'refused' && (
              <div>
                <Label htmlFor="reason_for_refusal">Reason for Refusal *</Label>
                <Textarea
                  id="reason_for_refusal"
                  value={formData.reason_for_refusal}
                  onChange={(e) => handleChange('reason_for_refusal', e.target.value)}
                  placeholder="Why did client refuse medication?"
                  rows={3}
                  required
                />
              </div>
            )}

            {formData.status === 'held' && (
              <div>
                <Label htmlFor="reason_for_hold">Reason for Hold *</Label>
                <Textarea
                  id="reason_for_hold"
                  value={formData.reason_for_hold}
                  onChange={(e) => handleChange('reason_for_hold', e.target.value)}
                  placeholder="Medical reason for holding medication?"
                  rows={3}
                  required
                />
              </div>
            )}

            {/* Additional Notes */}
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Any other relevant information?"
                rows={3}
              />
            </div>
          </CardContent>

          <CardFooter className="border-t flex justify-end gap-3 sticky bottom-0 bg-white">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-green-500 to-emerald-600">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Save Administration Record
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}