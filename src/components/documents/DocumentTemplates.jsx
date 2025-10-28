import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, X } from "lucide-react";

const templates = [
  {
    id: "care_plan_basic",
    name: "Basic Care Plan Template",
    category: "care_plan",
    description: "Standard care plan for basic ADL assistance",
    fields: [
      "Client Information",
      "Primary Diagnosis",
      "Goals & Objectives",
      "Care Tasks (ADLs/IADLs)",
      "Medication Management",
      "Emergency Procedures"
    ]
  },
  {
    id: "consent_form_general",
    name: "General Consent Form",
    category: "consent_form",
    description: "Standard consent for home care services",
    fields: [
      "Client/Guardian Information",
      "Services Authorized",
      "HIPAA Authorization",
      "Financial Agreement",
      "Signature & Date"
    ]
  },
  {
    id: "care_plan_dementia",
    name: "Dementia Care Plan",
    category: "care_plan",
    description: "Specialized care plan for memory care",
    fields: [
      "Cognitive Assessment",
      "Safety Measures",
      "Behavioral Triggers & Interventions",
      "Communication Strategies",
      "Family Support Plan"
    ]
  },
  {
    id: "assessment_initial",
    name: "Initial Assessment Form",
    category: "other",
    description: "Comprehensive initial client assessment",
    fields: [
      "Demographics",
      "Medical History",
      "Current Medications",
      "Functional Assessment",
      "Home Safety Evaluation",
      "Care Team Contact Info"
    ]
  },
  {
    id: "incident_report",
    name: "Incident Report Template",
    category: "other",
    description: "For documenting incidents/accidents",
    fields: [
      "Date/Time/Location",
      "Individuals Involved",
      "Incident Description",
      "Immediate Actions Taken",
      "Witness Statements",
      "Follow-up Plan"
    ]
  },
  {
    id: "medication_list",
    name: "Medication List Template",
    category: "other",
    description: "Comprehensive medication tracking",
    fields: [
      "Medication Name & Dosage",
      "Frequency & Time",
      "Prescribing Physician",
      "Purpose",
      "Side Effects to Monitor",
      "Refill Date"
    ]
  }
];

export default function DocumentTemplates({ onSelect, onClose }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleUseTemplate = (template) => {
    // Generate template content
    const content = generateTemplateContent(template);
    onSelect(template, content);
    onClose();
  };

  const generateTemplateContent = (template) => {
    let content = `${template.name}\n\n`;
    content += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    content += `Instructions: Please fill out all sections below.\n\n`;
    content += `${'='.repeat(60)}\n\n`;
    
    template.fields.forEach((field, idx) => {
      content += `${idx + 1}. ${field}\n`;
      content += `   [Please complete this section]\n\n`;
    });
    
    content += `${'='.repeat(60)}\n\n`;
    content += `Signature: _____________________________ Date: __________\n`;
    
    return content;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <CardTitle>Document Templates</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            {templates.map(template => (
              <Card key={template.id} className="border-2 hover:border-amber-500 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-amber-600" />
                        {template.name}
                      </CardTitle>
                      <p className="text-sm text-slate-500 mt-1">{template.description}</p>
                    </div>
                    <Badge variant="outline">{template.category.replace(/_/g, ' ')}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Includes:</p>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {template.fields.slice(0, 4).map((field, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-500">•</span>
                          {field}
                        </li>
                      ))}
                      {template.fields.length > 4 && (
                        <li className="text-xs text-slate-400">
                          +{template.fields.length - 4} more sections
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-amber-600 hover:bg-amber-700"
                      onClick={() => handleUseTemplate(template)}
                    >
                      Use Template
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>{selectedTemplate.name} - Preview</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedTemplate(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <pre className="text-sm bg-slate-50 p-4 rounded-lg whitespace-pre-wrap font-mono">
                {generateTemplateContent(selectedTemplate)}
              </pre>
              <div className="flex gap-2 mt-4">
                <Button 
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                  onClick={() => {
                    handleUseTemplate(selectedTemplate);
                    setSelectedTemplate(null);
                  }}
                >
                  Use This Template
                </Button>
                <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                  Close Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}