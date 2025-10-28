
import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Upload, 
  FileText,
  Image,
  File,
  CheckCircle2,
  Loader2,
  Plus,
  Calendar
} from "lucide-react";

export default function DocumentUpload({ onClose, clients, caregivers, preselectedEntity = null }) {
  const [formData, setFormData] = useState({
    title: "",
    category: "other",
    entity_type: preselectedEntity?.type || "agency",
    entity_id: preselectedEntity?.id || "",
    expiration_date: "",
    notes: "",
    tags: []
  });
  const [file, setFile] = useState(null); // For single file upload
  const [files, setFiles] = useState([]); // For bulk file upload
  const [bulkMode, setBulkMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newTag, setNewTag] = useState("");
  const [extracting, setExtracting] = useState(false); // For OCR extraction loading state
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const uploadFileMutation = useMutation({
    mutationFn: async (file) => {
      const response = await base44.integrations.Core.UploadFile({ file });
      return response.file_url;
    }
  });

  const createDocumentMutation = useMutation({
    mutationFn: (data) => base44.entities.Document.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['documents']);
      // For bulk upload, onClose will be called after all uploads
      if (!bulkMode) { 
        onClose();
      }
    },
  });

  const categoryOptions = [
    { value: "care_plan", label: "Care Plan" },
    { value: "doctors_orders", label: "Doctor's Orders" },
    { value: "authorization_letter", label: "Authorization Letter" },
    { value: "insurance_card", label: "Insurance Card" },
    { value: "photo_id", label: "Photo ID" },
    { value: "consent_form", label: "Consent Form" },
    { value: "training_certificate", label: "Training Certificate" },
    { value: "background_check", label: "Background Check" },
    { value: "license", label: "License" },
    { value: "contract", label: "Contract" },
    { value: "other", label: "Other" },
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const autoDetectCategory = (filename) => {
    const lower = filename.toLowerCase();
    if (lower.includes('care_plan') || lower.includes('careplan')) {
      setFormData(prev => ({ ...prev, category: 'care_plan' }));
    } else if (lower.includes('insurance')) {
      setFormData(prev => ({ ...prev, category: 'insurance_card' }));
    } else if (lower.includes('consent')) {
      setFormData(prev => ({ ...prev, category: 'consent_form' }));
    } else if (lower.includes('doctor') || lower.includes('order')) {
      setFormData(prev => ({ ...prev, category: 'doctors_orders' }));
    } else if (lower.includes('license')) {
      setFormData(prev => ({ ...prev, category: 'license' }));
    } else if (lower.includes('background') || lower.includes('check')) {
      setFormData(prev => ({ ...prev, category: 'background_check' }));
    } else if (lower.includes('training') || lower.includes('certificate')) {
      setFormData(prev => ({ ...prev, category: 'training_certificate' }));
    }
    // No change if none match, keeping existing category (which defaults to 'other')
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    
    if (droppedFiles.length > 1) {
      setBulkMode(true);
      setFiles(droppedFiles);
      setFile(null); // Clear single file state
    } else {
      setBulkMode(false);
      setFiles([]); // Clear bulk files state
      const droppedFile = droppedFiles[0];
      if (droppedFile) {
        setFile(droppedFile);
        if (!formData.title) {
          setFormData(prev => ({ ...prev, title: droppedFile.name.replace(/\.[^/.]+$/, "") }));
        }
        autoDetectCategory(droppedFile.name);
      }
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (selectedFiles.length > 1) {
      setBulkMode(true);
      setFiles(selectedFiles);
      setFile(null); // Clear single file state
    } else {
      setBulkMode(false);
      setFiles([]); // Clear bulk files state
      const selectedFile = selectedFiles[0];
      if (selectedFile) {
        setFile(selectedFile);
        if (!formData.title) {
          setFormData(prev => ({ ...prev, title: selectedFile.name.replace(/\.[^/.]+$/, "") }));
        }
        autoDetectCategory(selectedFile.name);
      }
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleOCRExtract = async (e) => {
    e.stopPropagation(); // Prevent triggering file input click
    if (!file) return;
    
    setExtracting(true);
    try {
      // First upload the file
      const fileUrl = await uploadFileMutation.mutateAsync(file);
      
      // Then extract data based on category
      let schema = {};
      
      if (formData.category === 'insurance_card') {
        schema = {
          type: "object",
          properties: {
            insurance_provider: { type: "string" },
            insurance_id: { type: "string" },
            policy_holder: { type: "string" },
            group_number: { type: "string" }
          }
        };
      } else if (formData.category === 'doctors_orders') {
        schema = {
          type: "object",
          properties: {
            physician_name: { type: "string" },
            diagnosis: { type: "string" },
            medications: { type: "array", items: { type: "string" } },
            special_instructions: { type: "string" }
          }
        };
      }
      
      if (Object.keys(schema).length > 0) {
        const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
          file_url: fileUrl,
          json_schema: schema
        });
        
        if (result.status === 'success' && result.output) {
          // Update notes with extracted data
          const extractedText = JSON.stringify(result.output, null, 2);
          setFormData(prev => ({ 
            ...prev, 
            notes: (prev.notes ? prev.notes + '\n\n' : '') + 'Extracted Data:\n' + extractedText 
          }));
          alert('Data extracted successfully! Check the notes field.');
        } else {
            alert('Extraction completed, but no relevant data found or extraction failed.');
        }
      } else {
          alert('OCR extraction is not supported for this document category yet.');
      }
    } catch (error) {
      console.error('OCR extraction failed:', error);
      alert('Failed to extract data. Please try again.');
    } finally {
      setExtracting(false);
    }
  };


  const handleSingleFileUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file to upload");
      return;
    }

    try {
      // Upload file first
      setUploadProgress(50);
      const fileUrl = await uploadFileMutation.mutateAsync(file);
      
      // Get current user for uploaded_by
      const user = await base44.auth.me();
      
      // Create document record
      setUploadProgress(75);
      await createDocumentMutation.mutateAsync({
        ...formData,
        file_url: fileUrl,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: user.email,
        version: 1,
        status: "pending_review"
      });
      
      setUploadProgress(100);
      // onClose is called via createDocumentMutation.onSuccess for single upload
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload document. Please try again.");
      setUploadProgress(0);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      alert("Please select files to upload");
      return;
    }

    setUploadProgress(0); // Reset progress for bulk
    const user = await base44.auth.me();
    let completed = 0;

    for (const f of files) {
      try {
        const fileUrl = await uploadFileMutation.mutateAsync(f);
        
        await createDocumentMutation.mutateAsync({
          title: f.name.replace(/\.[^/.]+$/, ""), // Title from filename
          category: formData.category,
          entity_type: formData.entity_type,
          entity_id: formData.entity_id,
          expiration_date: formData.expiration_date,
          notes: formData.notes,
          tags: formData.tags,
          file_url: fileUrl,
          file_type: f.type,
          file_size: f.size,
          uploaded_by: user.email,
          version: 1,
          status: "pending_review"
        });
        
        completed++;
        setUploadProgress(Math.round((completed / files.length) * 100));
      } catch (error) {
        console.error(`Failed to upload ${f.name}:`, error);
        // Continue with other files even if one fails
      }
    }

    alert(`${completed} out of ${files.length} documents uploaded successfully.`);
    onClose(); // Close after all attempts in bulk mode
  };

  const getFileIcon = () => {
    if (!file) return FileText;
    if (file.type.startsWith('image/')) return Image;
    return File;
  };

  const FileIcon = getFileIcon();
  const isUploading = uploadFileMutation.isPending || createDocumentMutation.isPending;

  // Get entity options based on selected type
  const getEntityOptions = () => {
    switch (formData.entity_type) {
      case 'client':
        return clients.map(c => ({ value: c.id, label: `${c.first_name} ${c.last_name}` }));
      case 'caregiver':
        return caregivers.map(c => ({ value: c.id, label: `${c.first_name} ${c.last_name}` }));
      default:
        return [];
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              {bulkMode ? `Upload ${files.length} Documents` : 'Upload Document'}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} disabled={isUploading || extracting}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <form onSubmit={bulkMode ? handleBulkSubmit : handleSingleFileUploadSubmit}>
          <CardContent className="p-6 space-y-6">
            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                ${isDragging 
                  ? 'border-amber-500 bg-amber-50' 
                  : (file || files.length > 0)
                    ? 'border-green-500 bg-green-50'
                    : 'border-slate-300 hover:border-amber-400 hover:bg-slate-50'
                }
              `}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                multiple // Enable multiple file selection
              />
              
              {bulkMode && files.length > 0 ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{files.length} files selected</p>
                    <p className="text-sm text-slate-500">
                      Total: {(files.reduce((sum, f) => sum + f.size, 0) / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm">
                    Change Files
                  </Button>
                </div>
              ) : file ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto">
                    <FileIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{file.name}</p>
                    <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button type="button" variant="outline" size="sm">
                      Change File
                    </Button>
                    {(formData.category === 'insurance_card' || formData.category === 'doctors_orders') && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={handleOCRExtract}
                        disabled={extracting || isUploading}
                      >
                        {extracting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Extracting...
                          </>
                        ) : (
                          'Extract Data (OCR)'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      Drop file(s) here or click to browse
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      Supports PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
                    </p>
                    <p className="text-xs text-amber-600 mt-2">
                      💡 Select multiple files for bulk upload
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {(isUploading || extracting) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">
                    {extracting ? 'Extracting Data...' : 'Uploading...'}
                  </span>
                  <span className="font-semibold text-amber-600">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-orange-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Document Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Document Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required={!bulkMode} // Title is auto-generated for bulk, but required for single
                  placeholder="e.g., John's Care Plan 2024"
                  disabled={bulkMode} // Disable title input in bulk mode
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="entity_type">Document For *</Label>
                <Select 
                  value={formData.entity_type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, entity_type: value, entity_id: "" }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agency">Agency</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="caregiver">Caregiver</SelectItem>
                    <SelectItem value="visit">Visit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(formData.entity_type === 'client' || formData.entity_type === 'caregiver') && (
                <div>
                  <Label htmlFor="entity_id">Select {formData.entity_type === 'client' ? 'Client' : 'Caregiver'}</Label>
                  <Select value={formData.entity_id} onValueChange={(value) => setFormData(prev => ({ ...prev, entity_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose..." />
                    </SelectTrigger>
                    <SelectContent>
                      {getEntityOptions().map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="expiration_date">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Expiration Date (Optional)
                </Label>
                <Input
                  id="expiration_date"
                  type="date"
                  value={formData.expiration_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiration_date: e.target.value }))}
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label>Tags (Optional)</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} size="icon" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1">
                    {tag}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                placeholder="Any additional information about this document..."
              />
            </div>
          </CardContent>

          <CardFooter className="border-t flex justify-end gap-3 sticky bottom-0 bg-white">
            <Button type="button" variant="outline" onClick={onClose} disabled={isUploading || extracting}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={(bulkMode && files.length === 0) || (!bulkMode && !file) || isUploading || extracting}
              className="bg-gradient-to-r from-amber-500 to-orange-600"
            >
              {isUploading || extracting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {extracting ? 'Extracting...' : 'Uploading...'}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {bulkMode ? `Upload ${files.length} Documents` : 'Upload Document'}
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
