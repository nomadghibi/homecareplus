import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Clock,
  Calendar,
  MapPin,
  User,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Phone,
  Navigation,
  FileText,
  Home as HomeIcon
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function CaregiverDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [currentVisit, setCurrentVisit] = useState(null);
  const [todayVisits, setTodayVisits] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const isAuth = localStorage.getItem('isAuthenticated');
    const userData = localStorage.getItem('currentUser');

    if (isAuth !== 'true' || !userData) {
      navigate(createPageUrl("CaregiverLogin"), { replace: true });
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== 'caregiver') {
      navigate(createPageUrl("Landing"), { replace: true });
      return;
    }

    // Check if account is inactive
    if (user.status === 'inactive') {
      toast.error("Your account has been deactivated. Please contact your agency administrator.");
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isAuthenticated');
      navigate(createPageUrl("CaregiverLogin"), { replace: true });
      return;
    }

    setCurrentUser(user);
    loadTodaySchedule(user);
    checkClockStatus(user);
  }, [navigate]);

  const loadTodaySchedule = (user) => {
    // In production, this would fetch from API
    // For now, load mock schedule
    const mockVisits = [
      {
        id: 1,
        clientName: "Mary Johnson",
        clientAddress: "123 Oak Street, Springfield",
        startTime: "09:00 AM",
        endTime: "11:00 AM",
        serviceType: "Personal Care",
        status: "scheduled",
        phone: "(555) 123-4567"
      },
      {
        id: 2,
        clientName: "Robert Smith",
        clientAddress: "456 Maple Avenue, Springfield",
        startTime: "01:00 PM",
        endTime: "03:00 PM",
        serviceType: "Companionship",
        status: "scheduled",
        phone: "(555) 987-6543"
      },
      {
        id: 3,
        clientName: "Linda Davis",
        clientAddress: "789 Pine Road, Springfield",
        startTime: "04:00 PM",
        endTime: "06:00 PM",
        serviceType: "Medication Reminder",
        status: "scheduled",
        phone: "(555) 456-7890"
      }
    ];

    setTodayVisits(mockVisits);
  };

  const checkClockStatus = (user) => {
    // Check if currently clocked in
    const clockStatus = localStorage.getItem(`caregiver_${user.id}_clock_status`);
    if (clockStatus === 'in') {
      setIsClockedIn(true);
      const activeVisit = localStorage.getItem(`caregiver_${user.id}_active_visit`);
      if (activeVisit) {
        setCurrentVisit(JSON.parse(activeVisit));
      }
    }
  };

  const handleClockIn = (visit) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // Save clock-in data
          localStorage.setItem(`caregiver_${currentUser.id}_clock_status`, 'in');
          localStorage.setItem(`caregiver_${currentUser.id}_active_visit`, JSON.stringify({
            ...visit,
            clockInTime: new Date().toISOString(),
            clockInLocation: { latitude, longitude }
          }));

          setIsClockedIn(true);
          setCurrentVisit(visit);

          toast.success(`Clocked in for ${visit.clientName}`, {
            description: `Time: ${format(new Date(), 'h:mm a')}`
          });
        },
        (error) => {
          toast.error("Location access required", {
            description: "Please enable location services to clock in"
          });
        }
      );
    } else {
      toast.error("Location not supported", {
        description: "Your device doesn't support GPS verification"
      });
    }
  };

  const handleClockOut = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // Save clock-out data
          localStorage.removeItem(`caregiver_${currentUser.id}_clock_status`);
          localStorage.removeItem(`caregiver_${currentUser.id}_active_visit`);

          toast.success(`Clocked out from ${currentVisit.clientName}`, {
            description: `Time: ${format(new Date(), 'h:mm a')}`
          });

          setIsClockedIn(false);
          setCurrentVisit(null);

          // Update visit status
          const updatedVisits = todayVisits.map(v =>
            v.id === currentVisit.id ? { ...v, status: 'completed' } : v
          );
          setTodayVisits(updatedVisits);
        },
        (error) => {
          toast.error("Location access required", {
            description: "Please enable location services to clock out"
          });
        }
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    toast.success("Logged out successfully");
    navigate(createPageUrl("CaregiverLogin"), { replace: true });
  };

  const getStatusBadge = (status) => {
    const configs = {
      scheduled: { color: "bg-blue-100 text-blue-700 border-blue-200", label: "Scheduled" },
      in_progress: { color: "bg-green-100 text-green-700 border-green-200", label: "In Progress" },
      completed: { color: "bg-slate-100 text-slate-700 border-slate-200", label: "Completed" }
    };
    const config = configs[status] || configs.scheduled;
    return <Badge className={`${config.color} border`}>{config.label}</Badge>;
  };

  if (!currentUser) {
    return null;
  }

  const completedToday = todayVisits.filter(v => v.status === 'completed').length;
  const upcomingVisits = todayVisits.filter(v => v.status === 'scheduled');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Care Connect Pro</h1>
                <p className="text-xs text-slate-500">Caregiver Portal</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-600 hover:text-slate-900"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome Card */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-600 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">Welcome back,</p>
                <h2 className="text-2xl font-bold mb-4">
                  {currentUser.firstName} {currentUser.lastName}
                </h2>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(), 'EEEE, MMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {format(new Date(), 'h:mm a')}
                  </div>
                </div>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clock In/Out Card */}
        {isClockedIn && currentVisit ? (
          <Card className="border-2 border-green-500 bg-green-50 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-sm font-semibold text-green-900">Currently Clocked In</p>
                  </div>
                  <p className="text-lg font-bold text-green-900 mb-1">{currentVisit.clientName}</p>
                  <div className="flex items-center gap-1 text-sm text-green-700">
                    <Clock className="w-4 h-4" />
                    Started at {format(new Date(currentVisit.clockInTime), 'h:mm a')}
                  </div>
                </div>
                <Button
                  onClick={handleClockOut}
                  className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Clock Out
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-dashed border-slate-300 shadow-lg">
            <CardContent className="p-6 text-center">
              <Clock className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 text-sm mb-2">Not clocked in</p>
              <p className="text-xs text-slate-500">Clock in when you arrive at your first visit</p>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{todayVisits.length}</p>
                  <p className="text-sm text-slate-500">Today's Visits</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{completedToday}</p>
                  <p className="text-sm text-slate-500">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingVisits.length === 0 && completedToday === todayVisits.length ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">All visits completed!</p>
                <p className="text-sm text-slate-500 mt-1">Great job today!</p>
              </div>
            ) : upcomingVisits.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No visits scheduled for today</p>
                <p className="text-sm text-slate-500 mt-1">Enjoy your day off!</p>
              </div>
            ) : (
              upcomingVisits.map((visit) => (
                <Card key={visit.id} className="border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">{visit.clientName}</h3>
                          {getStatusBadge(visit.status)}
                        </div>
                        <div className="space-y-1 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            {visit.startTime} - {visit.endTime}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {visit.clientAddress}
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" />
                            {visit.serviceType}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.open(`tel:${visit.phone}`, '_self')}
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(visit.clientAddress)}`, '_blank')}
                      >
                        <Navigation className="w-4 h-4 mr-1" />
                        Navigate
                      </Button>
                      {!isClockedIn && (
                        <Button
                          size="sm"
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                          onClick={() => handleClockIn(visit)}
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          Clock In
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Completed Visits */}
        {completedToday > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Completed Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {todayVisits.filter(v => v.status === 'completed').map((visit) => (
                  <div key={visit.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <p className="font-medium text-green-900">{visit.clientName}</p>
                      <p className="text-sm text-green-700">{visit.startTime} - {visit.endTime}</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Card */}
        <Card className="shadow-lg bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Need help?</p>
                <p className="text-blue-700 mt-1">
                  Contact your agency office for support or schedule changes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
