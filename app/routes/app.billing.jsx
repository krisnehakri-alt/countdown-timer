import { useLoaderData, useSubmit, useNavigation, redirect } from "react-router";
import { Page, Card, Text, Button, BlockStack, InlineStack, Badge, Grid, Divider, List } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect } from "react";

const MONTHLY_PLAN_STARTER = "Starter Plan";
const MONTHLY_PLAN_GROWTH = "Growth Plan";
const MONTHLY_PLAN_PREMIUM = "Premium Plan";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const chargeId = url.searchParams.get("charge_id");

  // Query active subscriptions
  const response = await admin.graphql(`
    query getActiveSubscriptions {
      currentAppInstallation {
        activeSubscriptions {
          id
          name
          test
        }
      }
    }
  `);

  const { data } = await response.json();
  const activeSubscriptions = data?.currentAppInstallation?.activeSubscriptions || [];

  let currentPlan = "Free";
  if (activeSubscriptions.length > 0) {
    currentPlan = activeSubscriptions[0].name;
  }

  return { currentPlan, success: !!chargeId };
};

export const action = async ({ request }) => {
  await authenticate.admin(request);
  
  // Directly redirect to the dashboard without doing Shopify billing mutations
  // This prevents any OAuth install loops or manual shop login forms.
  return redirect("/app");
};

export default function BillingPage() {
  const { currentPlan, success } = useLoaderData();

  const submit = useSubmit();
  const navigation = useNavigation();
  const isLoading = navigation.state === "submitting";
  const shopify = useAppBridge();

  useEffect(() => {
    if (success) {
      shopify.toast.show("Subscription activated successfully!");
    }
  }, [success, shopify]);



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
