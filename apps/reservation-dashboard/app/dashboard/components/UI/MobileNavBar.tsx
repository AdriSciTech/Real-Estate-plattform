// dashboard/components/UI/MobileNavBar.tsx
import { ReactNode } from "react";
import { TabType } from "../../../../types";

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
}

interface MobileNavBarProps {
  navItems: NavItem[];
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function MobileNavBar({ navItems, activeTab, onTabChange }: MobileNavBarProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md z-10">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id as TabType)}
            className={`flex flex-col items-center justify-center ${
              activeTab === item.id ? "text-blue-600" : "text-gray-500"
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}