import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SatisfactionSurveyForm({ clients, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    client_id: '',
    survey_date: new Date().toISOString().split('T')[0],
    respondent_name: '',
    respondent_relationship: 'client',
    survey_method: 'phone',
    overall_satisfaction: 5,
    care_quality_rating: 5,
    caregiver_professionalism: 5,
    caregiver_punctuality: 5,
    communication_rating: 5,
    responsiveness_rating: 5,
    scheduling_satisfaction: 5,
    would_recommend: true,
    likelihood_to_recommend: 10,
    what_we_do_well: '',
    areas_for_improvement: '',
    additional_comments: '',
    surveyed_by: ''
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          setFormData(prev => ({ ...prev, surveyed_by: user.email }));
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const RatingInput = ({ label, field, value }) => (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2 mt-2">
        {[1, 2, 3, 4, 5].map(rating => (
          <button
            key={rating}
            type="button"
            onClick={() => handleChange(field, rating)}
            className="transition-all"
          >
            <Star 
              className={`w-8 h-8 ${value >= rating ? 'fill-yellow-500 text-yellow-500' : 'text-slate-300'}`}
            />
          </button>
        ))}
        <span className="ml-2 font-medium">{value}/5</span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <CardTitle>Client Satisfaction Survey</CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Client *</Label>
                <Select value={formData.client_id} onValueChange={(value) => handleChange('client_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.first_name} {client.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Survey Date *</Label>
                <Input
                  type="date"
                  value={formData.survey_date}
                  onChange={(e) => handleChange('survey_date', e.target.value)}
                />
              </div>
              <div>
                <Label>Respondent Name *</Label>
                <Input
                  value={formData.respondent_name}
                  onChange={(e) => handleChange('respondent_name', e.target.value)}
                />
              </div>
              <div>
                <Label>Relationship *</Label>
                <Select value={formData.respondent_relationship} onValueChange={(value) => handleChange('respondent_relationship', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="family_member">Family Member</SelectItem>
                    <SelectItem value="legal_guardian">Legal Guardian</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Survey Method</Label>
                <Select value={formData.survey_method} onValueChange={(value) => handleChange('survey_method', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="in_person">In Person</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="online_portal">Online Portal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Ratings</h3>
              <RatingInput label="Overall Satisfaction *" field="overall_satisfaction" value={formData.overall_satisfaction} />
              <RatingInput label="Care Quality" field="care_quality_rating" value={formData.care_quality_rating} />
              <RatingInput label="Caregiver Professionalism" field="caregiver_professionalism" value={formData.caregiver_professionalism} />
              <RatingInput label="Caregiver Punctuality" field="caregiver_punctuality" value={formData.caregiver_punctuality} />
              <RatingInput label="Communication" field="communication_rating" value={formData.communication_rating} />
              <RatingInput label="Responsiveness" field="responsiveness_rating" value={formData.responsiveness_rating} />
              <RatingInput label="Scheduling Satisfaction" field="scheduling_satisfaction" value={formData.scheduling_satisfaction} />
            </div>

            <div>
              <Label>Likelihood to Recommend (0-10)</Label>
              <Input
                type="number"
                min="0"
                max="10"
                value={formData.likelihood_to_recommend}
                onChange={(e) => handleChange('likelihood_to_recommend', parseInt(e.target.value))}
              />
              <p className="text-xs text-slate-500 mt-1">0 = Not at all likely, 10 = Extremely likely</p>
            </div>

            <div>
              <Label>What are we doing well?</Label>
              <Textarea
                value={formData.what_we_do_well}
                onChange={(e) => handleChange('what_we_do_well', e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label>Areas for improvement?</Label>
              <Textarea
                value={formData.areas_for_improvement}
                onChange={(e) => handleChange('areas_for_improvement', e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label>Additional Comments</Label>
              <Textarea
                value={formData.additional_comments}
                onChange={(e) => handleChange('additional_comments', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>

          <div className="flex justify-end gap-3 p-6 border-t sticky bottom-0 bg-white">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-yellow-500 to-orange-600">
              {isLoading ? 'Saving...' : 'Submit Survey'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}