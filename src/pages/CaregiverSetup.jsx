import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Heart,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  UserCheck,
  CheckCircle2,
  Shield
} from "lucide-react";
import { toast } from "sonner";

export default function CaregiverSetup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [caregiverInfo, setCaregiverInfo] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form fields
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Error states
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    // Get invitation token from URL
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      toast.error("Invalid invitation link");
      navigate(createPageUrl("Landing"));
      return;
    }

    // Verify token and load caregiver info
    verifyToken(token, email);
  }, [searchParams, navigate]);

  const verifyToken = (token, email) => {
    // In production, this would verify with backend
    // For now, check pending invitations
    const pendingInvites = JSON.parse(localStorage.getItem('pendingCaregiverInvites') || '[]');
    const invite = pendingInvites.find(inv => inv.token === token && inv.email === email);

    if (!invite) {
      toast.error("Invalid or expired invitation link");
      navigate(createPageUrl("Landing"));
      return;
    }

    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      toast.error("This invitation has expired. Please contact your agency.");
      navigate(createPageUrl("Landing"));
      return;
    }

    setCaregiverInfo(invite);
  };

  // Password strength checker
  const getPasswordStrength = (pass) => {
    if (!pass) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (pass.length >= 8) strength++;
    if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength++;
    if (pass.match(/[0-9]/)) strength++;
    if (pass.match(/[^a-zA-Z0-9]/)) strength++;

    const levels = [
      { strength: 0, label: "Too weak", color: "bg-red-500" },
      { strength: 1, label: "Weak", color: "bg-orange-500" },
      { strength: 2, label: "Fair", color: "bg-yellow-500" },
      { strength: 3, label: "Good", color: "bg-blue-500" },
      { strength: 4, label: "Strong", color: "bg-green-500" },
    ];

    return levels[strength];
  };

  const passwordStrength = getPasswordStrength(password);

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Setup
  const handleSetup = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create caregiver user account
      const caregiverUser = {
        id: caregiverInfo.caregiverId,
        email: caregiverInfo.email,
        password: password, // In production, this would be hashed
        firstName: caregiverInfo.firstName,
        lastName: caregiverInfo.lastName,
        phone: caregiverInfo.phone,
        status: caregiverInfo.status || 'active',
        role: 'caregiver',
        agencyId: caregiverInfo.agencyId,
        agencyName: caregiverInfo.agencyName,
        isActivated: true,
        setupCompletedAt: new Date().toISOString()
      };

      // Add to caregiver users registry
      const caregiverUsers = JSON.parse(localStorage.getItem('caregiverUsers') || '[]');
      caregiverUsers.push(caregiverUser);
      localStorage.setItem('caregiverUsers', JSON.stringify(caregiverUsers));

      // Remove from pending invites
      const pendingInvites = JSON.parse(localStorage.getItem('pendingCaregiverInvites') || '[]');
      const updatedInvites = pendingInvites.filter(inv => inv.token !== caregiverInfo.token);
      localStorage.setItem('pendingCaregiverInvites', JSON.stringify(updatedInvites));

      toast.success("Account setup complete!", {
        description: "You can now sign in to your caregiver portal"
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate(createPageUrl("CaregiverLogin"));
      }, 2000);

    } catch (error) {
      console.error("Setup error:", error);
      setError(error.message || "Setup failed. Please try again.");
      toast.error(error.message || "Setup failed");
      setLoading(false);
    }
  };

  if (!caregiverInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-spin" />
            <p className="text-slate-600">Verifying invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card className="border-none shadow-2xl backdrop-blur-xl bg-white/95">
          <CardHeader className="text-center pb-6 pt-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform">
                  <UserCheck className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-4 border-white flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Welcome to {caregiverInfo.agencyName}!
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Set up your caregiver account
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-8">
            {/* Caregiver Info */}
            <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {caregiverInfo.firstName[0]}{caregiverInfo.lastName[0]}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {caregiverInfo.firstName} {caregiverInfo.lastName}
                  </p>
                  <p className="text-sm text-slate-600">{caregiverInfo.email}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSetup} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Create Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) {
                        setFieldErrors({ ...fieldErrors, password: "" });
                      }
                    }}
                    className={`pl-10 pr-10 h-12 ${fieldErrors.password ? 'border-red-500' : ''}`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {password && (
                  <div className="space-y-2">
                    <div className="flex gap-1 h-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`flex-1 rounded-full transition-colors ${
                            level <= passwordStrength.strength
                              ? passwordStrength.color
                              : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600">
                      Password strength: <span className="font-medium">{passwordStrength.label}</span>
                    </p>
                  </div>
                )}
                {fieldErrors.password && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword) {
                        setFieldErrors({ ...fieldErrors, confirmPassword: "" });
                      }
                    }}
                    className={`pl-10 pr-10 h-12 ${fieldErrors.confirmPassword ? 'border-red-500' : ''}`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Setting Up...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Complete Setup
                  </>
                )}
              </Button>

              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-purple-900 mb-1">Password Requirements:</p>
                    <ul className="space-y-1 text-purple-700 text-xs">
                      <li className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        At least 8 characters long
                      </li>
                      <li className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Mix of uppercase and lowercase letters
                      </li>
                      <li className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Include numbers and special characters
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-white/60 mt-6">
          Need help? Contact your agency administrator
        </p>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }

        .animate-blob {
          animation: blob 20s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
