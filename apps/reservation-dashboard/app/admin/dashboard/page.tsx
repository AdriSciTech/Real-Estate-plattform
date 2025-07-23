"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/hooks/useAdmin";

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const {
    owners,
    properties,
    loading: dataLoading,
    error,
    addPropertyOwner,
    assignPropertyToOwner
  } = useAdmin();

  const [activeTab, setActiveTab] = useState('owners'); // 'owners' or 'properties'
  
  // State for adding new owner
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [addingOwner, setAddingOwner] = useState(false);
  const [addOwnerError, setAddOwnerError] = useState('');

  // State for assigning property
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedOwnerId, setSelectedOwnerId] = useState('');
  const [assigningProperty, setAssigningProperty] = useState(false);
  const [assignPropertyError, setAssignPropertyError] = useState('');

  // Check authentication
  useEffect(() => {
    // Check if admin is logged in
    const adminLoggedIn = localStorage.getItem("adminLoggedIn");
    
    if (adminLoggedIn !== "true") {
      // Not authenticated, redirect to login
      router.push("/admin/login");
    } else {
      setIsAuthenticated(true);
    }
    
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminEmail");
    router.push("/admin/login");
  };

  // Handle owner submission
  interface AddOwnerEvent extends React.FormEvent<HTMLFormElement> {}

  const handleAddOwner = async (e: AddOwnerEvent): Promise<void> => {
    e.preventDefault();
    if (!newOwnerName.trim() || !newOwnerEmail.trim()) {
      setAddOwnerError('Name and email are required');
      return;
    }

    try {
      setAddingOwner(true);
      setAddOwnerError('');
      await addPropertyOwner(newOwnerName, newOwnerEmail);
      setNewOwnerName('');
      setNewOwnerEmail('');
    } catch (err) {
      setAddOwnerError(err instanceof Error ? err.message : 'Failed to add owner');
    } finally {
      setAddingOwner(false);
    }
  };

  // Handle property assignment
  interface AssignPropertyEvent extends React.FormEvent<HTMLFormElement> {}

  const handleAssignProperty = async (e: AssignPropertyEvent): Promise<void> => {
    e.preventDefault();
    if (!selectedPropertyId || !selectedOwnerId) {
      setAssignPropertyError('Both property and owner must be selected');
      return;
    }

    try {
      setAssigningProperty(true);
      setAssignPropertyError('');
      await assignPropertyToOwner(selectedPropertyId, selectedOwnerId);
      setSelectedPropertyId('');
      setSelectedOwnerId('');
    } catch (err) {
      setAssignPropertyError('Failed to assign property to owner');
    } finally {
      setAssigningProperty(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show authentication required message
  if (!isAuthenticated) {
    return null; // Will redirect to login page via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          {/* Navigation Tabs */}
          <div className="flex border-b mb-6">
            <button
              className={`py-2 px-4 ${activeTab === 'owners' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('owners')}
            >
              Property Owners
            </button>
            <button
              className={`py-2 px-4 ${activeTab === 'properties' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('properties')}
            >
              Assign Properties
            </button>
          </div>
          
          {/* Owners Tab Content */}
          {activeTab === 'owners' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Property Owners</h2>
              
              {/* Add Owner Form */}
              <div className="bg-white shadow-md rounded-md p-4 mb-6">
                <h3 className="text-lg font-medium mb-3">Add New Property Owner</h3>
                <form onSubmit={handleAddOwner}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-1">
                        Owner Name
                      </label>
                      <input
                        id="ownerName"
                        type="text"
                        value={newOwnerName}
                        onChange={(e) => setNewOwnerName(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Enter owner name"
                      />
                    </div>
                    <div>
                      <label htmlFor="ownerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                        Owner Email
                      </label>
                      <input
                        id="ownerEmail"
                        type="email"
                        value={newOwnerEmail}
                        onChange={(e) => setNewOwnerEmail(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Enter owner email"
                      />
                    </div>
                  </div>
                  
                  {addOwnerError && (
                    <div className="bg-red-100 text-red-700 p-2 rounded-md mb-4">
                      {addOwnerError}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={addingOwner}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                  >
                    {addingOwner ? 'Adding...' : 'Add Owner'}
                  </button>
                </form>
              </div>
              
              {/* Owners List */}
              <div className="bg-white shadow-md rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Properties
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dataLoading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center">
                          Loading owners...
                        </td>
                      </tr>
                    ) : owners.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                          No property owners found
                        </td>
                      </tr>
                    ) : (
                      owners.map((owner) => (
                        <tr key={owner.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {owner.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {owner.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {owner.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {owner.propertyIds.length}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Properties Tab Content */}
          {activeTab === 'properties' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Assign Properties to Owners</h2>
              
              /* Assign Property Form */
<div className="bg-white shadow-md rounded-md p-4 mb-6">
  <h3 className="text-lg font-medium mb-3">Property Assignment</h3>
  <form onSubmit={handleAssignProperty}>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <label htmlFor="propertySelect" className="block text-sm font-medium text-gray-700 mb-1">
          Select Property
        </label>
        <div className="flex flex-col space-y-2">
          <select
            id="propertySelect"
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">-- Select Property --</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.title} {property.ownerId ? '(Already assigned)' : ''}
              </option>
            ))}
          </select>
          
          <div className="flex items-center">
            <div className="border-t border-gray-300 flex-grow"></div>
            <span className="px-2 text-sm text-gray-500">OR</span>
            <div className="border-t border-gray-300 flex-grow"></div>
          </div>
          
          <div>
            <label htmlFor="propertyIdInput" className="block text-sm font-medium text-gray-700 mb-1">
              Enter Property ID Directly
            </label>
            <input
              id="propertyIdInput"
              type="text"
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              placeholder="Enter property ID"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>
      <div>
        <label htmlFor="ownerSelect" className="block text-sm font-medium text-gray-700 mb-1">
          Select Owner
        </label>
        <select
          id="ownerSelect"
          value={selectedOwnerId}
          onChange={(e) => setSelectedOwnerId(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">-- Select Owner --</option>
          {owners.map((owner) => (
            <option key={owner.id} value={owner.id}>
              {owner.name} ({owner.email})
            </option>
          ))}
        </select>
      </div>
    </div>
    
    {assignPropertyError && (
      <div className="bg-red-100 text-red-700 p-2 rounded-md mb-4">
        {assignPropertyError}
      </div>
    )}
    
    <button
      type="submit"
      disabled={assigningProperty}
      className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
    >
      {assigningProperty ? 'Assigning...' : 'Assign Property'}
    </button>
  </form>
</div>
              
              {/* Properties List */}
              <div className="bg-white shadow-md rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Property Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dataLoading ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center">
                          Loading properties...
                        </td>
                      </tr>
                    ) : properties.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                          No properties found
                        </td>
                      </tr>
                    ) : (
                      properties.map((property) => {
                        const owner = owners.find(o => o.id === property.ownerId);
                        return (
                          <tr key={property.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {property.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {property.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {owner ? `${owner.name} (${owner.email})` : 'Not assigned'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}