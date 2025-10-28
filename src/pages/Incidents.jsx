import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  User,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import IncidentForm from "../components/incidents/IncidentForm";
import IncidentDetails from "../components/incidents/IncidentDetails";

export default function Incidents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [editingIncident, setEditingIncident] = useState(null);
  const queryClient = useQueryClient();

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.Incident.list('-incident_date'),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
  });

  const { data: caregivers = [] } = useQuery({
    queryKey: ['caregivers'],
    queryFn: () => base44.entities.Caregiver.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Incident.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['incidents']);
      setShowForm(false);
      setEditingIncident(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Incident.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['incidents']);
      setShowForm(false);
      setEditingIncident(null);
      setSelectedIncident(null);
    },
  });

  const handleSubmit = (data) => {
    if (editingIncident) {
      updateMutation.mutate({ id: editingIncident.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      incident.incident_number?.toLowerCase().includes(searchLower) ||
      incident.description?.toLowerCase().includes(searchLower) ||
      incident.location?.toLowerCase().includes(searchLower);

    const matchesType = typeFilter === "all" || incident.incident_type === typeFilter;
    const matchesSeverity = severityFilter === "all" || incident.severity === severityFilter;
    const matchesStatus = statusFilter === "all" || incident.status === statusFilter;

    return matchesSearch && matchesType && matchesSeverity && matchesStatus;
  });

  const stats = {
    total: incidents.length,
    open: incidents.filter(i => i.status !== 'closed').length,
    critical: incidents.filter(i => i.severity === 'critical').length,
    thisMonth: incidents.filter(i => {
      const incidentDate = new Date(i.incident_date);
      const now = new Date();
      return incidentDate.getMonth() === now.getMonth() && incidentDate.getFullYear() === now.getFullYear();
    }).length,
  };

  const severityConfig = {
    minor: { color: "bg-blue-100 text-blue-700", label: "Minor", icon: AlertCircle },
    moderate: { color: "bg-yellow-100 text-yellow-700", label: "Moderate", icon: AlertTriangle },
    serious: { color: "bg-orange-100 text-orange-700", label: "Serious", icon: AlertTriangle },
    critical: { color: "bg-red-100 text-red-700", label: "Critical", icon: XCircle },
  };

  const statusConfig = {
    reported: { color: "bg-slate-100 text-slate-700", label: "Reported" },
    under_investigation: { color: "bg-blue-100 text-blue-700", label: "Investigating" },
    action_taken: { color: "bg-purple-100 text-purple-700", label: "Action Taken" },
    resolved: { color: "bg-green-100 text-green-700", label: "Resolved" },
    closed: { color: "bg-slate-100 text-slate-500", label: "Closed" },
  };

  const typeConfig = {
    fall: { label: "Fall", icon: "🤕" },
    medication_error: { label: "Medication Error", icon: "💊" },
    injury: { label: "Injury", icon: "🩹" },
    abuse_allegation: { label: "Abuse Allegation", icon: "⚠️" },
    complaint: { label: "Complaint", icon: "📝" },
    equipment_failure: { label: "Equipment Failure", icon: "🔧" },
    security_breach: { label: "Security Breach", icon: "🔒" },
    other: { label: "Other", icon: "📋" },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            Incident Reporting
          </h1>
          <p className="text-slate-500 mt-1">
            {filteredIncidents.length} incident{filteredIncidents.length !== 1 ? 's' : ''} • {stats.open} open
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingIncident(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Report Incident
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Incidents</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Open Cases</p>
                <p className="text-2xl font-bold text-orange-600">{stats.open}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Critical</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">This Month</p>
                <p className="text-2xl font-bold text-blue-600">{stats.thisMonth}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
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
                placeholder="Search incidents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(typeConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.icon} {config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full md:w-48 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="serious">Serious</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="reported">Reported</SelectItem>
                <SelectItem value="under_investigation">Investigating</SelectItem>
                <SelectItem value="action_taken">Action Taken</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Incident Form */}
      {showForm && (
        <IncidentForm
          incident={editingIncident}
          clients={clients}
          caregivers={caregivers}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingIncident(null);
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {/* Incident Details */}
      {selectedIncident && !showForm && (
        <IncidentDetails
          incident={selectedIncident}
          clients={clients}
          caregivers={caregivers}
          onClose={() => setSelectedIncident(null)}
          onEdit={(incident) => {
            setEditingIncident(incident);
            setShowForm(true);
          }}
        />
      )}

      {/* Incidents List */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-4 bg-slate-200 rounded" />
                <div className="h-4 bg-slate-200 rounded w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredIncidents.length === 0 ? (
        <Card className="border-none shadow-lg">
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No incidents found</h3>
            <p className="text-slate-500 mb-6">
              {searchTerm || typeFilter !== "all" ? "Try adjusting your filters" : "No incidents have been reported"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIncidents.map((incident) => {
            const severity = severityConfig[incident.severity] || severityConfig.minor;
            const status = statusConfig[incident.status] || statusConfig.reported;
            const type = typeConfig[incident.incident_type] || typeConfig.other;
            const client = clients.find(c => c.id === incident.client_id);
            const caregiver = caregivers.find(c => c.id === incident.caregiver_id);
            const SeverityIcon = severity.icon;

            return (
              <Card 
                key={incident.id}
                className="border-none shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedIncident(incident)}
              >
                <CardHeader className="border-b border-slate-100">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={severity.color}>
                      <SeverityIcon className="w-3 h-3 mr-1" />
                      {severity.label}
                    </Badge>
                    <Badge className={status.color}>
                      {status.label}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                  </CardTitle>
                  <p className="text-sm text-slate-500">
                    #{incident.incident_number || incident.id.slice(0, 8)}
                  </p>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {format(new Date(incident.incident_date), 'MMM d, yyyy h:mm a')}
                  </div>
                  {client && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <User className="w-4 h-4 text-slate-400" />
                      {client.first_name} {client.last_name}
                    </div>
                  )}
                  <p className="text-sm text-slate-700 line-clamp-2">
                    {incident.description}
                  </p>
                  {incident.medical_attention_required && (
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      Medical Attention Required
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}