import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Pill, 
  Plus,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  User,
  FileText,
  Bell,
  Activity
} from "lucide-react";
import { format, isToday, parseISO } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MedicationForm from "../components/medications/MedicationForm";
import MedicationDetails from "../components/medications/MedicationDetails";
import MedicationCard from "../components/medications/MedicationCard";
import UpcomingDoses from "../components/medications/UpcomingDoses";

export default function Medications() {
  const [searchTerm, setSearchTerm] = useState("");
  const [clientFilter, setClientFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [showForm, setShowForm] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [editingMedication, setEditingMedication] = useState(null);
  const queryClient = useQueryClient();

  const { data: medications = [], isLoading } = useQuery({
    queryKey: ['medications'],
    queryFn: () => base44.entities.MedicationSchedule.list('-created_date'),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MedicationSchedule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['medications']);
      setShowForm(false);
      setEditingMedication(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MedicationSchedule.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['medications']);
      setShowForm(false);
      setEditingMedication(null);
      setSelectedMedication(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MedicationSchedule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['medications']);
      setSelectedMedication(null);
    },
  });

  const handleSubmit = (data) => {
    if (editingMedication) {
      updateMutation.mutate({ id: editingMedication.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getClient = (clientId) => clients.find(c => c.id === clientId);

  // Filter medications
  const filteredMedications = medications.filter(med => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      med.medication_name?.toLowerCase().includes(searchLower) ||
      med.purpose?.toLowerCase().includes(searchLower) ||
      med.prescribing_doctor?.toLowerCase().includes(searchLower);

    const matchesClient = clientFilter === "all" || med.client_id === clientFilter;
    const matchesStatus = statusFilter === "all" || med.status === statusFilter;

    return matchesSearch && matchesClient && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: medications.length,
    active: medications.filter(m => m.status === 'active').length,
    discontinued: medications.filter(m => m.status === 'discontinued').length,
    paused: medications.filter(m => m.status === 'paused').length,
  };

  // Get upcoming doses for today
  const upcomingToday = medications.filter(med => {
    if (med.status !== 'active') return false;
    if (!med.schedule_times || med.schedule_times.length === 0) return false;
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    return med.schedule_times.some(time => time > currentTime);
  });

  // Group by client
  const medicationsByClient = filteredMedications.reduce((acc, med) => {
    const clientId = med.client_id;
    if (!acc[clientId]) acc[clientId] = [];
    acc[clientId].push(med);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Pill className="w-6 h-6 text-white" />
            </div>
            Medication Management
          </h1>
          <p className="text-slate-500 mt-1">
            {filteredMedications.length} medication schedule{filteredMedications.length !== 1 ? 's' : ''} • {upcomingToday.length} doses pending today
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingMedication(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Medication
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Medications</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Pill className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
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
                <p className="text-sm text-slate-500 mb-1">Pending Today</p>
                <p className="text-2xl font-bold text-orange-600">{upcomingToday.length}</p>
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
                <p className="text-sm text-slate-500 mb-1">Discontinued</p>
                <p className="text-2xl font-bold text-slate-600">{stats.discontinued}</p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-slate-600" />
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
                placeholder="Search medications by name, purpose, or doctor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-full md:w-64 h-12">
                <User className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {clients.filter(c => c.status === 'active').map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.first_name} {client.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 h-12">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Doses Today */}
      {upcomingToday.length > 0 && (
        <UpcomingDoses medications={upcomingToday} clients={clients} />
      )}

      {/* Medication Form */}
      {showForm && (
        <MedicationForm
          medication={editingMedication}
          clients={clients}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingMedication(null);
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {/* Medication Details */}
      {selectedMedication && !showForm && (
        <MedicationDetails
          medication={selectedMedication}
          client={getClient(selectedMedication.client_id)}
          onClose={() => setSelectedMedication(null)}
          onEdit={(med) => {
            setEditingMedication(med);
            setShowForm(true);
          }}
          onDelete={(id) => {
            if (confirm('Are you sure you want to delete this medication?')) {
              deleteMutation.mutate(id);
            }
          }}
        />
      )}

      {/* Medications List Grouped by Client */}
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
      ) : filteredMedications.length === 0 ? (
        <Card className="border-none shadow-lg">
          <CardContent className="p-12 text-center">
            <Pill className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No medications found</h3>
            <p className="text-slate-500 mb-6">
              {searchTerm || clientFilter !== "all" ? "Try adjusting your filters" : "Get started by adding medication schedules for your clients"}
            </p>
            {!searchTerm && clientFilter === "all" && (
              <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-purple-500 to-pink-600">
                <Plus className="w-4 h-4 mr-2" />
                Add First Medication
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(medicationsByClient).map(([clientId, meds]) => {
            const client = getClient(clientId);
            return (
              <div key={clientId}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {client ? `${client.first_name} ${client.last_name}` : 'Unknown Client'}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {meds.length} medication{meds.length !== 1 ? 's' : ''} • {meds.filter(m => m.status === 'active').length} active
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {meds.map(med => (
                    <MedicationCard
                      key={med.id}
                      medication={med}
                      client={client}
                      onClick={() => setSelectedMedication(med)}
                      onEdit={() => {
                        setEditingMedication(med);
                        setShowForm(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}