import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Clock } from "lucide-react";

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayLabels = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun'
};

export default function ScheduleBuilder({ schedule, onChange, hoursPerWeek }) {
  const handleAddTime = (day, time) => {
    if (!time) return;
    const updated = { ...schedule };
    if (!updated[day]) updated[day] = [];
    if (!updated[day].includes(time)) {
      updated[day] = [...updated[day], time].sort();
      onChange(updated);
    }
  };

  const handleRemoveTime = (day, timeToRemove) => {
    const updated = { ...schedule };
    updated[day] = updated[day].filter(time => time !== timeToRemove);
    onChange(updated);
  };

  const handleQuickTemplate = (template) => {
    let newSchedule = {};
    
    if (template === 'weekdays_morning') {
      ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
        newSchedule[day] = ['08:00-12:00'];
      });
    } else if (template === 'weekdays_afternoon') {
      ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
        newSchedule[day] = ['13:00-17:00'];
      });
    } else if (template === 'daily_morning') {
      days.forEach(day => {
        newSchedule[day] = ['08:00-12:00'];
      });
    } else if (template === 'mwf') {
      ['monday', 'wednesday', 'friday'].forEach(day => {
        newSchedule[day] = ['09:00-13:00'];
      });
    } else if (template === 'tth') {
      ['tuesday', 'thursday'].forEach(day => {
        newSchedule[day] = ['09:00-13:00'];
      });
    }
    
    onChange(newSchedule);
  };

  const totalHoursScheduled = Object.values(schedule).reduce((total, times) => {
    return total + (times?.length || 0) * 4; // Assuming 4-hour shifts
  }, 0);

  return (
    <div className="space-y-6">
      {/* Quick Templates */}
      <div>
        <Label className="mb-2 block">Quick Schedule Templates:</Label>
        <div className="grid md:grid-cols-3 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleQuickTemplate('weekdays_morning')}
          >
            Weekdays 8AM-12PM
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleQuickTemplate('weekdays_afternoon')}
          >
            Weekdays 1PM-5PM
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleQuickTemplate('daily_morning')}
          >
            Daily 8AM-12PM
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleQuickTemplate('mwf')}
          >
            Mon/Wed/Fri 9AM-1PM
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleQuickTemplate('tth')}
          >
            Tue/Thu 9AM-1PM
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onChange({})}
            className="text-red-600 hover:text-red-700"
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Hours Summary */}
      {hoursPerWeek > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  {totalHoursScheduled} hours scheduled
                </span>
              </div>
              <Badge className={`${
                totalHoursScheduled === hoursPerWeek 
                  ? 'bg-green-100 text-green-700' 
                  : totalHoursScheduled > hoursPerWeek
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {hoursPerWeek} hrs/week authorized
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Schedule Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {days.map(day => (
          <Card key={day} className="border-l-4 border-l-emerald-500">
            <CardContent className="p-4">
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                {dayLabels[day]}
              </h4>
              
              <div className="space-y-2">
                {schedule[day]?.map((time, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span className="text-sm font-medium">{time}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveTime(day, time)}
                      className="h-6 w-6"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-3">
                <Input
                  type="text"
                  placeholder="e.g., 08:00-12:00"
                  id={`time-input-${day}`}
                  className="text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTime(day, e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    const input = document.getElementById(`time-input-${day}`);
                    handleAddTime(day, input.value);
                    input.value = '';
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}