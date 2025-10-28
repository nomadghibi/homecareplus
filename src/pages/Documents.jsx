
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Upload,
  Search,
  Filter,
  FolderOpen,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Download,
  Share2,
  Clock,
  User,
  Trash2
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DocumentUpload from "../components/documents/DocumentUpload";
import DocumentViewer from "../components/documents/DocumentViewer";
import DocumentCard from "../components/documents/DocumentCard";
import DocumentTemplates from "../components/documents/DocumentTemplates"; // New import
import ShareLinkDialog from "../components/documents/ShareLinkDialog"; // New import

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false); // New state
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [sharingDocument, setSharingDocument] = useState(null); // New state
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list('-created_at'),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
  });

  const { data: caregivers = [] } = useQuery({
    queryKey: ['caregivers'],
    queryFn: () => base44.entities.Caregiver.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Document.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['documents']);
    },
  });

  const categoryConfig = {
    care_plan: { label: "Care Plan", icon: FileText, color: "bg-blue-100 text-blue-700" },
    doctors_orders: { label: "Doctor's Orders", icon: FileText, color: "bg-purple-100 text-purple-700" },
    authorization_letter: { label: "Authorization", icon: FileText, color: "bg-green-100 text-green-700" },
    insurance_card: { label: "Insurance Card", icon: FileText, color: "bg-teal-100 text-teal-700" },
    photo_id: { label: "Photo ID", icon: User, color: "bg-orange-100 text-orange-700" },
    consent_form: { label: "Consent Form", icon: FileText, color: "bg-pink-100 text-pink-700" },
    training_certificate: { label: "Training Cert", icon: FileText, color: "bg-indigo-100 text-indigo-700" },
    background_check: { label: "Background Check", icon: FileText, color: "bg-red-100 text-red-700" },
    license: { label: "License", icon: FileText, color: "bg-yellow-100 text-yellow-700" },
    contract: { label: "Contract", icon: FileText, color: "bg-slate-100 text-slate-700" },
    other: { label: "Other", icon: FileText, color: "bg-gray-100 text-gray-700" },
  };

  const statusConfig = {
    active: { label: "Active", color: "bg-green-100 text-green-700 border-green-200" },
    expired: { label: "Expired", color: "bg-red-100 text-red-700 border-red-200" },
    pending_review: { label: "Pending Review", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    archived: { label: "Archived", color: "bg-slate-100 text-slate-700 border-slate-200" },
  };

  // Check expiration and update status
  const getDocumentStatus = (doc) => {
    if (!doc.expiration_date) return doc.status;
    const today = new Date();
    const expiryDate = new Date(doc.expiration_date);
    if (expiryDate < today) return 'expired';
    return doc.status;
  };

  // Calculate expiring soon
  const expiringDocs = documents.filter(doc => {
    if (!doc.expiration_date || doc.status === 'expired' || doc.status === 'archived') return false;
    const daysUntil = differenceInDays(new Date(doc.expiration_date), new Date());
    return daysUntil <= 30 && daysUntil >= 0;
  });

  const filteredDocuments = documents.filter(doc => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      doc.title?.toLowerCase().includes(searchLower) ||
      doc.notes?.toLowerCase().includes(searchLower) ||
      doc.tags?.some(tag => tag.toLowerCase().includes(searchLower));

    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
    const matchesEntity = entityFilter === "all" || doc.entity_type === entityFilter;
    const actualStatus = getDocumentStatus(doc);
    const matchesStatus = statusFilter === "all" || actualStatus === statusFilter;

    return matchesSearch && matchesCategory && matchesEntity && matchesStatus;
  });

  const stats = {
    total: documents.length,
    active: documents.filter(d => getDocumentStatus(d) === 'active').length,
    expiring: expiringDocs.length,
    expired: documents.filter(d => getDocumentStatus(d) === 'expired').length,
  };

  // Group by category
  const groupedDocs = filteredDocuments.reduce((acc, doc) => {
    const category = doc.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(doc);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-white" />
            </div>
            Document Management
          </h1>
          <p className="text-slate-500 mt-1">
            {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} • {expiringDocs.length} expiring soon
          </p>
        </div>
        <div className="flex gap-2"> {/* Changed: Grouped buttons in a div */}
          <Button 
            variant="outline"
            onClick={() => setShowTemplates(true)}
          >
            <FileText className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button 
            onClick={() => setShowUpload(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Documents</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
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
                <p className="text-sm text-slate-500 mb-1">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600">{stats.expiring}</p>
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
                <p className="text-sm text-slate-500 mb-1">Expired</p>
                <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
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
                placeholder="Search documents by title, notes, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48 h-12">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-full md:w-48 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="client">Client Documents</SelectItem>
                <SelectItem value="caregiver">Caregiver Documents</SelectItem>
                <SelectItem value="agency">Agency Documents</SelectItem>
                <SelectItem value="visit">Visit Documents</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Expiring Soon Alert */}
      {expiringDocs.length > 0 && (
        <Card className="border-none shadow-md bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 mb-1">
                  {expiringDocs.length} Document{expiringDocs.length > 1 ? 's' : ''} Expiring Soon
                </h3>
                <p className="text-sm text-orange-700">
                  The following documents expire within 30 days. Please review and update as needed.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {expiringDocs.slice(0, 3).map(doc => (
                    <Badge key={doc.id} variant="outline" className="bg-white">
                      {doc.title} - {differenceInDays(new Date(doc.expiration_date), new Date())} days
                    </Badge>
                  ))}
                  {expiringDocs.length > 3 && (
                    <Badge variant="outline" className="bg-white">
                      +{expiringDocs.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents Grid */}
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
      ) : filteredDocuments.length === 0 ? (
        <Card className="border-none shadow-lg">
          <CardContent className="p-12 text-center">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No documents found</h3>
            <p className="text-slate-500 mb-6">
              {searchTerm || categoryFilter !== "all" ? "Try adjusting your filters" : "Get started by uploading your first document"}
            </p>
            {!searchTerm && categoryFilter === "all" && (
              <Button onClick={() => setShowUpload(true)} className="bg-gradient-to-r from-amber-500 to-orange-600">
                <Upload className="w-4 h-4 mr-2" />
                Upload Your First Document
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedDocs).map(([category, docs]) => {
            const config = categoryConfig[category] || categoryConfig.other;
            return (
              <div key={category}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 ${config.color} rounded-lg flex items-center justify-center`}>
                    <config.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{config.label}</h2>
                    <p className="text-sm text-slate-500">{docs.length} document{docs.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {docs.map(doc => (
                    <DocumentCard
                      key={doc.id}
                      document={doc}
                      status={getDocumentStatus(doc)}
                      categoryConfig={categoryConfig}
                      statusConfig={statusConfig}
                      clients={clients}
                      caregivers={caregivers}
                      onView={(doc) => setSelectedDocument(doc)}
                      onDelete={(id) => {
                        if (confirm('Are you sure you want to delete this document?')) {
                          deleteMutation.mutate(id);
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <DocumentUpload
          onClose={() => setShowUpload(false)}
          clients={clients}
          caregivers={caregivers}
        />
      )}

      {/* Templates Modal */} {/* New Modal */}
      {showTemplates && (
        <DocumentTemplates
          onSelect={(template, content) => {
            // Auto-fill form with template
            setShowTemplates(false);
            setShowUpload(true);
            // This is a placeholder for passing template data to the upload form.
            // You might need to adjust DocumentUpload to accept initial data.
          }}
          onClose={() => setShowTemplates(false)}
        />
      )}

      {/* Document Viewer */}
      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          clients={clients}
          caregivers={caregivers}
          onClose={() => setSelectedDocument(null)}
          onShare={() => { // New prop
            setSharingDocument(selectedDocument);
            setSelectedDocument(null);
          }}
        />
      )}

      {/* Share Link Dialog */} {/* New Modal */}
      {sharingDocument && (
        <ShareLinkDialog
          document={sharingDocument}
          onClose={() => setSharingDocument(null)}
        />
      )}
    </div>
  );
}
