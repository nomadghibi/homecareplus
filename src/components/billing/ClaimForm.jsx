import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, Save } from "lucide-react";

export default function ClaimForm({ clients, visits, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    claim_number: `CLM-${Date.now()}`,
    client_id: "",
    visit_ids: [],
    service_date_from: "",
    service_date_to: "",
    payer: "",
    payer_id: "",
    total_charge: 0,
    total_units: 0,
    claim_status: "draft",
    billing_notes: ""
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      submission_date: formData.claim_status !== 'draft' ? new Date().toISOString().split('T')[0] : undefined
    };
    onSubmit(submissionData);
  };

  const selectedClient = clients.find(c => c.id === formData.client_id);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <CardTitle>Create New Claim</CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="claim_number">Claim Number *</Label>
              <Input
                id="claim_number"
                value={formData.claim_number}
                onChange={(e) => handleChange('claim_number', e.target.value)}
                required
              />
            </div>

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

            {selectedClient && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 mb-1">Insurance Information</p>
                <p className="font-medium">{selectedClient.insurance_provider || 'Not specified'}</p>
                {selectedClient.insurance_id && (
                  <p className="text-sm text-slate-600">ID: {selectedClient.insurance_id}</p>
                )}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service_date_from">Service Date From *</Label>
                <Input
                  id="service_date_from"
                  type="date"
                  value={formData.service_date_from}
                  onChange={(e) => handleChange('service_date_from', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="service_date_to">Service Date To</Label>
                <Input
                  id="service_date_to"
                  type="date"
                  value={formData.service_date_to}
                  onChange={(e) => handleChange('service_date_to', e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="payer">Payer *</Label>
                <Input
                  id="payer"
                  value={formData.payer}
                  onChange={(e) => handleChange('payer', e.target.value)}
                  placeholder="Insurance company name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="payer_id">Payer ID</Label>
                <Input
                  id="payer_id"
                  value={formData.payer_id}
                  onChange={(e) => handleChange('payer_id', e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="total_charge">Total Charge ($) *</Label>
                <Input
                  id="total_charge"
                  type="number"
                  step="0.01"
                  value={formData.total_charge}
                  onChange={(e) => handleChange('total_charge', parseFloat(e.target.value))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="total_units">Total Units</Label>
                <Input
                  id="total_units"
                  type="number"
                  value={formData.total_units}
                  onChange={(e) => handleChange('total_units', parseInt(e.target.value))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="claim_status">Status</Label>
              <Select 
                value={formData.claim_status} 
                onValueChange={(value) => handleChange('claim_status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="billing_notes">Billing Notes</Label>
              <Textarea
                id="billing_notes"
                value={formData.billing_notes}
                onChange={(e) => handleChange('billing_notes', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>

          <CardFooter className="border-t flex justify-end gap-3 sticky bottom-0 bg-white">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-green-500 to-emerald-600">
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Create Claim'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}