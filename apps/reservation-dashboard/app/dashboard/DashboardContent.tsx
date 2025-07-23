// app/ReservationDashboard/dashboard/DashboardContent.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/supabase";
import {
  LayoutDashboard,
  Calendar,
  CreditCard,
  CheckCircle,
  User,
  Users,
} from "lucide-react";

// Components
import PropertyTab from "./components/tabs/PropertyTab";
import PaymentsTab from "./components/tabs/PaymentsTab";
import ProfileTab from "./components/tabs/ProfileTab";
import RoommateTab from "./components/tabs/RoommateTab";
import ReservedProperty from "./components/tabs/ReservedProperty";
import RequestedBookingsTab from "./components/tabs/RequestedBookings";
import NoProperty from "./components/NoProperty";
import DashboardHeader from "./components/UI/DashboardHeader";
import Sidebar from "./components/Sidebar";
import { LoadingSpinner } from "./components/UI/LoadingSpinner";
import MobileNavBar from "./components/UI/MobileNavBar";
import MobileMenuToggle from "./components/UI/MobileMenuToggle";

// Hooks
import { usePropertyManager } from "./hooks/usePropertyManager";
import { useNavigation } from "./hooks/useNavigation";

// Types
import { TabType } from "../../types";

export default function DashboardContent() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Use custom hooks
  const {
    activeTab,
    isMobileMenuOpen,
    handleTabChange,
    toggleMobileMenu,
    setIsMobileMenuOpen,
  } = useNavigation();

  const {
    property,
    isPropertyReserved,
    handleReserveProperty,
    handleFindAnotherProperty,
    formatPrice,
    loading: propertyLoading,
    error: propertyError,
  } = usePropertyManager(router, activeTab);

  // Authentication effect
  useEffect(() => {
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      if (!session) {
        const urlParams = new URLSearchParams(
          window.location.search
        ).toString();
        if (urlParams) {
          localStorage.setItem("propertyParams", urlParams);
        }
        router.push("/ReservationDashboard");
        return;
      }

      setUser(session.user);
      setAuthLoading(false);
    });

    // Close mobile menu when window is resized
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("resize", handleResize);
    };
  }, [router, setIsMobileMenuOpen]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/ReservationDashboard");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const onReserveProperty = () => {
    const redirectTab = handleReserveProperty();
    if (redirectTab) {
      handleTabChange(redirectTab as TabType);
    }
  };

  // Navigation items for both sidebar and mobile navigation
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      mobileLabel: "Home",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: "bookings",
      label: "Requested Bookings",
      mobileLabel: "Bookings",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      id: "payments",
      label: "Payments",
      mobileLabel: "Payments",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      id: "reserved",
      label: "Reserved Property",
      mobileLabel: "Reserved",
      icon: <CheckCircle className="w-5 h-5" />,
    },
    {
      id: "profile",
      label: "My Profile",
      mobileLabel: "Profile",
      icon: <User className="w-5 h-5" />,
    },
    {
      id: "roommates",
      label: "Roommate Matching",
      mobileLabel: "Roommates",
      icon: <Users className="w-5 h-5" />,
    },
  ];

  // Show loading spinner while checking authentication
  if (authLoading) {
    return <LoadingSpinner />;
  }

  // Render main content based on active tab
  const renderMainContent = () => {
    if (activeTab === "dashboard") {
      // Show loading state while fetching property
      if (propertyLoading) {
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </div>
        );
      }

      // Show error state if property fetch failed
      if (propertyError) {
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h2 className="text-2xl font-semibold mb-2">
                Error Loading Property
              </h2>
              <p className="text-gray-600 mb-4">{propertyError}</p>
              <button
                onClick={handleFindAnotherProperty}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Find Another Property
              </button>
            </div>
          </div>
        );
      }

      if (isPropertyReserved) {
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <div className="text-green-500 text-5xl mb-4">✓</div>
              <h2 className="text-2xl font-semibold mb-2">
                Property Reserved!
              </h2>
              <p className="text-gray-600 mb-4">
                Your property has been successfully reserved. You can view the
                details in the Reserved Property tab.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => handleTabChange("reserved")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Reserved Property
                </button>
                <button
                  onClick={handleFindAnotherProperty}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Find Another Property
                </button>
              </div>
            </div>
          </div>
        );
      } else if (property) {
        return (
          <PropertyTab
            property={property}
            formatPrice={formatPrice}
            onReserve={onReserveProperty}
          />
        );
      } else {
        return <NoProperty />;
      }
    } else if (activeTab === "bookings") {
      return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <RequestedBookingsTab />
        </div>
      );
    } else if (activeTab === "payments") {
      return (
        <PaymentsTab
          property={property}
          formatPrice={formatPrice}
          setActiveTab={handleTabChange}
        />
      );
    } else if (activeTab === "profile") {
      return <ProfileTab />;
    } else if (activeTab === "roommates") {
      return <RoommateTab />;
    } else if (activeTab === "reserved") {
      return isPropertyReserved && property ? (
        <ReservedProperty
          formatPrice={formatPrice}
        />
      ) : (
        <NoProperty />
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileMenuToggle isOpen={isMobileMenuOpen} onToggle={toggleMobileMenu} />

      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Desktop Sidebar */}
      <Sidebar
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isMobile={false}
      />

      {/* Mobile Sidebar */}
      <Sidebar
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isMobile={true}
        isOpen={isMobileMenuOpen}
      />

      {/* Main Content */}
      <div className="lg:ml-64">
        <DashboardHeader
          activeTab={activeTab}
          user={user}
          property={property}
          isPropertyReserved={isPropertyReserved}
          handleLogout={handleLogout}
          handleTabChange={handleTabChange}
          handleFindAnotherProperty={handleFindAnotherProperty}
        />

        <main className="p-4 md:p-6 pb-20 lg:pb-6">
          <Suspense fallback={<LoadingSpinner />}>
            {renderMainContent()}
          </Suspense>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNavBar
          navItems={navItems.slice(0, 5).map((item) => ({
            id: item.id,
            label: item.mobileLabel,
            icon: item.icon,
          }))}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>
    </div>
  );
}
