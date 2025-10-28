import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Heart,
  Loader2,
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  UserCheck,
  Shield,
  Smartphone
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function CaregiverLogin() {
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Error states
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const navigate = useNavigate();

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = localStorage.getItem('isAuthenticated');
        const currentUser = localStorage.getItem('currentUser');

        if (isAuth === 'true' && currentUser) {
          const userData = JSON.parse(currentUser);
          if (userData.role === 'caregiver') {
            setIsAuthenticated(true);
            navigate(createPageUrl("CaregiverDashboard"), { replace: true });
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
      }
    };
    checkAuth();
  }, [navigate]);

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email is invalid";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Check caregiver registry
      const caregiverUsers = JSON.parse(localStorage.getItem('caregiverUsers') || '[]');

      // Find caregiver by email (case insensitive)
      const foundCaregiver = caregiverUsers.find(
        user => user.email.toLowerCase() === email.toLowerCase()
      );

      if (foundCaregiver) {
        // Check if account is activated
        if (!foundCaregiver.isActivated) {
          toast.error("Please complete your account setup first. Check your email for the setup link.");
          setError("Account not activated. Please check your email for setup instructions.");
          setLoading(false);
          return;
        }

        // Check if account is inactive
        if (foundCaregiver.status === 'inactive') {
          toast.error("Your account has been deactivated. Please contact your agency administrator.");
          setError("Account deactivated. Contact your agency for assistance.");
          setLoading(false);
          return;
        }

        // Verify password
        if (foundCaregiver.password === password) {
          toast.success("Welcome back! Loading your schedule...");

          // Create session
          const sessionData = {
            ...foundCaregiver,
            role: 'caregiver'
          };

          localStorage.setItem('currentUser', JSON.stringify(sessionData));
          localStorage.setItem('isAuthenticated', 'true');

          // Save to localStorage if remember me is checked
          if (rememberMe) {
            localStorage.setItem("rememberMe", "true");
            localStorage.setItem("userEmail", email);
          }

          setTimeout(() => {
            navigate(createPageUrl("CaregiverDashboard"), { replace: true });
          }, 1000);
          return;
        } else {
          throw new Error("Invalid password");
        }
      } else {
        throw new Error("No account found with this email. Please contact your agency.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Invalid credentials. Please check your email and password.");
      toast.error(error.message || "Invalid credentials. Please try again.");
      setLoading(false);
    }
  };

  // Load remembered email
  useEffect(() => {
    const remembered = localStorage.getItem("rememberMe");
    const savedEmail = localStorage.getItem("userEmail");

    if (remembered === "true" && savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  if (isAuthenticated) {
    return null;
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
        <Link
          to={createPageUrl("Landing")}
          className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <Card className="border-none shadow-2xl backdrop-blur-xl bg-white/95">
          <CardHeader className="text-center pb-6 pt-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform">
                  <UserCheck className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-4 border-white flex items-center justify-center">
                  <Smartphone className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Caregiver Portal
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Sign in to view your schedule and clock in/out
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) {
                        setFieldErrors({ ...fieldErrors, email: "" });
                      }
                    }}
                    className={`pl-10 h-12 ${fieldErrors.email ? 'border-red-500' : ''}`}
                    disabled={loading}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => toast.info("Please contact your agency admin to reset your password")}
                    className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
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
                {fieldErrors.password && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={setRememberMe}
                  disabled={loading}
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-slate-600 cursor-pointer select-none"
                >
                  Remember me for 30 days
                </label>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-800 font-medium">{error}</p>
                    <p className="text-xs text-red-600 mt-1">
                      Contact your agency if you need help accessing your account
                    </p>
                  </div>
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
                    Signing In...
                  </>
                ) : (
                  <>
                    <UserCheck className="w-5 h-5 mr-2" />
                    Sign In
                  </>
                )}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-500">
                    For Caregivers Only
                  </span>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-purple-900">New caregiver?</p>
                    <p className="text-xs text-purple-700 mt-1">
                      Your agency admin will send you an invitation email to set up your account
                    </p>
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
