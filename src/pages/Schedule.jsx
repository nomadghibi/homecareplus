
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Users,
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import VisitForm from "../components/schedule/VisitForm";
import ScheduleCalendar from "../components/schedule/ScheduleCalendar";
import { withResourceLimitCheck } from "@/utils/resourceLimits";

export default function Schedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("week"); // week, day
  const [showForm, setShowForm] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const queryClient = useQueryClient();

  const { data: visits = [] } = useQuery({
    queryKey: ['visits'],
    queryFn: () => base44.entities.Visit.list('-scheduled_date'),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
  });

  const { data: caregivers = [] } = useQuery({
    queryKey: ['caregivers'],
    queryFn: () => base44.entities.Caregiver.filter({ status: 'active' }),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      // Check resource limits before creating visit
      return await withResourceLimitCheck('visits', async () => {
        return await base44.entities.Visit.create(data);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['visits']);
      setShowForm(false);
      setSelectedVisit(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Visit.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['visits']);
      setShowForm(false);
      setSelectedVisit(null);
    },
  });

  const handleSubmit = (data) => {
    if (selectedVisit) {
      updateMutation.mutate({ id: selectedVisit.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = [...Array(7)].map((_, i) => addDays(weekStart, i));

  const filteredVisits = visits.filter(visit => {
    if (view === "day") {
      return isSameDay(new Date(visit.scheduled_date), currentDate);
    } else {
      const visitDate = new Date(visit.scheduled_date);
      // Ensure visitDate is within the current week, including the start and end days
      return visitDate >= weekDays[0] && visitDate <= addDays(weekDays[6], 1); // Add 1 day to weekDays[6] to include the whole last day
    }
  });

  const statusCounts = {
    scheduled: visits.filter(v => v.status === 'scheduled').length,
    completed: visits.filter(v => v.status === 'completed').length,
    cancelled: visits.filter(v => v.status === 'cancelled').length,
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-teal-600 rounded-xl flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <span className="hidden sm:inline">Schedule Management</span>
            <span className="sm:hidden">Schedule</span>
          </h1>
          <p className="text-slate-500 mt-1 text-sm lg:text-base">
            {filteredVisits.length} visit{filteredVisits.length !== 1 ? 's' : ''} in current view
          </p>
        </div>
        <Button 
          onClick={() => {
            setSelectedVisit(null);
            setShowForm(true);
          }}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-teal-600 hover:from-blue-600 hover:to-teal-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Schedule Visit
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">{statusCounts.scheduled}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Completed</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.completed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.cancelled}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Controls */}
      <Card className="border-none shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(addDays(currentDate, view === "week" ? -7 : -1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(addDays(currentDate, view === "week" ? 7 : 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <div className="ml-2 lg:ml-4">
                <h3 className="font-semibold text-base lg:text-lg">
                  {view === "week" 
                    ? `${format(weekDays[0], 'MMM d')} - ${format(weekDays[6], 'MMM d, yyyy')}`
                    : format(currentDate, 'MMMM d, yyyy')
                  }
                </h3>
              </div>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant={view === "day" ? "default" : "outline"}
                onClick={() => setView("day")}
                className={`flex-1 sm:flex-initial ${view === "day" ? "bg-gradient-to-r from-blue-500 to-teal-600" : ""}`}
              >
                Day
              </Button>
              <Button
                variant={view === "week" ? "default" : "outline"}
                onClick={() => setView("week")}
                className={`flex-1 sm:flex-initial ${view === "week" ? "bg-gradient-to-r from-blue-500 to-teal-600" : ""}`}
              >
                Week
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      <ScheduleCalendar
        view={view}
        currentDate={currentDate}
        weekDays={weekDays}
        visits={filteredVisits}
        clients={clients}
        caregivers={caregivers}
        onVisitClick={(visit) => {
          setSelectedVisit(visit);
          setShowForm(true);
        }}
      />

      {/* Visit Form */}
      {showForm && (
        <VisitForm
          visit={selectedVisit}
          clients={clients}
          caregivers={caregivers}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setSelectedVisit(null);
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}
