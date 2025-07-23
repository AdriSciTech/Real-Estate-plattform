//my-app\app\admin\page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import PropertyTable from "@/components/PropertyTable";
import PropertyMap from "@/components/PropertyMap";
import { Property } from "@/lib/types";
import { createClient } from "@/lib/supabase";

export default function AdminDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("properties");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"table" | "split">("split");

  const PROPERTIES_PER_PAGE = 10;
  const supabase = createClient();

  const fetchProperties = async (page = 1, search = "") => {
    setLoading(true);

    try {
      if (!supabase) {
        console.error("Supabase client is not initialized.");
        setLoading(false);
        return;
      }

      let query = supabase
        .from("properties")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(
          `title.ilike.%${search}%,address.ilike.%${search}%,type.ilike.%${search}%`
        );
      }

      const { data, error, count } = await query.range(
        (page - 1) * PROPERTIES_PER_PAGE,
        page * PROPERTIES_PER_PAGE - 1
      );

      if (error) throw error;

      setProperties(data || []);
      setTotalPages(Math.ceil((count || 0) / PROPERTIES_PER_PAGE));
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleDelete = (deletedId: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== deletedId));
    if (selectedProperty?.id === deletedId) {
      setSelectedProperty(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProperties(1, searchTerm);
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    } else {
      console.error("Supabase client is not initialized.");
    }
  };

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
  };

  const tabs = [
    { id: "properties", label: "Properties", count: properties.length },
    { id: "analytics", label: "Analytics", count: null },
    { id: "settings", label: "Settings", count: null },
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              {/* Left side - Navigation */}
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">P</span>
                  </div>
                  <h1 className="text-xl font-semibold text-white">
                    Property Manager
                  </h1>
                </div>

                {/* Navigation Tabs */}
                <nav className="hidden md:flex space-x-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? "bg-gray-700 text-white"
                          : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                      }`}
                    >
                      <span>{tab.label}</span>
                      {tab.count !== null && (
                        <span className="ml-2 px-2 py-0.5 bg-gray-600 text-xs rounded-full">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Right side - Actions */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-400">
                    All changes saved
                  </span>
                </div>

                <Link
                  href="/admin/new"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <span>+</span>
                  <span>New Property</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === "properties" && (
            <>
              {/* Stats Grid - Modern Design */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Properties Card */}
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-400 mb-1">
                        Total Properties
                      </p>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-white">
                          {properties.length}
                        </span>
                        <span className="text-sm font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                          +
                          {properties.length > 0
                            ? Math.max(0, properties.length - 1)
                            : 0}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        vs last period
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Mini visualization */}
                  <div className="h-8 mb-4 flex items-end space-x-1">
                    {[12, 19, 15, 25, 22, 18, 28, 32, 24, 30, 26, 35].map(
                      (height, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-blue-500/40 rounded-sm transition-all duration-300 hover:bg-blue-400/60"
                          style={{ height: `${(height / 35) * 100}%` }}
                        ></div>
                      )
                    )}
                  </div>

                  {/* Bottom stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700/50">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">
                        {Math.max(0, properties.length - 1)}
                      </div>
                      <div className="text-xs text-gray-400">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">0</div>
                      <div className="text-xs text-gray-400">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">1</div>
                      <div className="text-xs text-gray-400">Sold</div>
                    </div>
                  </div>
                </div>

                {/* Average Price Card */}
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-400 mb-1">
                        Avg. Price
                      </p>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-white">
                          {properties.length > 0
                            ? `$${Math.round(
                                properties.reduce(
                                  (sum, p) => sum + p.price,
                                  0
                                ) /
                                  properties.length /
                                  1000
                              )}K`
                            : "$0"}
                        </span>
                        <span className="text-sm font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                          +8%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        vs last period
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Price trend line */}
                  <div className="h-8 mb-4 relative">
                    <svg className="w-full h-full" viewBox="0 0 100 32">
                      <defs>
                        <linearGradient
                          id="priceGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop
                            offset="0%"
                            style={{ stopColor: "#10B981", stopOpacity: 0.3 }}
                          />
                          <stop
                            offset="100%"
                            style={{ stopColor: "#10B981", stopOpacity: 0.8 }}
                          />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 0,20 Q 20,15 25,12 T 50,8 T 75,10 T 100,6"
                        stroke="url(#priceGradient)"
                        strokeWidth="2"
                        fill="none"
                        className="drop-shadow-sm"
                      />
                      <circle
                        cx="100"
                        cy="6"
                        r="3"
                        fill="#10B981"
                        className="animate-pulse"
                      />
                    </svg>
                  </div>

                  {/* Bottom stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700/50">
                    <div>
                      <div className="text-sm font-semibold text-white">
                        Highest
                      </div>
                      <div className="text-lg font-bold text-white">
                        {properties.length > 0
                          ? `$${Math.max(
                              ...properties.map((p) => p.price)
                            ).toLocaleString()}`
                          : "$0"}
                      </div>
                      <div className="text-xs text-gray-500">Premium</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">
                        Lowest
                      </div>
                      <div className="text-lg font-bold text-white">
                        {properties.length > 0
                          ? `$${Math.min(
                              ...properties.map((p) => p.price)
                            ).toLocaleString()}`
                          : "$0"}
                      </div>
                      <div className="text-xs text-blue-400">Starter</div>
                    </div>
                  </div>
                </div>

                {/* Property Types Card */}
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-400 mb-1">
                        Property Types
                      </p>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-white">
                          {new Set(properties.map((p) => p.type)).size}
                        </span>
                        <span className="text-xs text-gray-400">
                          categories
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">unique types</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Type distribution */}
                  <div className="mb-4">
                    {(() => {
                      const typeCount: Record<string, number> = {};
                      properties.forEach((p) => {
                        typeCount[p.type] = (typeCount[p.type] || 0) + 1;
                      });
                      const types = Object.entries(typeCount);
                      const colors = [
                        "#8B5CF6",
                        "#06B6D4",
                        "#F59E0B",
                        "#EF4444",
                      ];

                      return types.slice(0, 4).map(([type, count], index) => {
                        const percentage =
                          properties.length > 0
                            ? ((count as number) / properties.length) * 100
                            : 0;
                        return (
                          <div
                            key={type}
                            className="flex items-center space-x-3 mb-2"
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: colors[index] }}
                            ></div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-400 capitalize">
                                  {type}
                                </span>
                                <span className="text-xs font-medium text-white">
                                  {Math.round(percentage)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                                <div
                                  className="h-1.5 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${percentage}%`,
                                    backgroundColor: colors[index],
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* With Images Card */}
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-400 mb-1">
                        With Images
                      </p>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-white">
                          {
                            properties.filter(
                              (p) => p.image_urls && p.image_urls.length > 0
                            ).length
                          }
                        </span>
                        <span className="text-sm font-medium text-orange-400 bg-orange-400/10 px-2 py-1 rounded-full">
                          {properties.length > 0
                            ? Math.round(
                                (properties.filter(
                                  (p) => p.image_urls && p.image_urls.length > 0
                                ).length /
                                  properties.length) *
                                  100
                              )
                            : 0}
                          %
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        completion rate
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-orange-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Completion circle */}
                  <div className="flex justify-center mb-4">
                    <div className="relative w-16 h-16">
                      <svg
                        className="w-16 h-16 transform -rotate-90"
                        viewBox="0 0 64 64"
                      >
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="#374151"
                          strokeWidth="4"
                          fill="none"
                          className="opacity-20"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="#F59E0B"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={`${
                            properties.length > 0
                              ? (properties.filter(
                                  (p) => p.image_urls && p.image_urls.length > 0
                                ).length /
                                  properties.length) *
                                175.9
                              : 0
                          } 175.9`}
                          className="transition-all duration-500"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {properties.length > 0
                            ? Math.round(
                                (properties.filter(
                                  (p) => p.image_urls && p.image_urls.length > 0
                                ).length /
                                  properties.length) *
                                  100
                              )
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700/50">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">
                        {
                          properties.filter(
                            (p) => p.image_urls && p.image_urls.length > 0
                          ).length
                        }
                      </div>
                      <div className="text-xs text-gray-400">Complete</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">
                        {
                          properties.filter(
                            (p) => !p.image_urls || p.image_urls.length === 0
                          ).length
                        }
                      </div>
                      <div className="text-xs text-gray-400">Pending</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search and View Controls */}
              <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">
                    Property Collection
                  </h2>
                  <div className="flex items-center space-x-3">
                    {/* View Mode Toggle */}
                    <div className="flex items-center bg-gray-700 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode("table")}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          viewMode === "table"
                            ? "bg-blue-600 text-white"
                            : "text-gray-300 hover:text-white"
                        }`}
                      >
                        Table
                      </button>
                      <button
                        onClick={() => setViewMode("split")}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          viewMode === "split"
                            ? "bg-blue-600 text-white"
                            : "text-gray-300 hover:text-white"
                        }`}
                      >
                        Split View
                      </button>
                    </div>

                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <form
                  onSubmit={handleSearch}
                  className="flex items-center space-x-4"
                >
                  <div className="flex-1 relative">
                    <svg
                      className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search properties..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Search
                  </button>
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm("");
                        setCurrentPage(1);
                        fetchProperties(1, "");
                      }}
                      className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </form>
              </div>

              {/* Properties Content */}
              {loading ? (
                <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-400">Loading properties...</p>
                </div>
              ) : (
                <>
                  {viewMode === "table" ? (
                    // Table Only View
                    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                      <PropertyTable
                        properties={properties}
                        onDelete={handleDelete}
                        onPropertySelect={handlePropertySelect}
                        selectedProperty={selectedProperty}
                      />
                    </div>
                  ) : (
                    // Split View - Table and Map
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Properties Table */}
                      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                        <div className="p-4 border-b border-gray-700">
                          <h3 className="text-lg font-semibold text-white">
                            Properties List
                          </h3>
                        </div>
                        <PropertyTable
                          properties={properties}
                          onDelete={handleDelete}
                          onPropertySelect={handlePropertySelect}
                          selectedProperty={selectedProperty}
                          compact={true}
                        />
                      </div>

                      {/* Map */}
                      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                        <div className="p-4 border-b border-gray-700">
                          <h3 className="text-lg font-semibold text-white">
                            Property Locations
                          </h3>
                        </div>
                        <div className="h-96 lg:h-[600px]">
                          <PropertyMap
                            properties={properties}
                            selectedProperty={selectedProperty}
                            onPropertySelect={handlePropertySelect}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex justify-center">
                      <nav className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                          }
                          disabled={currentPage === 1}
                          className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(
                            (page) =>
                              page === 1 ||
                              page === totalPages ||
                              Math.abs(page - currentPage) <= 2
                          )
                          .map((page, index, array) => (
                            <div key={page} className="flex items-center">
                              {index > 0 && array[index - 1] !== page - 1 && (
                                <span className="px-2 text-gray-500">...</span>
                              )}
                              <button
                                onClick={() => setCurrentPage(page)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  currentPage === page
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                                }`}
                              >
                                {page}
                              </button>
                            </div>
                          ))}

                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(totalPages, prev + 1)
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Analytics Dashboard
              </h3>
              <p className="text-gray-400">Analytics features coming soon...</p>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
              <div className="text-6xl mb-4">⚙️</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Settings
              </h3>
              <p className="text-gray-400">Settings panel coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
