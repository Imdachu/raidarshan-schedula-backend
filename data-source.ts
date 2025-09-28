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
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
  logging: ['error'],
  ssl: { rejectUnauthorized: false },
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

// --- DEBUGGING STATEMENT ---
// We cast to `any` here just for the debug log to safely access the url property.
const logOptions = dataSourceOptions as any;
console.log("--- [DEBUG] MIGRATION SCRIPT CONFIG ---");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("Connection method:", logOptions.url ? `URL (${logOptions.url.substring(0, 25)}...)` : "Host/Port");
console.log("Entities Path:", logOptions.entities);
console.log("Migrations Path:", logOptions.migrations);
console.log("---------------------------------------");
// --- END DEBUGGING ---

export default new DataSource(dataSourceOptions);