import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  Map,
  Smartphone
} from "lucide-react";
import { format } from "date-fns";
import EVVEventDetails from "../components/evv/EVVEventDetails";

export default function EVV() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const { data: evvEvents = [], isLoading } = useQuery({
    queryKey: ['evvEvents'],
    queryFn: () => base44.entities.EVVEvent.list('-created_date'),
  });

  const { data: visits = [] } = useQuery({
    queryKey: ['visits'],
    queryFn: () => base44.entities.Visit.list(),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
  });

  const { data: caregivers = [] } = useQuery({
    queryKey: ['caregivers'],
    queryFn: () => base44.entities.Caregiver.list(),
  });

  const getVisit = (visitId) => visits.find(v => v.id === visitId);
  const getClient = (clientId) => clients.find(c => c.id === clientId);
  const getCaregiver = (caregiverId) => caregivers.find(c => c.id === caregiverId);

  const statusConfig = {
    valid: { 
      icon: CheckCircle2, 
      color: "bg-green-100 text-green-700 border-green-200", 
      label: "Valid" 
    },
    valid_with_attestation: { 
      icon: CheckCircle2, 
      color: "bg-blue-100 text-blue-700 border-blue-200", 
      label: "Valid (Attested)" 
    },
    pending: { 
      icon: Clock, 
      color: "bg-yellow-100 text-yellow-700 border-yellow-200", 
      label: "Pending Review" 
    },
    rejected: { 
      icon: XCircle, 
      color: "bg-red-100 text-red-700 border-red-200", 
      label: "Rejected" 
    },
  };

  const filteredEvents = evvEvents.filter(event => {
    const caregiver = getCaregiver(event.caregiver_id);
    const client = getClient(event.client_id);
    const searchLower = searchTerm.toLowerCase();
    
    return (
      caregiver?.first_name?.toLowerCase().includes(searchLower) ||
      caregiver?.last_name?.toLowerCase().includes(searchLower) ||
      client?.first_name?.toLowerCase().includes(searchLower) ||
      client?.last_name?.toLowerCase().includes(searchLower)
    );
  });

  const stats = {
    valid: evvEvents.filter(e => e.verification_status === 'valid').length,
    attested: evvEvents.filter(e => e.verification_status === 'valid_with_attestation').length,
    pending: evvEvents.filter(e => e.verification_status === 'pending').length,
    rejected: evvEvents.filter(e => e.verification_status === 'rejected').length,
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-green-600 rounded-xl flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          EVV Tracking
        </h1>
        <p className="text-slate-500 mt-1">
          Electronic Visit Verification monitoring and management
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Verified</p>
                <p className="text-2xl font-bold text-green-600">{stats.valid}</p>
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
                <p className="text-sm text-slate-500 mb-1">Attested</p>
                <p className="text-2xl font-bold text-blue-600">{stats.attested}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-none shadow-md">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search by caregiver or client name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </CardContent>
      </Card>

      {/* EVV Events List */}
      <Card className="border-none shadow-lg">
        <CardHeader className="border-b">
          <CardTitle>Recent EVV Events</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500">
                Loading EVV events...
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <MapPin className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No EVV events found</p>
              </div>
            ) : (
              filteredEvents.map((event) => {
                const caregiver = getCaregiver(event.caregiver_id);
                const client = getClient(event.client_id);
                const status = statusConfig[event.verification_status] || statusConfig.pending;
                const StatusIcon = status.icon;

                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-slate-900">
                            {caregiver ? `${caregiver.first_name} ${caregiver.last_name}` : 'Unknown Caregiver'}
                          </h4>
                          <Badge className={`${status.color} border flex items-center gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {event.event_type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            Client: {client ? `${client.first_name} ${client.last_name}` : 'Unknown'}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            {format(new Date(event.timestamp), 'MMM d, yyyy h:mm a')}
                          </div>
                          {event.verification_method && (
                            <div className="flex items-center gap-2">
                              <Smartphone className="w-4 h-4 text-slate-400" />
                              Method: {event.verification_method.toUpperCase()}
                            </div>
                          )}
                          {event.distance_from_client !== undefined && (
                            <div className="flex items-center gap-2">
                              <Map className="w-4 h-4 text-slate-400" />
                              Distance: {event.distance_from_client}m from client
                            </div>
                          )}
                        </div>
                        {event.integrity_flags && event.integrity_flags.length > 0 && (
                          <div className="mt-2 flex gap-2">
                            {event.integrity_flags.map((flag, idx) => (
                              <Badge key={idx} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                {flag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* EVV Event Details Modal */}
      {selectedEvent && (
        <EVVEventDetails
          event={selectedEvent}
          visit={getVisit(selectedEvent.visit_id)}
          client={getClient(selectedEvent.client_id)}
          caregiver={getCaregiver(selectedEvent.caregiver_id)}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}