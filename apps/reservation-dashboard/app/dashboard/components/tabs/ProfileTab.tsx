"use client";

import { useState, useEffect } from "react";
import { supabase, auth, db } from "../../../../lib/supabase";

interface UserProfile {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  dateOfBirth: string;
  income: string;
  employment: string;
  employerName: string;
  employmentDuration: string;
}

const defaultProfile: UserProfile = {
  fullName: "",
  phone: "",
  address: "",
  city: "",
  zipCode: "",
  country: "",
  dateOfBirth: "",
  income: "",
  employment: "",
  employerName: "",
  employmentDuration: ""
};

export default function ProfileTab() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Check for current user and set userId
    const checkUser = async () => {
      const { data: { user } } = await auth.getSession();
      if (user) {
        setUserId(user.id);
        return user.id;
      }
      return null;
    };

    const fetchProfile = async () => {
      try {
        const uid = await checkUser();
        if (!uid) {
          setLoading(false);
          return;
        }

        // Reset profile to default first to avoid data leakage
        setProfile(defaultProfile);

        // Create a user-specific localStorage key
        const localStorageKey = `userProfile_${uid}`;
        
        // Try to get profile from Supabase first
        const { data: profileData, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', uid)
          .single();
        
        if (profileData && !error) {
          // Map Supabase data to our UserProfile interface
          const mappedProfile: UserProfile = {
            fullName: profileData.first_name && profileData.last_name ? `${profileData.first_name} ${profileData.last_name}` : '',
            phone: profileData.phone || '',
            address: profileData.address || '',
            city: profileData.city || '',
            zipCode: profileData.zip_code || '',
            country: profileData.country || '',
            dateOfBirth: profileData.date_of_birth || '',
            income: profileData.income || '',
            employment: profileData.employment || '',
            employerName: profileData.employer_name || '',
            employmentDuration: profileData.employment_duration || ''
          };
          setProfile(mappedProfile);
          
          // Also update user-specific localStorage for quick access
          localStorage.setItem(localStorageKey, JSON.stringify(mappedProfile));
        } else {
          // If not in Supabase, try user-specific localStorage
          const storedProfile = localStorage.getItem(localStorageKey);
          if (storedProfile) {
            const parsedProfile = JSON.parse(storedProfile);
            setProfile(parsedProfile);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Check if profile is complete whenever it changes
  useEffect(() => {
    const requiredFields = [
      "fullName", "phone", "address", "city", "zipCode", 
      "country", "dateOfBirth", "income", "employment"
    ];
    
    const complete = requiredFields.every(field => 
      profile[field as keyof UserProfile] && String(profile[field as keyof UserProfile]).trim() !== ""
    );
    
    setIsComplete(complete);
    
    if (!userId) return;

    // Update user-specific localStorage with completion status
    const localStorageIsCompleteKey = `isProfileComplete_${userId}`;
    
    if (complete) {
      localStorage.setItem(localStorageIsCompleteKey, "true");
    } else {
      localStorage.removeItem(localStorageIsCompleteKey);
    }
  }, [profile, userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    
    // Clear any success message when the user makes changes
    if (savedMessage) {
      setSavedMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await auth.getSession();
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      setSaving(true);
      
      // Split full name into first and last name
      const nameParts = profile.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Save to Supabase
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email,
          first_name: firstName,
          last_name: lastName,
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          zip_code: profile.zipCode,
          country: profile.country,
          date_of_birth: profile.dateOfBirth,
          income: profile.income,
          employment: profile.employment,
          employer_name: profile.employerName,
          employment_duration: profile.employmentDuration,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        throw error;
      }
      
      // Save to user-specific localStorage for quick access
      const localStorageKey = `userProfile_${user.id}`;
      localStorage.setItem(localStorageKey, JSON.stringify(profile));
      
      // Update user-specific completion status
      const localStorageIsCompleteKey = `isProfileComplete_${user.id}`;
      if (isComplete) {
        localStorage.setItem(localStorageIsCompleteKey, "true");
      }
      
      setSavedMessage("Profile saved successfully!");
      
      // Clear the message after 3 seconds
      setTimeout(() => {
        setSavedMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setSavedMessage("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">My Profile</h2>
        
        {!isComplete && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700">
              <strong>Please complete your profile information</strong> to be able to reserve properties. All fields marked with * are required.
            </p>
          </div>
        )}
        
        {savedMessage && (
          <div className={`mb-6 p-4 ${savedMessage.includes("Failed") ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"} border rounded-lg`}>
            <p>{savedMessage}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={profile.dateOfBirth}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Address Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Address</h3>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Street Address *</label>
                <input
                  type="text"
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">City *</label>
                <input
                  type="text"
                  name="city"
                  value={profile.city}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Zip Code *</label>
                <input
                  type="text"
                  name="zipCode"
                  value={profile.zipCode}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Country *</label>
                <input
                  type="text"
                  name="country"
                  value={profile.country}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          {/* Financial Information */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Monthly Income *</label>
                <input
                  type="number"
                  name="income"
                  value={profile.income}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Employment Status *</label>
                <select
                  name="employment"
                  value={profile.employment}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select status</option>
                  <option value="fullTime">Full-time employed</option>
                  <option value="partTime">Part-time employed</option>
                  <option value="selfEmployed">Self-employed</option>
                  <option value="student">Student</option>
                  <option value="retired">Retired</option>
                  <option value="unemployed">Unemployed</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Employer Name</label>
                <input
                  type="text"
                  name="employerName"
                  value={profile.employerName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Employment Duration</label>
                <input
                  type="text"
                  name="employmentDuration"
                  value={profile.employmentDuration}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </button>
          </div>
        </form>
      </div>
      
      {isComplete && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
          <p className="text-green-700">
            <span className="inline-block mr-2">✓</span>
            Your profile is complete! You can now request bookings.
          </p>
        </div>
      )}
    </div>
  );
}