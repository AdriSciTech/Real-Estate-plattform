import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';


interface PropertyOwner {
  id: string;
  name: string;
  email: string;
  propertyIds: string[];
}

interface Property {
  id: string;
  title: string;
  ownerId?: string;
  // other property fields
}

export const useAdmin = () => {
  const [owners, setOwners] = useState<PropertyOwner[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all property owners
  const fetchOwners = async () => {
    try {
      setLoading(true);
      const { data: ownersData, error } = await supabase
        .from('property_owners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const ownersList: PropertyOwner[] = ownersData?.map(owner => ({
        id: owner.id,
        name: `${owner.first_name} ${owner.last_name}`.trim(),
        email: owner.email,
        propertyIds: owner.properties || [],
      })) || [];

      setOwners(ownersList);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch property owners');
      setLoading(false);
      console.error(err);
    }
  };

  // Fetch all properties
  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data: propertiesData, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const propertiesList: Property[] = propertiesData?.map(property => ({
        id: property.id,
        title: property.title,
        ownerId: property.owner_id || null,
        // Map other property fields here
      })) || [];

      setProperties(propertiesList);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch properties');
      setLoading(false);
      console.error(err);
    }
  };

  // Create a new property owner
  const addPropertyOwner = async (name: string, email: string) => {
    try {
      setLoading(true);
      
      // Check if owner with this email already exists
      const { data: existingOwner, error: checkError } = await supabase
        .from('property_owners')
        .select('id')
        .eq('email', email)
        .single();
      
      if (existingOwner && !checkError) {
        throw new Error('A property owner with this email already exists');
      }
      
      // Split name into first and last name
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Add new owner to Supabase
      const { data, error } = await supabase
        .from('property_owners')
        .insert({
          first_name: firstName,
          last_name: lastName,
          email,
          properties: [],
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Refresh owners list
      await fetchOwners();
      setLoading(false);
      
      return data.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add property owner');
      setLoading(false);
      console.error(err);
      throw err;
    }
  };

  // Assign a property to an owner
  // Assign a property to an owner
const assignPropertyToOwner = async (propertyId: string, ownerId: string) => {
    try {
      setLoading(true);
      
      // Check if property exists
      const { data: existingProperty, error: propertyError } = await supabase
        .from('properties')
        .select('id')
        .eq('id', propertyId)
        .single();
      
      if (!existingProperty && propertyError) {
        // Property doesn't exist, create it first
        const { error: createError } = await supabase
          .from('properties')
          .insert({
            id: propertyId,
            title: `Property ${propertyId}`, // Default title
            owner_id: ownerId, // Assign owner ID right away
            // Add other default fields as needed
            created_at: new Date().toISOString()
          });
        
        if (createError) {
          throw createError;
        }
        
        console.log(`Created new property with ID: ${propertyId}`);
      } else {
        // Property exists, just update the owner ID
        const { error: updateError } = await supabase
          .from('properties')
          .update({ owner_id: ownerId })
          .eq('id', propertyId);
        
        if (updateError) {
          throw updateError;
        }
      }
      
      // Get current owner's properties list
      const { data: ownerData, error: ownerError } = await supabase
        .from('property_owners')
        .select('properties')
        .eq('id', ownerId)
        .single();
      
      if (ownerData && !ownerError) {
        const propertyIds = ownerData.properties || [];
        
        // Only add if not already in the array
        if (!propertyIds.includes(propertyId)) {
          const { error: updateOwnerError } = await supabase
            .from('property_owners')
            .update({ properties: [...propertyIds, propertyId] })
            .eq('id', ownerId);
          
          if (updateOwnerError) {
            throw updateOwnerError;
          }
        }
      }
      
      // Refresh data
      await Promise.all([fetchProperties(), fetchOwners()]);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign property to owner');
      setLoading(false);
      console.error(err);
      throw err;
    }
  };

  // Get properties by owner ID
  const getPropertiesByOwner = async (ownerId: string) => {
    try {
      const { data: propertiesData, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', ownerId);
      
      if (error) {
        throw error;
      }
      
      const ownerProperties: Property[] = propertiesData?.map(property => ({
        id: property.id,
        title: property.title,
        ownerId: property.owner_id,
        // Map other property fields here
      })) || [];
      
      return ownerProperties;
    } catch (err) {
      console.error('Failed to get properties by owner', err);
      throw err;
    }
  };

  // Initialize data loading
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchOwners(), fetchProperties()]);
      } catch (err) {
        console.error('Failed to load admin data', err);
      }
    };
    
    loadData();
  }, []);

  return {
    owners,
    properties,
    loading,
    error,
    fetchOwners,
    fetchProperties,
    addPropertyOwner,
    assignPropertyToOwner,
    getPropertiesByOwner,
  };
};