import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Check,
  X,
  Star,
  TrendingUp,
  Users,
  Calendar,
  Shield,
  Zap,
  Crown,
  ArrowRight
} from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      id: "free",
      name: "Free Trial",
      icon: Heart,
      iconColor: "text-gray-600",
      price: 0,
      period: "14 days free",
      description: "Perfect for trying out Care Connect Pro",
      features: [
        { name: "Up to 10 clients", included: true },
        { name: "Up to 5 caregivers", included: true },
        { name: "50 visits/month", included: true },
        { name: "2 user accounts", included: true },
        { name: "1 GB storage", included: true },
        { name: "Basic billing", included: true },
        { name: "Family portal", included: true },
        { name: "Email support", included: true },
        { name: "EVV tracking", included: false },
        { name: "Advanced reporting", included: false },
        { name: "Mobile app", included: false },
      ],
      cta: "Start Free Trial",
      popular: false,
      tier: 0
    },
    {
      id: "starter",
      name: "Starter",
      icon: TrendingUp,
      iconColor: "text-blue-600",
      price: 99,
      annualPrice: 990,
      period: "per month",
      description: "For small home care agencies getting started",
      features: [
        { name: "Up to 50 clients", included: true },
        { name: "Up to 15 caregivers", included: true },
        { name: "500 visits/month", included: true },
        { name: "5 user accounts", included: true },
        { name: "10 GB storage", included: true },
        { name: "EVV tracking", included: true },
        { name: "Billing & claims", included: true },
        { name: "Family portal", included: true },
        { name: "Mobile app", included: true },
        { name: "Role-based access", included: true },
        { name: "Audit logs", included: true },
        { name: "Email support", included: true },
        { name: "Advanced reporting", included: false },
      ],
      cta: "Get Started",
      popular: false,
      tier: 1
    },
    {
      id: "professional",
      name: "Professional",
      icon: Star,
      iconColor: "text-purple-600",
      price: 299,
      annualPrice: 2990,
      period: "per month",
      description: "For growing agencies with advanced needs",
      features: [
        { name: "Up to 200 clients", included: true },
        { name: "Up to 50 caregivers", included: true },
        { name: "2,000 visits/month", included: true },
        { name: "15 user accounts", included: true },
        { name: "50 GB storage", included: true },
        { name: "Everything in Starter", included: true },
        { name: "Advanced reporting", included: true },
        { name: "API access", included: true },
        { name: "Multi-location support", included: true },
        { name: "Automated scheduling", included: true },
        { name: "Payroll integration", included: true },
        { name: "Priority support", included: true },
        { name: "Custom integrations", included: false },
      ],
      cta: "Start Free Trial",
      popular: true,
      tier: 2
    },
    {
      id: "enterprise",
      name: "Enterprise",
      icon: Crown,
      iconColor: "text-amber-600",
      price: 599,
      annualPrice: 5990,
      period: "per month",
      description: "For large organizations with custom requirements",
      features: [
        { name: "Unlimited clients", included: true },
        { name: "Unlimited caregivers", included: true },
        { name: "Unlimited visits", included: true },
        { name: "Unlimited users", included: true },
        { name: "Unlimited storage", included: true },
        { name: "Everything in Professional", included: true },
        { name: "White-label branding", included: true },
        { name: "Custom integrations", included: true },
        { name: "Dedicated account manager", included: true },
        { name: "24/7 phone support", included: true },
        { name: "Custom training", included: true },
        { name: "SLA guarantee", included: true },
        { name: "Advanced security", included: true },
      ],
      cta: "Contact Sales",
      popular: false,
      tier: 3
    }
  ];

  const [billingCycle, setBillingCycle] = React.useState("monthly");

  const getPrice = (plan) => {
    if (plan.price === 0) return "Free";
    if (billingCycle === "annual" && plan.annualPrice) {
      const monthlyEquivalent = (plan.annualPrice / 12).toFixed(0);
      return `$${monthlyEquivalent}`;
    }
    return `$${plan.price}`;
  };

  const getSavings = (plan) => {
    if (!plan.annualPrice || plan.price === 0) return null;
    const annualTotal = plan.price * 12;
    const savings = annualTotal - plan.annualPrice;
    const savingsPercent = Math.round((savings / annualTotal) * 100);
    return { amount: savings, percent: savingsPercent };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <nav className="bg-white/70 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50">
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
              <Link to={createPageUrl("Landing")}>
                <Button variant="ghost">Home</Button>
              </Link>
              <Link to={createPageUrl("AgencyLogin")}>
                <Button variant="outline">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Badge className="mb-4 bg-teal-100 text-teal-800 hover:bg-teal-200">
          <Zap className="w-3 h-3 mr-1" />
          14-Day Free Trial • No Credit Card Required
        </Badge>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
          Simple, Transparent Pricing
        </h1>

        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Choose the perfect plan for your home care agency. Scale as you grow with flexible pricing that works for you.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm font-medium ${billingCycle === "monthly" ? "text-gray-900" : "text-gray-500"}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingCycle === "annual" ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${billingCycle === "annual" ? "text-gray-900" : "text-gray-500"}`}>
            Annual
          </span>
          {billingCycle === "annual" && (
            <Badge className="bg-green-100 text-green-800">Save up to 17%</Badge>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => {
            const PlanIcon = plan.icon;
            const savings = getSavings(plan);

            return (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.popular
                    ? "border-2 border-purple-500 shadow-2xl shadow-purple-500/20 scale-105"
                    : "border border-gray-200"
                } hover:shadow-xl transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-6">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
                    <PlanIcon className={`w-8 h-8 ${plan.iconColor}`} />
                  </div>
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">{plan.description}</CardDescription>

                  <div className="mt-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold text-gray-900">{getPrice(plan)}</span>
                      {plan.price > 0 && (
                        <span className="text-gray-500 ml-1">/{billingCycle === "monthly" ? "mo" : "mo"}</span>
                      )}
                    </div>
                    {billingCycle === "annual" && savings && (
                      <p className="text-sm text-green-600 font-medium mt-2">
                        Save ${savings.amount}/year ({savings.percent}% off)
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">{plan.period}</p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${feature.included ? "text-gray-700" : "text-gray-400"}`}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Link to={createPageUrl("SignUp") + `?plan=${plan.id}`} className="w-full">
                    <Button
                      className={`w-full ${
                        plan.popular
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          : ""
                      }`}
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Add-ons Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Optional Add-Ons</h2>
          <p className="text-gray-600">Extend your plan with additional capacity and features</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Users</CardTitle>
              <CardDescription>Add more staff accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">$15<span className="text-lg font-normal text-gray-500">/user/mo</span></div>
              <p className="text-sm text-gray-600">Perfect for growing teams</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Extra Storage</CardTitle>
              <CardDescription>Increase file storage capacity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">$5<span className="text-lg font-normal text-gray-500">/10GB/mo</span></div>
              <p className="text-sm text-gray-600">Store more documents and files</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Priority Onboarding</CardTitle>
              <CardDescription>Dedicated setup specialist</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">$499<span className="text-lg font-normal text-gray-500"> one-time</span></div>
              <p className="text-sm text-gray-600">Get up and running faster</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I change plans later?</h3>
              <p className="text-gray-600">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate the difference.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">What happens after the free trial?</h3>
              <p className="text-gray-600">Your free trial lasts 14 days. After that, you'll need to choose a paid plan to continue using Care Connect Pro. No credit card required to start the trial.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">We accept all major credit cards (Visa, Mastercard, American Express) and ACH bank transfers for annual plans.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Is there a setup fee?</h3>
              <p className="text-gray-600">No setup fees for any plan. Optional priority onboarding is available for $499 one-time fee.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">What if I exceed my plan limits?</h3>
              <p className="text-gray-600">We'll notify you when you're approaching your limits. You can either upgrade your plan or purchase add-ons for additional capacity.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to transform your home care agency?
          </h2>
          <p className="text-xl text-teal-50 mb-8">
            Join hundreds of agencies using Care Connect Pro to deliver better care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("SignUp") + "?plan=free"}>
              <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2025 Care Connect Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
