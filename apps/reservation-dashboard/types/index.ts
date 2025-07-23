// types/index.ts
export interface PropertyData {
  id: string;
  title: string;
  price: string;
  displayPrice?: string;
  priceFrequency?: string | null;
  featuredImage: string;
  galleryImages: string[];
  url: string;
  rooms: string;
  bathrooms: string;
  size: string;
  ownerId?: string;  // Now included to support property-owner relationships
  image?: string; // For backward compatibility with some components
  bookingId?: string;
}

export interface PropertyOwner {
  id: string;
  name: string;
  email: string;
  propertyIds: string[];  // Array of property IDs owned by this landlord
}

export type TabType = 'dashboard' | 'bookings' | 'payments' | 'profile' | 'roommates' | 'reserved';

export interface UserProfile {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  dateOfBirth: string;
  income: string;
  employment: string;
  employerName?: string;
  employmentDuration?: string;
}

// Single, unified BookingRequest interface
export interface BookingRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  price: string;
  priceFrequency?: string | null;
  userId?: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  requestDate: Date;
  status: "pending" | "approved" | "rejected" | "reserved" | "cancelled";
  ownerEmail?: string;
  contractSigned?: boolean;
  contractSignedDate?: Date;
  paymentStatus?: "pending" | "processing" | "completed" | "failed" | "expired";
  paymentDate?: Date;
  stripeSessionId?: string;
  stripePaymentId?: string;
  updatedAt?: Date;
  paymentError?: string;
  rooms?: string;
  bathrooms?: string;
  size?: string;
}

// Admin user type
export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
  createdAt: Date;
}











// In your types/index.ts file

export interface BookingRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  price: string;
  priceFrequency?: string | null;
  userId?: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  requestDate: Date;
  status: "pending" | "approved" | "rejected" | "reserved" | "cancelled";
  ownerEmail?: string;
  contractSigned?: boolean;
  contractSignedDate?: Date;
  paymentStatus?: "pending" | "processing" | "completed" | "failed" | "expired";
  paymentDate?: Date;
  stripeSessionId?: string;
  stripePaymentId?: string;
  updatedAt?: Date;
  paymentError?: string;
  
  // Add these properties to fix the TypeScript errors for top-level fields
  rooms?: string;
  bathrooms?: string;
  size?: string;
  displayPrice?: string;
  
  // Add the nested property object structure based on your hook
  property?: {
    id: string;
    title: string;
    price: string;
    displayPrice?: string;
    priceFrequency?: string;
    featuredImage: string;
    rooms?: string;
    bathrooms?: string;
    size?: string;
  };
  
  // Add the nested user profile structure
  userProfile?: {
    fullName?: string;
    phone?: string;
    address?: string;
    income?: string;
    employment?: string;
    [key: string]: any; // For other possible fields
  };
}