import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart,
  Calendar,
  FileText,
  MessageSquare,
  Upload,
  Star,
  Clock,
  User,
  Pill,
  Home,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  CheckCircle2,
  TrendingUp
} from "lucide-react";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function FamilyPortal() {
  const [familyAccess, setFamilyAccess] = useState(null);
  const [client, setClient] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: allAccess = [] } = useQuery({
    queryKey: ['familyPortalAccess'],
    queryFn: () => base44.entities.FamilyPortalAccess.list(),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
  });

  const { data: visits = [] } = useQuery({
    queryKey: ['visits'],
    queryFn: () => base44.entities.Visit.list('-scheduled_date'),
  });

  const { data: caregivers = [] } = useQuery({
    queryKey: ['caregivers'],
    queryFn: () => base44.entities.Caregiver.list(),
  });

  const { data: medications = [] } = useQuery({
    queryKey: ['medications'],
    queryFn: () => base44.entities.MedicationSchedule.list(),
  });

  const { data: ratings = [] } = useQuery({
    queryKey: ['ratings'],
    queryFn: () => base44.entities.VisitRating.list(),
  });

  // Find family access for current user
  useEffect(() => {
    if (user && allAccess.length > 0) {
      const access = allAccess.find(a => 
        a.family_member_id === user.id || 
        a.status === 'active'
      );
      if (access) {
        setFamilyAccess(access);
        const clientData = clients.find(c => c.id === access.client_id);
        setClient(clientData);
      }
    }
  }, [user, allAccess, clients]);

  // If no access, show message
  if (!familyAccess || familyAccess.status !== 'active') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-none shadow-2xl">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Family Portal Access
            </h2>
            {familyAccess?.status === 'pending' ? (
              <>
                <p className="text-slate-600 mb-6">
                  Your access request is pending approval. We'll notify you once it's activated.
                </p>
                <Badge className="bg-yellow-100 text-yellow-700">Pending Approval</Badge>
              </>
            ) : (
              <>
                <p className="text-slate-600 mb-6">
                  You don't have active portal access yet. Please contact your care coordinator to request access.
                </p>
                <Button className="bg-gradient-to-r from-teal-500 to-blue-600">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Care Team
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const permissions = familyAccess.permissions || {};

  // Filter data for this client
  const clientVisits = visits.filter(v => v.client_id === client?.id);
  const upcomingVisits = clientVisits.filter(v => 
    v.status === 'scheduled' && 
    new Date(v.scheduled_date) >= new Date()
  ).slice(0, 5);
  const recentVisits = clientVisits.filter(v => 
    v.status === 'completed'
  ).slice(0, 5);
  const clientMedications = medications.filter(m => 
    m.client_id === client?.id && 
    m.status === 'active'
  );

  // Calculate stats
  const totalVisits = clientVisits.filter(v => v.status === 'completed').length;
  const avgRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.overall_rating, 0) / ratings.length).toFixed(1)
    : 0;
  const nextVisit = upcomingVisits[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              Welcome Back
            </h1>
            <p className="text-slate-600 mt-1">
              Care updates for {client?.first_name} {client?.last_name}
            </p>
          </div>
          <Badge className="bg-green-100 text-green-700 border-green-200 text-sm">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Portal Access Active
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Total Visits</p>
                  <p className="text-3xl font-bold text-teal-600">{totalVisits}</p>
                </div>
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Average Rating</p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold text-yellow-600">{avgRating}</p>
                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  </div>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Medications</p>
                  <p className="text-3xl font-bold text-purple-600">{clientMedications.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Pill className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Upcoming</p>
                  <p className="text-3xl font-bold text-blue-600">{upcomingVisits.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Visit Highlight */}
        {nextVisit && (
          <Card className="border-none shadow-lg bg-gradient-to-r from-teal-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">Next Scheduled Visit</h3>
                    {isToday(parseISO(nextVisit.scheduled_date)) && (
                      <Badge className="bg-white/20 text-white border-white/30">Today</Badge>
                    )}
                    {isTomorrow(parseISO(nextVisit.scheduled_date)) && (
                      <Badge className="bg-white/20 text-white border-white/30">Tomorrow</Badge>
                    )}
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-teal-100 text-sm mb-1">Date & Time</p>
                      <p className="font-semibold">
                        {format(parseISO(nextVisit.scheduled_date), 'EEEE, MMM d')}
                      </p>
                      <p className="text-sm">{nextVisit.scheduled_start_time} - {nextVisit.scheduled_end_time}</p>
                    </div>
                    <div>
                      <p className="text-teal-100 text-sm mb-1">Caregiver</p>
                      <p className="font-semibold">
                        {caregivers.find(c => c.id === nextVisit.caregiver_id)?.first_name || 'Assigned'}
                      </p>
                    </div>
                    <div>
                      <p className="text-teal-100 text-sm mb-1">Visit Type</p>
                      <p className="font-semibold capitalize">
                        {nextVisit.visit_type?.replace(/_/g, ' ') || 'Personal Care'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming Visits */}
          {permissions.view_schedule && (
            <Card className="border-none shadow-lg">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  Upcoming Visits
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {upcomingVisits.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No upcoming visits scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingVisits.map(visit => {
                      const caregiver = caregivers.find(c => c.id === visit.caregiver_id);
                      return (
                        <div key={visit.id} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {format(parseISO(visit.scheduled_date), 'EEE, MMM d')}
                              </p>
                              <p className="text-sm text-slate-600">
                                {visit.scheduled_start_time} - {visit.scheduled_end_time}
                              </p>
                            </div>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              {visit.visit_type?.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          {caregiver && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <User className="w-4 h-4" />
                              {caregiver.first_name} {caregiver.last_name}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Medications */}
          {permissions.view_medications && (
            <Card className="border-none shadow-lg">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-purple-600" />
                  Medication Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {clientMedications.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Pill className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No medications scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {clientMedications.slice(0, 5).map(med => (
                      <div key={med.id} className="p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-slate-900">{med.medication_name}</p>
                            <p className="text-sm text-slate-600">{med.dosage}</p>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {med.frequency}
                          </Badge>
                        </div>
                        {med.schedule_times && med.schedule_times.length > 0 && (
                          <div className="flex gap-2 flex-wrap mt-2">
                            {med.schedule_times.map((time, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {time}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {med.special_instructions && (
                          <p className="text-xs text-slate-500 mt-2 flex items-start gap-1">
                            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {med.special_instructions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <Card className="border-none shadow-lg">
          <CardHeader className="border-b">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              {permissions.message_team && (
                <Link to={createPageUrl("FamilyMessages")}>
                  <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2 hover:bg-teal-50 hover:border-teal-300">
                    <MessageSquare className="w-6 h-6 text-teal-600" />
                    <span className="font-semibold">Message Care Team</span>
                    <span className="text-xs text-slate-500">Send a message</span>
                  </Button>
                </Link>
              )}

              {permissions.view_visit_notes && (
                <Link to={createPageUrl("FamilyVisitHistory")}>
                  <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2 hover:bg-blue-50 hover:border-blue-300">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <span className="font-semibold">Visit History</span>
                    <span className="text-xs text-slate-500">View past visits</span>
                  </Button>
                </Link>
              )}

              {permissions.upload_documents && (
                <Link to={createPageUrl("FamilyDocuments")}>
                  <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2 hover:bg-purple-50 hover:border-purple-300">
                    <Upload className="w-6 h-6 text-purple-600" />
                    <span className="font-semibold">Upload Documents</span>
                    <span className="text-xs text-slate-500">Share photos/files</span>
                  </Button>
                </Link>
              )}

              {permissions.rate_visits && recentVisits.length > 0 && (
                <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2 hover:bg-yellow-50 hover:border-yellow-300">
                  <Star className="w-6 h-6 text-yellow-600" />
                  <span className="font-semibold">Rate Recent Visit</span>
                  <span className="text-xs text-slate-500">Share feedback</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-teal-600" />
              Need Help?
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Care Coordinator</p>
                <p className="font-semibold">24/7 Support</p>
                <a href="tel:1-800-HOMECARE" className="text-teal-600 hover:underline text-sm">
                  1-800-HOMECARE
                </a>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Email</p>
                <a href="mailto:support@careagency.com" className="text-teal-600 hover:underline">
                  support@careagency.com
                </a>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Emergency</p>
                <p className="font-semibold text-red-600">Call 911</p>
                <p className="text-xs text-slate-500 mt-1">For medical emergencies</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}