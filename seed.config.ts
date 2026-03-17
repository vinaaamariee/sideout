import { SeedPg } from '@snaplet/seed/adapter-pg';
import { defineConfig } from '@snaplet/seed/config';
import { Client } from 'pg';

export default defineConfig({
  adapter: async () => {
    const client = new Client({
      // Use the connection string but double-check the [PASSWORD]
      connectionString: "postgresql://postgres:[YOUR-PASSWORD]@db.skqsuddsknmzvwnlzpyx.supabase.co:6543/postgres?pgbouncer=true",
      // Adding a timeout can help prevent the "AggregateError"
      connectionTimeoutMillis: 20000, 
    });
    
    try {
      await client.connect();
      console.log("Successfully connected to SideOut database!");
    } catch (e) {
      console.error("Connection failed. Check if your password is correct.");
      throw e;
    }
    
    return new SeedPg(client);
  },
  select: ['!*', 'public.*'],
});