import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Calendar,
  AlertTriangle,
  XCircle,
  Clock,
  MapPin,
  UserX,
  UserPlus,
  DollarSign,
  CheckCircle2,
  X,
  Settings
} from "lucide-react";
import { format, differenceInDays, differenceInMinutes, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("all");
  const [caregivers, setCaregivers] = useState([]);
  const [visits, setVisits] = useState([]);
  const [evvEvents, setEvvEvents] = useState([]);
  const [claims, setClaims] = useState([]);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [caregiversData, visitsData, evvData, claimsData, clientsData] = await Promise.all([
        base44.entities.Caregiver.list(),
        base44.entities.Visit.list(),
        base44.entities.EVVEvent.list(),
        base44.entities.Claim.list(),
        base44.entities.Client.list(),
      ]);

      setCaregivers(caregiversData || []);
      setVisits(visitsData || []);
      setEvvEvents(evvData || []);
      setClaims(claimsData || []);
      setClients(clientsData || []);

      // Generate notifications after data is loaded
      generateNotifications(
        caregiversData || [],
        visitsData || [],
        evvData || [],
        claimsData || [],
        clientsData || []
      );
    } catch (error) {
      console.error("Error loading notification data:", error);
    }
  };

  const generateNotifications = (caregiversData, visitsData, evvData, claimsData, clientsData) => {
    const newNotifications = [];
    const now = new Date();

    // 1. License expiring notifications
    caregiversData.forEach(caregiver => {
      if (caregiver.license_expiry) {
        const expiryDate = parseISO(caregiver.license_expiry);
        const daysUntilExpiry = differenceInDays(expiryDate, now);

        if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
          const severity = daysUntilExpiry <= 7 ? 'critical' : daysUntilExpiry <= 14 ? 'urgent' : 'warning';
          newNotifications.push({
            id: `license-${caregiver.id}`,
            type: 'license_expiring',
            severity,
            title: `License Expiring ${daysUntilExpiry === 0 ? 'Today' : `in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''}`}`,
            message: `${caregiver.first_name} ${caregiver.last_name}'s license expires ${format(expiryDate, 'MMM d, yyyy')}`,
            icon: AlertTriangle,
            timestamp: now,
            actionLabel: "View Caregiver",
            actionUrl: createPageUrl("Caregivers"),
            data: { caregiverId: caregiver.id }
          });
        }
      }
    });

    // 2. Shift starting soon (no check-in)
    const upcomingVisits = visitsData.filter(v => {
      if (v.status !== 'scheduled') return false;
      const visitDateTime = new Date(`${v.scheduled_date}T${v.scheduled_start_time}`);
      const minutesUntil = differenceInMinutes(visitDateTime, now);
      return minutesUntil > 0 && minutesUntil <= 30;
    });

    upcomingVisits.forEach(visit => {
      const hasCheckIn = evvData.some(e => 
        e.visit_id === visit.id && 
        e.event_type === 'clock_in'
      );

      if (!hasCheckIn) {
        const caregiver = caregiversData.find(c => c.id === visit.caregiver_id);
        const client = clientsData.find(c => c.id === visit.client_id);
        const visitDateTime = new Date(`${visit.scheduled_date}T${visit.scheduled_start_time}`);
        const minutesUntil = differenceInMinutes(visitDateTime, now);

        newNotifications.push({
          id: `shift-${visit.id}`,
          type: 'shift_starting',
          severity: minutesUntil <= 10 ? 'urgent' : 'warning',
          title: `Shift Starting in ${minutesUntil} Minutes`,
          message: `${caregiver?.first_name || 'Caregiver'} hasn't checked in for ${client?.first_name || 'client'}'s visit`,
          icon: Clock,
          timestamp: now,
          actionLabel: "View Schedule",
          actionUrl: createPageUrl("Schedule"),
          data: { visitId: visit.id }
        });
      }
    });

    // 3. EVV mismatch detected
    const recentEVVIssues = evvData.filter(e => 
      e.verification_status === 'rejected' || 
      (e.integrity_flags && e.integrity_flags.length > 0) ||
      e.geofence_match === false
    );

    recentEVVIssues.slice(0, 5).forEach(event => {
      const caregiver = caregiversData.find(c => c.id === event.caregiver_id);
      const client = clientsData.find(c => c.id === event.client_id);
      
      newNotifications.push({
        id: `evv-${event.id}`,
        type: 'evv_mismatch',
        severity: 'urgent',
        title: 'EVV Verification Issue',
        message: `${caregiver?.first_name || 'Caregiver'} - ${client?.first_name || 'Client'}: ${
          event.geofence_match === false ? 'Location mismatch' : 
          event.integrity_flags?.length > 0 ? event.integrity_flags[0] : 
          'Verification rejected'
        }`,
        icon: MapPin,
        timestamp: parseISO(event.timestamp),
        actionLabel: "View EVV",
        actionUrl: createPageUrl("EVV"),
        data: { eventId: event.id }
      });
    });

    // 4. Claim rejected/denied
    const rejectedClaims = claimsData.filter(c => 
      c.claim_status === 'rejected' || c.claim_status === 'denied'
    );

    rejectedClaims.slice(0, 5).forEach(claim => {
      const client = clientsData.find(c => c.id === claim.client_id);
      
      newNotifications.push({
        id: `claim-${claim.id}`,
        type: 'claim_rejected',
        severity: 'urgent',
        title: `Claim ${claim.claim_status === 'denied' ? 'Denied' : 'Rejected'}`,
        message: `${claim.claim_number} - ${client?.first_name || 'Client'}: $${claim.total_charge?.toFixed(2) || '0.00'}`,
        icon: XCircle,
        timestamp: claim.updated_date ? parseISO(claim.updated_date) : now,
        actionLabel: "View Claim",
        actionUrl: createPageUrl("Billing"),
        data: { claimId: claim.id }
      });
    });

    // 5. New client referral (recent clients)
    const recentClients = clients
      .filter(c => {
        const createdDate = parseISO(c.created_date);
        const daysSinceCreated = differenceInDays(now, createdDate);
        return daysSinceCreated <= 7;
      })
      .slice(0, 3);

    recentClients.forEach(client => {
      newNotifications.push({
        id: `client-${client.id}`,
        type: 'new_client',
        severity: 'info',
        title: 'New Client Added',
        message: `${client.first_name} ${client.last_name} - ${client.care_level || 'Basic'} care level`,
        icon: UserPlus,
        timestamp: parseISO(client.created_date),
        actionLabel: "View Client",
        actionUrl: createPageUrl("Clients"),
        data: { clientId: client.id }
      });
    });

    // 6. Schedule conflicts (overlapping visits for same caregiver)
    const scheduledVisits = visitsData.filter(v => v.status === 'scheduled');
    const conflicts = [];
    
    scheduledVisits.forEach((visit, idx) => {
      scheduledVisits.slice(idx + 1).forEach(otherVisit => {
        if (visit.caregiver_id === otherVisit.caregiver_id && 
            visit.scheduled_date === otherVisit.scheduled_date) {
          
          const start1 = visit.scheduled_start_time;
          const end1 = visit.scheduled_end_time;
          const start2 = otherVisit.scheduled_start_time;
          const end2 = otherVisit.scheduled_end_time;
          
          // Check for overlap
          if ((start1 < end2 && end1 > start2) || (start2 < end1 && end2 > start1)) {
            const caregiver = caregiversData.find(c => c.id === visit.caregiver_id);
            conflicts.push({
              id: `conflict-${visit.id}-${otherVisit.id}`,
              type: 'schedule_conflict',
              severity: 'critical',
              title: 'Schedule Conflict Detected',
              message: `${caregiver?.first_name || 'Caregiver'} has overlapping visits on ${format(parseISO(visit.scheduled_date), 'MMM d')}`,
              icon: AlertTriangle,
              timestamp: now,
              actionLabel: "Fix Schedule",
              actionUrl: createPageUrl("Schedule"),
              data: { visitId: visit.id }
            });
          }
        }
      });
    });

    conflicts.slice(0, 3).forEach(conflict => newNotifications.push(conflict));

    // 7. Caregiver on leave/inactive (simulated "calling out sick")
    const inactiveCaregivers = caregiversData.filter(c => c.status === 'on_leave' || c.status === 'inactive');
    inactiveCaregivers.forEach(caregiver => {
      const affectedVisits = visitsData.filter(v => 
        v.caregiver_id === caregiver.id && 
        v.status === 'scheduled' &&
        new Date(v.scheduled_date) >= now
      );

      if (affectedVisits.length > 0) {
        newNotifications.push({
          id: `absence-${caregiver.id}`,
          type: 'caregiver_unavailable',
          severity: 'urgent',
          title: 'Caregiver Unavailable',
          message: `${caregiver.first_name} ${caregiver.last_name} is ${caregiver.status === 'on_leave' ? 'on leave' : 'inactive'} - ${affectedVisits.length} visit${affectedVisits.length > 1 ? 's' : ''} affected`,
          icon: UserX,
          timestamp: now,
          actionLabel: "Reassign Visits",
          actionUrl: createPageUrl("Schedule"),
          data: { caregiverId: caregiver.id }
        });
      }
    });

    // 8. Visit running late (completed after scheduled end time)
    const lateVisits = visitsData.filter(v => {
      if (v.status !== 'completed' || !v.actual_end_time) return false;
      const scheduledEnd = new Date(`${v.scheduled_date}T${v.scheduled_end_time}`);
      const actualEnd = parseISO(v.actual_end_time);
      const minutesLate = differenceInMinutes(actualEnd, scheduledEnd);
      return minutesLate > 15;
    });

    lateVisits.slice(0, 3).forEach(visit => {
      const caregiver = caregiversData.find(c => c.id === visit.caregiver_id);
      const client = clientsData.find(c => c.id === visit.client_id);
      const scheduledEnd = new Date(`${visit.scheduled_date}T${visit.scheduled_end_time}`);
      const actualEnd = parseISO(visit.actual_end_time);
      const minutesLate = differenceInMinutes(actualEnd, scheduledEnd);

      newNotifications.push({
        id: `late-${visit.id}`,
        type: 'visit_late',
        severity: 'warning',
        title: 'Visit Ran Late',
        message: `${caregiver?.first_name || 'Caregiver'} with ${client?.first_name || 'Client'} - ${minutesLate} minutes over`,
        icon: Clock,
        timestamp: actualEnd,
        actionLabel: "View Details",
        actionUrl: createPageUrl("Documentation"),
        data: { visitId: visit.id }
      });
    });

    // Sort by severity and timestamp
    const severityOrder = { critical: 0, urgent: 1, warning: 2, info: 3 };
    newNotifications.sort((a, b) => {
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return b.timestamp - a.timestamp;
    });

    setNotifications(newNotifications);
    setUnreadCount(newNotifications.filter(n => !n.read).length);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const dismissNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => {
      const notification = notifications.find(n => n.id === notificationId);
      return notification && !notification.read ? Math.max(0, prev - 1) : prev;
    });
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === "all") return true;
    if (filter === "urgent") return n.severity === 'critical' || n.severity === 'urgent';
    if (filter === "info") return n.severity === 'info';
    return true;
  });

  const severityConfig = {
    critical: { color: 'bg-red-100 border-red-300 text-red-900', dot: 'bg-red-500' },
    urgent: { color: 'bg-orange-100 border-orange-300 text-orange-900', dot: 'bg-orange-500' },
    warning: { color: 'bg-yellow-100 border-yellow-300 text-yellow-900', dot: 'bg-yellow-500' },
    info: { color: 'bg-blue-100 border-blue-300 text-blue-900', dot: 'bg-blue-500' }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-slate-100">
          <Bell className="w-5 h-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-[420px] p-0">
        <Card className="border-none shadow-2xl">
          <CardHeader className="border-b bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex gap-2 mt-3">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                className="text-xs"
              >
                All ({notifications.length})
              </Button>
              <Button
                variant={filter === "urgent" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("urgent")}
                className="text-xs"
              >
                Urgent ({notifications.filter(n => n.severity === 'critical' || n.severity === 'urgent').length})
              </Button>
              <Button
                variant={filter === "info" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("info")}
                className="text-xs"
              >
                Info ({notifications.filter(n => n.severity === 'info').length})
              </Button>
            </div>
          </CardHeader>
          
          <ScrollArea className="h-[500px]">
            <CardContent className="p-0">
              {filteredNotifications.length === 0 ? (
                <div className="p-12 text-center">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p className="text-slate-600 font-medium">All caught up!</p>
                  <p className="text-sm text-slate-500 mt-1">No notifications to show</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredNotifications.map((notification) => {
                    const Icon = notification.icon;
                    const config = severityConfig[notification.severity];

                    return (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-slate-50 transition-colors ${
                          !notification.read ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0 border`}>
                            <Icon className="w-5 h-5" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2">
                                {!notification.read && (
                                  <div className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
                                )}
                                <h4 className="font-semibold text-slate-900 text-sm">
                                  {notification.title}
                                </h4>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 -mt-1"
                                onClick={() => dismissNotification(notification.id)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                            
                            <p className="text-sm text-slate-600 mb-2">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-400">
                                {format(notification.timestamp, 'MMM d, h:mm a')}
                              </span>
                              
                              {notification.actionLabel && (
                                <Link 
                                  to={notification.actionUrl}
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <Button variant="link" size="sm" className="text-xs h-auto p-0">
                                    {notification.actionLabel} →
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </ScrollArea>
          
          {filteredNotifications.length > 0 && (
            <div className="border-t p-3 bg-slate-50 text-center">
              <Link to={createPageUrl("Notifications")}>
                <Button variant="ghost" size="sm" className="text-xs">
                  View All Notifications
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}