import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Heart, Menu, X, ArrowRight } from "lucide-react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50">
      {/* TOP NAVIGATION BAR */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">HomeCare+</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-slate-600 hover:text-teal-600">Features</a>
              <a href="#pricing" className="text-slate-600 hover:text-teal-600">Pricing</a>
              <a href="#about" className="text-slate-600 hover:text-teal-600">About</a>
              <Link to={createPageUrl("Dashboard")}>
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Link to={createPageUrl("Clients")}>
                <Button className="bg-gradient-to-r from-teal-500 to-blue-600">Get Started</Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-200 py-4 space-y-3">
              <a href="#features" className="block py-2 text-slate-600">Features</a>
              <a href="#pricing" className="block py-2 text-slate-600">Pricing</a>
              <a href="#about" className="block py-2 text-slate-600">About</a>
              <Link to={createPageUrl("Dashboard")} className="block">
                <Button variant="outline" className="w-full">Dashboard</Button>
              </Link>
              <Link to={createPageUrl("Clients")} className="block">
                <Button className="w-full bg-gradient-to-r from-teal-500 to-blue-600">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Transform Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">Home Care Agency</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Complete platform for scheduling, EVV, billing, compliance, and family engagement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Dashboard")}>
              <Button size="lg" className="bg-gradient-to-r from-teal-500 to-blue-600 text-lg px-8 py-6">
                Go to Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl("Clients")}>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                View Clients
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="grid md:grid-cols-3 gap-8 mt-20">
          <FeatureCard 
            icon="📅"
            title="Smart Scheduling"
            description="Intelligent scheduling with caregiver matching and conflict detection."
          />
          <FeatureCard 
            icon="📱"
            title="Mobile EVV"
            description="GPS-verified electronic visit verification with clock in/out."
          />
          <FeatureCard 
            icon="💰"
            title="Automated Billing"
            description="Streamlined claims submission and revenue cycle management."
          />
          <FeatureCard 
            icon="👨‍👩‍👧"
            title="Family Portal"
            description="Real-time updates and secure messaging with families."
          />
          <FeatureCard 
            icon="🛡️"
            title="Compliance & QA"
            description="Quality audits, incident tracking, and compliance tools."
          />
          <FeatureCard 
            icon="❤️"
            title="Care Management"
            description="Medication tracking, care plans, and documentation."
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}