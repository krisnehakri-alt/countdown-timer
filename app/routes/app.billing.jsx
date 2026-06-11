import { useLoaderData, useSubmit, useNavigation, redirect } from "react-router";
import { Page, Card, Text, Button, BlockStack, InlineStack, Badge, Grid, Divider, List } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect } from "react";
import prisma from "../db.server";

const MONTHLY_PLAN_STARTER = "Starter Plan";
const MONTHLY_PLAN_GROWTH = "Growth Plan";
const MONTHLY_PLAN_PREMIUM = "Premium Plan";

// All plan names the billing API should check for
const ALL_PLANS = [MONTHLY_PLAN_STARTER, MONTHLY_PLAN_GROWTH, MONTHLY_PLAN_PREMIUM];

export const loader = async ({ request }) => {
  const { session, billing } = await authenticate.admin(request);
  const shop = session.shop;

  // Attempt to read the live plan from Shopify Billing API.
  // Falls back to the plan stored in our DB if Shopify returns an error
  // (e.g. 403 on a dev store where billing is not yet activated).
  let currentPlan = "Free";
  try {
    const billingCheck = await billing.check({
      plans: ALL_PLANS,
      isTest: true,
    });
    if (billingCheck.hasActivePayment) {
      currentPlan = billingCheck.appSubscriptions[0].name;
    }
  } catch (err) {
    console.error("[Billing Loader] billing.check() failed, falling back to DB plan:", err.message);
    // Read the last-known plan from our own database as the fallback
    try {
      const shopRecord = await prisma.shop.findUnique({ where: { shop } });
      if (shopRecord?.plan) currentPlan = shopRecord.plan;
    } catch (dbErr) {
      console.error("[Billing Loader] DB fallback also failed:", dbErr.message);
    }
  }

  // Sync whatever plan we resolved back into the database
  try {
    await prisma.shop.upsert({
      where: { shop },
      update: { plan: currentPlan },
      create: { shop, plan: currentPlan },
    });
  } catch (dbErr) {
    console.error("[Billing Loader] DB upsert failed:", dbErr.message);
  }

  // If Shopify redirected back here after payment approval, go straight to dashboard.
  const url = new URL(request.url);
  const chargeId = url.searchParams.get("charge_id");
  if (chargeId) {
    return redirect("/app");
  }

  return { currentPlan };
};

export const action = async ({ request }) => {
  console.log("=== BILLING ACTION HIT ===");
  const { session, billing } = await authenticate.admin(request);
  const shop = session.shop;

  const formData = await request.formData();
  const planName = formData.get("plan");
  console.log("Selected plan:", planName);

  // Downgrade to Free: cancel active subscription
  if (planName === "Free") {
    try {
      const billingCheck = await billing.check({
        plans: ALL_PLANS,
        isTest: true,
      });
      if (billingCheck.hasActivePayment) {
        const activeSubscription = billingCheck.appSubscriptions[0];
        await billing.cancel({
          subscriptionId: activeSubscription.id,
          isTest: activeSubscription.test,
          prorate: true,
        });
      }
    } catch (err) {
      console.error("[Billing Action] billing.check/cancel failed during downgrade:", err.message);
      // Even if billing API fails, still sync the DB to Free so the UI is consistent
    }
    await prisma.shop.upsert({
      where: { shop },
      update: { plan: "Free" },
      create: { shop, plan: "Free" },
    });
    return redirect("/app");
  }

  // Upgrade to a paid plan
  console.log("Requesting plan:", planName);

  try {
    await billing.request({
      plan: planName,
      isTest: true,
    });
  } catch (error) {
    // Shopify billing.request() throws a Response object to redirect the merchant to the approval page.
    // We MUST rethrow it so React Router can execute the redirect.
    if (error instanceof Response) {
      throw error;
    }
    
    // If it's a real error (like 403 Forbidden because of dev store billing limits), catch it gracefully.
    console.error("[Billing Action] billing.request() failed:", error.message || error);
    return redirect("/app/billing?error=billing_failed");
  }
};

export default function BillingPage() {
  const { currentPlan } = useLoaderData();

  const submit = useSubmit();
  const navigation = useNavigation();
  const isLoading = navigation.state === "submitting";
  const shopify = useAppBridge();

  useEffect(() => {
    // success toast is no longer needed here since we redirect on charge_id,
    // but keep the hook in case the app bridge is used elsewhere.
  }, [shopify]);

  const handleUpgrade = (planName) => {
    submit({ plan: planName }, { method: "post" });
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Basic features for getting started",
      features: [
        "1 Free Template (Clean Modern)",
        "Unlimited countdowns",
        "Basic Customizations"
      ],
      current: currentPlan === "Free"
    },
    {
      name: MONTHLY_PLAN_STARTER,
      price: "$39/mo",
      description: "Animated designs for better conversions",
      features: [
        "Everything in Free",
        "2 Starter Templates unlocked",
        "Floating Glassmorphism design",
        "Neon Sale urgency design"
      ],
      current: currentPlan === MONTHLY_PLAN_STARTER
    },
    {
      name: MONTHLY_PLAN_GROWTH,
      price: "$59/mo",
      description: "Luxury designs for high volume stores",
      features: [
        "Everything in Starter",
        "2 Growth Templates unlocked",
        "Luxury Dark gradient design",
        "Product Launch motion design"
      ],
      current: currentPlan === MONTHLY_PLAN_GROWTH
    },
    {
      name: MONTHLY_PLAN_PREMIUM,
      price: "$99/mo",
      description: "Ultimate VIP designs for maximum ROI",
      features: [
        "Everything in Growth",
        "2 Premium Templates unlocked",
        "Black & Gold VIP design",
        "Enterprise Ultra animations"
      ],
      current: currentPlan === MONTHLY_PLAN_PREMIUM
    }
  ];

  return (
    <Page title="Billing & Subscriptions">
      <BlockStack gap="500">
        <Text variant="bodyMd" as="p">
          Upgrade your plan to unlock more premium countdown templates. Templates you create with premium designs will automatically be locked if you downgrade.
        </Text>

        <Grid>
          {plans.map((plan, index) => (
            <Grid.Cell key={index} columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
              <Card padding="400">
                <BlockStack gap="400">
                  <InlineStack align="space-between">
                    <Text variant="headingLg" as="h3">{plan.name}</Text>
                    {plan.current && <Badge tone="success">Current</Badge>}
                  </InlineStack>
                  <Text variant="headingXl" as="h2">{plan.price}</Text>
                  <Text tone="subdued" as="p">{plan.description}</Text>

                  <Divider />

                  <div style={{ minHeight: '180px' }}>
                    <List type="bullet">
                      {plan.features.map((feature, i) => (
                        <List.Item key={i}>{feature}</List.Item>
                      ))}
                    </List>
                  </div>

                  {!plan.current && (
                    <Button
                      fullWidth
                      variant="primary"
                      onClick={() => handleUpgrade(plan.name)}
                      loading={isLoading}
                    >
                      {plan.name === "Free" ? "Downgrade" : "Upgrade"}
                    </Button>
                  )}
                  {plan.current && (
                    <Button fullWidth disabled>
                      Active Plan
                    </Button>
                  )}
                </BlockStack>
              </Card>
            </Grid.Cell>
          ))}
        </Grid>
      </BlockStack>
    </Page>
  );
}
