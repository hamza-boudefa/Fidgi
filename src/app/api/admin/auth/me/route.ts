import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, getAdminById } from '@/lib/auth';

// GET /api/admin/auth/me - Get current admin info
export async function GET(request: NextRequest) {
  try {
    
    // Get token from cookie or Authorization header
    const token = request.cookies.get('admin-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authentication token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyAdminToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
console.log('Decoded token:', decoded);
    // Get admin from database
    const admin = await getAdminById(decoded.adminId);
    console.log('Admin:', admin);
    
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 401 }
      );
    }
    
    // Check if admin is active (handle both Sequelize instance and plain object)
    const isActive = admin.dataValues ? admin.dataValues.isActive : admin.isActive;
    if (!isActive) {
      return NextResponse.json(
        { success: false, error: 'Admin account is inactive' },
        { status: 401 }
      );
    }

    // Extract data safely (handle both Sequelize instance and plain object)
    const adminData = admin.dataValues || admin;
    
    return NextResponse.json({
      success: true,
      data: {
        id: adminData.id,
        email: adminData.email,
        name: adminData.name,
        role: adminData.role,
        lastLoginAt: adminData.lastLoginAt,
        createdAt: adminData.createdAt,
      },
    });
  } catch (error) {
    console.error('Get admin info error:', error);
    
    // Handle specific database connection errors
    if (error.name === 'SequelizeConnectionError' || error.message?.includes('Connection terminated') || error.message?.includes('ETIMEDOUT')) {
      return NextResponse.json(
        { success: false, error: 'Database connection error. Please try again.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to get admin info' },
      { status: 500 }
    );
  }
}
