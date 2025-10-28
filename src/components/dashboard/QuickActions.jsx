import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Calendar, 
  UserPlus, 
  FileText,
  DollarSign,
  Bell
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function QuickActions() {
  const actions = [
    {
      title: "Schedule Visit",
      description: "Create new visit",
      icon: Calendar,
      color: "from-blue-500 to-cyan-500",
      link: createPageUrl("Schedule")
    },
    {
      title: "Add Client",
      description: "Onboard new client",
      icon: UserPlus,
      color: "from-teal-500 to-green-500",
      link: createPageUrl("Clients")
    },
    {
      title: "Add Caregiver",
      description: "Hire new caregiver",
      icon: UserPlus,
      color: "from-purple-500 to-pink-500",
      link: createPageUrl("Caregivers")
    },
    {
      title: "Create Claim",
      description: "Submit new billing claim",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
      link: createPageUrl("Billing")
    },
    {
      title: "Documentation",
      description: "Complete visit notes",
      icon: FileText,
      color: "from-indigo-500 to-purple-600",
      link: createPageUrl("Documentation")
    },
    {
      title: "Send Alert",
      description: "Notify caregivers",
      icon: Bell,
      color: "from-orange-500 to-red-500",
      link: "#"
    }
  ];

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-slate-600" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, idx) => (
            <Link key={idx} to={action.link}>
              <Button
                variant="outline"
                className="w-full h-auto flex flex-col items-start p-4 hover:shadow-md transition-all group"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-slate-900 text-sm mb-1">
                  {action.title}
                </span>
                <span className="text-xs text-slate-500">
                  {action.description}
                </span>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}