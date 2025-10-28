import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Save } from "lucide-react";

export default function UpdateRefillForm({ medication, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    refill_quantity: medication.refill_quantity || 0,
    refill_threshold: medication.refill_threshold || 7,
    last_refill_date: medication.last_refill_date || new Date().toISOString().split('T')[0],
    next_refill_date: medication.next_refill_date || "",
    pharmacy_name: medication.pharmacy_name || "",
    pharmacy_phone: medication.pharmacy_phone || "",
    prescription_number: medication.prescription_number || ""
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Update Refill Information</CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-6">
            {/* Quantities */}
            <div>
              <h3 className="font-semibold mb-4">Current Supply</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="refill_quantity">Doses Remaining</Label>
                  <Input
                    type="number"
                    id="refill_quantity"
                    value={formData.refill_quantity}
                    onChange={(e) => handleChange('refill_quantity', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="refill_threshold">Alert Threshold (doses)</Label>
                  <Input
                    type="number"
                    id="refill_threshold"
                    value={formData.refill_threshold}
                    onChange={(e) => handleChange('refill_threshold', parseInt(e.target.value) || 0)}
                    min="1"
                  />
                  <p className="text-xs text-slate-500 mt-1">Alert when quantity drops below this</p>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div>
              <h3 className="font-semibold mb-4">Refill Dates</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="last_refill_date">Last Refill Date</Label>
                  <Input
                    type="date"
                    id="last_refill_date"
                    value={formData.last_refill_date}
                    onChange={(e) => handleChange('last_refill_date', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="next_refill_date">Next Refill Due</Label>
                  <Input
                    type="date"
                    id="next_refill_date"
                    value={formData.next_refill_date}
                    onChange={(e) => handleChange('next_refill_date', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Pharmacy Info */}
            <div>
              <h3 className="font-semibold mb-4">Pharmacy Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pharmacy_name">Pharmacy Name</Label>
                  <Input
                    id="pharmacy_name"
                    value={formData.pharmacy_name}
                    onChange={(e) => handleChange('pharmacy_name', e.target.value)}
                    placeholder="e.g., CVS Pharmacy"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pharmacy_phone">Phone Number</Label>
                    <Input
                      id="pharmacy_phone"
                      value={formData.pharmacy_phone}
                      onChange={(e) => handleChange('pharmacy_phone', e.target.value)}
                      placeholder="555-0123"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prescription_number">Prescription #</Label>
                    <Input
                      id="prescription_number"
                      value={formData.prescription_number}
                      onChange={(e) => handleChange('prescription_number', e.target.value)}
                      placeholder="RX123456"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-t flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-purple-500 to-pink-600">
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Refill Info'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}