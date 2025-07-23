//my-app\components\PropertyTable.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Property } from '@/lib/types';
import { createClient } from '@/lib/supabase';

interface PropertyTableProps {
  properties: Property[];
  onDelete: (id: string) => void;
  onPropertySelect?: (property: Property) => void;
  selectedProperty?: Property | null;
  compact?: boolean;
}

export default function PropertyTable({ 
  properties, 
  onDelete, 
  onPropertySelect,
  selectedProperty,
  compact = false 
}: PropertyTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  // Get the best image URL from R2 structure with Cloudflare optimization
  const getPrimaryImageUrl = (property: Property): string | null => {
    // Priority 1: Use new R2 structure (image_urls_full) with Cloudflare optimization
    if (property.image_urls_full && property.image_urls_full.length > 0) {
      const firstImage = property.image_urls_full[0];
      // Use thumb for table display (faster loading) - these should already be optimized URLs
      return firstImage.thumb || firstImage.medium || firstImage.full || null;
    }
    
    // Priority 2: Fallback to legacy images
    if (property.image_urls && property.image_urls.length > 0) {
      return property.image_urls[0];
    }
    
    return null;
  };

  // Delete images from R2 storage
  const deleteR2Images = async (property: Property) => {
    try {
      if (property.image_urls_full && property.image_urls_full.length > 0) {
        // Call R2 deletion API
        const response = await fetch('/api/delete-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            propertyId: property.id,
            imageUrls: property.image_urls_full 
          })
        });

        if (!response.ok) {
          console.warn('Failed to delete R2 images:', await response.text());
          // Don't throw - property deletion should continue even if image cleanup fails
        } else {
          console.log('✅ R2 images deleted successfully');
        }
      }
    } catch (error) {
      console.warn('⚠️ Error deleting R2 images:', error);
      // Don't throw - property deletion should continue
    }
  };

  // Delete legacy Supabase images (for backward compatibility)
  const deleteLegacyImages = async (property: Property) => {
    try {
      const supabase = createClient();
      if (!supabase || !property.image_urls?.length) return;

      const imagePaths: string[] = property.image_urls
        .map((url: string) => {
          const fileName: string | undefined = url.split('/').pop();
          return fileName ? `${property.id}/${fileName}` : null;
        })
        .filter((path: string | null): path is string => path !== null);
      
      if (imagePaths.length > 0) {
        await supabase.storage
          .from('propertyphotos')
          .remove(imagePaths);
        console.log('✅ Legacy Supabase images deleted');
      }
    } catch (error) {
      console.warn('⚠️ Error deleting legacy images:', error);
      // Don't throw - property deletion should continue
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    
    try {
      const supabase = createClient();
      
      if (!supabase) {
        throw new Error('Unable to connect to database');
      }

      // Get property to delete images
      const { data: property } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (property) {
        // Delete R2 images (new system)
        await deleteR2Images(property);
        
        // Delete legacy images (backward compatibility)
        await deleteLegacyImages(property);
      }

      // Delete property record
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      onDelete(id);
      setShowDeleteModal(null);
    } catch (error) {
      console.error('❌ Error deleting property:', error);
      alert('Failed to delete property. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleRowClick = (property: Property) => {
    if (onPropertySelect) {
      onPropertySelect(property);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getTypeColor = (type: string) => {
    const normalizedType = type.toLowerCase();
    const colors = {
      'house': 'bg-blue-100 text-blue-800',
      'apartment': 'bg-green-100 text-green-800',
      'condo': 'bg-purple-100 text-purple-800',
      'townhouse': 'bg-yellow-100 text-yellow-800',
      'villa': 'bg-pink-100 text-pink-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[normalizedType as keyof typeof colors] || colors.default;
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Check if image is from Cloudflare optimized R2
  const isCloudflareOptimized = (imageUrl: string) => {
    return imageUrl.includes('/cdn-cgi/image/') || imageUrl.includes('img.studentrentals.es');
  };

  return (
    <>
      <div className={`${compact ? 'bg-gray-800' : 'bg-white'} shadow-md rounded-lg overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={compact ? 'bg-gray-750' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  compact ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Property
                </th>
                {!compact && (
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    compact ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Type
                  </th>
                )}
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  compact ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Price
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  compact ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {compact ? 'Location' : 'Details'}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  compact ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`${compact ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
              {properties.map((property) => {
                const primaryImageUrl = getPrimaryImageUrl(property);
                const hasR2Images = property.image_urls_full && property.image_urls_full.length > 0;
                const isOptimized = primaryImageUrl && isCloudflareOptimized(primaryImageUrl);

                return (
                  <tr 
                    key={property.id} 
                    className={`transition-colors ${
                      compact 
                        ? `hover:bg-gray-700 cursor-pointer ${
                            selectedProperty?.id === property.id ? 'bg-gray-700 ring-2 ring-blue-500' : ''
                          }`
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleRowClick(property)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {primaryImageUrl ? (
                            <div className="relative">
                              <Image
                                src={primaryImageUrl}
                                alt={property.title}
                                width={48}
                                height={48}
                                className="h-12 w-12 object-cover rounded-lg"
                                sizes="48px"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  console.warn('🖼️ Image failed to load:', primaryImageUrl);
                                  target.style.display = 'none';
                                }}
                              />
                              {/* Optimization indicator */}
                              {isOptimized && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-white" 
                                     title="Cloudflare Optimized" />
                              )}
                              {/* R2 indicator (fallback for non-optimized R2) */}
                              {hasR2Images && !isOptimized && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white" 
                                     title="R2 Storage" />
                              )}
                            </div>
                          ) : (
                            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                              compact ? 'bg-gray-600' : 'bg-gray-200'
                            }`}>
                              <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="ml-4 min-w-0 flex-1">
                          <div className={`text-sm font-medium truncate ${
                            compact ? 'text-white' : 'text-gray-900'
                          }`} title={property.title}>
                            {property.title}
                          </div>
                          <div className={`text-sm truncate ${
                            compact ? 'text-gray-400' : 'text-gray-500'
                          }`} title={property.address}>
                            {compact ? truncateText(property.address, 30) : property.address}
                          </div>
                          {compact && (
                            <div className="flex items-center mt-1 space-x-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(property.type)}`}>
                                {property.type}
                              </span>
                              {/* Updated badges */}
                              {isOptimized && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  ⚡ CF
                                </span>
                              )}
                              {hasR2Images && !isOptimized && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  📦 R2
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    {!compact && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(property.type)}`}>
                            {property.type}
                          </span>
                          {/* Updated badges for non-compact view */}
                          {isOptimized && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              ⚡ Cloudflare
                            </span>
                          )}
                          {hasR2Images && !isOptimized && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              📦 R2
                            </span>
                          )}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        compact ? 'text-green-400' : 'text-gray-900'
                      }`}>
                        {formatPrice(property.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {compact ? (
                        <div className="flex items-center text-sm text-gray-400">
                          {property.lat && property.lng ? (
                            <>
                              <svg className="w-4 h-4 mr-1 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="text-green-400">Located</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>No location</span>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          {property.beds} bed{property.beds !== 1 ? 's' : ''}, {property.baths} bath{property.baths !== 1 ? 's' : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/admin/edit/${property.id}`}
                          className={`transition-colors ${
                            compact 
                              ? 'text-blue-400 hover:text-blue-300' 
                              : 'text-blue-600 hover:text-blue-900'
                          }`}
                          onClick={(e) => e.stopPropagation()}
                          title="Edit property"
                        >
                          {compact ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          ) : (
                            'Edit'
                          )}
                        </Link>
                        {!compact && (
                          <Link
                            href={`/properties/${property.id}`}
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            title="View property"
                          >
                            View
                          </Link>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteModal(property.id);
                          }}
                          disabled={deletingId === property.id}
                          className={`transition-colors disabled:opacity-50 ${
                            compact 
                              ? 'text-red-400 hover:text-red-300' 
                              : 'text-red-600 hover:text-red-900'
                          }`}
                          title="Delete property"
                        >
                          {deletingId === property.id ? (
                            compact ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                            ) : (
                              'Deleting...'
                            )
                          ) : compact ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          ) : (
                            'Delete'
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {properties.length === 0 && (
          <div className={`text-center py-12 ${compact ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="text-6xl mb-4">🏠</div>
            <h3 className={`text-xl font-semibold mb-2 ${compact ? 'text-white' : 'text-gray-900'}`}>
              No Properties Found
            </h3>
            <div className="mb-6">
              {compact ? 'No properties match your search criteria.' : 'Get started by adding your first property.'}
            </div>
            {!compact && (
              <Link
                href="/admin/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Add First Property
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" role="dialog" aria-modal="true">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900">Delete Property</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this property? This action cannot be undone and will also remove all associated images from both R2 and legacy storage.
                </p>
              </div>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal)}
                  disabled={deletingId === showDeleteModal}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {deletingId === showDeleteModal ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}