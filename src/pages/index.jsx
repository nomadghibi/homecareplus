import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Clients from "./Clients";

import Caregivers from "./Caregivers";

import Schedule from "./Schedule";

import EVV from "./EVV";

import Documentation from "./Documentation";

import Billing from "./Billing";

import PricingStrategies from "./PricingStrategies";

import AuditLogs from "./AuditLogs";

import Landing from "./Landing";

import Pricing from "./Pricing";

import SignUp from "./SignUp";

import Home from "./Home";

import Reports from "./Reports";

import Documents from "./Documents";

import Messages from "./Messages";

import FamilyPortal from "./FamilyPortal";

import FamilyVisitHistory from "./FamilyVisitHistory";

import Medications from "./Medications";

import CarePlans from "./CarePlans";

import Incidents from "./Incidents";

import QualityAssurance from "./QualityAssurance";

import MobileApp from "./MobileApp";

import Onboarding from "./Onboarding";

import AgencyLogin from "./AgencyLogin";

import FamilyLogin from "./FamilyLogin";

import CaregiverLogin from "./CaregiverLogin";

import CaregiverSetup from "./CaregiverSetup";

import CaregiverDashboard from "./CaregiverDashboard";

import Checkout from "./Checkout";

import ResetPassword from "./ResetPassword";

import EmailTest from "./EmailTest";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Clients: Clients,
    
    Caregivers: Caregivers,
    
    Schedule: Schedule,
    
    EVV: EVV,
    
    Documentation: Documentation,
    
    Billing: Billing,

    PricingStrategies: PricingStrategies,

    AuditLogs: AuditLogs,
    
    Landing: Landing,

    Pricing: Pricing,

    SignUp: SignUp,

    Home: Home,
    
    Reports: Reports,
    
    Documents: Documents,
    
    Messages: Messages,
    
    FamilyPortal: FamilyPortal,
    
    FamilyVisitHistory: FamilyVisitHistory,
    
    Medications: Medications,
    
    CarePlans: CarePlans,
    
    Incidents: Incidents,
    
    QualityAssurance: QualityAssurance,
    
    MobileApp: MobileApp,
    
    Onboarding: Onboarding,
    
    AgencyLogin: AgencyLogin,

    FamilyLogin: FamilyLogin,

    CaregiverLogin: CaregiverLogin,

    CaregiverSetup: CaregiverSetup,

    CaregiverDashboard: CaregiverDashboard,

    Checkout: Checkout,

    ResetPassword: ResetPassword,

    EmailTest: EmailTest,

}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>

                    <Route path="/" element={<Landing />} />


                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Clients" element={<Clients />} />
                
                <Route path="/Caregivers" element={<Caregivers />} />
                
                <Route path="/Schedule" element={<Schedule />} />
                
                <Route path="/EVV" element={<EVV />} />
                
                <Route path="/Documentation" element={<Documentation />} />
                
                <Route path="/Billing" element={<Billing />} />

                <Route path="/PricingStrategies" element={<PricingStrategies />} />

                <Route path="/AuditLogs" element={<AuditLogs />} />
                
                <Route path="/Landing" element={<Landing />} />

                <Route path="/Pricing" element={<Pricing />} />

                <Route path="/SignUp" element={<SignUp />} />

                <Route path="/Home" element={<Home />} />
                
                <Route path="/Reports" element={<Reports />} />
                
                <Route path="/Documents" element={<Documents />} />
                
                <Route path="/Messages" element={<Messages />} />
                
                <Route path="/FamilyPortal" element={<FamilyPortal />} />
                
                <Route path="/FamilyVisitHistory" element={<FamilyVisitHistory />} />
                
                <Route path="/Medications" element={<Medications />} />
                
                <Route path="/CarePlans" element={<CarePlans />} />
                
                <Route path="/Incidents" element={<Incidents />} />
                
                <Route path="/QualityAssurance" element={<QualityAssurance />} />
                
                <Route path="/MobileApp" element={<MobileApp />} />
                
                <Route path="/Onboarding" element={<Onboarding />} />
                
                <Route path="/AgencyLogin" element={<AgencyLogin />} />

                <Route path="/FamilyLogin" element={<FamilyLogin />} />

                <Route path="/CaregiverLogin" element={<CaregiverLogin />} />

                <Route path="/CaregiverSetup" element={<CaregiverSetup />} />

                <Route path="/CaregiverDashboard" element={<CaregiverDashboard />} />

                <Route path="/Checkout" element={<Checkout />} />

                <Route path="/reset-password" element={<ResetPassword />} />

                <Route path="/EmailTest" element={<EmailTest />} />

            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}