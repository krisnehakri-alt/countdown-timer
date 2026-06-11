// One-time migration: delete stale non-expiring offline sessions.
// On next merchant visit, the token-exchange strategy will re-auth
// and issue a fresh expiring offline token WITH a refreshToken.
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  // Find all sessions that are missing a refreshToken (old non-expiring format)
  const stale = await prisma.session.findMany({
    where: { refreshToken: null, isOnline: false },
  });

  console.log(`Found ${stale.length} stale offline session(s) to delete:`);
  for (const s of stale) {
    console.log(`  - ${s.id} (${s.shop})`);
  }

  if (stale.length === 0) {
    console.log('No stale sessions found — nothing to do.');
    await prisma.$disconnect();
    return;
  }

  const result = await prisma.session.deleteMany({
    where: { refreshToken: null, isOnline: false },
  });

  console.log(`\n✅ Deleted ${result.count} stale session(s).`);
  console.log('Both shops must re-authorize on next app open to receive fresh expiring tokens.\n');

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
