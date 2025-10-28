import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, CheckCircle2, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

export default function MobileClockInOut({ caregiver, currentVisit, isClockedIn, onClockIn, onClockOut }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createEVVMutation = useMutation({
    mutationFn: (data) => base44.entities.EVVEvent.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['evvEvents']);
      queryClient.invalidateQueries(['visits']);
    },
  });

  const handleClockIn = async () => {
    if (!currentVisit) {
      toast({
        title: "No Active Visit",
        description: "Please select a visit to clock in.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const evvData = {
              visit_id: currentVisit.id,
              caregiver_id: caregiver.id,
              client_id: currentVisit.client_id,
              event_type: 'clock_in',
              timestamp: new Date().toISOString(),
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              verification_method: 'gps',
              verification_status: 'valid',
            };

            await createEVVMutation.mutateAsync(evvData);
            
            toast({
              title: "Clocked In",
              description: "Successfully clocked in for visit.",
            });
            
            if (onClockIn) onClockIn();
            setLoading(false);
          },
          (error) => {
            toast({
              title: "Location Error",
              description: "Could not get your location. Please enable location services.",
              variant: "destructive",
            });
            setLoading(false);
          }
        );
      } else {
        toast({
          title: "Location Not Supported",
          description: "Your device does not support location services.",
          variant: "destructive",
        });
        setLoading(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clock in. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!currentVisit) return;

    setLoading(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const evvData = {
              visit_id: currentVisit.id,
              caregiver_id: caregiver.id,
              client_id: currentVisit.client_id,
              event_type: 'clock_out',
              timestamp: new Date().toISOString(),
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              verification_method: 'gps',
              verification_status: 'valid',
            };

            await createEVVMutation.mutateAsync(evvData);
            
            toast({
              title: "Clocked Out",
              description: "Successfully clocked out from visit.",
            });
            
            if (onClockOut) onClockOut();
            setLoading(false);
          },
          (error) => {
            toast({
              title: "Location Error",
              description: "Could not get your location. Please enable location services.",
              variant: "destructive",
            });
            setLoading(false);
          }
        );
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clock out. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Clock In/Out
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentVisit ? (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900 font-medium">Active Visit</p>
              <p className="text-xs text-blue-700 mt-1">
                {currentVisit.scheduled_start_time} - {currentVisit.scheduled_end_time}
              </p>
            </div>

            {isClockedIn ? (
              <Button
                onClick={handleClockOut}
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600 text-white h-14"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                {loading ? "Clocking Out..." : "Clock Out"}
              </Button>
            ) : (
              <Button
                onClick={handleClockIn}
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 text-white h-14"
              >
                <MapPin className="w-5 h-5 mr-2" />
                {loading ? "Clocking In..." : "Clock In"}
              </Button>
            )}

            <p className="text-xs text-slate-500 text-center">
              <MapPin className="w-3 h-3 inline mr-1" />
              Location will be verified using GPS
            </p>
          </>
        ) : (
          <div className="text-center py-6">
            <AlertCircle className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-600">No active visit</p>
            <p className="text-xs text-slate-500 mt-1">
              Select a visit from your schedule to clock in
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}