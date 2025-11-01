
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Users,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Edit,
  Heart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ClientForm from "../components/clients/ClientForm";
import ClientDetails from "../components/clients/ClientDetails";
import { withResourceLimitCheck } from "@/utils/resourceLimits";

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      // Check resource limits before creating client
      return await withResourceLimitCheck('clients', async () => {
        return await base44.entities.Client.create(data);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['clients']);
      setShowForm(false);
      setEditingClient(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Client.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['clients']);
      setShowForm(false);
      setEditingClient(null);
      setSelectedClient(null);
    },
  });

  const handleSubmit = (data) => {
    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.first_name?.toLowerCase().includes(searchLower) ||
      client.last_name?.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.phone?.includes(searchTerm)
    );
  });

  const statusConfig = {
    active: { color: "bg-green-100 text-green-700 border-green-200", label: "Active" },
    inactive: { color: "bg-slate-100 text-slate-700 border-slate-200", label: "Inactive" },
    pending: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Pending" },
  };

  const careLevelConfig = {
    basic: { color: "bg-blue-100 text-blue-700", label: "Basic" },
    moderate: { color: "bg-orange-100 text-orange-700", label: "Moderate" },
    intensive: { color: "bg-red-100 text-red-700", label: "Intensive" },
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <span className="hidden sm:inline">Client Management</span>
            <span className="sm:hidden">Clients</span>
          </h1>
          <p className="text-slate-500 mt-1 text-sm lg:text-base">
            {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingClient(null);
            setShowForm(true);
            setSelectedClient(null);
          }}
          className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Search */}
      <Card className="border-none shadow-md">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </CardContent>
      </Card>

      {/* Client Form Modal */}
      {showForm && (
        <ClientForm
          client={editingClient}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingClient(null);
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {/* Client Details Modal */}
      {selectedClient && !showForm && (
        <ClientDetails
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onEdit={(client) => {
            setEditingClient(client);
            setShowForm(true);
          }}
        />
      )}

      {/* Client Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
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
      ) : filteredClients.length === 0 ? (
        <Card className="border-none shadow-lg">
          <CardContent className="p-12 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No clients found</h3>
            <p className="text-slate-500 mb-6">
              {searchTerm ? "Try adjusting your search" : "Get started by adding your first client"}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-teal-500 to-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Client
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {filteredClients.map((client) => {
            const status = statusConfig[client.status] || statusConfig.active;
            const careLevel = careLevelConfig[client.care_level];

            return (
              <Card 
                key={client.id} 
                className="border-none shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedClient(client)}
              >
                <CardHeader className="border-b border-slate-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 group-hover:text-teal-600 transition-colors">
                        {client.first_name} {client.last_name}
                      </CardTitle>
                      <div className="flex gap-2 flex-wrap">
                        <Badge className={`${status.color} border`}>
                          {status.label}
                        </Badge>
                        {careLevel && (
                          <Badge className={careLevel.color}>
                            {careLevel.label} Care
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingClient(client);
                        setShowForm(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      {client.phone}
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {client.email}
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                      <span className="line-clamp-2">
                        {client.address}, {client.city}, {client.state} {client.zip_code}
                      </span>
                    </div>
                  )}
                  {client.primary_diagnosis && (
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <FileText className="w-4 h-4 text-slate-400 mt-0.5" />
                      <span className="line-clamp-1">{client.primary_diagnosis}</span>
                    </div>
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
