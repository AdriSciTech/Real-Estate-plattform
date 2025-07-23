// app/dashboard/components/UI/DashboardHeader.tsx
"use client";

import { PropertyData, TabType } from "../../../../types";

interface DashboardHeaderProps {
  activeTab: TabType;
  user: any;
  property: PropertyData | null;
  isPropertyReserved: boolean;
  handleLogout: () => Promise<void>;
  handleTabChange: (tab: TabType) => void;
  handleFindAnotherProperty: () => void;
}

export default function DashboardHeader({
  activeTab,
  user,
  property,
  isPropertyReserved,
  handleLogout,
  handleTabChange,
  handleFindAnotherProperty
}: DashboardHeaderProps) {
  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-gray-800">
          {activeTab === "dashboard" && "Dashboard"}
          {activeTab === "bookings" && "Requested Bookings"}
          {activeTab === "payments" && "Payments"}
          {activeTab === "profile" && "My Profile"}
          {activeTab === "roommates" && "Roommate Matching"}
          {activeTab === "reserved" && "Reserved Property"}
        </h1>

        {isPropertyReserved && (
          <button
            onClick={() => handleTabChange("reserved")}
            className="px-4 py-1.5 bg-green-100 text-green-800 rounded-full flex items-center hover:bg-green-200 transition-colors text-sm font-medium"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
            Reserved Property
          </button>
        )}

        {property && !isPropertyReserved && (
          <button
            onClick={handleFindAnotherProperty}
            className="px-4 py-1.5 bg-blue-100 text-blue-800 rounded-full flex items-center hover:bg-blue-200 transition-colors text-sm font-medium"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
            Find Another Property
          </button>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <span className="text-gray-600 hidden md:inline">{user?.email}</span>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-colors"
        >
          Log Out
        </button>
      </div>
    </header>
  );
}