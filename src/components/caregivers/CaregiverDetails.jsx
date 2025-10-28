import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Edit, Phone, Mail, MapPin, Calendar, Award, DollarSign, Clock, FileText, Upload, Eye, Download } from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import DocumentUpload from "../documents/DocumentUpload";

export default function CaregiverDetails({ caregiver, onClose, onEdit }) {
  const [showUpload, setShowUpload] = useState(false);

  // Fetch caregiver's documents
  const { data: allDocuments = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list('-created_date'),
  });

  const caregiverDocuments = allDocuments.filter(doc => 
    doc.entity_type === 'caregiver' && doc.entity_id === caregiver.id
  );

  const statusConfig = {
    active: { color: "bg-green-100 text-green-700 border-green-200", label: "Active" },
    inactive: { color: "bg-slate-100 text-slate-700 border-slate-200", label: "Inactive" },
    on_leave: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "On Leave" },
  };

  const status = statusConfig[caregiver.status] || statusConfig.active;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{caregiver.first_name} {caregiver.last_name}</CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge className={`${status.color} border`}>
                  {status.label}
                </Badge>
                <Badge variant="outline">{caregiver.employee_id}</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onEdit(caregiver)}>
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
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-purple-600" />
              Contact Information
            </h3>
            <div className="space-y-3">
              {caregiver.phone && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Phone className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="font-medium">{caregiver.phone}</p>
                  </div>
                </div>
              )}
              {caregiver.email && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Mail className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-medium">{caregiver.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {caregiver.address && (
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                Address
              </h3>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="font-medium">{caregiver.address}</p>
                <p className="text-slate-600">{caregiver.city}, {caregiver.state} {caregiver.zip_code}</p>
              </div>
            </div>
          )}

          {(caregiver.certifications?.length > 0 || caregiver.specializations?.length > 0) && (
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                Certifications & Specializations
              </h3>
              <div className="space-y-3">
                {caregiver.certifications?.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500 mb-2">Certifications</p>
                    <div className="flex flex-wrap gap-2">
                      {caregiver.certifications.map((cert, idx) => (
                        <Badge key={idx} className="bg-blue-100 text-blue-700">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {caregiver.specializations?.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500 mb-2">Specializations</p>
                    <div className="flex flex-wrap gap-2">
                      {caregiver.specializations.map((spec, idx) => (
                        <Badge key={idx} className="bg-purple-100 text-purple-700">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Employment Details
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {caregiver.license_number && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">License Number</p>
                  <p className="font-medium">{caregiver.license_number}</p>
                </div>
              )}
              {caregiver.license_expiry && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">License Expiry</p>
                  <p className="font-medium">{format(new Date(caregiver.license_expiry), 'MMM d, yyyy')}</p>
                </div>
              )}
              {caregiver.hire_date && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Hire Date</p>
                  <p className="font-medium">{format(new Date(caregiver.hire_date), 'MMM d, yyyy')}</p>
                </div>
              )}
              {caregiver.hourly_rate && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Hourly Rate
                  </p>
                  <p className="font-medium">${caregiver.hourly_rate}/hr</p>
                </div>
              )}
              {caregiver.max_hours_per_week && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Max Hours Per Week
                  </p>
                  <p className="font-medium">{caregiver.max_hours_per_week} hours</p>
                </div>
              )}
            </div>
          </div>

          {/* Documents Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                Documents
                <Badge variant="outline">{caregiverDocuments.length}</Badge>
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

            {caregiverDocuments.length === 0 ? (
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
                {caregiverDocuments.slice(0, 5).map(doc => (
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
                {caregiverDocuments.length > 5 && (
                  <p className="text-sm text-center text-slate-500 pt-2">
                    +{caregiverDocuments.length - 5} more documents
                  </p>
                )}
              </div>
            )}
          </div>

          {caregiver.notes && (
            <div>
              <h3 className="font-semibold text-lg mb-4">Additional Notes</h3>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-slate-700 whitespace-pre-wrap">{caregiver.notes}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      {showUpload && (
        <DocumentUpload
          onClose={() => setShowUpload(false)}
          clients={[]}
          caregivers={[caregiver]}
          preselectedEntity={{ type: 'caregiver', id: caregiver.id }}
        />
      )}
    </div>
  );
}