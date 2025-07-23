// app/api/upload/route.ts - Complete Production Solution
import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { S3Client } from '@aws-sdk/client-s3';

// Environment validation with detailed error messages
function validateEnvironment() {
  const required = [
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY', 
    'R2_ENDPOINT',
    'R2_BUCKET',
    'R2_CUSTOM_DOMAIN',
    'CLOUDFLARE_MAIN_DOMAIN'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
  
  return {
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID!,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY!,
    R2_ENDPOINT: process.env.R2_ENDPOINT!,
    R2_BUCKET: process.env.R2_BUCKET!,
    R2_CUSTOM_DOMAIN: process.env.R2_CUSTOM_DOMAIN!, // images.studentrentals.es
    CLOUDFLARE_MAIN_DOMAIN: process.env.CLOUDFLARE_MAIN_DOMAIN! // studentrentals.es
  };
}

// Generate optimized URLs using Cloudflare Image Resizing
function generateOptimizedUrls(originalUrl: string, mainDomain: string) {
  const baseTransformUrl = `https://${mainDomain}/cdn-cgi/image`;
  
  return {
    thumb: `${baseTransformUrl}/width=300,height=200,fit=cover,quality=80,format=webp/${originalUrl}`,
    medium: `${baseTransformUrl}/width=800,height=600,fit=cover,quality=85,format=webp/${originalUrl}`,
    full: `${baseTransformUrl}/width=1920,height=1440,fit=cover,quality=90,format=webp/${originalUrl}`
  };
}

// Validate uploaded files
function validateFile(file: File): { valid: boolean; error?: string } {
  const maxFileSize = 20 * 1024 * 1024; // 20MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Allowed: ${allowedTypes.join(', ')}`
    };
  }

  if (file.size > maxFileSize) {
    return {
      valid: false,
      error: `File too large: ${Math.round(file.size / 1024 / 1024)}MB. Maximum: 20MB`
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: `File appears to be empty: ${file.name}`
    };
  }

  return { valid: true };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🚀 [UPLOAD] Starting Cloudflare optimized upload process...');

    // Validate environment
    let envVars;
    try {
      envVars = validateEnvironment();
      console.log('✅ [ENV] Environment variables validated');
      console.log(`📍 [ENV] R2 Custom Domain: ${envVars.R2_CUSTOM_DOMAIN}`);
      console.log(`🌐 [ENV] Main Domain: ${envVars.CLOUDFLARE_MAIN_DOMAIN}`);
    } catch (envError) {
      console.error('❌ [ENV] Environment validation failed:', envError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Server configuration error',
          details: envError instanceof Error ? envError.message : 'Unknown env error'
        },
        { status: 500 }
      );
    }

    // Create R2 client
    let r2Client;
    try {
      r2Client = new S3Client({
        region: 'auto',
        endpoint: envVars.R2_ENDPOINT,
        credentials: {
          accessKeyId: envVars.R2_ACCESS_KEY_ID,
          secretAccessKey: envVars.R2_SECRET_ACCESS_KEY,
        },
        forcePathStyle: true,
      });
      console.log('✅ [R2] Client created successfully');
    } catch (clientError) {
      console.error('❌ [R2] Client creation failed:', clientError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create R2 client',
          details: clientError instanceof Error ? clientError.message : 'Unknown client error'
        },
        { status: 500 }
      );
    }

    // Parse form data
    let formData, files, propertyId;
    try {
      formData = await request.formData();
      files = formData.getAll('files') as File[];
      propertyId = formData.get('propertyId') as string;
      
      console.log(`📁 [UPLOAD] Processing ${files.length} files for property: ${propertyId}`);
    } catch (parseError) {
      console.error('❌ [PARSE] Form data parsing failed:', parseError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to parse form data',
          details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
        },
        { status: 400 }
      );
    }

    // Validate inputs
    if (!files || files.length === 0) {
      console.log('❌ [VALIDATION] No files provided');
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    if (!propertyId) {
      console.log('❌ [VALIDATION] No property ID provided');
      return NextResponse.json(
        { success: false, error: 'Property ID is required' },
        { status: 400 }
      );
    }

    // Validate all files before processing
    for (let i = 0; i < files.length; i++) {
      const validation = validateFile(files[i]);
      if (!validation.valid) {
        console.log(`❌ [VALIDATION] File ${i + 1} failed validation: ${validation.error}`);
        return NextResponse.json(
          { success: false, error: validation.error },
          { status: 400 }
        );
      }
    }

    const uploadedImages = [];

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`📸 [UPLOAD] Processing file ${i + 1}/${files.length}: ${file.name} (${file.type}, ${Math.round(file.size / 1024)}KB)`);

      try {
        // Prepare file data
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const baseFileName = file.name.replace(/\.[^/.]+$/, '');
        const fileExtension = file.name.split('.').pop() || 'jpg';

        // Generate unique key for original image (NO SIZE PREFIX!)
        const timestamp = Date.now();
        const uniqueId = uuidv4().split('-')[0];
        const key = `properties/${propertyId}/originals/${timestamp}_${uniqueId}_${baseFileName}.${fileExtension}`;

        console.log(`⬆️ [R2] Uploading to key: ${key}`);

        // Upload to R2
        const command = new PutObjectCommand({
          Bucket: envVars.R2_BUCKET,
          Key: key,
          Body: buffer,
          ContentType: file.type,
          CacheControl: 'public, max-age=31536000', // 1 year cache
          Metadata: {
            propertyId,
            originalFileName: file.name,
            uploadedAt: new Date().toISOString(),
            fileSize: buffer.length.toString(),
            imageIndex: i.toString(),
          },
        });

        await r2Client.send(command);
        
        // Generate original image URL using custom domain
        const originalImageUrl = `https://${envVars.R2_CUSTOM_DOMAIN}/${key}`;
        
        // Generate Cloudflare optimized URLs (all pointing to same original file)
        const optimizedUrls = {
          thumb: `https://${envVars.CLOUDFLARE_MAIN_DOMAIN}/cdn-cgi/image/width=300,height=200,fit=cover,quality=80,format=webp/${originalImageUrl}`,
          medium: `https://${envVars.CLOUDFLARE_MAIN_DOMAIN}/cdn-cgi/image/width=800,height=600,fit=cover,quality=85,format=webp/${originalImageUrl}`,
          full: `https://${envVars.CLOUDFLARE_MAIN_DOMAIN}/cdn-cgi/image/width=1920,height=1440,fit=cover,quality=90,format=webp/${originalImageUrl}`
        };
        
        uploadedImages.push(optimizedUrls);
        
        console.log(`✅ [SUCCESS] File ${i + 1} uploaded successfully`);
        console.log(`📍 [URL] Original: ${originalImageUrl}`);
        console.log(`🎨 [OPTIMIZED] Thumb: ${optimizedUrls.thumb}`);
        console.log(`🎨 [OPTIMIZED] Medium: ${optimizedUrls.medium}`);
        console.log(`🎨 [OPTIMIZED] Full: ${optimizedUrls.full}`);

      } catch (uploadError) {
        console.error(`❌ [ERROR] Upload failed for ${file.name}:`, uploadError);
        return NextResponse.json(
          { 
            success: false, 
            error: `Failed to upload ${file.name}`,
            details: uploadError instanceof Error ? uploadError.message : 'Unknown upload error'
          },
          { status: 500 }
        );
      }
    }

    const duration = Date.now() - startTime;
    console.log(`🎉 [COMPLETE] Upload completed in ${duration}ms`);
    console.log(`📊 [STATS] Successfully processed ${uploadedImages.length} images with Cloudflare optimization`);

    return NextResponse.json({
      success: true,
      data: uploadedImages,
      message: `Successfully uploaded ${uploadedImages.length} images with Cloudflare optimization`,
      stats: {
        totalFiles: uploadedImages.length,
        processingTimeMs: duration,
        optimizationEnabled: true
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('💥 [FATAL] Unexpected error after', duration, 'ms:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Unexpected server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}