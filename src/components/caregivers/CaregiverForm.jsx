import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Save, Plus } from "lucide-react";

export default function CaregiverForm({ caregiver, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState(caregiver || {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    status: "active",
    certifications: [],
    skills: [], // Changed from specializations to match DB schema
    license_number: "",
    license_expiry: "",
    hire_date: "",
    hourly_rate: "",
    max_hours_per_week: 40,
    employment_type: "Full-time", // Added - required in schema
    address: "",
    city: "",
    state: "",
    zip_code: "",
    notes: ""
  });

  const [newCertification, setNewCertification] = useState("");
  const [newSkill, setNewSkill] = useState(""); // Changed from newSpecialization

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...(prev.certifications || []), newCertification.trim()]
      }));
      setNewCertification("");
    }
  };

  const removeCertification = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
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
            <CardTitle>{caregiver ? 'Edit Caregiver' : 'Add New Caregiver'}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-4">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Certifications & Skills</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Certifications</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Add certification"
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                    />
                    <Button type="button" onClick={addCertification} size="icon">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.certifications?.map((cert, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1">
                        {cert}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeCertification(idx)} />
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Skills</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Add skill"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <Button type="button" onClick={addSkill} size="icon">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills?.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1">
                        {skill}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeSkill(idx)} />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">License & Employment</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="license_number">License Number</Label>
                  <Input
                    id="license_number"
                    value={formData.license_number}
                    onChange={(e) => handleChange('license_number', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="license_expiry">License Expiry</Label>
                  <Input
                    id="license_expiry"
                    type="date"
                    value={formData.license_expiry}
                    onChange={(e) => handleChange('license_expiry', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="hire_date">Hire Date</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => handleChange('hire_date', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    step="0.01"
                    value={formData.hourly_rate}
                    onChange={(e) => handleChange('hourly_rate', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="max_hours_per_week">Max Hours Per Week</Label>
                  <Input
                    id="max_hours_per_week"
                    type="number"
                    value={formData.max_hours_per_week}
                    onChange={(e) => handleChange('max_hours_per_week', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Address</h3>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip_code">ZIP Code</Label>
                    <Input
                      id="zip_code"
                      value={formData.zip_code}
                      onChange={(e) => handleChange('zip_code', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>

          <CardFooter className="border-t flex justify-end gap-3 sticky bottom-0 bg-white">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-purple-500 to-blue-600">
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Caregiver'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}