import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  CheckCircle2, 
  Building2, 
  Users, 
  Phone,
  Heart,
  ArrowRight,
  Loader2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [agencyData, setAgencyData] = useState({
    agency_name: "",
    agency_type: "home_health",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    phone: "",
    email: "",
    license_number: "",
    tax_id: "",
    admin_name: "",
    admin_email: "",
    admin_phone: ""
  });

  const handleInputChange = (field, value) => {
    setAgencyData(prev => ({ ...prev, [field]: value }));
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Simulate API call for onboarding completion
      await new Promise(resolve => setTimeout(resolve, 1500));

      // TODO: Replace with actual API call when backend is ready
      // await fetch('/api/onboarding/complete', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     agency_info: agencyData,
      //     onboarding_completed: true
      //   })
      // });

      // Save to localStorage for now
      localStorage.setItem('agency_info', JSON.stringify(agencyData));
      localStorage.setItem('onboarding_completed', 'true');

      // Update current user with onboarding completion
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      currentUser.onboardingCompleted = true;
      currentUser.agencyInfo = agencyData;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));

      toast({
        title: "Welcome to Care Connect Pro!",
        description: "Your agency has been successfully set up.",
      });

      // Navigate to dashboard after successful completion
      setTimeout(() => {
        navigate(createPageUrl("Dashboard"), { replace: true });
      }, 500);
    } catch (error) {
      console.error("Onboarding error:", error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: "Agency Details", icon: Building2 },
    { number: 2, title: "Contact Information", icon: Phone },
    { number: 3, title: "Administrator", icon: Users }
  ];

  const currentStep = steps[step - 1];
  const CurrentStepIcon = currentStep.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              HomeCare+
            </h1>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome! Let's Get Started</h2>
          <p className="text-slate-600">Set up your agency in just a few simple steps</p>
        </div>

        <div className="flex justify-between mb-8 px-4">
          {steps.map((s, idx) => {
            const StepIcon = s.icon;
            return (
              <div key={s.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    step > s.number ? 'bg-green-500' : step === s.number ? 'bg-gradient-to-r from-teal-500 to-blue-600' : 'bg-slate-200'
                  }`}>
                    {step > s.number ? (
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    ) : (
                      <StepIcon className={`w-6 h-6 ${step === s.number ? 'text-white' : 'text-slate-400'}`} />
                    )}
                  </div>
                  <span className={`text-xs font-medium text-center ${
                    step >= s.number ? 'text-slate-900' : 'text-slate-400'
                  }`}>
                    {s.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 mb-8 rounded ${
                    step > s.number ? 'bg-green-500' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        <Card className="border-none shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <CurrentStepIcon className="w-6 h-6 text-teal-600" />
              {currentStep.title}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Tell us about your home care agency"}
              {step === 2 && "How can we reach you?"}
              {step === 3 && "Who will be the primary administrator?"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="agency_name">Agency Name *</Label>
                  <Input
                    id="agency_name"
                    placeholder="Comfort Care Services"
                    value={agencyData.agency_name}
                    onChange={(e) => handleInputChange('agency_name', e.target.value)}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="license_number">License Number *</Label>
                    <Input
                      id="license_number"
                      placeholder="HHA-12345"
                      value={agencyData.license_number}
                      onChange={(e) => handleInputChange('license_number', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax_id">Tax ID / EIN *</Label>
                    <Input
                      id="tax_id"
                      placeholder="12-3456789"
                      value={agencyData.tax_id}
                      onChange={(e) => handleInputChange('tax_id', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    placeholder="123 Main Street"
                    value={agencyData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="Springfield"
                      value={agencyData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      placeholder="IL"
                      value={agencyData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      maxLength={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip_code">ZIP Code *</Label>
                    <Input
                      id="zip_code"
                      placeholder="62701"
                      value={agencyData.zip_code}
                      onChange={(e) => handleInputChange('zip_code', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone">Agency Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={agencyData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Agency Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@comfortcare.com"
                    value={agencyData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="admin_name">Administrator Full Name *</Label>
                  <Input
                    id="admin_name"
                    placeholder="John Doe"
                    value={agencyData.admin_name}
                    onChange={(e) => handleInputChange('admin_name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin_email">Administrator Email *</Label>
                  <Input
                    id="admin_email"
                    type="email"
                    placeholder="john.doe@comfortcare.com"
                    value={agencyData.admin_email}
                    onChange={(e) => handleInputChange('admin_email', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin_phone">Administrator Phone *</Label>
                  <Input
                    id="admin_phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={agencyData.admin_phone}
                    onChange={(e) => handleInputChange('admin_phone', e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="flex justify-between pt-6">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  disabled={loading}
                >
                  Back
                </Button>
              )}
              {step < 3 ? (
                <Button
                  className="ml-auto bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
                  onClick={() => setStep(step + 1)}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  className="ml-auto bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
                  onClick={handleComplete}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Setting Up...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <CheckCircle2 className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-6">
          Need help? Contact our support team at{" "}
          <a href="mailto:support@homecare.com" className="text-teal-600 hover:underline">
            support@homecare.com
          </a>
        </p>
      </div>
    </div>
  );
}