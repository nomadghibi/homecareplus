import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Edit2, Calendar, User, Award } from "lucide-react";
import { format } from "date-fns";

export default function QualityAuditDetails({ audit, clients, caregivers, onClose, onEdit }) {
  const client = clients.find(c => c.id === audit.client_id);
  const caregiver = caregivers.find(c => c.id === audit.caregiver_id);

  const passFailConfig = {
    pass: { color: "bg-green-100 text-green-700", label: "Pass" },
    conditional_pass: { color: "bg-yellow-100 text-yellow-700", label: "Conditional Pass" },
    fail: { color: "bg-red-100 text-red-700", label: "Fail" }
  };

  const statusConfig = {
    scheduled: { color: "bg-slate-100 text-slate-700", label: "Scheduled" },
    in_progress: { color: "bg-blue-100 text-blue-700", label: "In Progress" },
    completed: { color: "bg-green-100 text-green-700", label: "Completed" },
    follow_up_required: { color: "bg-orange-100 text-orange-700", label: "Follow-up Required" }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">
                {audit.audit_number || `Audit #${audit.id.slice(0, 8)}`}
              </CardTitle>
              <div className="flex gap-2 flex-wrap">
                <Badge className={statusConfig[audit.status]?.color}>
                  {statusConfig[audit.status]?.label}
                </Badge>
                {audit.pass_fail && (
                  <Badge className={passFailConfig[audit.pass_fail]?.color}>
                    {passFailConfig[audit.pass_fail]?.label}
                  </Badge>
                )}
                {audit.overall_score !== null && audit.overall_score !== undefined && (
                  <Badge variant="outline" className="font-bold">
                    Score: {audit.overall_score}%
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => onEdit(audit)}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <ScrollArea className="flex-1">
          <CardContent className="p-6 space-y-6">
            {/* Audit Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Audit Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Audit Type</p>
                  <p className="font-medium capitalize">{audit.audit_type?.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Audit Date</p>
                  <p className="font-medium">{format(new Date(audit.audit_date), 'MMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Auditor</p>
                  <p className="font-medium">{audit.auditor_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Organization</p>
                  <p className="font-medium">{audit.auditor_organization || 'N/A'}</p>
                </div>
                {client && (
                  <div>
                    <p className="text-sm text-slate-500">Client</p>
                    <p className="font-medium">{client.first_name} {client.last_name}</p>
                  </div>
                )}
                {caregiver && (
                  <div>
                    <p className="text-sm text-slate-500">Caregiver</p>
                    <p className="font-medium">{caregiver.first_name} {caregiver.last_name}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scope */}
            {audit.scope && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Scope</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap">{audit.scope}</p>
                </CardContent>
              </Card>
            )}

            {/* Deficiencies */}
            {audit.deficiencies_found && audit.deficiencies_found.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Deficiencies Found</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {audit.deficiencies_found.map((def, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-slate-900">{def.deficiency}</p>
                        <Badge variant="outline" className={
                          def.severity === 'critical' ? 'bg-red-50 text-red-700' :
                          def.severity === 'major' ? 'bg-orange-50 text-orange-700' :
                          'bg-blue-50 text-blue-700'
                        }>
                          {def.severity}
                        </Badge>
                      </div>
                      {def.citation && (
                        <p className="text-sm text-slate-600">Citation: {def.citation}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {audit.recommendations && audit.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2">
                    {audit.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-slate-700">{rec}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {audit.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap">{audit.notes}</p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}