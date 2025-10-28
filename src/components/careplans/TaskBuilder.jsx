import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Activity, Home, Heart } from "lucide-react";

const commonADLs = [
  "Bathing/Showering",
  "Dressing",
  "Toileting",
  "Transferring (bed/chair)",
  "Continence management",
  "Feeding/Eating",
  "Grooming",
  "Oral hygiene",
  "Walking/Mobility"
];

const commonIADLs = [
  "Light housekeeping",
  "Meal preparation",
  "Laundry",
  "Shopping",
  "Transportation",
  "Medication reminders",
  "Phone usage",
  "Money management",
  "Companionship"
];

const commonMedicalTasks = [
  "Vital signs monitoring",
  "Blood glucose monitoring",
  "Medication administration",
  "Wound care",
  "Catheter care",
  "Ostomy care",
  "Oxygen administration",
  "Range of motion exercises",
  "Transfer assistance"
];

export default function TaskBuilder({ adlTasks, iadlTasks, medicalTasks, onChangeADL, onChangeIADL, onChangeMedical }) {
  const [newTask, setNewTask] = useState({ task: "", frequency: "daily", assistance_level: "minimal_assist", special_instructions: "" });

  const handleAddTask = (type, commonTasks, currentTasks, onChange) => {
    if (newTask.task.trim()) {
      onChange([...currentTasks, { ...newTask }]);
      setNewTask({ task: "", frequency: "daily", assistance_level: "minimal_assist", special_instructions: "" });
    }
  };

  const handleQuickAdd = (taskName, type, currentTasks, onChange) => {
    onChange([...currentTasks, {
      task: taskName,
      frequency: "daily",
      assistance_level: "minimal_assist",
      special_instructions: ""
    }]);
  };

  const handleRemoveTask = (index, currentTasks, onChange) => {
    onChange(currentTasks.filter((_, i) => i !== index));
  };

  const handleUpdateTask = (index, field, value, currentTasks, onChange) => {
    const updated = [...currentTasks];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const renderTaskList = (tasks, onChange, commonTasks, type, IconComponent, color) => (
    <div className="space-y-4">
      {/* Quick Add Buttons */}
      <div>
        <Label className="mb-2 block">Quick Add Common Tasks:</Label>
        <div className="flex flex-wrap gap-2">
          {commonTasks.map((task, idx) => (
            <Button
              key={idx}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickAdd(task, type, tasks, onChange)}
              className="text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              {task}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Task Input */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label>Task Name</Label>
              <Input
                value={newTask.task}
                onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
                placeholder="Enter custom task..."
              />
            </div>
            <div>
              <Label>Frequency</Label>
              <Select 
                value={newTask.frequency} 
                onValueChange={(value) => setNewTask({ ...newTask, frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="twice_daily">Twice Daily</SelectItem>
                  <SelectItem value="three_times_daily">3x Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="as_needed">As Needed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Assistance Level</Label>
              <Select 
                value={newTask.assistance_level} 
                onValueChange={(value) => setNewTask({ ...newTask, assistance_level: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="independent">Independent</SelectItem>
                  <SelectItem value="supervision">Supervision</SelectItem>
                  <SelectItem value="minimal_assist">Minimal Assist</SelectItem>
                  <SelectItem value="moderate_assist">Moderate Assist</SelectItem>
                  <SelectItem value="maximal_assist">Maximal Assist</SelectItem>
                  <SelectItem value="total_assist">Total Assist</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                onClick={() => handleAddTask(type, commonTasks, tasks, onChange)}
                className={`w-full ${color}`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Task
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-slate-500 border-2 border-dashed rounded-lg">
            <IconComponent className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p>No tasks added yet. Use quick add or create custom tasks above.</p>
          </div>
        ) : (
          tasks.map((task, idx) => (
            <Card key={idx} className="border-l-4" style={{ borderLeftColor: color.split('-')[1] }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{task.task}</h4>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{task.frequency.replace(/_/g, ' ')}</Badge>
                      <Badge variant="outline" className="text-xs">{task.assistance_level.replace(/_/g, ' ')}</Badge>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveTask(idx, tasks, onChange)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <Textarea
                  value={task.special_instructions || ""}
                  onChange={(e) => handleUpdateTask(idx, 'special_instructions', e.target.value, tasks, onChange)}
                  placeholder="Special instructions or notes..."
                  rows={2}
                  className="text-sm"
                />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  return (
    <Tabs defaultValue="adl" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="adl" className="flex items-center gap-2">
          <Activity className="w-4 h-4" />
          ADLs ({adlTasks.length})
        </TabsTrigger>
        <TabsTrigger value="iadl" className="flex items-center gap-2">
          <Home className="w-4 h-4" />
          IADLs ({iadlTasks.length})
        </TabsTrigger>
        <TabsTrigger value="medical" className="flex items-center gap-2">
          <Heart className="w-4 h-4" />
          Medical ({medicalTasks.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="adl" className="mt-6">
        {renderTaskList(adlTasks, onChangeADL, commonADLs, 'adl', Activity, 'bg-gradient-to-r from-blue-500 to-blue-600')}
      </TabsContent>

      <TabsContent value="iadl" className="mt-6">
        {renderTaskList(iadlTasks, onChangeIADL, commonIADLs, 'iadl', Home, 'bg-gradient-to-r from-purple-500 to-purple-600')}
      </TabsContent>

      <TabsContent value="medical" className="mt-6">
        {renderTaskList(medicalTasks, onChangeMedical, commonMedicalTasks, 'medical', Heart, 'bg-gradient-to-r from-red-500 to-red-600')}
      </TabsContent>
    </Tabs>
  );
}