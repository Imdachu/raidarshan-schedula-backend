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

// This is the configuration object we will import into our app module
export const dataSourceOptions: DataSourceOptions = isProd ? prodOptions : devOptions;

// This is the DataSource instance used by the TypeORM CLI
export default new DataSource(dataSourceOptions);