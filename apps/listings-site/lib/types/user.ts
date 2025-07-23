// lib/types/user.ts
// ========================================
import { PropertyType } from './property';

// User-related types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  preferences?: UserPreferences;
  savedProperties?: string[];
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  budgetMin?: number;
  budgetMax?: number;
  preferredAreas?: string[];
  propertyTypes?: PropertyType[];
  mustHaveFeatures?: string[];
  notifications?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };
}