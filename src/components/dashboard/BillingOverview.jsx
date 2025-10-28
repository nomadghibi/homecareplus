import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

export default function BillingOverview({ claims, totalBilled, totalPaid }) {
  const recentClaims = claims.slice(0, 6);
  
  const statusConfig = {
    draft: { color: "bg-slate-100 text-slate-700", label: "Draft" },
    submitted: { color: "bg-blue-100 text-blue-700", label: "Submitted" },
    accepted: { color: "bg-green-100 text-green-700", label: "Accepted" },
    paid: { color: "bg-green-100 text-green-700", label: "Paid" },
    rejected: { color: "bg-red-100 text-red-700", label: "Rejected" },
    denied: { color: "bg-red-100 text-red-700", label: "Denied" },
  };

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Billing Overview
          </CardTitle>
          <div className="flex gap-4 text-sm">
            <div className="text-right">
              <p className="text-slate-500 text-xs">Total Billed</p>
              <p className="font-bold text-slate-900">${totalBilled.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 text-xs">Total Paid</p>
              <p className="font-bold text-green-600">${totalPaid.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {recentClaims.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <DollarSign className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No claims submitted yet</p>
            </div>
          ) : (
            recentClaims.map((claim) => {
              const status = statusConfig[claim.claim_status] || statusConfig.draft;

              return (
                <div key={claim.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-900">
                          {claim.claim_number}
                        </span>
                        <Badge className={status.color}>
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span>{claim.payer}</span>
                        {claim.submission_date && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {claim.days_outstanding || 0} days
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">
                        ${(claim.total_charge || 0).toFixed(2)}
                      </div>
                      {claim.paid_amount > 0 && (
                        <div className="text-sm text-green-600 flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-3 h-3" />
                          ${claim.paid_amount.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}