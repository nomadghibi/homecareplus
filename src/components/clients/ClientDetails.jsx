import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Edit, Phone, Mail, MapPin, Calendar, FileText, Heart, User, Shield, Upload, Eye, Download } from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import DocumentUpload from "../documents/DocumentUpload";

export default function ClientDetails({ client, onClose, onEdit }) {
  const [showUpload, setShowUpload] = useState(false);

  // Fetch client's documents
  const { data: allDocuments = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list('-created_date'),
  });

  const clientDocuments = allDocuments.filter(doc => 
    doc.entity_type === 'client' && doc.entity_id === client.id
  );

  const statusConfig = {
    active: { color: "bg-green-100 text-green-700 border-green-200", label: "Active" },
    inactive: { color: "bg-slate-100 text-slate-700 border-slate-200", label: "Inactive" },
    pending: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Pending" },
  };

  const careLevelConfig = {
    basic: { color: "bg-blue-100 text-blue-700", label: "Basic Care" },
    moderate: { color: "bg-orange-100 text-orange-700", label: "Moderate Care" },
    intensive: { color: "bg-red-100 text-red-700", label: "Intensive Care" },
  };

  const status = statusConfig[client.status] || statusConfig.active;
  const careLevel = careLevelConfig[client.care_level];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{client.first_name} {client.last_name}</CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge className={`${status.color} border`}>
                  {status.label}
                </Badge>
                {careLevel && (
                  <Badge className={careLevel.color}>
                    {careLevel.label}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onEdit(client)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Contact Information */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-teal-600" />
              Contact Information
            </h3>
            <div className="space-y-3">
              {client.phone && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Phone className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="font-medium">{client.phone}</p>
                  </div>
                </div>
              )}
              {client.email && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Mail className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-medium">{client.email}</p>
                  </div>
                </div>
              )}
              {client.date_of_birth && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-500">Date of Birth</p>
                    <p className="font-medium">{format(new Date(client.date_of_birth), 'MMMM d, yyyy')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          {client.address && (
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-600" />
                Address
              </h3>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="font-medium">{client.address}</p>
                <p className="text-slate-600">{client.city}, {client.state} {client.zip_code}</p>
              </div>
            </div>
          )}

          {/* Emergency Contact */}
          {(client.emergency_contact_name || client.emergency_contact_phone) && (
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-red-600" />
                Emergency Contact
              </h3>
              <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                {client.emergency_contact_name && (
                  <p className="font-medium mb-1">{client.emergency_contact_name}</p>
                )}
                {client.emergency_contact_phone && (
                  <p className="text-slate-600">{client.emergency_contact_phone}</p>
                )}
              </div>
            </div>
          )}

          {/* Medical Information */}
          {client.primary_diagnosis && (
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-600" />
                Medical Information
              </h3>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Primary Diagnosis</p>
                <p className="font-medium">{client.primary_diagnosis}</p>
              </div>
            </div>
          )}

          {/* Insurance */}
          {(client.insurance_provider || client.insurance_id) && (
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Insurance Information
              </h3>
              <div className="space-y-3">
                {client.insurance_provider && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Provider</p>
                    <p className="font-medium">{client.insurance_provider}</p>
                  </div>
                )}
                {client.insurance_id && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Insurance ID</p>
                    <p className="font-medium">{client.insurance_id}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Documents Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                Documents
                <Badge variant="outline">{clientDocuments.length}</Badge>
              </h3>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowUpload(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>

            {clientDocuments.length === 0 ? (
              <div className="p-8 bg-slate-50 rounded-lg text-center">
                <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="text-sm text-slate-500">No documents uploaded yet</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-3"
                  onClick={() => setShowUpload(true)}
                >
                  Upload First Document
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {clientDocuments.slice(0, 5).map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{doc.title}</p>
                        <p className="text-xs text-slate-500">{doc.category.replace(/_/g, ' ')}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => window.open(doc.file_url, '_blank')}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => window.open(doc.file_url, '_blank')}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {clientDocuments.length > 5 && (
                  <p className="text-sm text-center text-slate-500 pt-2">
                    +{clientDocuments.length - 5} more documents
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          {client.notes && (
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                Additional Notes
              </h3>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-slate-700 whitespace-pre-wrap">{client.notes}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      {showUpload && (
        <DocumentUpload
          onClose={() => setShowUpload(false)}
          clients={[client]}
          caregivers={[]}
          preselectedEntity={{ type: 'client', id: client.id }}
        />
      )}
    </div>
  );
}