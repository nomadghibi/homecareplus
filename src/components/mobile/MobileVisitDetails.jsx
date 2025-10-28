import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  FileText,
  Camera,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

export default function MobileVisitDetails({ visit, client, onBack }) {
  const [notes, setNotes] = useState(visit?.visit_notes || "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateVisitMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Visit.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['visits']);
    },
  });

  const handleCompleteVisit = async () => {
    setLoading(true);
    try {
      await updateVisitMutation.mutateAsync({
        id: visit.id,
        data: {
          status: 'completed',
          visit_notes: notes,
          actual_end_time: new Date().toISOString().split('T')[1].substring(0, 5),
        }
      });

      toast({
        title: "Visit Completed",
        description: "Visit has been marked as completed successfully.",
      });

      if (onBack) onBack();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete visit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    setLoading(true);
    try {
      await updateVisitMutation.mutateAsync({
        id: visit.id,
        data: { visit_notes: notes }
      });

      toast({
        title: "Notes Saved",
        description: "Visit notes have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!visit || !client) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white p-4 sticky top-0 z-40 shadow-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-white hover:bg-white/20 mb-3"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h2 className="text-xl font-bold">Visit Details</h2>
      </div>

      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-teal-600" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-slate-500">Name</p>
              <p className="font-semibold">{client.first_name} {client.last_name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Address</p>
              <p className="text-sm">{client.address}</p>
              <p className="text-sm text-slate-600">{client.city}, {client.state} {client.zip_code}</p>
            </div>
            {client.phone && (
              <div>
                <p className="text-sm text-slate-500">Phone</p>
                <a href={`tel:${client.phone}`} className="text-blue-600 font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {client.phone}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Visit Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-slate-500">Date</p>
                <p className="font-semibold">
                  {format(new Date(visit.scheduled_date), 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Time</p>
                <p className="font-semibold">
                  {visit.scheduled_start_time} - {visit.scheduled_end_time}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500">Service Type</p>
              <Badge className="mt-1">{visit.service_type?.replace('_', ' ')}</Badge>
            </div>
            <div>
              <p className="text-sm text-slate-500">Status</p>
              <Badge 
                variant={visit.status === 'completed' ? 'default' : 'outline'}
                className="mt-1"
              >
                {visit.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Visit Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add visit notes, observations, tasks completed..."
              className="min-h-[150px]"
            />
            <Button 
              onClick={handleSaveNotes} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Save Notes
            </Button>
          </CardContent>
        </Card>

        {visit.status !== 'completed' && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <Button
                onClick={handleCompleteVisit}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Complete Visit
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}