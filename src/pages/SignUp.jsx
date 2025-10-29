import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Heart,
  Building2,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Check,
  Loader2,
  ArrowRight,
  Shield,
  Clock,
  Info,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";

export default function SignUp() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get selected plan from URL params
  const selectedPlan = searchParams.get('plan') || 'starter';
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPasswordHelper, setShowPasswordHelper] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Organization Info
    organizationName: '',
    slug: '',

    // Step 2: Admin Account
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',

    // Step 3: Contact Details
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',

    // Terms
    agreeToTerms: false,
  });

  const plans = {
    free: { name: 'Free Trial', price: 0, period: '14 days' },
    starter: { name: 'Starter', price: 99, period: 'per month' },
    professional: { name: 'Professional', price: 299, period: 'per month' },
    enterprise: { name: 'Enterprise', price: 599, period: 'per month' }
  };

  const plan = plans[selectedPlan] || plans.starter;

  // Calculate password strength (0-4)
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const getPasswordStrengthLabel = (strength) => {
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    return labels[strength];
  };

  const getPasswordStrengthColor = (strength) => {
    const colors = ['bg-gray-200', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
    return colors[strength];
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    // Auto-generate slug from organization name
    if (field === 'organizationName') {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }

    // Calculate password strength
    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.organizationName.trim()) {
        newErrors.organizationName = 'Organization name is required';
      }
      if (!formData.slug.trim()) {
        newErrors.slug = 'URL slug is required';
      } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
        newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
      }
    }

    if (step === 2) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (step === 3) {
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(3)) return;

    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create user account data (persistent)
    const userData = {
      id: `user-${Date.now()}`,
      email: formData.email,
      password: formData.password, // In production, this would be hashed
      firstName: formData.firstName,
      lastName: formData.lastName,
      organizationName: formData.organizationName,
      organizationSlug: formData.slug,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      plan: selectedPlan,
      createdAt: new Date().toISOString(),
      onboardingCompleted: false
    };

    // Save to persistent user registry
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    registeredUsers.push(userData);
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

    // Also set current session
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('isAuthenticated', 'true');

    console.log('User created and registered:', userData);

    // Redirect to onboarding
    navigate(createPageUrl('Onboarding') + `?new=true&plan=${selectedPlan}`);
  };

  const renderStepIndicator = () => {
    const progress = Math.round((currentStep / 3) * 100);

    return (
      <div className="mb-8">
        {/* Progress percentage */}
        <div className="text-center mb-2">
          <span className="text-sm font-medium text-teal-600">{progress}% Complete</span>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center">
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep >= step
                      ? 'bg-teal-600 text-white scale-110'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > step ? <Check className="w-5 h-5" /> : step}
                </div>
                <span className={`text-xs mt-2 ${currentStep >= step ? 'text-teal-600 font-medium' : 'text-gray-500'}`}>
                  {step === 1 && 'Organization'}
                  {step === 2 && 'Account'}
                  {step === 3 && 'Details'}
                </span>
              </div>
              {step < 3 && (
                <div
                  className={`w-16 h-1 mx-2 mb-6 transition-all ${
                    currentStep > step ? 'bg-teal-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-12">
      {/* Header */}
      <nav className="absolute top-0 left-0 right-0 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to={createPageUrl("Landing")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                Care Connect Pro
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Already have an account?</span>
              <Link to={createPageUrl("AgencyLogin")}>
                <Button variant="outline">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        {/* Plan Badge */}
        <div className="text-center mb-6">
          <Badge className="bg-teal-100 text-teal-800 px-4 py-2 text-base">
            <Shield className="w-4 h-4 mr-2 inline" />
            {plan.name} Plan - {plan.price === 0 ? plan.period : `$${plan.price}/${plan.period}`}
          </Badge>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Create Your Account</CardTitle>
            <CardDescription className="flex items-center justify-center gap-2 mt-2">
              <Clock className="w-4 h-4" />
              <span>Takes about 2 minutes</span>
            </CardDescription>
            <CardDescription>
              {selectedPlan === 'free' ? 'Start your 14-day free trial' : 'Get started with Care Connect Pro'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {renderStepIndicator()}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Organization Info */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right">
                  <div>
                    <Label htmlFor="organizationName">
                      Organization Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="organizationName"
                        placeholder="e.g., Sunrise Home Care"
                        className="pl-10"
                        value={formData.organizationName}
                        onChange={(e) => handleChange('organizationName', e.target.value)}
                      />
                    </div>
                    {errors.organizationName && (
                      <p className="text-sm text-red-500 mt-1">{errors.organizationName}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Label htmlFor="slug">
                        Your URL <span className="text-red-500">*</span>
                      </Label>
                      <div className="group relative inline-block">
                        <Info className="w-4 h-4 text-gray-400 cursor-help" />
                        <div className="hidden group-hover:block absolute z-10 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg -top-2 left-6">
                          This creates your unique portal URL where you, your staff, and families can access Care Connect Pro
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">careconnectpro.com/</span>
                      <Input
                        id="slug"
                        placeholder="your-agency"
                        value={formData.slug}
                        onChange={(e) => handleChange('slug', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    {errors.slug && (
                      <p className="text-sm text-red-500 mt-1">{errors.slug}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      This will be your unique URL for accessing the platform
                    </p>
                  </div>

                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription className="text-sm">
                      Don't worry, you can change these details later in your settings.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Step 2: Admin Account */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                      />
                      {errors.firstName && (
                        <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                      />
                      {errors.lastName && (
                        <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@sunrisecare.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="password">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Minimum 8 characters"
                        className="pl-10"
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        onFocus={() => setShowPasswordHelper(true)}
                      />
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                    )}

                    {/* Password Strength Meter */}
                    {formData.password && (
                      <div className="mt-2 space-y-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full transition-all ${
                                level <= passwordStrength
                                  ? getPasswordStrengthColor(passwordStrength)
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className={`text-xs font-medium ${
                          passwordStrength === 4 ? 'text-green-600' :
                          passwordStrength === 3 ? 'text-yellow-600' :
                          passwordStrength === 2 ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          Password Strength: {getPasswordStrengthLabel(passwordStrength)}
                        </p>
                      </div>
                    )}

                    {/* Password Requirements Helper */}
                    {showPasswordHelper && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-xs space-y-1">
                        <p className="font-medium text-blue-900 mb-1">Password must contain:</p>
                        <div className={`flex items-center gap-1 ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-600'}`}>
                          {formData.password.length >= 8 ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          <span>At least 8 characters</span>
                        </div>
                        <div className={`flex items-center gap-1 ${/[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-600'}`}>
                          {/[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          <span>Mix of uppercase & lowercase</span>
                        </div>
                        <div className={`flex items-center gap-1 ${/\d/.test(formData.password) ? 'text-green-600' : 'text-gray-600'}`}>
                          {/\d/.test(formData.password) ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          <span>At least one number</span>
                        </div>
                        <div className={`flex items-center gap-1 ${/[^a-zA-Z0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-600'}`}>
                          {/[^a-zA-Z0-9]/.test(formData.password) ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          <span>Special character (recommended)</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Re-enter password"
                        className="pl-10"
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Contact Details */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right">
                  <div>
                    <Label htmlFor="phone">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        className="pl-10"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="address">
                      Street Address <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="address"
                        placeholder="123 Main Street"
                        className="pl-10"
                        value={formData.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                      />
                    </div>
                    {errors.address && (
                      <p className="text-sm text-red-500 mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="Springfield"
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        placeholder="IL"
                        value={formData.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      placeholder="62701"
                      value={formData.zipCode}
                      onChange={(e) => handleChange('zipCode', e.target.value)}
                    />
                  </div>

                  <div className="flex items-start gap-2 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={(e) => handleChange('agreeToTerms', e.target.checked)}
                      className="mt-1"
                    />
                    <Label htmlFor="agreeToTerms" className="text-sm cursor-pointer">
                      I agree to the{' '}
                      <a href="#" className="text-teal-600 hover:underline">Terms of Service</a>
                      {' '}and{' '}
                      <a href="#" className="text-teal-600 hover:underline">Privacy Policy</a>
                    </Label>
                  </div>
                  {errors.agreeToTerms && (
                    <p className="text-sm text-red-500">{errors.agreeToTerms}</p>
                  )}

                  <Alert className="bg-green-50 border-green-200">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-sm">
                      {selectedPlan === 'free'
                        ? 'No credit card required for your 14-day free trial!'
                        : 'You\'ll be able to add payment details after account setup.'}
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                )}

                <div className="ml-auto">
                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="bg-gradient-to-r from-teal-600 to-blue-600"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-teal-600 to-blue-600"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security Badge */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <Shield className="w-4 h-4 inline mr-1" />
          Your data is protected with bank-level encryption
        </div>
      </div>
    </div>
  );
}
