import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
config();

const isProd = process.env.NODE_ENV === 'production';

const options: DataSourceOptions = {
  type: 'postgres',
  schema: 'public',
  synchronize: false,
  entities: [isProd ? 'dist/**/*.entity.js' : 'src/**/*.entity.ts'],
  migrations: [isProd ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
  ...(isProd
    ? {
        url: process.env.DATABASE_URL,
        logging: ['error'],
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        logging: ['query', 'error', 'schema'],
      }),
};

if (isProd && !options.url) {
  throw new Error('DATABASE_URL is not set in production environment for data-source.');
}


export const AppDataSource = new DataSource(options);

// Debugging output
console.log('[data-source] TypeORM Config Initialized for NODE_ENV:', process.env.NODE_ENV);