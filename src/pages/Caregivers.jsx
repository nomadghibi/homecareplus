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
  Clock,
  Send,
  Copy
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";
import CaregiverForm from "../components/caregivers/CaregiverForm";
import CaregiverDetails from "../components/caregivers/CaregiverDetails";
import { withResourceLimitCheck } from "@/utils/resourceLimits";

export default function Caregivers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const [editingCaregiver, setEditingCaregiver] = useState(null);
  const queryClient = useQueryClient();

  const { data: caregivers = [], isLoading } = useQuery({
    queryKey: ['caregivers'],
    queryFn: () => base44.entities.Caregiver.list('-created_at'),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      // Check resource limits before creating caregiver
      return await withResourceLimitCheck('caregivers', async () => {
        return await base44.entities.Caregiver.create(data);
      });
    },
    onSuccess: (newCaregiver) => {
      console.log('Caregiver created successfully:', newCaregiver);
      queryClient.invalidateQueries(['caregivers']);
      setShowForm(false);
      setEditingCaregiver(null);

      // Automatically create portal invitation for new caregiver
      if (newCaregiver && newCaregiver.email) {
        console.log('Creating invitation for:', newCaregiver.email);
        const inviteUrl = createInvitation(newCaregiver, false);

        // Show success message first
        toast.success('Caregiver added successfully!', {
          description: `${newCaregiver.first_name} ${newCaregiver.last_name} has been added to your team`,
          duration: 3000
        });

        // Then show the invitation link with prominent action button
        setTimeout(() => {
          toast.info('Portal Invitation Created', {
            description: `Send this link to ${newCaregiver.first_name} to set up their portal account`,
            action: {
              label: 'Copy Invite Link',
              onClick: () => {
                navigator.clipboard.writeText(inviteUrl).then(() => {
                  toast.success('Invitation link copied to clipboard!', {
                    description: `Share this with ${newCaregiver.first_name} via email, text, or any messaging app`,
                    duration: 5000
                  });
                }).catch(() => {
                  toast.error('Failed to copy link', {
                    description: 'Please copy the link from the console below',
                    duration: 5000
                  });
                });
              }
            },
            duration: 15000, // Show for 15 seconds
            important: true
          });
        }, 500);

        // Also log the invitation URL to console for easy access
        console.log('='.repeat(60));
        console.log('PORTAL INVITATION CREATED');
        console.log('Caregiver:', `${newCaregiver.first_name} ${newCaregiver.last_name}`);
        console.log('Email:', newCaregiver.email);
        console.log('Invitation URL:', inviteUrl);
        console.log('='.repeat(60));
      } else {
        console.log('No email found on caregiver, skipping invitation');
        toast.success('Caregiver added successfully!');
      }
    },
    onError: (error) => {
      console.error('Create caregiver error:', error);
      if (error.message.includes('duplicate key') || error.message.includes('Duplicate entry')) {
        toast.error('Email already exists', {
          description: 'A caregiver with this email address already exists in the system.'
        });
      } else {
        toast.error('Failed to add caregiver', {
          description: error.message || 'Please try again.'
        });
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Caregiver.update(id, data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries(['caregivers']);

      // Sync status changes to caregiver user registry
      if (variables.data.status) {
        const caregiverUsers = JSON.parse(localStorage.getItem('caregiverUsers') || '[]');
        const userIndex = caregiverUsers.findIndex(user => user.id === variables.id);

        if (userIndex !== -1) {
          caregiverUsers[userIndex].status = variables.data.status;
          localStorage.setItem('caregiverUsers', JSON.stringify(caregiverUsers));

          // If the caregiver is currently logged in and was set to inactive, log them out
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          if (currentUser.id === variables.id && variables.data.status === 'inactive') {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isAuthenticated');
            toast.info('Caregiver has been logged out due to status change');
          }
        }
      }

      setShowForm(false);
      setEditingCaregiver(null);
      setSelectedCaregiver(null);
      toast.success('Caregiver updated successfully!');
    },
    onError: (error) => {
      console.error('Update caregiver error:', error);
      if (error.message.includes('duplicate key') || error.message.includes('Duplicate entry')) {
        toast.error('Email already exists', {
          description: 'A caregiver with this email address already exists in the system.'
        });
      } else {
        toast.error('Failed to update caregiver', {
          description: error.message || 'Please try again.'
        });
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Caregiver.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['caregivers']);
      setSelectedCaregiver(null);
      toast.success('Caregiver deleted successfully');
    },
    onError: (error) => {
      console.error('Delete caregiver error:', error);
      toast.error('Failed to delete caregiver', {
        description: error.message || 'Please try again.'
      });
    }
  });

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  const handleSubmit = (data) => {
    console.log('Submitting caregiver data:', data);

    // Clean up the data - remove any undefined/null values and ensure proper format
    const cleanData = {
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      email: data.email || '',
      phone: data.phone || '',
      status: data.status || 'active',
      certifications: data.certifications || [],
      skills: data.skills || [],
      license_number: data.license_number || '',
      license_expiry: data.license_expiry || null,
      hire_date: data.hire_date || new Date().toISOString().split('T')[0],
      hourly_rate: data.hourly_rate ? parseFloat(data.hourly_rate) : null,
      max_hours_per_week: data.max_hours_per_week ? parseInt(data.max_hours_per_week) : 40,
      employment_type: data.employment_type || 'Full-time',
      address: data.address || '',
      city: data.city || '',
      state: data.state || '',
      zip_code: data.zip_code || '',
      notes: data.notes || ''
    };

    console.log('Cleaned caregiver data:', cleanData);

    if (editingCaregiver) {
      updateMutation.mutate({ id: editingCaregiver.id, data: cleanData });
    } else {
      createMutation.mutate(cleanData);
    }
  };

  const createInvitation = (caregiver, showToast = true) => {
    // Generate invitation token
    const token = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    // Get current agency info
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const agencyName = currentUser.organizationName || currentUser.agencyName || 'Your Agency';

    // Create invitation
    const invitation = {
      token,
      email: caregiver.email,
      caregiverId: caregiver.id,
      firstName: caregiver.first_name,
      lastName: caregiver.last_name,
      phone: caregiver.phone,
      status: caregiver.status,
      agencyId: currentUser.id,
      agencyName,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString()
    };

    // Store invitation
    const pendingInvites = JSON.parse(localStorage.getItem('pendingCaregiverInvites') || '[]');
    pendingInvites.push(invitation);
    localStorage.setItem('pendingCaregiverInvites', JSON.stringify(pendingInvites));

    // Generate invitation URL
    const inviteUrl = `${window.location.origin}${createPageUrl('CaregiverSetup')}?token=${token}&email=${encodeURIComponent(caregiver.email)}`;

    // In production, you would also send an email here
    console.log('Invitation created:', invitation);
    console.log('Invitation URL:', inviteUrl);

    if (showToast) {
      // Copy to clipboard
      navigator.clipboard.writeText(inviteUrl).then(() => {
        toast.success('Invitation link copied!', {
          description: `Share this link with ${caregiver.first_name} to set up their account`,
          action: {
            label: 'View Link',
            onClick: () => {
              toast.info('Invitation Link', {
                description: inviteUrl,
                duration: 10000
              });
            }
          }
        });
      }).catch(() => {
        toast.success('Invitation created!', {
          description: inviteUrl,
          duration: 10000
        });
      });
    }

    return inviteUrl;
  };

  const handleSendInvite = (caregiver, e) => {
    e.stopPropagation();
    createInvitation(caregiver, true);
  };

  const filteredCaregivers = caregivers.filter(caregiver => {
    const searchLower = searchTerm.toLowerCase();
    return (
      caregiver.first_name?.toLowerCase().includes(searchLower) ||
      caregiver.last_name?.toLowerCase().includes(searchLower) ||
      caregiver.email?.toLowerCase().includes(searchLower) ||
      caregiver.phone?.toLowerCase().includes(searchLower)
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
              placeholder="Search caregivers by name, email, or phone..."
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
          onDelete={handleDelete}
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
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleSendInvite(caregiver, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Send portal invitation"
                      >
                        <Send className="w-4 h-4 text-purple-600" />
                      </Button>
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
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
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