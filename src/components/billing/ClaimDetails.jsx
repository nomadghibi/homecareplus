import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, DollarSign, Calendar, CheckCircle2, FileText } from "lucide-react";
import { format } from "date-fns";

export default function ClaimDetails({ claim, client, visits, onClose }) {
  const statusConfig = {
    draft: { color: "bg-slate-100 text-slate-700", label: "Draft" },
    submitted: { color: "bg-blue-100 text-blue-700", label: "Submitted" },
    accepted: { color: "bg-green-100 text-green-700", label: "Accepted" },
    paid: { color: "bg-green-100 text-green-700", label: "Paid" },
    rejected: { color: "bg-red-100 text-red-700", label: "Rejected" },
    denied: { color: "bg-red-100 text-red-700", label: "Denied" },
    appealed: { color: "bg-orange-100 text-orange-700", label: "Appealed" },
  };

  const status = statusConfig[claim.claim_status] || statusConfig.draft;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{claim.claim_number}</CardTitle>
              <Badge className={`${status.color} mt-2`}>
                {status.label}
              </Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-4">Claim Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Client</p>
                <p className="font-medium">
                  {client ? `${client.first_name} ${client.last_name}` : 'Unknown'}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Payer</p>
                <p className="font-medium">{claim.payer}</p>
                {claim.payer_id && (
                  <p className="text-xs text-slate-600 mt-1">ID: {claim.payer_id}</p>
                )}
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Service Period
                </p>
                <p className="font-medium">
                  {format(new Date(claim.service_date_from), 'MMM d, yyyy')}
                  {claim.service_date_to && ` - ${format(new Date(claim.service_date_to), 'MMM d, yyyy')}`}
                </p>
              </div>
              {claim.submission_date && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Submission Date</p>
                  <p className="font-medium">{format(new Date(claim.submission_date), 'MMM d, yyyy')}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Financial Details
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <p className="text-sm text-green-600 mb-1">Total Charge</p>
                <p className="text-2xl font-bold text-slate-900">${claim.total_charge?.toFixed(2)}</p>
              </div>
              {claim.paid_amount > 0 && (
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                  <p className="text-sm text-emerald-600 mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Amount Paid
                  </p>
                  <p className="text-2xl font-bold text-slate-900">${claim.paid_amount.toFixed(2)}</p>
                </div>
              )}
              {claim.total_units && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Total Units</p>
                  <p className="font-medium">{claim.total_units}</p>
                </div>
              )}
              {claim.adjustment_amount && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Adjustment</p>
                  <p className="font-medium">${claim.adjustment_amount.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>

          {claim.days_outstanding !== undefined && (
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
              <p className="text-sm text-orange-600 font-medium mb-1">Days Outstanding</p>
              <p className="text-2xl font-bold text-slate-900">{claim.days_outstanding} days</p>
            </div>
          )}

          {claim.billing_notes && (
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Billing Notes
              </h3>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-slate-700 whitespace-pre-wrap">{claim.billing_notes}</p>
              </div>
            </div>
          )}

          {claim.denial_reason && (
            <div>
              <h3 className="font-semibold text-lg mb-4">Denial Information</h3>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-600 font-medium mb-1">Reason</p>
                <p className="text-slate-700">{claim.denial_reason}</p>
                {claim.denial_code && (
                  <p className="text-xs text-slate-600 mt-2">Code: {claim.denial_code}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}