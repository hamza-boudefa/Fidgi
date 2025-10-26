import { NextRequest, NextResponse } from 'next/server';
import { registerAdmin } from '@/lib/auth';

import { withAdminAuth, AdminRequest } from '@/lib/adminMiddleware';
import { AdminRole } from '@/models';

// Initialize database connection
let dbInitialized = false;
const initDB = async () => {
  if (!dbInitialized) {
  
    dbInitialized = true;
  }
};

// POST /api/admin/auth/register - Create new admin (Super Admin only)
async function createAdminHandler(req: AdminRequest) {
  try {
    
    
    const body = await req.json();
    const { email, password, name, role } = body;

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

    // Validate role if provided
    if (role && !Object.values(AdminRole).includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Attempt to create admin
    const result = await registerAdmin({
      email,
      password,
      name,
      role: role || AdminRole.ADMIN,
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Admin with this email already exists' },
        { status: 409 }
      );
    }

    const { admin } = result;

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
        message: 'Admin created successfully',
      },
    });
  } catch (error) {
    console.error('Admin creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create admin' },
      { status: 500 }
    );
  }
}

// Export the handler with super admin authentication
export const POST = withAdminAuth(createAdminHandler, AdminRole.SUPER_ADMIN);

