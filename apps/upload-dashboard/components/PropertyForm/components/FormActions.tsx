// my-app\components\PropertyForm\components\FormActions.tsx
import React from 'react';
import { testR2Connection, getR2Config } from '../../../lib/uploadClient';
import { createClient } from '../../../lib/supabase';

interface FormActionsProps {
  loading: boolean;
  geocoding: boolean;
  processing: boolean;
  showPreview: boolean;
  isEditing: boolean;
  onTogglePreview: () => void;
  onCancel: () => void;
}

export const FormActions: React.FC<FormActionsProps> = ({
  loading,
  geocoding,
  processing,
  showPreview,
  isEditing,
  onTogglePreview,
  onCancel
}) => {
  // Test database connection (Supabase)
  const testDatabaseConnection = async () => {
    try {
      const supabase = createClient();
      if (!supabase) {
        return { success: false, message: 'Failed to create Supabase client' };
      }

      // Test with a simple query
      const { data, error } = await supabase
        .from('properties')
        .select('id')
        .limit(1);

      if (error) {
        return { success: false, message: `Database error: ${error.message}` };
      }

      return { success: true, message: `Database connection successful! Found ${data?.length || 0} properties.` };
    } catch (error) {
      return { 
        success: false, 
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  };

  // Test R2 upload system
  const testR2System = async () => {
    const r2Result = await testR2Connection();
    const r2Config = getR2Config();
    
    let message = `🔒 R2 Upload System\n`;
    message += `Status: ${r2Result.success ? '✅ Available' : '❌ Error'}\n`;
    message += `${r2Result.message}\n\n`;
    message += `📋 Configuration:\n`;
    message += `• Max file size: ${r2Config.maxFileSize}\n`;
    message += `• Max files: ${r2Config.maxFiles}\n`;
    message += `• Allowed types: ${r2Config.allowedTypes.join(', ')}\n`;
    message += `• Endpoint: ${r2Config.endpoint}`;
    
    return { success: r2Result.success, message };
  };

  const handleTestDatabase = async () => {
    const result = await testDatabaseConnection();
    alert(result.message);
    if (!result.success) {
      console.error('Database test error:', result.message);
    }
  };

  const handleTestR2 = async () => {
    const result = await testR2System();
    alert(result.message);
    if (!result.success) {
      console.error('R2 test error:', result.message);
    }
  };

  const handleTestAll = async () => {
    console.log('🧪 Running system tests...');
    
    // Test database
    const dbResult = await testDatabaseConnection();
    console.log('Database test:', dbResult);
    
    // Test R2
    const r2Result = await testR2System();
    console.log('R2 test:', r2Result);
    
    // Combined message
    let message = `🧪 System Test Results\n\n`;
    message += `📊 Database (Supabase):\n`;
    message += `${dbResult.success ? '✅' : '❌'} ${dbResult.message}\n\n`;
    message += `🔒 Image Upload (R2):\n`;
    message += `${r2Result.success ? '✅' : '❌'} ${r2Result.message}`;
    
    alert(message);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onTogglePreview}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          
          <button
            type="button"
            onClick={handleTestDatabase}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
            title="Test Supabase database connection"
          >
            Test DB
          </button>

          <button
            type="button"
            onClick={handleTestR2}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            title="Test R2 upload system"
          >
            Test R2
          </button>

          <button
            type="button"
            onClick={handleTestAll}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
            title="Test all systems"
          >
            Test All
          </button>
        </div>
        
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading || geocoding || processing}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving Property...' : 
             geocoding ? 'Finding Location...' : 
             processing ? 'Uploading to R2...' : 
             isEditing ? 'Update Property' : 'Create Property'}
          </button>
        </div>
      </div>

      {/* Status indicator */}
      {(loading || geocoding || processing) && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-sm text-blue-800">
              {loading && !geocoding && !processing && 'Saving property to database...'}
              {geocoding && 'Looking up address coordinates...'}
              {processing && 'Uploading and optimizing images on Cloudflare R2...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};