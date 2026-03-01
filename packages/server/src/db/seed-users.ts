import bcrypt from 'bcrypt';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { users } from './schema/users.js';

const connectionString = process.env.DATABASE_URL || 'postgresql://nbagm:nbagm_dev@localhost:5432/nba_gm_simulator';
const client = postgres(connectionString);
const db = drizzle(client);

const seedUsers = [
  { email: 'smithc0222@gmail.com', displayName: 'Chase', password: 'password123' },
  { email: 'Maverick2335@icloud.com', displayName: 'Maverick', password: 'password123' },
];

async function main() {
  for (const { email, displayName, password } of seedUsers) {
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await db
      .insert(users)
      .values({ email, passwordHash, displayName })
      .onConflictDoNothing({ target: users.email })
      .returning();

    if (result.length > 0) {
      console.log(`Created user: ${displayName} (id: ${result[0].id}, email: ${email})`);
    } else {
      console.log(`User already exists: ${displayName} (${email})`);
    }
  }

  console.log('\nDone!');
  await client.end();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
