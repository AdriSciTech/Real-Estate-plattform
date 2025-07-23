// dashboard/hooks/useNavigation.ts
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { TabType } from "../types";

export function useNavigation() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize active tab from URL
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam &&
      [
        "dashboard",
        "bookings",
        "payments",
        "profile",
        "roommates",
        "reserved",
      ].includes(tabParam)
    ) {
      setActiveTab(tabParam as TabType);
    }
  }, [searchParams]);

  // Handle tab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    
    // Update URL with tab parameter
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("tab", tab);
    window.history.replaceState({}, "", newUrl.toString());
    
    // Close mobile menu after tab change
    setIsMobileMenuOpen(false);
  };

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return {
    activeTab,
    isMobileMenuOpen,
    handleTabChange,
    toggleMobileMenu,
    setIsMobileMenuOpen
  };
}