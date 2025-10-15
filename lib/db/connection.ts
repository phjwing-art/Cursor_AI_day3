import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/notes'

// Database connection
const connectionString = process.env.DATABASE_URL!

// Direct connection to Supabase Postgres
const client = postgres(connectionString)
export const db = drizzle(client, { schema })

export type Database = typeof db
