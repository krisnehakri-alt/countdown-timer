
import prisma from "../db.server";

// Public API called from storefront via fetch
export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  
  if (!shop) {
    return Response.json({ error: "Missing shop parameter" }, { status: 400 });
  }

  const activeCountdowns = await prisma.countdown.findMany({
    where: { shopId: shop, active: true },
    select: {
      id: true,
      title: true,
      description: true,
      templateId: true,
      fontColor: true,
      textColor: true,
      buttonColor: true,
      backgroundColor: true,
      ctaText: true,
      ctaUrl: true,
      expiryDate: true
    }
  });

  return Response.json(activeCountdowns, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=60"
    }
  });
};

export const action = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    const data = await request.json();
    const { countdownId, eventType } = data; // eventType: "VIEW" or "CLICK"

    if (countdownId && eventType) {
      await prisma.analyticsEvent.create({
        data: {
          countdownId,
          eventType
        }
      });
    }

    return Response.json({ success: true }, {
      headers: { "Access-Control-Allow-Origin": "*" }
    });
  } catch (error) {
    return Response.json({ error: "Failed to process analytics event" }, { 
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" }
    });
  }
};
