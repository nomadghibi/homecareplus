import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  TrendingUp,
  TrendingDown,
  Users,
  UserCheck,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Activity,
  Bell,
  Plus,
  ArrowRight,
  Sparkles,
  Heart,
  FileText,
  BarChart3,
  Pill,
  Sun,
  Moon,
  Cloud
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import RecentVisits from "../components/dashboard/RecentVisits";
import UpcomingShifts from "../components/dashboard/UpcomingShifts";
import EVVStatusChart from "../components/dashboard/EVVStatusChart";
import BillingOverview from "../components/dashboard/BillingOverview";

export default function Dashboard() {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("");
  const [timeIcon, setTimeIcon] = useState(Sun);

  // Get current user
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await base44.auth.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    };
    fetchUser();
  }, []);

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good Morning");
      setTimeIcon(Sun);
    } else if (hour < 18) {
      setGreeting("Good Afternoon");
      setTimeIcon(Cloud);
    } else {
      setGreeting("Good Evening");
      setTimeIcon(Moon);
    }
  }, []);

  // Fetch data
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
  });

  const { data: caregivers = [] } = useQuery({
    queryKey: ['caregivers'],
    queryFn: () => base44.entities.Caregiver.list(),
  });

  const { data: visits = [] } = useQuery({
    queryKey: ['visits'],
    queryFn: () => base44.entities.Visit.list({ sort: '-scheduled_start' }),
  });

  const { data: evvEvents = [] } = useQuery({
    queryKey: ['evvEvents'],
    queryFn: () => base44.entities.EVVEvent.list(),
  });

  const { data: claims = [] } = useQuery({
    queryKey: ['claims'],
    queryFn: () => base44.entities.Claim.list(),
  });

  const { data: medications = [] } = useQuery({
    queryKey: ['medications'],
    queryFn: () => base44.entities.MedicationSchedule.list(),
  });

  // Calculate KPIs
  const activeClients = clients.filter(c => c.status === 'active').length;
  const activeCaregivers = caregivers.filter(c => c.status === 'active').length;

  const today = new Date().toISOString().split('T')[0];
  const todayVisits = visits.filter(v => {
    if (v.scheduled_start) {
      return v.scheduled_start.startsWith(today);
    }
    return v.scheduled_date === today;
  });

  const completedToday = todayVisits.filter(v => v.status === 'completed').length;
  const scheduledToday = todayVisits.filter(v => v.status === 'scheduled').length;
  const fillRate = todayVisits.length > 0 ? (completedToday / todayVisits.length) * 100 : 100;

  const evvVerified = evvEvents.filter(e => e.status === 'verified').length;
  const evvMatchRate = evvEvents.length > 0 ? (evvVerified / evvEvents.length) * 100 : 100;

  const pendingClaims = claims.filter(c => ['draft', 'submitted', 'pending'].includes(c.status)).length;
  const paidClaims = claims.filter(c => c.status === 'paid').length;
  const totalBilled = claims.reduce((sum, c) => sum + (c.total_amount || 0), 0);
  const totalPaid = claims.reduce((sum, c) => sum + (c.paid_amount || 0), 0);

  const activeMedications = medications.filter(m => m.status === 'active').length;

  const upcomingVisits = visits
    .filter(v => v.status === 'scheduled')
    .slice(0, 5);

  const recentVisits = visits.slice(0, 6);

  // Quick actions
  const quickActions = [
    {
      label: "Schedule Visit",
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
      path: "Schedule"
    },
    {
      label: "Add Client",
      icon: Users,
      color: "from-teal-500 to-teal-600",
      path: "Clients"
    },
    {
      label: "Add Caregiver",
      icon: UserCheck,
      color: "from-purple-500 to-purple-600",
      path: "Caregivers"
    },
    {
      label: "Create Claim",
      icon: DollarSign,
      color: "from-green-500 to-green-600",
      path: "Billing"
    }
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl p-6 lg:p-8 text-white shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              {React.createElement(timeIcon, { className: "w-8 h-8" })}
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold">{greeting}!</h1>
              <p className="text-blue-100 mt-1">
                {currentUser?.name || "Welcome back"} • {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm">
              <Activity className="w-4 h-4 mr-2" />
              {todayVisits.length} visits today
            </Badge>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Clients Card */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-500/10 to-teal-600/10 rounded-full -mr-16 -mt-16" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Active Clients</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-end gap-2">
                <p className="text-4xl font-bold text-slate-900">{activeClients}</p>
                <Badge variant="secondary" className="bg-teal-50 text-teal-700 border-teal-200 mb-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              <p className="text-sm text-slate-500">Total: {clients.length} clients</p>
            </div>
          </CardContent>
        </Card>

        {/* Active Caregivers Card */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-full -mr-16 -mt-16" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Active Caregivers</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-end gap-2">
                <p className="text-4xl font-bold text-slate-900">{activeCaregivers}</p>
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200 mb-1">
                  <Heart className="w-3 h-3 mr-1" />
                  On Duty
                </Badge>
              </div>
              <p className="text-sm text-slate-500">Total: {caregivers.length} staff</p>
            </div>
          </CardContent>
        </Card>

        {/* Visit Fill Rate Card */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-full -mr-16 -mt-16" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Fill Rate Today</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <p className="text-4xl font-bold text-slate-900">{fillRate.toFixed(0)}%</p>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 mb-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Good
                </Badge>
              </div>
              <div className="space-y-1">
                <Progress value={fillRate} className="h-2" />
                <p className="text-sm text-slate-500">
                  {completedToday} completed • {scheduledToday} scheduled
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* EVV Match Rate Card */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-full -mr-16 -mt-16" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">EVV Match Rate</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <p className="text-4xl font-bold text-slate-900">{evvMatchRate.toFixed(0)}%</p>
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 mb-1">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              </div>
              <div className="space-y-1">
                <Progress value={evvMatchRate} className="h-2" />
                <p className="text-sm text-slate-500">
                  {evvVerified} of {evvEvents.length} verified
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
              <p className="text-sm text-slate-500 mt-1">Common tasks to get started</p>
            </div>
            <Sparkles className="w-5 h-5 text-teal-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(createPageUrl(action.path))}
                className="group relative overflow-hidden rounded-xl p-6 text-left transition-all hover:scale-105"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-90 group-hover:opacity-100 transition-opacity`} />
                <div className="relative z-10">
                  <action.icon className="w-8 h-8 text-white mb-3" />
                  <p className="text-white font-semibold">{action.label}</p>
                  <ArrowRight className="w-4 h-4 text-white/80 mt-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Overview */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Today's Overview</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">{format(new Date(), 'EEEE, MMMM d')}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(createPageUrl("Schedule"))}
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-900">{todayVisits.length}</p>
                      <p className="text-xs text-blue-700">Total Visits</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-900">{completedToday}</p>
                      <p className="text-xs text-green-700">Completed</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-900">{scheduledToday}</p>
                      <p className="text-xs text-orange-700">Pending</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Visits */}
          <RecentVisits visits={recentVisits} clients={clients} caregivers={caregivers} />

          {/* Billing Overview */}
          <BillingOverview
            claims={claims}
            totalBilled={totalBilled}
            totalPaid={totalPaid}
          />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <CardHeader>
              <CardTitle className="text-lg">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-300 mb-1">Total Billed</p>
                <p className="text-3xl font-bold">${totalBilled.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-300 mb-1">Total Collected</p>
                <p className="text-2xl font-semibold text-green-400">${totalPaid.toLocaleString()}</p>
              </div>
              <div className="pt-3 border-t border-slate-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Pending Claims</span>
                  <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                    {pendingClaims}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-slate-300">Paid Claims</span>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                    {paidClaims}
                  </Badge>
                </div>
              </div>
              <Button
                className="w-full bg-white text-slate-900 hover:bg-slate-100"
                onClick={() => navigate(createPageUrl("Billing"))}
              >
                View Billing
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Shifts */}
          <UpcomingShifts visits={upcomingVisits} clients={clients} caregivers={caregivers} />

          {/* Alerts & Notifications */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Alerts</CardTitle>
                <Bell className="w-5 h-5 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingClaims > 0 && (
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-900">Pending Claims</p>
                    <p className="text-xs text-orange-700 mt-0.5">
                      {pendingClaims} claims need attention
                    </p>
                  </div>
                </div>
              )}

              {activeMedications > 0 && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <Pill className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Active Medications</p>
                    <p className="text-xs text-blue-700 mt-0.5">
                      {medications.filter(m => m.status === 'active').length} medications scheduled
                    </p>
                  </div>
                </div>
              )}

              {scheduledToday > 0 && (
                <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg border border-teal-100">
                  <Clock className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-teal-900">Visits Today</p>
                    <p className="text-xs text-teal-700 mt-0.5">
                      {scheduledToday} visits scheduled for today
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* EVV Status */}
          <EVVStatusChart evvEvents={evvEvents.slice(0, 100)} />
        </div>
      </div>
    </div>
  );
}
