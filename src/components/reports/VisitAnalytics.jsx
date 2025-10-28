import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

export default function VisitAnalytics({ visits, clients, caregivers, detailed = false }) {
  // Visit status distribution
  const statusData = [
    { name: 'Completed', value: visits.filter(v => v.status === 'completed').length, color: '#10b981' },
    { name: 'Scheduled', value: visits.filter(v => v.status === 'scheduled').length, color: '#3b82f6' },
    { name: 'In Progress', value: visits.filter(v => v.status === 'in_progress').length, color: '#f59e0b' },
    { name: 'Cancelled', value: visits.filter(v => v.status === 'cancelled').length, color: '#ef4444' },
    { name: 'Missed', value: visits.filter(v => v.status === 'missed').length, color: '#8b5cf6' },
  ].filter(item => item.value > 0);

  // Visit type distribution
  const typeData = visits.reduce((acc, visit) => {
    const type = visit.visit_type || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const visitTypeData = Object.entries(typeData).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value
  }));

  // Daily visit pattern (last 7 days)
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const dailyPattern = weekDays.map(day => {
    const dayVisits = visits.filter(v => {
      const visitDate = new Date(v.scheduled_date);
      return format(visitDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
    });

    return {
      day: format(day, 'EEE'),
      total: dayVisits.length,
      completed: dayVisits.filter(v => v.status === 'completed').length,
      cancelled: dayVisits.filter(v => v.status === 'cancelled').length
    };
  });

  // Calculate metrics
  const totalVisits = visits.length;
  const completedVisits = visits.filter(v => v.status === 'completed').length;
  const completionRate = totalVisits > 0 ? (completedVisits / totalVisits) * 100 : 0;
  const cancelledVisits = visits.filter(v => v.status === 'cancelled').length;
  const cancellationRate = totalVisits > 0 ? (cancelledVisits / totalVisits) * 100 : 0;
  const avgVisitsPerDay = totalVisits / 30; // Assuming 30-day period

  // Top performing caregivers
  const caregiverStats = caregivers.map(caregiver => {
    const caregiverVisits = visits.filter(v => v.caregiver_id === caregiver.id);
    const completed = caregiverVisits.filter(v => v.status === 'completed').length;
    const total = caregiverVisits.length;
    const rate = total > 0 ? (completed / total) * 100 : 0;

    return {
      id: caregiver.id,
      name: `${caregiver.first_name} ${caregiver.last_name}`,
      total,
      completed,
      rate
    };
  }).filter(c => c.total > 0).sort((a, b) => b.rate - a.rate).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-none shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Total Visits</span>
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{totalVisits}</div>
            <div className="text-xs text-slate-500 mt-1">{avgVisitsPerDay.toFixed(1)} per day avg</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Completion Rate</span>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">{completionRate.toFixed(1)}%</div>
            <div className="text-xs text-slate-500 mt-1">{completedVisits} completed</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Cancellation Rate</span>
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600">{cancellationRate.toFixed(1)}%</div>
            <div className="text-xs text-slate-500 mt-1">{cancelledVisits} cancelled</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">EVV Match Rate</span>
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-bold text-teal-600">
              {visits.filter(v => v.evv_verified).length > 0 
                ? ((visits.filter(v => v.evv_verified).length / completedVisits) * 100).toFixed(1)
                : 0
              }%
            </div>
            <div className="text-xs text-slate-500 mt-1">{visits.filter(v => v.evv_verified).length} verified</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Visit Status Distribution */}
        <Card className="border-none shadow-lg">
          <CardHeader className="border-b">
            <CardTitle>Visit Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Pattern */}
        <Card className="border-none shadow-lg">
          <CardHeader className="border-b">
            <CardTitle>Weekly Visit Pattern</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyPattern}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
                <Bar dataKey="cancelled" fill="#ef4444" name="Cancelled" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {detailed && (
        <>
          {/* Visit Type Distribution */}
          <Card className="border-none shadow-lg">
            <CardHeader className="border-b">
              <CardTitle>Visit Type Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={visitTypeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" name="Visits" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Performing Caregivers */}
          <Card className="border-none shadow-lg">
            <CardHeader className="border-b">
              <CardTitle>Top Performing Caregivers</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-700">Caregiver</th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-700">Total Visits</th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-700">Completed</th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-700">Completion Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {caregiverStats.map((caregiver, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-4 font-medium text-slate-900">{caregiver.name}</td>
                        <td className="p-4 text-right text-slate-600">{caregiver.total}</td>
                        <td className="p-4 text-right font-semibold text-green-600">{caregiver.completed}</td>
                        <td className="p-4 text-right">
                          <Badge className={`${
                            caregiver.rate >= 95 ? 'bg-green-100 text-green-700' :
                            caregiver.rate >= 85 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {caregiver.rate.toFixed(1)}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}