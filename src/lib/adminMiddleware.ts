import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from './auth';
import { AdminRole } from '@/models';

export interface AdminRequest extends NextRequest {
  admin?: {
    id: string;
    email: string;
    role: AdminRole;
  };
}

export function withAdminAuth(
  handler: (req: AdminRequest) => Promise<NextResponse>,
  requiredRole: AdminRole = AdminRole.ADMIN
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Get token from cookie or Authorization header
      const token = req.cookies.get('admin-token')?.value || 
                    req.headers.get('authorization')?.replace('Bearer ', '');

      if (!token) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
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

      // Check role permissions
      const hasPermission = decoded.role === AdminRole.SUPER_ADMIN || 
                           (requiredRole === AdminRole.ADMIN && decoded.role === AdminRole.ADMIN) ||
                           (requiredRole === AdminRole.MANAGER && (decoded.role === AdminRole.ADMIN || decoded.role === AdminRole.MANAGER));

      if (!hasPermission) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      // Add admin info to request
      const adminRequest = req as AdminRequest;
      adminRequest.admin = {
        id: decoded.adminId,
        email: decoded.email,
        role: decoded.role,
      };

      return await handler(adminRequest);
    } catch (error) {
      console.error('Admin middleware error:', error);
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
}

// Helper function to check if user is authenticated
export function isAdminAuthenticated(req: NextRequest): boolean {
  const token = req.cookies.get('admin-token')?.value || 
                req.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) return false;
  
  const decoded = verifyAdminToken(token);
  return decoded !== null;
}

// Helper function to get admin info from request
export function getAdminFromRequest(req: NextRequest) {
  const token = req.cookies.get('admin-token')?.value || 
                req.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) return null;
  
  const decoded = verifyAdminToken(token);
  if (!decoded) return null;
  
  return {
    id: decoded.adminId,
    email: decoded.email,
    role: decoded.role,
  };
}
