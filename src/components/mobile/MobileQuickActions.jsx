import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, FileText, Phone, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function MobileQuickActions({ caregiver }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Link to={createPageUrl("Messages")}>
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <MessageSquare className="w-6 h-6" />
              <span className="text-xs">Messages</span>
            </Button>
          </Link>
          <Link to={createPageUrl("Documentation")}>
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <FileText className="w-6 h-6" />
              <span className="text-xs">Documents</span>
            </Button>
          </Link>
          <a href="tel:911">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2 border-red-200">
              <Phone className="w-6 h-6 text-red-600" />
              <span className="text-xs">Emergency</span>
            </Button>
          </a>
          <Link to={createPageUrl("Incidents")}>
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2 border-orange-200">
              <AlertCircle className="w-6 h-6 text-orange-600" />
              <span className="text-xs">Report Issue</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}