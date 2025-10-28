import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Calendar,
  User,
  Clock,
  FileText,
  Star,
  ChevronLeft,
  Search,
  CheckCircle2,
  Heart,
  TrendingUp
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import VisitRatingForm from "../components/family/VisitRatingForm";

export default function FamilyVisitHistory() {
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [familyAccess, setFamilyAccess] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: allAccess = [] } = useQuery({
    queryKey: ['familyPortalAccess'],
    queryFn: () => base44.entities.FamilyPortalAccess.list(),
  });

  const { data: visits = [] } = useQuery({
    queryKey: ['visits'],
    queryFn: () => base44.entities.Visit.list('-scheduled_date'),
  });

  const { data: caregivers = [] } = useQuery({
    queryKey: ['caregivers'],
    queryFn: () => base44.entities.Caregiver.list(),
  });

  const { data: ratings = [] } = useQuery({
    queryKey: ['ratings'],
    queryFn: () => base44.entities.VisitRating.list(),
  });

  useEffect(() => {
    if (user && allAccess.length > 0) {
      const access = allAccess.find(a => a.status === 'active');
      setFamilyAccess(access);
    }
  }, [user, allAccess]);

  const clientVisits = visits.filter(v => 
    v.client_id === familyAccess?.client_id && 
    v.status === 'completed'
  );

  const filteredVisits = clientVisits.filter(visit => {
    const caregiver = caregivers.find(c => c.id === visit.caregiver_id);
    const searchLower = searchTerm.toLowerCase();
    return (
      caregiver?.first_name?.toLowerCase().includes(searchLower) ||
      caregiver?.last_name?.toLowerCase().includes(searchLower) ||
      visit.visit_type?.toLowerCase().includes(searchLower)
    );
  });

  const avgRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.overall_rating, 0) / ratings.length).toFixed(1)
    : 0;

  const getVisitRating = (visitId) => {
    return ratings.find(r => r.visit_id === visitId);
  };

  if (!familyAccess || !familyAccess.permissions?.view_visit_notes) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-semibold mb-2">Access Restricted</h3>
            <p className="text-slate-600">
              You don't have permission to view visit history.
            </p>
            <Link to={createPageUrl("FamilyPortal")}>
              <Button className="mt-6">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Portal
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link to={createPageUrl("FamilyPortal")}>
              <Button variant="ghost" size="sm" className="mb-2">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Portal
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              Visit History
            </h1>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Total Visits</p>
                  <p className="text-3xl font-bold text-blue-600">{clientVisits.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
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

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Rated</p>
                  <p className="text-3xl font-bold text-green-600">
                    {ratings.length}/{clientVisits.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="border-none shadow-lg">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search by caregiver name or visit type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </CardContent>
        </Card>

        {/* Visit List */}
        <div className="space-y-4">
          {filteredVisits.map(visit => {
            const caregiver = caregivers.find(c => c.id === visit.caregiver_id);
            const rating = getVisitRating(visit.id);

            return (
              <Card 
                key={visit.id} 
                className="border-none shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedVisit(visit)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-slate-900">
                          {format(parseISO(visit.scheduled_date), 'EEEE, MMMM d, yyyy')}
                        </h3>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {visit.visit_type?.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {visit.scheduled_start_time} - {visit.scheduled_end_time}
                        </div>
                        {caregiver && (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {caregiver.first_name} {caregiver.last_name}
                          </div>
                        )}
                        {visit.billable_hours && (
                          <Badge variant="secondary">
                            {visit.billable_hours}h
                          </Badge>
                        )}
                      </div>
                    </div>

                    {rating ? (
                      <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold text-yellow-700">{rating.overall_rating}</span>
                      </div>
                    ) : familyAccess.permissions?.rate_visits && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVisit(visit);
                          setShowRatingForm(true);
                        }}
                        className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Rate Visit
                      </Button>
                    )}
                  </div>

                  {visit.visit_notes && (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Visit Notes
                      </p>
                      <p className="text-slate-600 text-sm line-clamp-2">
                        {visit.visit_notes}
                      </p>
                    </div>
                  )}

                  {visit.tasks_completed && visit.tasks_completed.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-slate-700 mb-2">Tasks Completed</p>
                      <div className="flex gap-2 flex-wrap">
                        {visit.tasks_completed.filter(t => t.completed).map((task, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-green-50 text-green-700">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {task.task}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {filteredVisits.length === 0 && (
            <Card className="border-none shadow-lg">
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-xl font-semibold mb-2">No Visits Found</h3>
                <p className="text-slate-600">
                  {searchTerm ? "Try adjusting your search" : "Visit history will appear here"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Rating Form Modal */}
      {showRatingForm && selectedVisit && (
        <VisitRatingForm
          visit={selectedVisit}
          caregiver={caregivers.find(c => c.id === selectedVisit.caregiver_id)}
          familyEmail={user?.email}
          onClose={() => {
            setShowRatingForm(false);
            setSelectedVisit(null);
          }}
          onSubmitSuccess={() => {
            queryClient.invalidateQueries(['ratings']);
            setShowRatingForm(false);
            setSelectedVisit(null);
          }}
        />
      )}
    </div>
  );
}