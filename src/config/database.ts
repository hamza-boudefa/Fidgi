import { Sequelize } from 'sequelize';

// Initialize sequelize instance
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_8zfgp2UVSrRn@ep-muddy-dust-agcy9fyn-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  {
    dialect: 'postgres',
    dialectModule: require('pg'),
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Database initialization function - only run once at startup
let isInitialized = false;

export const initializeDatabase = async () => {
  if (isInitialized) {
    return; // Already initialized, skip
  }

  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Only sync on first initialization
    try {
      await sequelize.sync({ alter: true });
      console.log('Database synchronized successfully with alterations.');
    } catch (syncError: any) {
      // If it's a constraint error, try without alter
      if (syncError.name === 'SequelizeUnknownConstraintError' || 
          syncError.message?.includes('constraint') ||
          syncError.message?.includes('does not exist')) {
        console.warn('Constraint sync error, trying without alter...');
        await sequelize.sync({ alter: false, force: false });
        console.log('Database synchronized successfully without alterations.');
      } else {
        throw syncError;
      }
    }
    
    isInitialized = true;
    console.log('Database initialization completed.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    // Don't throw error to prevent app crashes, just log it
    console.warn('Database sync had issues, but continuing...');
  }
};

export default sequelize;
