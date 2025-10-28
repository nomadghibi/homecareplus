import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Save, 
  ChevronRight, 
  ChevronLeft,
  Plus,
  Trash2,
  Target,
  Clock,
  User,
  Activity,
  Shield,
  AlertTriangle,
  FileText
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskBuilder from "./TaskBuilder";
import GoalBuilder from "./GoalBuilder";
import ScheduleBuilder from "./ScheduleBuilder";

export default function CarePlanForm({ plan, clients, onSubmit, onCancel, isLoading }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(plan || {
    client_id: "",
    plan_name: "",
    status: "draft",
    effective_date: "",
    review_date: "",
    expiration_date: "",
    primary_diagnosis: "",
    secondary_diagnoses: [],
    care_level: "moderate",
    hours_per_week: 0,
    goals: [],
    adl_tasks: [],
    iadl_tasks: [],
    medical_tasks: [],
    schedule_pattern: {},
    preferred_caregivers: [],
    restrictions: [],
    safety_concerns: [],
    emergency_procedures: "",
    communication_preferences: {},
    equipment_needed: [],
    notes: ""
  });

  const steps = [
    { id: 'basic', title: 'Basic Info', icon: FileText },
    { id: 'goals', title: 'Goals', icon: Target },
    { id: 'tasks', title: 'Care Tasks', icon: Activity },
    { id: 'schedule', title: 'Schedule', icon: Clock },
    { id: 'safety', title: 'Safety & Notes', icon: Shield }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayAdd = (field, value) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), value.trim()]
      }));
    }
  };

  const handleArrayRemove = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const canProceed = () => {
    if (currentStep === 0) {
      return formData.client_id && formData.plan_name && formData.effective_date;
    }
    return true;
  };

  const CurrentStepIcon = steps[currentStep].icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <CurrentStepIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>{plan ? 'Edit Care Plan' : 'Create New Care Plan'}</CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                  Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel} disabled={isLoading}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mt-4">
            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => setCurrentStep(idx)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      idx === currentStep
                        ? 'bg-emerald-100 text-emerald-700'
                        : idx < currentStep
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <StepIcon className="w-4 h-4" />
                    <span className="text-sm font-medium hidden md:inline">{step.title}</span>
                  </button>
                  {idx < steps.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6">
            {/* Step 0: Basic Info */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
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
                    <Label htmlFor="plan_name">Plan Name *</Label>
                    <Input
                      id="plan_name"
                      value={formData.plan_name}
                      onChange={(e) => handleChange('plan_name', e.target.value)}
                      placeholder="e.g., Post-Surgery Care Plan 2024"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="effective_date">Effective Date *</Label>
                    <Input
                      id="effective_date"
                      type="date"
                      value={formData.effective_date}
                      onChange={(e) => handleChange('effective_date', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="review_date">Review Date</Label>
                    <Input
                      id="review_date"
                      type="date"
                      value={formData.review_date}
                      onChange={(e) => handleChange('review_date', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="expiration_date">Expiration Date</Label>
                    <Input
                      id="expiration_date"
                      type="date"
                      value={formData.expiration_date}
                      onChange={(e) => handleChange('expiration_date', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="care_level">Care Level *</Label>
                    <Select 
                      value={formData.care_level} 
                      onValueChange={(value) => handleChange('care_level', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic Care</SelectItem>
                        <SelectItem value="moderate">Moderate Care</SelectItem>
                        <SelectItem value="intensive">Intensive Care</SelectItem>
                        <SelectItem value="skilled">Skilled Nursing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="hours_per_week">Authorized Hours/Week</Label>
                    <Input
                      id="hours_per_week"
                      type="number"
                      value={formData.hours_per_week}
                      onChange={(e) => handleChange('hours_per_week', parseInt(e.target.value) || 0)}
                      min="0"
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
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending_approval">Pending Approval</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="primary_diagnosis">Primary Diagnosis *</Label>
                  <Input
                    id="primary_diagnosis"
                    value={formData.primary_diagnosis}
                    onChange={(e) => handleChange('primary_diagnosis', e.target.value)}
                    placeholder="e.g., Type 2 Diabetes, Heart Failure"
                    required
                  />
                </div>

                <div>
                  <Label>Secondary Diagnoses</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      id="secondary_diagnosis_input"
                      placeholder="Add diagnosis and press Enter"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleArrayAdd('secondary_diagnoses', e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const input = document.getElementById('secondary_diagnosis_input');
                        handleArrayAdd('secondary_diagnoses', input.value);
                        input.value = '';
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.secondary_diagnoses?.map((diag, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1">
                        {diag}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => handleArrayRemove('secondary_diagnoses', idx)} 
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Goals */}
            {currentStep === 1 && (
              <GoalBuilder
                goals={formData.goals}
                onChange={(goals) => handleChange('goals', goals)}
              />
            )}

            {/* Step 2: Tasks */}
            {currentStep === 2 && (
              <TaskBuilder
                adlTasks={formData.adl_tasks}
                iadlTasks={formData.iadl_tasks}
                medicalTasks={formData.medical_tasks}
                onChangeADL={(tasks) => handleChange('adl_tasks', tasks)}
                onChangeIADL={(tasks) => handleChange('iadl_tasks', tasks)}
                onChangeMedical={(tasks) => handleChange('medical_tasks', tasks)}
              />
            )}

            {/* Step 3: Schedule */}
            {currentStep === 3 && (
              <ScheduleBuilder
                schedule={formData.schedule_pattern}
                onChange={(schedule) => handleChange('schedule_pattern', schedule)}
                hoursPerWeek={formData.hours_per_week}
              />
            )}

            {/* Step 4: Safety & Notes */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <Label>Safety Concerns</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      id="safety_input"
                      placeholder="Add safety concern and press Enter"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleArrayAdd('safety_concerns', e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const input = document.getElementById('safety_input');
                        handleArrayAdd('safety_concerns', input.value);
                        input.value = '';
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.safety_concerns?.map((concern, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1 bg-red-50 text-red-700">
                        <AlertTriangle className="w-3 h-3" />
                        {concern}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => handleArrayRemove('safety_concerns', idx)} 
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Care Restrictions</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      id="restrictions_input"
                      placeholder="Add restriction and press Enter"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleArrayAdd('restrictions', e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const input = document.getElementById('restrictions_input');
                        handleArrayAdd('restrictions', input.value);
                        input.value = '';
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.restrictions?.map((restriction, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1">
                        {restriction}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => handleArrayRemove('restrictions', idx)} 
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Equipment Needed</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      id="equipment_input"
                      placeholder="Add equipment and press Enter"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleArrayAdd('equipment_needed', e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const input = document.getElementById('equipment_input');
                        handleArrayAdd('equipment_needed', input.value);
                        input.value = '';
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.equipment_needed?.map((equip, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1">
                        {equip}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => handleArrayRemove('equipment_needed', idx)} 
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="emergency_procedures">Emergency Procedures</Label>
                  <Textarea
                    id="emergency_procedures"
                    value={formData.emergency_procedures}
                    onChange={(e) => handleChange('emergency_procedures', e.target.value)}
                    rows={4}
                    placeholder="Specific emergency protocols for this client..."
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows={4}
                    placeholder="Any additional information about the care plan..."
                  />
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="border-t flex justify-between sticky bottom-0 bg-white">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                if (currentStep > 0) {
                  setCurrentStep(currentStep - 1);
                } else {
                  onCancel();
                }
              }}
              disabled={isLoading}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {currentStep === 0 ? 'Cancel' : 'Previous'}
            </Button>
            
            {currentStep < steps.length - 1 ? (
              <Button 
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className="bg-gradient-to-r from-emerald-500 to-teal-600"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={isLoading || !canProceed()}
                className="bg-gradient-to-r from-emerald-500 to-teal-600"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Care Plan'}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}