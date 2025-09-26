import { DataSource } from 'typeorm';
import { config } from 'dotenv';
config();

const isProd = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: isProd ? process.env.DATABASE_URL : undefined,
  host: isProd ? undefined : process.env.DB_HOST,
  port: isProd ? undefined : parseInt(process.env.DB_PORT || '5432', 10),
  username: isProd ? undefined : process.env.DB_USERNAME,
  password: isProd ? undefined : process.env.DB_PASSWORD,
  database: isProd ? undefined : process.env.DB_DATABASE,
  schema: 'public',
  entities: [isProd ? 'dist/**/*.entity.js' : 'src/**/*.entity.ts'],
  migrations: [isProd ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
  synchronize: false,
  logging: ['query', 'error', 'schema'],
  ssl: isProd ? { rejectUnauthorized: false } : false,
});

// Debugging output
console.log('TypeORM Config:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL);
