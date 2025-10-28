import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Search,
  Calendar,
  User,
  Heart,
  Activity,
  CheckCircle2,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VisitDocumentation from "../components/documentation/VisitDocumentation";

export default function Documentation() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedVisit, setSelectedVisit] = useState(null);

  const { data: visits = [], isLoading } = useQuery({
    queryKey: ['visits'],
    queryFn: () => base44.entities.Visit.list({ sort: '-scheduled_start' }),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
  });

  const { data: caregivers = [] } = useQuery({
    queryKey: ['caregivers'],
    queryFn: () => base44.entities.Caregiver.list(),
  });

  const getClient = (clientId) => clients.find(c => c.id === clientId);
  const getCaregiver = (caregiverId) => caregivers.find(c => c.id === caregiverId);

  const filteredVisits = visits.filter(visit => {
    const client = getClient(visit.client_id);
    const caregiver = getCaregiver(visit.caregiver_id);
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      client?.first_name?.toLowerCase().includes(searchLower) ||
      client?.last_name?.toLowerCase().includes(searchLower) ||
      caregiver?.first_name?.toLowerCase().includes(searchLower) ||
      caregiver?.last_name?.toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === "all" || visit.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: visits.length,
    documented: visits.filter(v => v.visit_notes || v.tasks_completed?.length > 0).length,
    signed: visits.filter(v => v.client_signature && v.caregiver_signature).length,
    pending: visits.filter(v => v.status === 'completed' && !v.visit_notes).length,
  };

  const statusConfig = {
    completed: { color: "bg-green-100 text-green-700 border-green-200", label: "Completed" },
    in_progress: { color: "bg-blue-100 text-blue-700 border-blue-200", label: "In Progress" },
    scheduled: { color: "bg-slate-100 text-slate-700 border-slate-200", label: "Scheduled" },
    cancelled: { color: "bg-red-100 text-red-700 border-red-200", label: "Cancelled" },
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          Clinical Documentation
        </h1>
        <p className="text-slate-500 mt-1">
          Visit notes, tasks, and clinical records
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Visits</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Documented</p>
                <p className="text-2xl font-bold text-green-600">{stats.documented}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Signed</p>
                <p className="text-2xl font-bold text-purple-600">{stats.signed}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search by client or caregiver name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visits List */}
      <Card className="border-none shadow-lg">
        <CardHeader className="border-b">
          <CardTitle>Visit Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500">
                Loading visits...
              </div>
            ) : filteredVisits.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No visits found</p>
              </div>
            ) : (
              filteredVisits.map((visit) => {
                const client = getClient(visit.client_id);
                const caregiver = getCaregiver(visit.caregiver_id);
                const status = statusConfig[visit.status] || statusConfig.scheduled;
                const hasDocumentation = visit.visit_notes || visit.tasks_completed?.length > 0;
                const hasSignatures = visit.client_signature && visit.caregiver_signature;

                return (
                  <div
                    key={visit.id}
                    onClick={() => setSelectedVisit(visit)}
                    className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h4 className="font-semibold text-slate-900">
                            {client ? `${client.first_name} ${client.last_name}` : 'Unknown Client'}
                          </h4>
                          <Badge className={`${status.color} border`}>
                            {status.label}
                          </Badge>
                          {hasDocumentation && (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              <FileText className="w-3 h-3 mr-1" />
                              Documented
                            </Badge>
                          )}
                          {hasSignatures && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Signed
                            </Badge>
                          )}
                          {visit.evv_verified && (
                            <Badge variant="outline" className="bg-teal-50 text-teal-700">
                              EVV ✓
                            </Badge>
                          )}
                        </div>
                        <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            Caregiver: {caregiver ? `${caregiver.first_name} ${caregiver.last_name}` : 'Unassigned'}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {visit.scheduled_start ? (
                              <>
                                {format(new Date(visit.scheduled_start), 'MMM d, yyyy')} • {format(new Date(visit.scheduled_start), 'HH:mm')} - {visit.scheduled_end ? format(new Date(visit.scheduled_end), 'HH:mm') : '--:--'}
                              </>
                            ) : visit.scheduled_date ? (
                              <>
                                {format(new Date(visit.scheduled_date), 'MMM d, yyyy')} • {visit.scheduled_start_time || '--:--'} - {visit.scheduled_end_time || '--:--'}
                              </>
                            ) : (
                              'No date'
                            )}
                          </div>
                          {visit.visit_type && (
                            <div className="flex items-center gap-2">
                              <Heart className="w-4 h-4 text-slate-400" />
                              <span className="capitalize">{visit.visit_type.replace(/_/g, ' ')}</span>
                            </div>
                          )}
                          {visit.tasks_completed && visit.tasks_completed.length > 0 && (
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-slate-400" />
                              {visit.tasks_completed.filter(t => t.completed).length}/{visit.tasks_completed.length} tasks completed
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Visit Documentation Modal */}
      {selectedVisit && (
        <VisitDocumentation
          visit={selectedVisit}
          client={getClient(selectedVisit.client_id)}
          caregiver={getCaregiver(selectedVisit.caregiver_id)}
          onClose={() => setSelectedVisit(null)}
        />
      )}
    </div>
  );
}