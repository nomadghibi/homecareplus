import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';

export default function StrategyForm({ open, onClose, strategy = null }) {
  const [formData, setFormData] = useState({
    name: strategy?.name || '',
    description: strategy?.description || '',
    strategy_type: strategy?.strategy_type || 'standard',
    is_active: strategy?.is_active ?? true,
    is_default: strategy?.is_default ?? false,
    effective_date: strategy?.effective_date || new Date().toISOString().split('T')[0],
    expiration_date: strategy?.expiration_date || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement save logic
    console.log('Saving pricing strategy:', formData);
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {strategy ? 'Edit Pricing Strategy' : 'New Pricing Strategy'}
            </DialogTitle>
            <DialogDescription>
              Create or modify a pricing strategy with service rates and modifiers
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Strategy Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Standard Private Pay"
                required
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe this pricing strategy..."
                rows={3}
              />
            </div>

            {/* Strategy Type */}
            <div className="grid gap-2">
              <Label htmlFor="strategy_type">Strategy Type *</Label>
              <Select
                value={formData.strategy_type}
                onValueChange={(value) => handleChange('strategy_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="private_pay">Private Pay</SelectItem>
                  <SelectItem value="medicare">Medicare</SelectItem>
                  <SelectItem value="medicaid">Medicaid</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="effective_date">Effective Date *</Label>
                <Input
                  id="effective_date"
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => handleChange('effective_date', e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expiration_date">Expiration Date</Label>
                <Input
                  id="expiration_date"
                  type="date"
                  value={formData.expiration_date}
                  onChange={(e) => handleChange('expiration_date', e.target.value)}
                />
              </div>
            </div>

            {/* Switches */}
            <div className="flex items-center justify-between border-t pt-4">
              <div className="space-y-1">
                <Label htmlFor="is_active">Active Strategy</Label>
                <p className="text-sm text-gray-500">Enable this pricing strategy</p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleChange('is_active', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="is_default">Default Strategy</Label>
                <p className="text-sm text-gray-500">Use as default for new clients</p>
              </div>
              <Switch
                id="is_default"
                checked={formData.is_default}
                onCheckedChange={(checked) => handleChange('is_default', checked)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {strategy ? 'Update Strategy' : 'Create Strategy'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
