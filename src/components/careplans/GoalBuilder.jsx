import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Target, CheckCircle2, Clock, XCircle } from "lucide-react";

const goalTemplates = [
  "Improve mobility and independence with transfers",
  "Maintain current level of functioning",
  "Increase social engagement and reduce isolation",
  "Improve medication adherence to 100%",
  "Maintain skin integrity with no pressure ulcers",
  "Improve nutritional intake and hydration",
  "Manage chronic pain effectively",
  "Reduce fall risk through safety interventions"
];

export default function GoalBuilder({ goals, onChange }) {
  const [newGoal, setNewGoal] = useState({
    goal: "",
    target_date: "",
    status: "not_started",
    progress_notes: ""
  });

  const handleAddGoal = () => {
    if (newGoal.goal.trim()) {
      onChange([...goals, { ...newGoal }]);
      setNewGoal({ goal: "", target_date: "", status: "not_started", progress_notes: "" });
    }
  };

  const handleQuickAdd = (goalText) => {
    onChange([...goals, {
      goal: goalText,
      target_date: "",
      status: "not_started",
      progress_notes: ""
    }]);
  };

  const handleRemoveGoal = (index) => {
    onChange(goals.filter((_, i) => i !== index));
  };

  const handleUpdateGoal = (index, field, value) => {
    const updated = [...goals];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const statusConfig = {
    not_started: { icon: Clock, color: "bg-slate-100 text-slate-700", label: "Not Started" },
    in_progress: { icon: Target, color: "bg-blue-100 text-blue-700", label: "In Progress" },
    achieved: { icon: CheckCircle2, color: "bg-green-100 text-green-700", label: "Achieved" },
    not_achieved: { icon: XCircle, color: "bg-red-100 text-red-700", label: "Not Achieved" }
  };

  return (
    <div className="space-y-6">
      {/* Quick Add Goal Templates */}
      <div>
        <Label className="mb-2 block">Quick Add Common Goals:</Label>
        <div className="grid md:grid-cols-2 gap-2">
          {goalTemplates.map((goal, idx) => (
            <Button
              key={idx}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickAdd(goal)}
              className="text-left justify-start h-auto py-3"
            >
              <Plus className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="text-sm">{goal}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Goal Input */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <Label>Goal Description</Label>
              <Textarea
                value={newGoal.goal}
                onChange={(e) => setNewGoal({ ...newGoal, goal: e.target.value })}
                placeholder="Enter a custom SMART goal..."
                rows={2}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label>Target Date</Label>
                <Input
                  type="date"
                  value={newGoal.target_date}
                  onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={handleAddGoal}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom Goal
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals List */}
      <div className="space-y-3">
        {goals.length === 0 ? (
          <div className="text-center py-12 text-slate-500 border-2 border-dashed rounded-lg">
            <Target className="w-16 h-16 mx-auto mb-3 text-slate-300" />
            <p className="text-lg font-medium mb-1">No goals defined yet</p>
            <p className="text-sm">Use quick add templates or create custom SMART goals above</p>
          </div>
        ) : (
          goals.map((goal, idx) => {
            const StatusIcon = statusConfig[goal.status].icon;
            const statusStyle = statusConfig[goal.status].color;

            return (
              <Card key={idx} className="border-l-4 border-l-emerald-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-emerald-600" />
                        <h4 className="font-semibold text-slate-900">Goal {idx + 1}</h4>
                      </div>
                      <p className="text-slate-700">{goal.goal}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveGoal(idx)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <Label className="text-xs">Target Date</Label>
                      <Input
                        type="date"
                        value={goal.target_date}
                        onChange={(e) => handleUpdateGoal(idx, 'target_date', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Status</Label>
                      <Select 
                        value={goal.status} 
                        onValueChange={(value) => handleUpdateGoal(idx, 'status', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusConfig).map(([key, config]) => {
                            const Icon = config.icon;
                            return (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <Icon className="w-4 h-4" />
                                  {config.label}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Progress Notes</Label>
                    <Textarea
                      value={goal.progress_notes || ""}
                      onChange={(e) => handleUpdateGoal(idx, 'progress_notes', e.target.value)}
                      placeholder="Document progress towards this goal..."
                      rows={2}
                      className="mt-1 text-sm"
                    />
                  </div>

                  <Badge className={`${statusStyle} mt-2`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig[goal.status].label}
                  </Badge>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}