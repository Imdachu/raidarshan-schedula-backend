import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();

const isProd = process.env.NODE_ENV === 'production';

// Common options for both environments
const baseOptions = {
  type: 'postgres',
  schema: 'public',
  synchronize: false,
};

// Environment-specific options
const envOptions = isProd
  ? {
      url: process.env.DATABASE_URL,
      entities: ['dist/**/*.entity.js'],
      migrations: ['dist/migrations/*.js'],
      logging: ['error'],
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: ['src/**/*.entity.ts'],
      migrations: ['src/migrations/*.ts'],
      logging: ['query', 'error', 'schema'],
    };

// Combine and export the final configuration
export default new DataSource({
  ...baseOptions,
  ...envOptions,
} as DataSourceOptions);