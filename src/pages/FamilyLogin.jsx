import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Users, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function FamilyLogin() {
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        if (authenticated) {
          setIsAuthenticated(true);
          navigate(createPageUrl("FamilyPortal"), { replace: true });
        }
      } catch (error) {
        console.error("Auth check error:", error);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await base44.auth.login({ email, password });
      if (result.success) {
        navigate(createPageUrl("FamilyPortal"), { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to={createPageUrl("Landing")} className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <Card className="border-none shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Family Portal</CardTitle>
            <CardDescription>Stay connected with your loved one's care</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <p className="text-sm text-slate-600 mb-4">
                    Access your family member's care information
                  </p>

                  <div className="space-y-2">
                    <Label htmlFor="family-email">Email</Label>
                    <Input
                      id="family-email"
                      type="email"
                      placeholder="family@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="family-password">Password</Label>
                    <Input
                      id="family-password"
                      type="password"
                      placeholder="Enter any password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 h-12"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Sign In to Portal
                      </>
                    )}
                  </Button>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-xs text-slate-600">
                      <strong>Demo Mode:</strong><br />
                      Use any email and password to explore the family portal
                    </p>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleLogin} className="space-y-4">
                  <p className="text-sm text-slate-600 mb-4">
                    Request portal access for your family member
                  </p>

                  <div className="space-y-2">
                    <Label htmlFor="signup-family-email">Email</Label>
                    <Input
                      id="signup-family-email"
                      type="email"
                      placeholder="family@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-family-password">Password</Label>
                    <Input
                      id="signup-family-password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 h-12"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Access...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Request Access
                      </>
                    )}
                  </Button>

                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <p className="text-xs text-slate-600">
                      <strong>What You'll Get:</strong><br />
                      • Real-time visit updates<br />
                      • Access to care notes<br />
                      • Medication schedules<br />
                      • Direct messaging with care team<br />
                      • Visit ratings and feedback
                    </p>
                  </div>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-xs text-slate-500">
              Your loved one's privacy and security are our top priority
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}