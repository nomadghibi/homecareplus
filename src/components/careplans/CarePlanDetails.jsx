import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  X, 
  Edit2, 
  Copy,
  Calendar,
  User,
  Activity,
  Target,
  Clock,
  Shield,
  FileText,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { format, parseISO } from "date-fns";

export default function CarePlanDetails({ plan, client, onClose, onEdit, onDuplicate }) {
  const statusConfig = {
    draft: { color: "bg-slate-100 text-slate-700", label: "Draft" },
    active: { color: "bg-green-100 text-green-700", label: "Active" },
    pending_approval: { color: "bg-yellow-100 text-yellow-700", label: "Pending Approval" },
    completed: { color: "bg-blue-100 text-blue-700", label: "Completed" },
    expired: { color: "bg-red-100 text-red-700", label: "Expired" }
  };

  const careLevelConfig = {
    basic: { color: "bg-blue-100 text-blue-700", label: "Basic Care" },
    moderate: { color: "bg-orange-100 text-orange-700", label: "Moderate Care" },
    intensive: { color: "bg-red-100 text-red-700", label: "Intensive Care" },
    skilled: { color: "bg-purple-100 text-purple-700", label: "Skilled Nursing" }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{plan.plan_name}</CardTitle>
              <div className="flex gap-2 flex-wrap">
                <Badge className={statusConfig[plan.status]?.color}>
                  {statusConfig[plan.status]?.label}
                </Badge>
                <Badge className={careLevelConfig[plan.care_level]?.color}>
                  {careLevelConfig[plan.care_level]?.label}
                </Badge>
                {plan.hours_per_week && (
                  <Badge variant="outline">
                    {plan.hours_per_week} hrs/week
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => onDuplicate(plan)}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => onEdit(plan)}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <ScrollArea className="flex-1">
          <CardContent className="p-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="goals">Goals</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="safety">Safety</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-6">
                {/* Client Info */}
                {client && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Client Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-500">Name</p>
                        <p className="font-medium">{client.first_name} {client.last_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Date of Birth</p>
                        <p className="font-medium">
                          {client.date_of_birth ? format(parseISO(client.date_of_birth), 'MMM d, yyyy') : 'N/A'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Plan Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Plan Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Effective Date</p>
                      <p className="font-medium">
                        {plan.effective_date ? format(parseISO(plan.effective_date), 'MMM d, yyyy') : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Review Date</p>
                      <p className="font-medium">
                        {plan.review_date ? format(parseISO(plan.review_date), 'MMM d, yyyy') : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Expiration Date</p>
                      <p className="font-medium">
                        {plan.expiration_date ? format(parseISO(plan.expiration_date), 'MMM d, yyyy') : 'Not set'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Diagnoses */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Diagnoses
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Primary Diagnosis</p>
                      <p className="font-medium">{plan.primary_diagnosis || 'Not specified'}</p>
                    </div>
                    {plan.secondary_diagnoses && plan.secondary_diagnoses.length > 0 && (
                      <div>
                        <p className="text-sm text-slate-500 mb-2">Secondary Diagnoses</p>
                        <div className="flex flex-wrap gap-2">
                          {plan.secondary_diagnoses.map((diag, idx) => (
                            <Badge key={idx} variant="secondary">{diag}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Additional Notes */}
                {plan.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Additional Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 whitespace-pre-wrap">{plan.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Goals Tab */}
              <TabsContent value="goals" className="space-y-4 mt-6">
                {plan.goals && plan.goals.length > 0 ? (
                  plan.goals.map((goal, idx) => (
                    <Card key={idx}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Target className="w-5 h-5 text-emerald-600 mt-1" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 mb-2">Goal {idx + 1}</h4>
                            <p className="text-slate-700 mb-3">{goal.goal}</p>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {goal.target_date && (
                                <Badge variant="outline">
                                  Target: {format(parseISO(goal.target_date), 'MMM d, yyyy')}
                                </Badge>
                              )}
                              <Badge className={
                                goal.status === 'achieved' ? 'bg-green-100 text-green-700' :
                                goal.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                goal.status === 'not_achieved' ? 'bg-red-100 text-red-700' :
                                'bg-slate-100 text-slate-700'
                              }>
                                {goal.status?.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                            {goal.progress_notes && (
                              <p className="text-sm text-slate-600 mt-2">
                                <strong>Progress:</strong> {goal.progress_notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <Target className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                    <p>No goals defined</p>
                  </div>
                )}
              </TabsContent>

              {/* Tasks Tab */}
              <TabsContent value="tasks" className="space-y-6 mt-6">
                {/* ADL Tasks */}
                {plan.adl_tasks && plan.adl_tasks.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-600" />
                        ADL Tasks ({plan.adl_tasks.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {plan.adl_tasks.map((task, idx) => (
                        <div key={idx} className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-slate-900">{task.task}</h5>
                            <div className="flex gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {task.frequency?.replace(/_/g, ' ')}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {task.assistance_level?.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                          </div>
                          {task.special_instructions && (
                            <p className="text-sm text-slate-600">{task.special_instructions}</p>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* IADL Tasks */}
                {plan.iadl_tasks && plan.iadl_tasks.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-purple-600" />
                        IADL Tasks ({plan.iadl_tasks.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {plan.iadl_tasks.map((task, idx) => (
                        <div key={idx} className="p-3 bg-purple-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-slate-900">{task.task}</h5>
                            <div className="flex gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {task.frequency?.replace(/_/g, ' ')}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {task.assistance_level?.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                          </div>
                          {task.special_instructions && (
                            <p className="text-sm text-slate-600">{task.special_instructions}</p>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Medical Tasks */}
                {plan.medical_tasks && plan.medical_tasks.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-red-600" />
                        Medical Tasks ({plan.medical_tasks.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {plan.medical_tasks.map((task, idx) => (
                        <div key={idx} className="p-3 bg-red-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-slate-900">{task.task}</h5>
                            <Badge variant="secondary" className="text-xs">
                              {task.frequency?.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          {task.special_instructions && (
                            <p className="text-sm text-slate-600">{task.special_instructions}</p>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {(!plan.adl_tasks?.length && !plan.iadl_tasks?.length && !plan.medical_tasks?.length) && (
                  <div className="text-center py-12 text-slate-500">
                    <Activity className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                    <p>No tasks defined</p>
                  </div>
                )}
              </TabsContent>

              {/* Schedule Tab */}
              <TabsContent value="schedule" className="mt-6">
                {plan.schedule_pattern && Object.keys(plan.schedule_pattern).length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                      plan.schedule_pattern[day] && plan.schedule_pattern[day].length > 0 && (
                        <Card key={day}>
                          <CardHeader>
                            <CardTitle className="text-base capitalize">{day}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {plan.schedule_pattern[day].map((time, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                                  <Clock className="w-4 h-4 text-slate-400" />
                                  <span className="font-medium">{time}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <Clock className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                    <p>No schedule defined</p>
                  </div>
                )}
              </TabsContent>

              {/* Safety Tab */}
              <TabsContent value="safety" className="space-y-6 mt-6">
                {/* Safety Concerns */}
                {plan.safety_concerns && plan.safety_concerns.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        Safety Concerns
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {plan.safety_concerns.map((concern, idx) => (
                          <Badge key={idx} className="bg-red-50 text-red-700">
                            {concern}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Restrictions */}
                {plan.restrictions && plan.restrictions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Care Restrictions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {plan.restrictions.map((restriction, idx) => (
                          <Badge key={idx} variant="secondary">{restriction}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Equipment */}
                {plan.equipment_needed && plan.equipment_needed.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Equipment Needed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {plan.equipment_needed.map((equip, idx) => (
                          <Badge key={idx} variant="outline">{equip}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Emergency Procedures */}
                {plan.emergency_procedures && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Emergency Procedures</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 whitespace-pre-wrap">{plan.emergency_procedures}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}