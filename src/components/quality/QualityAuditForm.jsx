import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function QualityAuditForm({ audit, clients, caregivers, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    audit_number: '',
    audit_type: 'internal',
    audit_date: new Date().toISOString().split('T')[0],
    auditor_name: '',
    auditor_email: '',
    auditor_organization: '',
    scope: '',
    client_id: '',
    caregiver_id: '',
    overall_score: 0,
    pass_fail: 'pass',
    status: 'scheduled',
    notes: '',
    ...audit
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await base44.auth.me();
        if (!audit && user) {
          setFormData(prev => ({
            ...prev,
            auditor_name: user.full_name || '',
            auditor_email: user.email || ''
          }));
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, [audit]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <CardTitle>{audit ? 'Edit Quality Audit' : 'New Quality Audit'}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Audit Number</Label>
                <Input
                  value={formData.audit_number}
                  onChange={(e) => handleChange('audit_number', e.target.value)}
                  placeholder="Auto-generated if empty"
                />
              </div>
              <div>
                <Label>Audit Type *</Label>
                <Select value={formData.audit_type} onValueChange={(value) => handleChange('audit_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Internal Audit</SelectItem>
                    <SelectItem value="external">External Audit</SelectItem>
                    <SelectItem value="regulatory">Regulatory Audit</SelectItem>
                    <SelectItem value="client_satisfaction">Client Satisfaction</SelectItem>
                    <SelectItem value="caregiver_performance">Caregiver Performance</SelectItem>
                    <SelectItem value="documentation_review">Documentation Review</SelectItem>
                    <SelectItem value="medication_audit">Medication Audit</SelectItem>
                    <SelectItem value="evv_audit">EVV Audit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Audit Date *</Label>
                <Input
                  type="date"
                  value={formData.audit_date}
                  onChange={(e) => handleChange('audit_date', e.target.value)}
                />
              </div>
              <div>
                <Label>Auditor Name *</Label>
                <Input
                  value={formData.auditor_name}
                  onChange={(e) => handleChange('auditor_name', e.target.value)}
                />
              </div>
              <div>
                <Label>Auditor Email</Label>
                <Input
                  type="email"
                  value={formData.auditor_email}
                  onChange={(e) => handleChange('auditor_email', e.target.value)}
                />
              </div>
              <div>
                <Label>Organization</Label>
                <Input
                  value={formData.auditor_organization}
                  onChange={(e) => handleChange('auditor_organization', e.target.value)}
                  placeholder="Internal or external agency"
                />
              </div>
              <div>
                <Label>Client (if specific)</Label>
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
                <Label>Caregiver (if specific)</Label>
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
                <Label>Overall Score (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.overall_score}
                  onChange={(e) => handleChange('overall_score', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label>Pass/Fail</Label>
                <Select value={formData.pass_fail} onValueChange={(value) => handleChange('pass_fail', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pass">Pass</SelectItem>
                    <SelectItem value="conditional_pass">Conditional Pass</SelectItem>
                    <SelectItem value="fail">Fail</SelectItem>
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
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="follow_up_required">Follow-up Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Scope</Label>
              <Textarea
                value={formData.scope}
                onChange={(e) => handleChange('scope', e.target.value)}
                placeholder="What was audited..."
                rows={3}
              />
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Additional notes..."
                rows={4}
              />
            </div>
          </CardContent>

          <div className="flex justify-end gap-3 p-6 border-t sticky bottom-0 bg-white">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-green-500 to-teal-600">
              {isLoading ? 'Saving...' : audit ? 'Update Audit' : 'Create Audit'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}