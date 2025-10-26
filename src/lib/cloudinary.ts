import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dngrhp34r',
  api_key: '786822197575486',
  api_secret: '1CW2czf1LMKggcnjPX1OGjn0jOc',
  secure: true
});

// Upload presets for different item types (will be created in Cloudinary dashboard)
export const UPLOAD_PRESETS = {
  FIDGI_COLOR: 'fidgi-colors',
  KEYCAP_DESIGN: 'keycap-designs', 
  SWITCH_TYPE: 'switch-types',
  PREBUILT_FIDGI: 'prebuilt-fidgis'
} as const;

// Image transformation utilities
export const getOptimizedImageUrl = (
  publicId: string, 
  width?: number, 
  height?: number, 
  quality: 'auto' | number = 'auto'
) => {
  const transformations: string[] = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (quality === 'auto') {
    transformations.push('q_auto,f_auto');
  } else {
    transformations.push(`q_${quality}`);
  }
  
  // Add crop mode for consistent sizing
  transformations.push('c_fill');
  
  const transformString = transformations.join(',');
  return `https://res.cloudinary.com/dngrhp34r/image/upload/${transformString}/${publicId}`;
};

// Generate different image sizes
export const getImageSizes = (publicId: string) => ({
  thumbnail: getOptimizedImageUrl(publicId, 150, 150),
  small: getOptimizedImageUrl(publicId, 300, 300),
  medium: getOptimizedImageUrl(publicId, 600, 600),
  large: getOptimizedImageUrl(publicId, 1200, 1200),
  original: `https://res.cloudinary.com/dngrhp34r/image/upload/${publicId}`
});

// Upload image to Cloudinary
export const uploadToCloudinary = async (
  file: File | Buffer,
  folder: string,
  preset?: string
): Promise<{ public_id: string; secure_url: string }> => {
  try {
    console.log('Uploading to Cloudinary:', { folder, preset });
    
    // Convert File to Buffer if needed
    let fileBuffer: Buffer;
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else {
      fileBuffer = file;
    }
    
    const uploadOptions: any = {
      folder,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto'
    };

    // Only add preset if it exists
    if (preset) {
      uploadOptions.upload_preset = preset;
    }

    console.log('Upload options:', uploadOptions);
    console.log('File buffer size:', fileBuffer.length);

    // Convert buffer to base64 string
    const mimeType = file instanceof File ? file.type : 'image/jpeg';
    const base64String = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(base64String, uploadOptions);
    
    console.log('Upload successful:', result);
    
    return {
      public_id: result.public_id,
      secure_url: result.secure_url
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    console.error('Error details:', error);
    throw new Error(`Failed to upload image to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Delete image from Cloudinary
export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
  try {
    console.log('Attempting to delete public ID:', publicId);
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Cloudinary delete result:', result);
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      publicId,
      error
    });
    return false;
  }
};

// Get image info
export const getImageInfo = async (publicId: string) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary info error:', error);
    return null;
  }
};

// Extract public_id from Cloudinary URL
export const extractPublicId = (url: string): string | null => {
  try {
    // Cloudinary URL pattern: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}
    // The public_id can include folder paths like "fidgi-store/colors/filename"
    const match = url.match(/\/upload\/(?:[^\/]+\/)?(.+)$/);
    if (match) {
      // Remove file extension if present
      return match[1].replace(/\.[^.]*$/, '');
    }
    return null;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
};

// Delete multiple images from Cloudinary
export const deleteMultipleFromCloudinary = async (urls: string[]): Promise<{ success: string[], failed: string[] }> => {
  const results = { success: [], failed: [] };
  
  for (const url of urls) {
    const publicId = extractPublicId(url);
    if (publicId) {
      const deleted = await deleteFromCloudinary(publicId);
      if (deleted) {
        results.success.push(url);
      } else {
        results.failed.push(url);
      }
    } else {
      results.failed.push(url);
    }
  }
  
  return results;
};

export { cloudinary };
