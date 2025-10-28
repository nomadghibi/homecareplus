
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  FileText,
  DollarSign,
  MapPin,
  FileCheck,
  Settings,
  LogOut,
  Menu,
  X,
  Heart,
  MessageSquare,
  Pill,
  ClipboardList,
  Shield,
  Smartphone,
  AlertTriangle,
  BarChart3,
  User,
  ChevronDown
} from "lucide-react";

export default function Layout({ children, currentPageName }) {
  // No layout for public pages - check this BEFORE calling any hooks
  const publicPages = ["Landing", "AgencyLogin", "FamilyLogin", "Onboarding", "Home"];
  const isPublicPage = publicPages.includes(currentPageName);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState(null);
  const navigate = useNavigate();

  // Fetch current user on mount (only for non-public pages)
  React.useEffect(() => {
    if (isPublicPage) return;

    const fetchUser = async () => {
      try {
        const user = await base44.auth.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    };
    fetchUser();
  }, [isPublicPage]);

  // Early return for public pages (after all hooks have been called)
  if (isPublicPage) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await base44.auth.logout();
    navigate(createPageUrl("Landing"), { replace: true });
  };

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "Dashboard" },
    { name: "Clients", icon: Users, path: "Clients" },
    { name: "Caregivers", icon: UserCheck, path: "Caregivers" },
    { name: "Schedule", icon: Calendar, path: "Schedule" },
    { name: "EVV", icon: MapPin, path: "EVV" },
    { name: "Visit Notes", icon: FileText, path: "Documentation" },
    { name: "Billing", icon: DollarSign, path: "Billing" },
    { name: "Reports", icon: BarChart3, path: "Reports" },
    { name: "File Storage", icon: FileCheck, path: "Documents" },
    { name: "Messages", icon: MessageSquare, path: "Messages" },
    { name: "Medications", icon: Pill, path: "Medications" },
    { name: "Care Plans", icon: ClipboardList, path: "CarePlans" },
    { name: "Incidents", icon: AlertTriangle, path: "Incidents" },
    { name: "Quality", icon: Shield, path: "QualityAssurance" },
    { name: "Mobile App", icon: Smartphone, path: "MobileApp" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-teal-600" />
          <span className="font-bold text-lg">CareConnect</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Notifications for Mobile */}
          {currentUser && <NotificationCenter />}

          {/* User Menu for Mobile */}
          {currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-semibold">{currentUser.name}</span>
                    <span className="text-xs text-slate-500 font-normal">{currentUser.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-700">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-white pt-16 overflow-y-auto">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={createPageUrl(item.path)}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  currentPageName === item.path
                    ? "bg-teal-50 text-teal-700"
                    : "hover:bg-slate-100"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 min-h-screen sticky top-0">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">CareConnect Pro</h1>
                <p className="text-xs text-slate-500">Home Care Platform</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={createPageUrl(item.path)}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  currentPageName === item.path
                    ? "bg-teal-50 text-teal-700 font-medium"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.name}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Desktop Top Header */}
          <header className="hidden lg:flex bg-white border-b border-slate-200 px-8 py-4 items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-slate-800">{currentPageName}</h2>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              {currentUser && <NotificationCenter />}

              {/* User Profile Section */}
              {currentUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-3 h-auto py-2 px-3 hover:bg-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-semibold text-slate-800">{currentUser.name}</div>
                        <div className="text-xs text-slate-500">{currentUser.email}</div>
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-semibold">{currentUser.name}</span>
                      <span className="text-xs text-slate-500 font-normal">{currentUser.email}</span>
                      {currentUser.role && (
                        <span className="text-xs text-teal-600 font-medium mt-1">{currentUser.role}</span>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-700 focus:bg-red-50">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              )}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
