import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Debugging Cloudinary configuration...');
    
    // Check environment variables
    const cloudName = 'dngrhp34r';
    const apiKey = '786822197575486';
    const apiSecret = '1CW2czf1LMKggcnjPX1OGjn0jOc';
    
    console.log('Cloudinary config:', {
      cloudName,
      apiKey: apiKey.substring(0, 4) + '...',
      apiSecret: apiSecret.substring(0, 4) + '...'
    });
    
    // Test basic Cloudinary import
    let cloudinary;
    try {
      const cloudinaryModule = await import('cloudinary');
      cloudinary = cloudinaryModule.v2;
      console.log('Cloudinary module imported successfully');
    } catch (importError) {
      console.error('Failed to import Cloudinary:', importError);
      return NextResponse.json({
        success: false,
        error: 'Failed to import Cloudinary module',
        details: importError instanceof Error ? importError.message : 'Unknown import error'
      }, { status: 500 });
    }
    
    // Test configuration
    try {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true
      });
      console.log('Cloudinary configured successfully');
    } catch (configError) {
      console.error('Failed to configure Cloudinary:', configError);
      return NextResponse.json({
        success: false,
        error: 'Failed to configure Cloudinary',
        details: configError instanceof Error ? configError.message : 'Unknown config error'
      }, { status: 500 });
    }
    
    // Test ping
    try {
      const pingResult = await cloudinary.api.ping();
      console.log('Cloudinary ping successful:', pingResult);
      
      return NextResponse.json({
        success: true,
        message: 'Cloudinary configuration is working',
        data: {
          ping: pingResult,
          config: {
            cloudName,
            apiKey: apiKey.substring(0, 4) + '...',
            apiSecret: apiSecret.substring(0, 4) + '...'
          }
        }
      });
    } catch (pingError) {
      console.error('Cloudinary ping failed:', pingError);
      return NextResponse.json({
        success: false,
        error: 'Cloudinary ping failed',
        details: pingError instanceof Error ? pingError.message : 'Unknown ping error'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
