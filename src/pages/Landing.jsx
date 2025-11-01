import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Users,
  Calendar,
  DollarSign,
  Shield,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  Star,
  TrendingUp,
  Clock,
  Award,
  UserCheck
} from "lucide-react";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 opacity-70"></div>
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxNGI4YTYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptLTQgMjBjLTIuMjEgMC00IDEuNzktNCA0czEuNzkgNCA0IDQgNC0xLjc5IDQtNC0xLjc5LTQtNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>

      <div className="relative z-10">
        {/* Top Navigation */}
        <nav className="bg-white/70 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 via-teal-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/50">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">Care Connect Pro</span>
              </div>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center gap-4">
                <a href="#features" className="text-slate-700 hover:text-teal-600 transition-colors font-medium">Features</a>
                <Link to={createPageUrl("Pricing")} className="text-slate-700 hover:text-teal-600 transition-colors font-medium">Pricing</Link>
                <a href="#stats" className="text-slate-700 hover:text-teal-600 transition-colors font-medium">Why Us</a>
                <a href="#testimonials" className="text-slate-700 hover:text-teal-600 transition-colors font-medium">Reviews</a>
                <Link to={createPageUrl("AgencyLogin")}>
                  <Button variant="outline" className="border-2 hover:border-teal-500 hover:text-teal-600">Agency</Button>
                </Link>
                <Link to={createPageUrl("CaregiverLogin")}>
                  <Button variant="outline" className="border-2 hover:border-purple-500 hover:text-purple-600">
                    <UserCheck className="w-4 h-4 mr-1" />
                    Caregiver
                  </Button>
                </Link>
                <Link to={createPageUrl("FamilyLogin")}>
                  <Button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 shadow-lg shadow-teal-500/50">Family</Button>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl">
              <div className="px-4 py-4 space-y-3">
                <a href="#features" className="block py-2 text-slate-700 font-medium">Features</a>
                <Link to={createPageUrl("Pricing")} className="block py-2 text-slate-700 font-medium">Pricing</Link>
                <a href="#stats" className="block py-2 text-slate-700 font-medium">Why Us</a>
                <a href="#testimonials" className="block py-2 text-slate-700 font-medium">Reviews</a>
                <Link to={createPageUrl("AgencyLogin")} className="block">
                  <Button variant="outline" className="w-full">Agency Login</Button>
                </Link>
                <Link to={createPageUrl("CaregiverLogin")} className="block">
                  <Button variant="outline" className="w-full border-2 border-purple-500 text-purple-600">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Caregiver Login
                  </Button>
                </Link>
                <Link to={createPageUrl("FamilyLogin")} className="block">
                  <Button className="w-full bg-gradient-to-r from-teal-500 to-blue-600">Family Portal</Button>
                </Link>
              </div>
            </div>
          )}
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-12 md:mb-20">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold mb-8 border border-teal-200">
              <Award className="w-4 h-4" />
              Trusted by 500+ Home Care Agencies
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-slate-900 mb-8 leading-tight">
              Transform Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-teal-600 to-blue-600 animate-gradient">
                Home Care
              </span>
              <br />
              Agency Today
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-4xl mx-auto leading-relaxed">
              Complete platform for scheduling, EVV, billing, compliance, and family engagement.
              Everything you need to run a successful home care agency in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Link to={createPageUrl("AgencyLogin")}>
                <Button size="lg" className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-lg px-10 py-7 shadow-2xl shadow-teal-500/50 hover:shadow-teal-600/50 transition-all duration-300 hover:scale-105">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-10 py-7 border-2 hover:border-teal-500 hover:bg-teal-50">
                <span className="flex items-center gap-2">
                  Watch Demo
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </span>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div id="stats" className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            <StatCard number="98%" label="Client Satisfaction" icon={Star} />
            <StatCard number="500+" label="Active Agencies" icon={Users} />
            <StatCard number="50K+" label="Visits Tracked" icon={Calendar} />
            <StatCard number="45%" label="Time Saved" icon={Clock} />
          </div>

          {/* Features Grid */}
          <div id="features" className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Everything You Need, All in One Place
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Powerful features designed to streamline your operations and improve care quality
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={Calendar}
                title="Smart Scheduling"
                description="Intelligent scheduling with caregiver matching, conflict detection, and automatic notifications."
                color="from-blue-500 to-cyan-500"
              />
              <FeatureCard
                icon={Smartphone}
                title="Mobile EVV"
                description="GPS-verified electronic visit verification with clock in/out, visit notes, and signatures."
                color="from-teal-500 to-green-500"
              />
              <FeatureCard
                icon={DollarSign}
                title="Automated Billing"
                description="Streamlined claims submission, payment tracking, and revenue cycle management."
                color="from-green-500 to-emerald-500"
              />
              <FeatureCard
                icon={Users}
                title="Family Portal"
                description="Real-time updates, visit ratings, photo sharing, and secure messaging with families."
                color="from-purple-500 to-pink-500"
              />
              <FeatureCard
                icon={Shield}
                title="Compliance & QA"
                description="Built-in quality audits, incident tracking, and regulatory compliance tools."
                color="from-orange-500 to-red-500"
              />
              <FeatureCard
                icon={Heart}
                title="Care Management"
                description="Medication tracking, care plans, vital signs, and comprehensive documentation."
                color="from-pink-500 to-rose-500"
              />
            </div>
          </div>

          {/* Testimonials Section */}
          <div id="testimonials" className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Loved by Healthcare Professionals
              </h2>
              <p className="text-xl text-slate-600">See what our customers have to say</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <TestimonialCard
                quote="Care Connect Pro has transformed how we manage our agency. Scheduling is now effortless and our caregivers love the mobile app."
                author="Sarah Johnson"
                role="Agency Director"
                company="CareFirst Home Health"
              />
              <TestimonialCard
                quote="The EVV system is incredibly reliable and has saved us countless hours on billing and compliance. Highly recommend!"
                author="Michael Chen"
                role="Operations Manager"
                company="Premier Care Services"
              />
              <TestimonialCard
                quote="Our families absolutely love the portal. They can see real-time updates and feel connected to their loved ones' care."
                author="Emily Rodriguez"
                role="Care Coordinator"
                company="Golden Years Home Care"
              />
            </div>
          </div>

          {/* Final CTA Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-3xl opacity-10 blur-3xl"></div>
            <div className="relative text-center bg-gradient-to-br from-teal-500 via-teal-600 to-blue-600 rounded-3xl p-12 md:p-16 text-white shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48"></div>

              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Agency?</h2>
                <p className="text-xl md:text-2xl mb-10 opacity-95 max-w-2xl mx-auto">
                  Join hundreds of agencies already using Care Connect Pro to deliver better care and grow their business
                </p>
                <Link to={createPageUrl("AgencyLogin")}>
                  <Button size="lg" variant="secondary" className="text-lg px-12 py-7 bg-white text-teal-600 hover:bg-slate-50 shadow-xl hover:scale-105 transition-all duration-300">
                    Start Your Free Trial
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <p className="mt-6 text-sm opacity-90">No credit card required • 14-day free trial • Cancel anytime</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white/50 backdrop-blur-sm mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">Care Connect Pro</span>
              </div>
              <p className="text-slate-600 text-sm">© 2025 Care Connect Pro. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color }) {
  return (
    <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200 hover:border-teal-200 hover:-translate-y-2">
      <div className={`w-16 h-16 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

function StatCard({ number, label, icon: Icon }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-center mb-3">
        <Icon className="w-8 h-8 text-teal-600" />
      </div>
      <div className="text-4xl font-bold text-slate-900 mb-2 bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
        {number}
      </div>
      <div className="text-sm text-slate-600 font-medium">{label}</div>
    </div>
  );
}

function TestimonialCard({ quote, author, role, company }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-slate-700 mb-6 leading-relaxed italic">"{quote}"</p>
      <div className="border-t border-slate-200 pt-4">
        <p className="font-bold text-slate-900">{author}</p>
        <p className="text-sm text-slate-600">{role}</p>
        <p className="text-sm text-teal-600 font-medium">{company}</p>
      </div>
    </div>
  );
}