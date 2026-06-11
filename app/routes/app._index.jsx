import { useLoaderData, useNavigate } from "react-router";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  InlineStack,
  Badge,
  Grid
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { session, billing } = await authenticate.admin(request);
  const shop = session.shop;

  // Attempt to read live plan from Shopify Billing API.
  // Falls back to DB plan on any error (403, network, etc.).
  let currentPlan = "Free";
  try {
    const billingCheck = await billing.check({
      plans: ["Starter Plan", "Growth Plan", "Premium Plan"],
      isTest: true,
    });
    if (billingCheck.hasActivePayment) {
      currentPlan = billingCheck.appSubscriptions[0].name;
    }
  } catch (err) {
    console.error("[Dashboard Loader] billing.check() failed, falling back to DB:", err.message);
    try {
      const shopRecord = await prisma.shop.findUnique({ where: { shop } });
      if (shopRecord?.plan) currentPlan = shopRecord.plan;
    } catch (dbErr) {
      console.error("[Dashboard Loader] DB fallback failed:", dbErr.message);
    }
  }

  // Sync plan to database
  try {
    await prisma.shop.upsert({
      where: { shop },
      update: { plan: currentPlan },
      create: { shop, plan: currentPlan },
    });
  } catch (dbErr) {
    console.error("[Dashboard Loader] DB upsert failed:", dbErr.message);
  }

  // Get active countdowns
  const activeCountdowns = await prisma.countdown.count({
    where: { shopId: shop, active: true }
  });

  const totalCountdowns = await prisma.countdown.count({
    where: { shopId: shop }
  });

  // Get Analytics
  let views = 0;
  let clicks = 0;
  try {
    const analytics = await prisma.analyticsEvent.groupBy({
      by: ['eventType'],
      where: { countdown: { shopId: shop } },
      _count: { _all: true }
    });
    analytics.forEach(a => {
      if (a.eventType === "VIEW") views = a._count._all;
      if (a.eventType === "CLICK") clicks = a._count._all;
    });
  } catch (err) {
    console.error("[Analytics Query Error]", err);
    // Non-fatal: analytics failing should not crash the dashboard
  }

  const conversionRate = views > 0 ? ((clicks / views) * 100).toFixed(2) : 0;

  return {
    shop,
    currentPlan,
    activeCountdowns,
    totalCountdowns,
    views,
    clicks,
    conversionRate
  };
};

export default function Index() {
  const { currentPlan, activeCountdowns, totalCountdowns, views, clicks, conversionRate } = useLoaderData();
  const navigate = useNavigate();

  return (
    <Page title="Dashboard">
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Grid>
              <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 3, xl: 3}}>
                <Card>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm" tone="subdued">Active Countdowns</Text>
                    <Text as="p" variant="headingXl">{activeCountdowns}</Text>
                    <Text as="p" variant="bodySm" tone="subdued">{totalCountdowns} total created</Text>
                  </BlockStack>
                </Card>
              </Grid.Cell>
              
              <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 3, xl: 3}}>
                <Card>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm" tone="subdued">Total Views</Text>
                    <Text as="p" variant="headingXl">{views}</Text>
                  </BlockStack>
                </Card>
              </Grid.Cell>

              <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 3, xl: 3}}>
                <Card>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm" tone="subdued">Total Clicks</Text>
                    <Text as="p" variant="headingXl">{clicks}</Text>
                  </BlockStack>
                </Card>
              </Grid.Cell>

              <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 3, xl: 3}}>
                <Card>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm" tone="subdued">Conversion Rate</Text>
                    <Text as="p" variant="headingXl">{conversionRate}%</Text>
                  </BlockStack>
                </Card>
              </Grid.Cell>
            </Grid>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card padding="400">
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">Subscription Status</Text>
                <InlineStack align="space-between">
                  <Text as="p">Current Plan</Text>
                  <Badge tone={currentPlan !== "Free" ? "success" : "info"}>{currentPlan}</Badge>
                </InlineStack>
                <Button onClick={() => navigate("/app/billing")}>
                  Manage Subscription
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="twoThirds">
            <Card padding="400">
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">Quick Actions</Text>
                <InlineStack gap="300">
                  <Button variant="primary" onClick={() => navigate("/app/templates")}>
                    Create New Countdown
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
