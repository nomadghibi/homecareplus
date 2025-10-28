import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  UserCheck, 
  Phone, 
  Mail, 
  Calendar,
  Award,
  Edit,
  MapPin,
  DollarSign,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import CaregiverForm from "../components/caregivers/CaregiverForm";
import CaregiverDetails from "../components/caregivers/CaregiverDetails";

export default function Caregivers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const [editingCaregiver, setEditingCaregiver] = useState(null);
  const queryClient = useQueryClient();

  const { data: caregivers = [], isLoading } = useQuery({
    queryKey: ['caregivers'],
    queryFn: () => base44.entities.Caregiver.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Caregiver.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['caregivers']);
      setShowForm(false);
      setEditingCaregiver(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Caregiver.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['caregivers']);
      setShowForm(false);
      setEditingCaregiver(null);
      setSelectedCaregiver(null);
    },
  });

  const handleSubmit = (data) => {
    if (editingCaregiver) {
      updateMutation.mutate({ id: editingCaregiver.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredCaregivers = caregivers.filter(caregiver => {
    const searchLower = searchTerm.toLowerCase();
    return (
      caregiver.first_name?.toLowerCase().includes(searchLower) ||
      caregiver.last_name?.toLowerCase().includes(searchLower) ||
      caregiver.email?.toLowerCase().includes(searchLower) ||
      caregiver.employee_id?.toLowerCase().includes(searchLower)
    );
  });

  const statusConfig = {
    active: { color: "bg-green-100 text-green-700 border-green-200", label: "Active" },
    inactive: { color: "bg-slate-100 text-slate-700 border-slate-200", label: "Inactive" },
    on_leave: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "On Leave" },
  };

  const isLicenseExpiring = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            Caregiver Management
          </h1>
          <p className="text-slate-500 mt-1">
            {filteredCaregivers.length} caregiver{filteredCaregivers.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingCaregiver(null);
            setShowForm(true);
            setSelectedCaregiver(null);
          }}
          className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Caregiver
        </Button>
      </div>

      <Card className="border-none shadow-md">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search caregivers by name, email, or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <CaregiverForm
          caregiver={editingCaregiver}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingCaregiver(null);
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {selectedCaregiver && !showForm && (
        <CaregiverDetails
          caregiver={selectedCaregiver}
          onClose={() => setSelectedCaregiver(null)}
          onEdit={(caregiver) => {
            setEditingCaregiver(caregiver);
            setShowForm(true);
          }}
        />
      )}

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
      ) : filteredCaregivers.length === 0 ? (
        <Card className="border-none shadow-lg">
          <CardContent className="p-12 text-center">
            <UserCheck className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No caregivers found</h3>
            <p className="text-slate-500 mb-6">
              {searchTerm ? "Try adjusting your search" : "Get started by adding your first caregiver"}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-purple-500 to-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Caregiver
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCaregivers.map((caregiver) => {
            const status = statusConfig[caregiver.status] || statusConfig.active;
            const licenseExpiring = isLicenseExpiring(caregiver.license_expiry);

            return (
              <Card 
                key={caregiver.id} 
                className="border-none shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedCaregiver(caregiver)}
              >
                <CardHeader className="border-b border-slate-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 group-hover:text-purple-600 transition-colors">
                        {caregiver.first_name} {caregiver.last_name}
                      </CardTitle>
                      <div className="flex gap-2 flex-wrap">
                        <Badge className={`${status.color} border`}>
                          {status.label}
                        </Badge>
                        {licenseExpiring && (
                          <Badge className="bg-red-100 text-red-700 border-red-200">
                            License Expiring
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCaregiver(caregiver);
                        setShowForm(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Award className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{caregiver.employee_id}</span>
                  </div>
                  {caregiver.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      {caregiver.phone}
                    </div>
                  )}
                  {caregiver.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{caregiver.email}</span>
                    </div>
                  )}
                  {caregiver.certifications && caregiver.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {caregiver.certifications.slice(0, 3).map((cert, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {caregiver.hourly_rate && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-sm text-slate-500 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        Hourly Rate
                      </span>
                      <span className="font-semibold text-slate-900">${caregiver.hourly_rate}/hr</span>
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