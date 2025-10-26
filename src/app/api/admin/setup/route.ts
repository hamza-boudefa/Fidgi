import { NextRequest, NextResponse } from 'next/server';
import { registerAdmin } from '@/lib/auth';
import { initializeDatabase, Admin } from '@/models';
import { AdminRole } from '@/models';

// Initialize database connection
let dbInitialized = false;
const initDB = async () => {
  if (!dbInitialized) {
    
    dbInitialized = true;
  }
};

// POST /api/admin/setup - Create first super admin (no auth required)
export async function POST(request: NextRequest) {
  try {
    
    
    // Check if any admin already exists
    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin already exists. Use the regular admin creation endpoint with authentication.' },
        { status: 409 }
      );
    }
    
    const body = await request.json();
    const { email, password, name } = body;

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Create super admin
    const result = await registerAdmin({
      email,
      password,
      name,
      role: AdminRole.SUPER_ADMIN,
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Failed to create super admin' },
        { status: 500 }
      );
    }

    const { admin, token } = result;

    return NextResponse.json({
      success: true,
      data: {
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          isActive: admin.isActive,
          createdAt: admin.createdAt,
        },
        token,
        message: 'Super admin created successfully. Use this token for future admin operations.',
      },
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { success: false, error: 'Setup failed' },
      { status: 500 }
    );
  }
}

