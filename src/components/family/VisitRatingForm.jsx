import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Star, Send } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function VisitRatingForm({ visit, caregiver, familyEmail, onClose, onSubmitSuccess }) {
  const [ratings, setRatings] = useState({
    overall_rating: 0,
    punctuality_rating: 0,
    professionalism_rating: 0,
    care_quality_rating: 0,
    communication_rating: 0,
  });
  const [comments, setComments] = useState("");
  const [wouldRequestAgain, setWouldRequestAgain] = useState(true);
  const [concernsRaised, setConcernsRaised] = useState(false);
  const [concernDetails, setConcernDetails] = useState("");
  const [hoverRating, setHoverRating] = useState({});

  const submitRatingMutation = useMutation({
    mutationFn: (data) => base44.entities.VisitRating.create(data),
    onSuccess: () => {
      onSubmitSuccess();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (ratings.overall_rating === 0) {
      alert("Please provide an overall rating");
      return;
    }

    submitRatingMutation.mutate({
      visit_id: visit.id,
      client_id: visit.client_id,
      caregiver_id: visit.caregiver_id,
      rated_by_email: familyEmail,
      ...ratings,
      comments,
      would_request_again: wouldRequestAgain,
      concerns_raised: concernsRaised,
      concern_details: concernsRaised ? concernDetails : null,
      follow_up_needed: concernsRaised,
      follow_up_status: concernsRaised ? 'pending' : null
    });
  };

  const RatingStars = ({ category, label }) => {
    const currentRating = ratings[category] || 0;
    const currentHover = hoverRating[category] || 0;

    return (
      <div>
        <Label className="mb-2 block">{label}</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRatings(prev => ({ ...prev, [category]: star }))}
              onMouseEnter={() => setHoverRating(prev => ({ ...prev, [category]: star }))}
              onMouseLeave={() => setHoverRating(prev => ({ ...prev, [category]: 0 }))}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (currentHover || currentRating)
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-slate-300'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-slate-600 self-center">
            {currentRating > 0 && `${currentRating}/5`}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Rate This Visit</CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                {format(parseISO(visit.scheduled_date), 'MMMM d, yyyy')} • {caregiver?.first_name} {caregiver?.last_name}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-6">
            {/* Overall Rating */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <RatingStars category="overall_rating" label="Overall Satisfaction *" />
            </div>

            {/* Detailed Ratings */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Detailed Ratings</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <RatingStars category="punctuality_rating" label="Punctuality" />
                <RatingStars category="professionalism_rating" label="Professionalism" />
                <RatingStars category="care_quality_rating" label="Care Quality" />
                <RatingStars category="communication_rating" label="Communication" />
              </div>
            </div>

            {/* Comments */}
            <div>
              <Label htmlFor="comments">Additional Comments</Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                placeholder="Share any specific feedback about the visit..."
                className="mt-2"
              />
            </div>

            {/* Would Request Again */}
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
              <Checkbox
                id="request_again"
                checked={wouldRequestAgain}
                onCheckedChange={setWouldRequestAgain}
              />
              <Label htmlFor="request_again" className="cursor-pointer font-medium">
                I would request this caregiver again
              </Label>
            </div>

            {/* Concerns */}
            <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
              <div className="flex items-center gap-3 mb-3">
                <Checkbox
                  id="concerns"
                  checked={concernsRaised}
                  onCheckedChange={(checked) => {
                    setConcernsRaised(checked);
                    if (!checked) setConcernDetails("");
                  }}
                />
                <Label htmlFor="concerns" className="cursor-pointer font-medium text-orange-900">
                  I have concerns about this visit
                </Label>
              </div>

              {concernsRaised && (
                <Textarea
                  value={concernDetails}
                  onChange={(e) => setConcernDetails(e.target.value)}
                  rows={3}
                  placeholder="Please describe your concerns. A care coordinator will follow up with you."
                  className="bg-white"
                  required={concernsRaised}
                />
              )}
            </div>
          </CardContent>

          <CardFooter className="border-t flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={ratings.overall_rating === 0 || submitRatingMutation.isPending}
              className="bg-gradient-to-r from-teal-500 to-blue-600"
            >
              <Send className="w-4 h-4 mr-2" />
              {submitRatingMutation.isPending ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}