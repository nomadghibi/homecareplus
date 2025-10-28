import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  User,
  Menu,
  X,
  Calendar,
  CheckCircle2,
  Home,
  MessageSquare
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import MobileClockInOut from "../components/mobile/MobileClockInOut";
import MobileTodaySchedule from "../components/mobile/MobileTodaySchedule";
import MobileVisitDetails from "../components/mobile/MobileVisitDetails";
import MobileQuickActions from "../components/mobile/MobileQuickActions";

export default function MobileApp() {
  const [user, setUser] = useState(null);
  const [caregiver, setCaregiver] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);

  const { data: caregivers = [] } = useQuery({
    queryKey: ['caregivers'],
    queryFn: () => base44.entities.Caregiver.list(),
  });

  const { data: visits = [] } = useQuery({
    queryKey: ['visits'],
    queryFn: () => base44.entities.Visit.list('-scheduled_date'),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
  });

  const { data: evvEvents = [] } = useQuery({
    queryKey: ['evvEvents'],
    queryFn: () => base44.entities.EVVEvent.list('-created_date'),
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        const caregiverData = caregivers.find(c => c.email === currentUser.email);
        setCaregiver(caregiverData);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, [caregivers]);

  const today = new Date().toISOString().split('T')[0];
  const todayVisits = visits.filter(v => 
    v.caregiver_id === caregiver?.id && 
    v.scheduled_date === today
  ).sort((a, b) => a.scheduled_start_time.localeCompare(b.scheduled_start_time));

  const currentVisit = todayVisits.find(v => v.status === 'in_progress');

  const lastEvent = evvEvents
    .filter(e => e.caregiver_id === caregiver?.id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  
  const isClockedIn = lastEvent?.event_type === 'clock_in';
  const upcomingVisits = todayVisits.filter(v => v.status === 'scheduled');
  const completedToday = todayVisits.filter(v => v.status === 'completed').length;

  if (!caregiver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <User className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-bold mb-2">Caregiver Access Only</h3>
            <p className="text-slate-600 mb-4">
              This mobile interface is for caregivers. Please log in with your caregiver credentials.
            </p>
            <Link to={createPageUrl("Dashboard")}>
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedVisit) {
    return (
      <MobileVisitDetails
        visit={selectedVisit}
        client={clients.find(c => c.id === selectedVisit.client_id)}
        onBack={() => setSelectedVisit(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 pb-20">
      {/* Mobile Header - Only One */}
      <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white p-4 sticky top-0 z-40 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold">{caregiver.first_name} {caregiver.last_name}</h2>
              <p className="text-xs text-teal-100">ID: {caregiver.employee_id}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowMenu(!showMenu)}
            className="text-white hover:bg-white/20"
          >
            {showMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <Badge className={`${isClockedIn ? 'bg-green-500' : 'bg-slate-500'} text-white border-0`}>
            <Clock className="w-3 h-3 mr-1" />
            {isClockedIn ? 'Clocked In' : 'Clocked Out'}
          </Badge>
          <div className="text-sm">
            <span className="font-bold">{completedToday}</span>/{todayVisits.length} visits completed
          </div>
        </div>
      </div>

      {showMenu && (
        <div className="bg-white shadow-lg p-4 space-y-2">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="ghost" className="w-full justify-start">
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Link to={createPageUrl("Messages")}>
            <Button variant="ghost" className="w-full justify-start">
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
            </Button>
          </Link>
        </div>
      )}

      <div className="p-4 space-y-4">
        {currentVisit && (
          <Card className="border-2 border-green-500 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Badge className="bg-green-500 text-white mb-2">In Progress</Badge>
                  <h3 className="font-bold text-lg">
                    {clients.find(c => c.id === currentVisit.client_id)?.first_name} {' '}
                    {clients.find(c => c.id === currentVisit.client_id)?.last_name}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {currentVisit.scheduled_start_time} - {currentVisit.scheduled_end_time}
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => setSelectedVisit(currentVisit)}
              >
                Continue Visit
              </Button>
            </CardContent>
          </Card>
        )}

        <MobileClockInOut 
          caregiver={caregiver}
          isClockedIn={isClockedIn}
          currentVisit={currentVisit}
          lastEvent={lastEvent}
        />

        <MobileTodaySchedule
          visits={todayVisits}
          clients={clients}
          onSelectVisit={setSelectedVisit}
        />

        <MobileQuickActions caregiver={caregiver} />
      </div>
    </div>
  );
}