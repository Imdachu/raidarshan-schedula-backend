import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();

const isProd = process.env.NODE_ENV === 'production';

const commonOptions: Partial<DataSourceOptions> = {
  type: 'postgres',
  schema: 'public',
  synchronize: false,
};

const prodOptions: DataSourceOptions = {
  ...commonOptions,
  type: 'postgres',
  url: process.env.DATABASE_URL,
  // Fix the entity paths for production build structure
  entities: ['dist/src/**/*.entity.js'],
  migrations: ['dist/src/migrations/*.js'],
  logging: ['error', 'migration', 'query'], // Add more logging
  ssl: { rejectUnauthorized: false },
  // Add this to ensure migrations run
  migrationsRun: false, // Don't auto-run, we do it manually
};

const devOptions: DataSourceOptions = {
  ...commonOptions,
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  logging: ['query', 'error', 'schema'],
};

export const dataSourceOptions: DataSourceOptions = isProd ? prodOptions : devOptions;

// Enhanced debugging
const logOptions = dataSourceOptions as any;
console.log("--- [DEBUG] MIGRATION SCRIPT CONFIG ---");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("Connection method:", logOptions.url ? `URL (${logOptions.url.substring(0, 25)}...)` : "Host/Port");
console.log("Entities Path:", logOptions.entities);
console.log("Migrations Path:", logOptions.migrations);
console.log("Current directory:", __dirname);
console.log("---------------------------------------");

export default new DataSource(dataSourceOptions);