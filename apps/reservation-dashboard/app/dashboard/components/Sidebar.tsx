// app/dashboard/components/Sidebar.tsx
"use client";

import { ReactNode } from "react";
import { TabType } from "../../../types";

// Define the shape of each navigation item
interface NavItem {
  id: string;
  label: string;
  mobileLabel?: string;
  icon: ReactNode;
}

// Update the SidebarProps to include navItems
interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void; // Changed from setActiveTab to onTabChange
  navItems: NavItem[]; // Add this line
  isMobile?: boolean;
  isOpen?: boolean;
}

export default function Sidebar({ 
  activeTab, 
  onTabChange, // Note: changed parameter name to match
  navItems,
  isMobile = false,
  isOpen = true
}: SidebarProps) {
  // Create different styles for mobile and desktop sidebars
  const sidebarClasses = isMobile
    ? `fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 text-white transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-200 ease-in-out lg:hidden h-full`
    : "fixed h-full w-64 bg-gray-900 text-white hidden lg:block";

  return (
    <div className={sidebarClasses}>
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold">Rental Platform</h1>
      </div>

      <nav className="mt-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onTabChange(item.id as TabType)}
                className={`w-full text-left px-6 py-3 flex items-center space-x-2 hover:bg-gray-700 transition-colors ${
                  activeTab === item.id
                    ? "bg-gray-700 border-l-4 border-blue-500"
                    : ""
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}