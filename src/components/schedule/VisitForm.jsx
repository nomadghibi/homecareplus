import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save } from "lucide-react";

export default function VisitForm({ visit, clients, caregivers, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState(visit || {
    client_id: "",
    caregiver_id: "",
    scheduled_date: "",
    scheduled_start_time: "",
    scheduled_end_time: "",
    status: "scheduled",
    visit_type: "personal_care"
  });

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
            <CardTitle>{visit ? 'Edit Visit' : 'Schedule New Visit'}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-4">
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
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.first_name} {client.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="caregiver_id">Caregiver *</Label>
              <Select 
                value={formData.caregiver_id} 
                onValueChange={(value) => handleChange('caregiver_id', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select caregiver" />
                </SelectTrigger>
                <SelectContent>
                  {caregivers.map((caregiver) => (
                    <SelectItem key={caregiver.id} value={caregiver.id}>
                      {caregiver.first_name} {caregiver.last_name} ({caregiver.employee_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="scheduled_date">Date *</Label>
              <Input
                id="scheduled_date"
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => handleChange('scheduled_date', e.target.value)}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduled_start_time">Start Time *</Label>
                <Input
                  id="scheduled_start_time"
                  type="time"
                  value={formData.scheduled_start_time}
                  onChange={(e) => handleChange('scheduled_start_time', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="scheduled_end_time">End Time *</Label>
                <Input
                  id="scheduled_end_time"
                  type="time"
                  value={formData.scheduled_end_time}
                  onChange={(e) => handleChange('scheduled_end_time', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="visit_type">Visit Type *</Label>
              <Select 
                value={formData.visit_type} 
                onValueChange={(value) => handleChange('visit_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal_care">Personal Care</SelectItem>
                  <SelectItem value="companionship">Companionship</SelectItem>
                  <SelectItem value="medication_management">Medication Management</SelectItem>
                  <SelectItem value="skilled_nursing">Skilled Nursing</SelectItem>
                  <SelectItem value="physical_therapy">Physical Therapy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {visit && (
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
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>

          <CardFooter className="border-t flex justify-end gap-3 sticky bottom-0 bg-white">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-blue-500 to-teal-600">
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Visit'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}