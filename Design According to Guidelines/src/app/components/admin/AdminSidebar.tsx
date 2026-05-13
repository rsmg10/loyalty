import React from 'react';
import { LayoutDashboard, Building2, Users, Headphones, Settings, Shield, LogOut } from 'lucide-react';

interface AdminSidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

export function AdminSidebar({ activeSection, onNavigate }: AdminSidebarProps) {
  const menuItems = [
    { id: 'platform-dashboard', icon: LayoutDashboard, label: 'Platform Dashboard' },
    { id: 'tenant-management', icon: Building2, label: 'Tenant Management' },
    { id: 'user-management', icon: Users, label: 'User Management' },
    { id: 'support', icon: Headphones, label: 'Support' },
    { id: 'global-settings', icon: Settings, label: 'Global Settings' }
  ];

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="font-bold">Loyalty Platform</h1>
            <p className="text-xs text-gray-400">Admin Portal</p>
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
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Admin User */}
      <div className="px-3 py-4 border-t border-gray-800">
        <div className="px-3 py-2 mb-2">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={14} className="text-purple-400" />
            <p className="text-xs text-purple-400 font-medium">System Admin</p>
          </div>
          <p className="font-medium text-sm">Admin User</p>
          <p className="text-xs text-gray-400">admin@platform.com</p>
        </div>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
