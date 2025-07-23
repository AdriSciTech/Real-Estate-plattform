// ===== MAJOR CLEANUP NEEDED =====

// lib/types/utils.ts - CLEANED VERSION (Remove 80% redundancy) ❌⚠️
// Most functions already exist in unified property.ts

import { Property, PropertyType } from './property';
import { ImageUrls } from './image';

// REMOVE: Most of safePropertyData - these functions already exist in property.ts:
// - getTitle, getPrice, getBeds, getBaths, getAddress, getType → use getPropertyDisplayData()
// - getFirstImage → use getPrimaryImageUrl()
// - getAllImages → use existing image utilities

// KEEP ONLY: Unique utilities not in property.ts
export const formatPropertyPrice = (price: number, includeFrequency: boolean = false): string => {
  if (price === undefined || price === null) {
    return 'Price on request';
  }
  
  const formatted = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(price);
  
  return includeFrequency ? `${formatted}/month` : formatted;
};

export const formatPropertyArea = (area: number | undefined): string => {
  if (!area) return 'Size N/A';
  return `${area} m²`;
};

// REMOVE: getImageUrl, isValidPropertyType - already exist in property.ts

// Optional: Keep if you want more specific image handling
export const getPropertyImageUrl = (
  property: Property,
  size: 'thumb' | 'medium' | 'full' = 'medium',
  index: number = 0
): string => {
  // Use the existing getPrimaryImageUrl from property.ts for index 0
  if (index === 0) {
    const { getPrimaryImageUrl } = require('./property');
    return getPrimaryImageUrl(property, size) || '/images/default-property.jpg';
  }
  
  // Handle other indices
  const images = property.images || [];
  if (images[index]) {
    return images[index][size];
  }
  
  return '/images/default-property.jpg';
};
