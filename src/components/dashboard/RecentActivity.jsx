import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity,
  UserPlus,
  Calendar,
  FileText,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Clock
} from "lucide-react";
import { format } from "date-fns";

export default function RecentActivity({ visits, clients, caregivers, claims }) {
  // Generate activity feed from recent actions
  const activities = [];

  // Recent visits
  visits.slice(0, 3).forEach(visit => {
    const client = clients.find(c => c.id === visit.client_id);
    const caregiver = caregivers.find(c => c.id === visit.caregiver_id);
    
    activities.push({
      type: 'visit',
      icon: Calendar,
      color: visit.status === 'completed' ? 'text-green-600' : 'text-blue-600',
      bgColor: visit.status === 'completed' ? 'bg-green-100' : 'bg-blue-100',
      title: `Visit ${visit.status}`,
      description: `${caregiver?.first_name || 'Caregiver'} → ${client?.first_name || 'Client'}`,
      timestamp: visit.created_date
    });
  });

  // Recent clients
  clients.slice(0, 2).forEach(client => {
    activities.push({
      type: 'client',
      icon: UserPlus,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
      title: 'New client added',
      description: `${client.first_name} ${client.last_name}`,
      timestamp: client.created_date
    });
  });

  // Recent claims
  claims.slice(0, 2).forEach(claim => {
    const statusIcon = claim.claim_status === 'paid' ? CheckCircle2 : 
                       claim.claim_status === 'rejected' ? AlertTriangle : DollarSign;
    
    activities.push({
      type: 'claim',
      icon: statusIcon,
      color: claim.claim_status === 'paid' ? 'text-green-600' : 
             claim.claim_status === 'rejected' ? 'text-red-600' : 'text-blue-600',
      bgColor: claim.claim_status === 'paid' ? 'bg-green-100' : 
               claim.claim_status === 'rejected' ? 'bg-red-100' : 'bg-blue-100',
      title: `Claim ${claim.claim_status}`,
      description: `${claim.claim_number} - $${claim.total_charge?.toFixed(2) || '0.00'}`,
      timestamp: claim.created_date
    });
  });

  // Filter out activities with invalid timestamps and sort by timestamp
  const validActivities = activities.filter(a => a.timestamp && !isNaN(new Date(a.timestamp)));
  validActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const recentActivities = validActivities.slice(0, 8);

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-slate-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {recentActivities.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Activity className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            recentActivities.map((activity, idx) => {
              const Icon = activity.icon;
              return (
                <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 ${activity.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm">
                        {activity.title}
                      </p>
                      <p className="text-sm text-slate-600 truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                      </p>
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