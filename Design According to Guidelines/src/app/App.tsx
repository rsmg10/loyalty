import React, { useState } from 'react';
import { Smartphone, Building2, Shield, Store } from 'lucide-react';
import { Card, CardBody } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { LanguageProvider } from './context/LanguageContext';

// Customer App Components
import { SignIn } from './components/customer/SignIn';
import { CustomerHome } from './components/customer/CustomerHome';
import { CustomerExplore } from './components/customer/CustomerExplore';
import { BusinessProfile } from './components/customer/BusinessProfile';
import { LoyaltyCard } from './components/customer/LoyaltyCard';
import { CustomerProfile } from './components/customer/CustomerProfile';
import { CustomerRewards } from './components/customer/CustomerRewards';
import { CustomerQRCode } from './components/customer/CustomerQRCode';

// Business Mobile App Components
import { BusinessMobileSignIn } from './components/business-mobile/BusinessMobileSignIn';
import { BusinessMobileHome } from './components/business-mobile/BusinessMobileHome';
import { BusinessMobileScan } from './components/business-mobile/BusinessMobileScan';
import { BusinessMobileActivity } from './components/business-mobile/BusinessMobileActivity';
import { BusinessMobileCustomers } from './components/business-mobile/BusinessMobileCustomers';
import { BusinessMobileProfile } from './components/business-mobile/BusinessMobileProfile';
import { BusinessMobileNav } from './components/business-mobile/BusinessMobileNav';

// Business Portal Components
import { BusinessSidebar } from './components/business/BusinessSidebar';
import { BusinessDashboard } from './components/business/BusinessDashboard';
import { UserManagement } from './components/business/UserManagement';
import { StaffOperations } from './components/business/StaffOperations';

// Admin Portal Components
import { AdminSidebar } from './components/admin/AdminSidebar';
import { PlatformDashboard } from './components/admin/PlatformDashboard';
import { TenantManagement } from './components/admin/TenantManagement';
import { AdminUserManagement } from './components/admin/AdminUserManagement';

type Experience = 'home' | 'customer' | 'business-mobile' | 'business' | 'admin';
type CustomerView = 'home' | 'explore' | 'business-profile' | 'loyalty-card' | 'profile' | 'rewards' | 'redemption' | 'qrcode';
type BizMobileView = 'home' | 'scan' | 'customers' | 'activity' | 'profile';
type BusinessSection = 'dashboard' | 'programs' | 'offers' | 'customers' | 'user-management' | 'staff-ops' | 'settings';
type AdminSection = 'platform-dashboard' | 'tenant-management' | 'user-management' | 'support' | 'global-settings';

export default function App() {
  const [experience, setExperience] = useState<Experience>('home');
  const [customerView, setCustomerView] = useState<CustomerView>('home');
  const [bizMobileView, setBizMobileView] = useState<BizMobileView>('home');
  const [businessSection, setBusinessSection] = useState<BusinessSection>('dashboard');
  const [adminSection, setAdminSection] = useState<AdminSection>('platform-dashboard');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isBizSignedIn, setIsBizSignedIn] = useState(false);

  // Landing Page
  if (experience === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 flex items-center justify-center p-6">
        <div className="max-w-5xl w-full">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-indigo-200 text-sm mb-6">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Multi-tenant Loyalty Platform — Libya
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">Loyalty Platform</h1>
            <p className="text-lg text-indigo-300">Choose an experience to explore</p>
          </div>

          <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Customer App */}
            <Card hoverable onClick={() => setExperience('customer')}>
              <CardBody className="py-10 text-center">
                <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-5 shadow-lg" style={{width: '72px', height: '72px'}}>
                  <Smartphone className="text-white" size={36} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Customer App</h2>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">Mobile-first loyalty experience for customers in Libya</p>
                <Button variant="primary" fullWidth className="!bg-gradient-to-r !from-indigo-600 !to-violet-600">Launch Customer App</Button>
              </CardBody>
            </Card>

            {/* Business Mobile App */}
            <Card hoverable onClick={() => setExperience('business-mobile')}>
              <CardBody className="py-10 text-center">
                <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-5 shadow-lg" style={{width: '72px', height: '72px'}}>
                  <Store className="text-white" size={36} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Business Phone App</h2>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">Staff mobile app to scan QR codes, stamp cards & manage customers</p>
                <Button variant="primary" fullWidth className="!bg-gradient-to-r !from-amber-500 !to-orange-600">Launch Business App</Button>
              </CardBody>
            </Card>

            {/* Business Portal */}
            <Card hoverable onClick={() => setExperience('business')}>
              <CardBody className="py-10 text-center">
                <div className="rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-lg" style={{width: '72px', height: '72px'}}>
                  <Building2 className="text-white" size={36} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Business Portal</h2>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">Dashboard for business owners to manage loyalty programs</p>
                <Button variant="primary" fullWidth className="!bg-gradient-to-r !from-teal-600 !to-emerald-600">Launch Business Portal</Button>
              </CardBody>
            </Card>

            {/* Admin Portal */}
            <Card hoverable onClick={() => setExperience('admin')}>
              <CardBody className="py-10 text-center">
                <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center mx-auto mb-5 shadow-lg" style={{width: '72px', height: '72px'}}>
                  <Shield className="text-white" size={36} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Admin Portal</h2>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">System administration for platform management and oversight</p>
                <Button variant="primary" fullWidth className="!bg-gradient-to-r !from-violet-600 !to-purple-700">Launch Admin Portal</Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Business Mobile App Experience
  if (experience === 'business-mobile') {
    const renderBizMobileView = () => {
      if (!isBizSignedIn) {
        return <BusinessMobileSignIn onSignIn={() => setIsBizSignedIn(true)} />;
      }
      switch (bizMobileView) {
        case 'scan':
          return <BusinessMobileScan onNavigate={setBizMobileView} />;
        case 'customers':
          return <BusinessMobileCustomers onNavigate={setBizMobileView} />;
        case 'activity':
          return <BusinessMobileActivity onNavigate={setBizMobileView} />;
        case 'profile':
          return <BusinessMobileProfile onNavigate={setBizMobileView} />;
        default:
          return <BusinessMobileHome onNavigate={setBizMobileView} />;
      }
    };

    return (
      <div className="min-h-screen bg-gray-100">
        {isBizSignedIn && (
          <div className="fixed top-4 left-4 z-50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setExperience('home'); setIsBizSignedIn(false); setBizMobileView('home'); }}
              className="bg-white/90 backdrop-blur-sm shadow"
            >
              ← Back to Home
            </Button>
          </div>
        )}
        <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative">
          {renderBizMobileView()}
          {isBizSignedIn && (
            <BusinessMobileNav active={bizMobileView} onNavigate={setBizMobileView} />
          )}
        </div>
      </div>
    );
  }

  // Customer Mobile App Experience
  if (experience === 'customer') {
    const renderCustomerView = () => {
      // Show sign-in if not signed in
      if (!isSignedIn) {
        return <SignIn onSignIn={() => setIsSignedIn(true)} />;
      }

      switch (customerView) {
        case 'explore':
          return <CustomerExplore onNavigate={setCustomerView} />;
        case 'business-profile':
          return <BusinessProfile onNavigate={setCustomerView} onBack={() => setCustomerView('explore')} />;
        case 'loyalty-card':
          return <LoyaltyCard onNavigate={setCustomerView} onBack={() => setCustomerView('home')} />;
        case 'rewards':
          return <CustomerRewards onNavigate={setCustomerView} />;
        case 'profile':
          return <CustomerProfile onNavigate={setCustomerView} />;
        case 'qrcode':
          return <CustomerQRCode onBack={() => setCustomerView('home')} />;
        default:
          return <CustomerHome onNavigate={setCustomerView} />;
      }
    };

    return (
      <LanguageProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Back to Home Button - Only show when signed in */}
          {isSignedIn && (
            <div className="fixed top-4 left-4 z-50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setExperience('home');
                  setIsSignedIn(false);
                }}
                className="bg-white/90 backdrop-blur-sm"
              >
                ← Back to Home
              </Button>
            </div>
          )}

          {/* Mobile Container */}
          <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl">
            {renderCustomerView()}
          </div>
        </div>
      </LanguageProvider>
    );
  }

  // Business Portal Experience
  if (experience === 'business') {
    const renderBusinessSection = () => {
      switch (businessSection) {
        case 'user-management':
          return <UserManagement />;
        case 'staff-ops':
          return <StaffOperations />;
        default:
          return <BusinessDashboard />;
      }
    };

    return (
      <div className="flex h-screen bg-gray-50">
        <BusinessSidebar activeSection={businessSection} onNavigate={setBusinessSection} />
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setExperience('home')}>
              ← Back to Home
            </Button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Business Portal</span>
            </div>
          </div>
          {renderBusinessSection()}
        </div>
      </div>
    );
  }

  // Admin Portal Experience
  if (experience === 'admin') {
    const renderAdminSection = () => {
      switch (adminSection) {
        case 'tenant-management':
          return <TenantManagement />;
        case 'user-management':
          return <AdminUserManagement />;
        default:
          return <PlatformDashboard />;
      }
    };

    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar activeSection={adminSection} onNavigate={setAdminSection} />
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setExperience('home')}>
              ← Back to Home
            </Button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Admin Portal</span>
            </div>
          </div>
          {renderAdminSection()}
        </div>
      </div>
    );
  }

  return null;
}