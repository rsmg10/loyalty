import React from 'react';
import { LayoutDashboard, Award, Gift, Users, UserCog, Scan, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

export function BusinessSidebar({ activeSection, onNavigate }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'programs', icon: Award, label: 'Loyalty Programs' },
    { id: 'offers', icon: Gift, label: 'Offers & Rewards' },
    { id: 'customers', icon: Users, label: 'Customers' },
    { id: 'user-management', icon: UserCog, label: 'User Management' },
    { id: 'staff-ops', icon: Scan, label: 'Staff Operations' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-xl">
            ☕
          </div>
          <div>
            <h1 className="font-bold">Blue Bottle Coffee</h1>
            <p className="text-xs text-gray-400">Business Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
              activeSection === item.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Menu */}
      <div className="px-3 py-4 border-t border-gray-800">
        <div className="px-3 py-2 mb-2">
          <p className="font-medium text-sm">John Smith</p>
          <p className="text-xs text-gray-400">Owner</p>
        </div>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
