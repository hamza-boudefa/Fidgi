import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { QueryTypes } from 'sequelize';
import { Admin, AdminRole } from '../models';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface AuthToken {
  adminId: string;
  email: string;
  role: AdminRole;
  iat: number;
  exp: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: AdminRole;
}

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Verify password
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
export const generateToken = (admin: Admin): string => {
  const payload: Omit<AuthToken, 'iat' | 'exp'> = {
    adminId: admin.id,
    email: admin.email,
    role: admin.role,
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

// Verify JWT token
export const verifyToken = (token: string): AuthToken | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthToken;
  } catch (error) {
    return null;
  }
};

// Login admin
export const loginAdmin = async (credentials: LoginCredentials): Promise<{ admin: Admin; token: string } | null> => {
  try {
    console.log('Login attempt for email:', credentials.email);
    
    // Use raw query to get admin data due to Sequelize model sync issues
    const [rawAdmin] = await Admin.sequelize!.query(
      'SELECT id, email, password, name, role, "isActive", "lastLoginAt", "createdAt", "updatedAt" FROM admins WHERE email = :email AND "isActive" = true',
      {
        replacements: { email: credentials.email },
        type: QueryTypes.SELECT
      }
    ) as any[];

    console.log('Raw query result:', rawAdmin ? 'Admin found' : 'No admin found');
    
    if (!rawAdmin) {
      console.log('No admin found with email:', credentials.email);
      return null;
    }

    console.log('Admin found:', { 
      id: rawAdmin.id, 
      email: rawAdmin.email, 
      hasPassword: !!rawAdmin.password,
      passwordLength: rawAdmin.password ? rawAdmin.password.length : 0,
      passwordStart: rawAdmin.password ? rawAdmin.password.substring(0, 10) + '...' : 'null'
    });
    
    if (!rawAdmin.password) {
      console.error('Admin password is undefined or null');
      return null;
    }

    console.log('Verifying password...');
    const isValidPassword = await verifyPassword(credentials.password, rawAdmin.password);
    console.log('Password verification result:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('Password verification failed');
      return null;
    }

    console.log('Login successful, updating last login...');
    
    // Update last login using raw query
    await Admin.sequelize!.query(
      'UPDATE admins SET "lastLoginAt" = :lastLoginAt WHERE id = :id',
      {
        replacements: { 
          lastLoginAt: new Date(),
          id: rawAdmin.id 
        }
      }
    );

    // Create a mock Admin instance for token generation
    const admin = {
      id: rawAdmin.id,
      email: rawAdmin.email,
      name: rawAdmin.name,
      role: rawAdmin.role,
      isActive: rawAdmin.isActive,
      lastLoginAt: new Date(),
      createdAt: rawAdmin.createdAt,
      updatedAt: rawAdmin.updatedAt
    } as Admin;

    const token = generateToken(admin);
    console.log('Token generated successfully');
    return { admin, token };
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

// Register admin
export const registerAdmin = async (data: RegisterData): Promise<{ admin: Admin; token: string } | null> => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      where: { email: data.email }
    });

    if (existingAdmin) {
      return null;
    }

    const hashedPassword = await hashPassword(data.password);
    
    const admin = await Admin.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: data.role || AdminRole.ADMIN,
      isActive: true,
    });

    const token = generateToken(admin);
    return { admin, token };
  } catch (error) {
    console.error('Registration error:', error);
    return null;
  }
};

// Get admin by ID
export const getAdminById = async (adminId: string): Promise<Admin | null> => {
  try {
    return await Admin.findByPk(adminId);
  } catch (error) {
    console.error('Get admin error:', error);
    return null;
  }
};

// Middleware to verify admin token
export const verifyAdminToken = (token: string): AuthToken | null => {
  return verifyToken(token);
};

// Check if admin has required role
export const hasRole = (adminRole: AdminRole, requiredRole: AdminRole): boolean => {
  const roleHierarchy = {
    [AdminRole.MANAGER]: 1,
    [AdminRole.ADMIN]: 2,
    [AdminRole.SUPER_ADMIN]: 3,
  };

  return roleHierarchy[adminRole] >= roleHierarchy[requiredRole];
};
