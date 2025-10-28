import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, FileText, Activity, Clock, Target, CheckCircle2 } from "lucide-react";

const templates = [
  {
    id: 'post_surgery',
    name: 'Post-Surgery Recovery',
    care_level: 'intensive',
    description: 'Comprehensive care plan for clients recovering from surgery',
    hours_per_week: 35,
    goals: [
      { goal: 'Achieve pain management within acceptable levels', target_date: '', status: 'not_started', progress_notes: '' },
      { goal: 'Regain mobility and independence with transfers', target_date: '', status: 'not_started', progress_notes: '' },
      { goal: 'Prevent surgical site infection', target_date: '', status: 'not_started', progress_notes: '' }
    ],
    adl_tasks: [
      { task: 'Bathing/Showering', frequency: 'daily', assistance_level: 'moderate_assist', special_instructions: 'Avoid getting surgical site wet' },
      { task: 'Dressing', frequency: 'twice_daily', assistance_level: 'minimal_assist', special_instructions: '' },
      { task: 'Toileting', frequency: 'as_needed', assistance_level: 'minimal_assist', special_instructions: '' },
      { task: 'Transferring (bed/chair)', frequency: 'as_needed', assistance_level: 'moderate_assist', special_instructions: 'Use gait belt' }
    ],
    iadl_tasks: [
      { task: 'Meal preparation', frequency: 'three_times_daily', assistance_level: 'moderate_assist', special_instructions: 'Soft diet initially' },
      { task: 'Light housekeeping', frequency: 'daily', assistance_level: 'total_assist', special_instructions: '' }
    ],
    medical_tasks: [
      { task: 'Vital signs monitoring', frequency: 'twice_daily', special_instructions: 'Monitor for fever' },
      { task: 'Wound care', frequency: 'daily', special_instructions: 'Clean and dress surgical site per physician orders' },
      { task: 'Medication administration', frequency: 'as_needed', special_instructions: 'Pain medication as prescribed' }
    ],
    safety_concerns: ['Fall risk - post-operative weakness', 'Surgical site infection risk'],
    restrictions: ['No heavy lifting', 'Limit stairs'],
    equipment_needed: ['Gait belt', 'Walker', 'Shower chair']
  },
  {
    id: 'dementia_care',
    name: 'Dementia/Alzheimer\'s Care',
    care_level: 'moderate',
    description: 'Supportive care for clients with cognitive impairment',
    hours_per_week: 28,
    goals: [
      { goal: 'Maintain current cognitive function', target_date: '', status: 'not_started', progress_notes: '' },
      { goal: 'Ensure safety and prevent wandering', target_date: '', status: 'not_started', progress_notes: '' },
      { goal: 'Maintain social engagement', target_date: '', status: 'not_started', progress_notes: '' }
    ],
    adl_tasks: [
      { task: 'Bathing/Showering', frequency: 'daily', assistance_level: 'moderate_assist', special_instructions: 'Use simple instructions' },
      { task: 'Dressing', frequency: 'twice_daily', assistance_level: 'moderate_assist', special_instructions: 'Lay out clothes in order' },
      { task: 'Grooming', frequency: 'daily', assistance_level: 'supervision', special_instructions: 'Verbal cues' },
      { task: 'Feeding/Eating', frequency: 'three_times_daily', assistance_level: 'supervision', special_instructions: 'Cut food into small pieces' }
    ],
    iadl_tasks: [
      { task: 'Meal preparation', frequency: 'three_times_daily', assistance_level: 'total_assist', special_instructions: '' },
      { task: 'Medication reminders', frequency: 'as_needed', assistance_level: 'total_assist', special_instructions: '' },
      { task: 'Companionship', frequency: 'daily', assistance_level: 'total_assist', special_instructions: 'Engage in familiar activities' }
    ],
    medical_tasks: [],
    safety_concerns: ['Wandering risk', 'Confusion/disorientation', 'Medication non-compliance'],
    restrictions: ['No unsupervised cooking', 'No driving'],
    equipment_needed: ['Door alarms', 'ID bracelet']
  },
  {
    id: 'diabetes_management',
    name: 'Diabetes Management',
    care_level: 'moderate',
    description: 'Care plan focused on diabetes control and monitoring',
    hours_per_week: 21,
    goals: [
      { goal: 'Maintain blood glucose within target range', target_date: '', status: 'not_started', progress_notes: '' },
      { goal: 'Prevent diabetes complications', target_date: '', status: 'not_started', progress_notes: '' },
      { goal: 'Improve medication adherence to 100%', target_date: '', status: 'not_started', progress_notes: '' }
    ],
    adl_tasks: [
      { task: 'Bathing/Showering', frequency: 'daily', assistance_level: 'supervision', special_instructions: 'Check feet for wounds' },
      { task: 'Grooming', frequency: 'daily', assistance_level: 'supervision', special_instructions: 'Proper foot care' }
    ],
    iadl_tasks: [
      { task: 'Meal preparation', frequency: 'three_times_daily', assistance_level: 'moderate_assist', special_instructions: 'Diabetic diet - carb counting' },
      { task: 'Shopping', frequency: 'weekly', assistance_level: 'total_assist', special_instructions: 'Purchase diabetic-friendly foods' }
    ],
    medical_tasks: [
      { task: 'Blood glucose monitoring', frequency: 'three_times_daily', special_instructions: 'Before meals and bedtime' },
      { task: 'Medication administration', frequency: 'daily', special_instructions: 'Insulin as prescribed' },
      { task: 'Vital signs monitoring', frequency: 'daily', special_instructions: 'Blood pressure monitoring' }
    ],
    safety_concerns: ['Hypoglycemia risk', 'Foot wound risk'],
    restrictions: ['Strict diabetic diet'],
    equipment_needed: ['Glucometer', 'Test strips', 'Insulin supplies']
  },
  {
    id: 'companionship',
    name: 'Companionship & Light Assistance',
    care_level: 'basic',
    description: 'Basic support for independent seniors',
    hours_per_week: 15,
    goals: [
      { goal: 'Reduce social isolation', target_date: '', status: 'not_started', progress_notes: '' },
      { goal: 'Maintain independence', target_date: '', status: 'not_started', progress_notes: '' },
      { goal: 'Ensure medication compliance', target_date: '', status: 'not_started', progress_notes: '' }
    ],
    adl_tasks: [
      { task: 'Grooming', frequency: 'daily', assistance_level: 'supervision', special_instructions: '' }
    ],
    iadl_tasks: [
      { task: 'Light housekeeping', frequency: 'twice_weekly', assistance_level: 'total_assist', special_instructions: '' },
      { task: 'Meal preparation', frequency: 'daily', assistance_level: 'minimal_assist', special_instructions: '' },
      { task: 'Shopping', frequency: 'weekly', assistance_level: 'total_assist', special_instructions: '' },
      { task: 'Transportation', frequency: 'as_needed', assistance_level: 'total_assist', special_instructions: 'Medical appointments' },
      { task: 'Companionship', frequency: 'daily', assistance_level: 'total_assist', special_instructions: 'Social activities, games, conversation' },
      { task: 'Medication reminders', frequency: 'daily', assistance_level: 'supervision', special_instructions: '' }
    ],
    medical_tasks: [],
    safety_concerns: [],
    restrictions: [],
    equipment_needed: []
  }
];

export default function CarePlanTemplates({ clients, onUseTemplate, onClose }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedClient, setSelectedClient] = useState("");

  const handleUseTemplate = () => {
    if (!selectedTemplate || !selectedClient) return;

    const template = templates.find(t => t.id === selectedTemplate);
    const today = new Date().toISOString().split('T')[0];
    
    const templateData = {
      client_id: selectedClient,
      plan_name: `${template.name} - ${new Date().getFullYear()}`,
      status: 'draft',
      effective_date: today,
      review_date: '',
      expiration_date: '',
      primary_diagnosis: '',
      secondary_diagnoses: [],
      care_level: template.care_level,
      hours_per_week: template.hours_per_week,
      goals: template.goals,
      adl_tasks: template.adl_tasks,
      iadl_tasks: template.iadl_tasks,
      medical_tasks: template.medical_tasks,
      schedule_pattern: {},
      preferred_caregivers: [],
      restrictions: template.restrictions,
      safety_concerns: template.safety_concerns,
      emergency_procedures: '',
      communication_preferences: {},
      equipment_needed: template.equipment_needed,
      notes: ''
    };

    onUseTemplate(template, templateData);
  };

  const currentTemplate = templates.find(t => t.id === selectedTemplate);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Care Plan Templates</CardTitle>
              <p className="text-slate-500 mt-1">Start with a pre-built template and customize</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <div className="flex-1 overflow-hidden flex">
          {/* Template List */}
          <div className="w-1/3 border-r">
            <ScrollArea className="h-full p-6">
              <div className="space-y-3">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all ${
                      selectedTemplate === template.id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'hover:border-emerald-300'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 mb-1">{template.name}</h3>
                          <p className="text-sm text-slate-600 mb-2">{template.description}</p>
                          <div className="flex gap-2">
                            <Badge className={
                              template.care_level === 'basic' ? 'bg-blue-100 text-blue-700' :
                              template.care_level === 'moderate' ? 'bg-orange-100 text-orange-700' :
                              template.care_level === 'intensive' ? 'bg-red-100 text-red-700' :
                              'bg-purple-100 text-purple-700'
                            }>
                              {template.care_level}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {template.hours_per_week} hrs/wk
                            </Badge>
                          </div>
                        </div>
                        {selectedTemplate === template.id && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Template Preview */}
          <div className="flex-1 flex flex-col">
            {currentTemplate ? (
              <>
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">{currentTemplate.name}</h2>
                      <p className="text-slate-600">{currentTemplate.description}</p>
                    </div>

                    {/* Goals */}
                    {currentTemplate.goals.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Target className="w-5 h-5 text-emerald-600" />
                            Goals ({currentTemplate.goals.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {currentTemplate.goals.map((goal, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                <span className="text-slate-700">{goal.goal}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {/* Tasks Summary */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Activity className="w-5 h-5 text-blue-600" />
                          Care Tasks
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {currentTemplate.adl_tasks.length > 0 && (
                          <div>
                            <h4 className="font-medium text-slate-900 mb-2">ADL Tasks ({currentTemplate.adl_tasks.length})</h4>
                            <div className="flex flex-wrap gap-2">
                              {currentTemplate.adl_tasks.map((task, idx) => (
                                <Badge key={idx} variant="secondary">{task.task}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {currentTemplate.iadl_tasks.length > 0 && (
                          <div>
                            <h4 className="font-medium text-slate-900 mb-2">IADL Tasks ({currentTemplate.iadl_tasks.length})</h4>
                            <div className="flex flex-wrap gap-2">
                              {currentTemplate.iadl_tasks.map((task, idx) => (
                                <Badge key={idx} variant="secondary" className="bg-purple-100 text-purple-700">
                                  {task.task}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {currentTemplate.medical_tasks.length > 0 && (
                          <div>
                            <h4 className="font-medium text-slate-900 mb-2">Medical Tasks ({currentTemplate.medical_tasks.length})</h4>
                            <div className="flex flex-wrap gap-2">
                              {currentTemplate.medical_tasks.map((task, idx) => (
                                <Badge key={idx} variant="secondary" className="bg-red-100 text-red-700">
                                  {task.task}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Safety & Equipment */}
                    {(currentTemplate.safety_concerns.length > 0 || currentTemplate.equipment_needed.length > 0) && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Safety & Equipment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {currentTemplate.safety_concerns.length > 0 && (
                            <div>
                              <h4 className="font-medium text-slate-900 mb-2">Safety Concerns</h4>
                              <div className="flex flex-wrap gap-2">
                                {currentTemplate.safety_concerns.map((concern, idx) => (
                                  <Badge key={idx} className="bg-red-50 text-red-700">{concern}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {currentTemplate.equipment_needed.length > 0 && (
                            <div>
                              <h4 className="font-medium text-slate-900 mb-2">Equipment Needed</h4>
                              <div className="flex flex-wrap gap-2">
                                {currentTemplate.equipment_needed.map((equip, idx) => (
                                  <Badge key={idx} variant="outline">{equip}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </ScrollArea>

                <div className="border-t p-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-900 mb-2 block">
                      Select Client *
                    </label>
                    <Select value={selectedClient} onValueChange={setSelectedClient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose client for this care plan" />
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
                  <Button
                    onClick={handleUseTemplate}
                    disabled={!selectedClient}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Use This Template
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p>Select a template to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}