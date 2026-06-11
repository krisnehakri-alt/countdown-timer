// Inspect live sessions for debugging billing/token issues
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  const sessions = await prisma.session.findMany({
    orderBy: { id: 'asc' },
  });

  console.log(`\n=== LIVE SESSION TABLE (${sessions.length} rows) ===`);
  for (const s of sessions) {
    console.log({
      id: s.id,
      shop: s.shop,
      isOnline: s.isOnline,
      scope: s.scope,
      expires: s.expires,
      accessToken: s.accessToken?.substring(0, 20) + '...',
      hasRefreshToken: !!s.refreshToken,
      refreshTokenExpires: s.refreshTokenExpires,
      accountOwner: s.accountOwner,
    });
  }

  const shops = await prisma.shop.findMany();
  console.log(`\n=== SHOP TABLE (${shops.length} rows) ===`);
  for (const sh of shops) {
    console.log({ shop: sh.shop, plan: sh.plan, createdAt: sh.createdAt });
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
