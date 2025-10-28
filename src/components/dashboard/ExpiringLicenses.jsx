import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar, User } from "lucide-react";
import { format } from "date-fns";

export default function ExpiringLicenses({ caregivers }) {
  const today = new Date();
  
  const expiringLicenses = caregivers
    .filter(caregiver => {
      if (!caregiver.license_expiry) return false;
      const expiryDate = new Date(caregiver.license_expiry);
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 60 && daysUntilExpiry >= 0;
    })
    .map(caregiver => {
      const expiryDate = new Date(caregiver.license_expiry);
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      return {
        ...caregiver,
        daysUntilExpiry,
        severity: daysUntilExpiry <= 14 ? 'critical' : daysUntilExpiry <= 30 ? 'warning' : 'info'
      };
    })
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

  const severityConfig = {
    critical: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Urgent' },
    warning: { color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Soon' },
    info: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Upcoming' }
  };

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Expiring Licenses
          </CardTitle>
          {expiringLicenses.length > 0 && (
            <Badge className="bg-orange-100 text-orange-700 border-orange-200">
              {expiringLicenses.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {expiringLicenses.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-green-300" />
              <p className="text-sm font-medium text-green-600">All licenses current</p>
              <p className="text-xs text-slate-500 mt-1">No licenses expiring in the next 60 days</p>
            </div>
          ) : (
            expiringLicenses.map((caregiver) => {
              const severity = severityConfig[caregiver.severity];
              return (
                <div 
                  key={caregiver.id}
                  className="flex items-start justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="font-medium text-slate-900 truncate">
                        {caregiver.first_name} {caregiver.last_name}
                      </span>
                      <Badge className={`${severity.color} border flex-shrink-0`}>
                        {severity.label}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-600 ml-6">
                      <p>License: {caregiver.license_number}</p>
                      <p className="mt-1">
                        Expires: {format(new Date(caregiver.license_expiry), 'MMM d, yyyy')} 
                        <span className="font-semibold ml-1">
                          ({caregiver.daysUntilExpiry} days)
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {expiringLicenses.length > 0 && (
          <Button variant="outline" className="w-full mt-4" size="sm">
            Notify All Caregivers
          </Button>
        )}
      </CardContent>
    </Card>
  );
}