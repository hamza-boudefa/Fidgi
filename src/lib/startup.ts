import { initializeDatabase } from '@/config/database';
import { addDatabaseIndexes } from './addIndexes';

// Initialize database and add indexes on app startup
export const initializeApp = async () => {
  try {
    console.log('🚀 Initializing application...');
    
    // Initialize database
    await initializeDatabase();
    
    // Add database indexes for better performance
    await addDatabaseIndexes();
    
    console.log('✅ Application initialization completed!');
  } catch (error) {
    console.error('❌ Application initialization failed:', error);
    // Don't throw error to prevent app crashes
  }
};

