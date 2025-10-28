import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Download, 
  Share2,
  Calendar,
  User,
  FileText,
  Tag,
  Clock
} from "lucide-react";
import { format } from "date-fns";

export default function DocumentViewer({ document, clients, caregivers, onClose }) {
  const getEntityName = () => {
    if (document.entity_type === 'client') {
      const client = clients.find(c => c.id === document.entity_id);
      return client ? `${client.first_name} ${client.last_name}` : 'Unknown Client';
    }
    if (document.entity_type === 'caregiver') {
      const caregiver = caregivers.find(c => c.id === document.entity_id);
      return caregiver ? `${caregiver.first_name} ${caregiver.last_name}` : 'Unknown Caregiver';
    }
    return document.entity_type.charAt(0).toUpperCase() + document.entity_type.slice(1);
  };

  const isImage = document.file_type?.startsWith('image/');
  const isPDF = document.file_type === 'application/pdf';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{document.title}</CardTitle>
              <p className="text-sm text-slate-500 mt-1">Version {document.version}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                onClick={() => window.open(document.file_url, '_blank')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <div className="flex-1 overflow-auto">
          <div className="grid lg:grid-cols-3 gap-6 p-6">
            {/* Preview */}
            <div className="lg:col-span-2">
              <div className="bg-slate-50 rounded-xl p-4 min-h-[500px] flex items-center justify-center">
                {isImage ? (
                  <img 
                    src={document.file_url} 
                    alt={document.title}
                    className="max-w-full max-h-[600px] object-contain rounded-lg shadow-lg"
                  />
                ) : isPDF ? (
                  <iframe
                    src={document.file_url}
                    className="w-full h-[600px] rounded-lg shadow-lg"
                    title={document.title}
                  />
                ) : (
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">Preview not available</p>
                    <Button onClick={() => window.open(document.file_url, '_blank')}>
                      <Download className="w-4 h-4 mr-2" />
                      Download to View
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-4">Document Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Category</p>
                    <Badge variant="outline">{document.category.replace(/_/g, ' ')}</Badge>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Related To
                    </p>
                    <p className="font-medium">{getEntityName()}</p>
                  </div>

                  {document.expiration_date && (
                    <div>
                      <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Expiration Date
                      </p>
                      <p className="font-medium">
                        {format(new Date(document.expiration_date), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Uploaded
                    </p>
                    <p className="font-medium">
                      {format(new Date(document.created_date), 'MMM d, yyyy h:mm a')}
                    </p>
                    <p className="text-sm text-slate-500">
                      by {document.uploaded_by || 'Unknown'}
                    </p>
                  </div>

                  {document.tags && document.tags.length > 0 && (
                    <div>
                      <p className="text-sm text-slate-500 mb-2 flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        Tags
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {document.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {document.notes && (
                    <div>
                      <p className="text-sm text-slate-500 mb-2">Notes</p>
                      <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                        {document.notes}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <p className="text-xs text-slate-500">
                      File Size: {(document.file_size / 1024).toFixed(2)} KB
                    </p>
                    <p className="text-xs text-slate-500">
                      Type: {document.file_type}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}