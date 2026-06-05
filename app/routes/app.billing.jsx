import { useLoaderData, useSubmit, useNavigation, redirect, useActionData } from "react-router";
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
  const { admin, session, redirect: shopifyRedirect } = await authenticate.admin(request);
  const formData = await request.formData();
  const plan = formData.get("plan");

  // Query active subscriptions to cancel them if needed
  const response = await admin.graphql(`
    query getActiveSubscriptions {
      currentAppInstallation {
        activeSubscriptions {
          id
        }
      }
    }
  `);
  const { data } = await response.json();
  const activeSubscriptions = data?.currentAppInstallation?.activeSubscriptions || [];

  if (plan === "Free") {
    // Cancel all active subscriptions
    for (const sub of activeSubscriptions) {
      await admin.graphql(`
        mutation CancelSubscription($id: ID!) {
          appSubscriptionCancel(id: $id, prorate: true) {
            userErrors {
              field
              message
            }
          }
        }
      `, {
        variables: { id: sub.id }
      });
    }
    return redirect("/app/billing");
  }

  // Define pricing
  let amount = 0;
  if (plan === MONTHLY_PLAN_STARTER) amount = 39.00;
  else if (plan === MONTHLY_PLAN_GROWTH) amount = 59.00;
  else if (plan === MONTHLY_PLAN_PREMIUM) amount = 99.00;

  if (amount === 0) return redirect("/app/billing");

  const returnUrl = `https://${session.shop}/admin/apps/${process.env.SHOPIFY_API_KEY}/app/billing`;

  const createResponse = await admin.graphql(`
    mutation CreateSubscription($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!, $test: Boolean) {
      appSubscriptionCreate(name: $name, lineItems: $lineItems, returnUrl: $returnUrl, test: $test) {
        appSubscription {
          id
        }
        confirmationUrl
        userErrors {
          field
          message
        }
      }
    }
  `, {
    variables: {
      name: plan,
      returnUrl: returnUrl,
      test: true,
      lineItems: [
        {
          plan: {
            appRecurringPricingDetails: {
              price: {
                amount: amount,
                currencyCode: "USD"
              },
              interval: "EVERY_30_DAYS"
            }
          }
        }
      ]
    }
  });

  const createData = await createResponse.json();
  const confirmationUrl = createData.data?.appSubscriptionCreate?.confirmationUrl;
  const userErrors = createData.data?.appSubscriptionCreate?.userErrors;

  if (userErrors && userErrors.length > 0) {
    console.error("Subscription create errors:", userErrors);
    return null;
  }

  if (confirmationUrl) {
    console.log("[Billing Flow] returnUrl used in mutation:", returnUrl);
    console.log("[Billing Flow] confirmationUrl received:", confirmationUrl);
    console.log("[Billing Flow] Redirect method being executed: Client-side top-level navigation via useActionData and window.open");
    
    // Return the confirmationUrl to the client instead of doing a server-side redirect, 
    // which causes the browser to try and follow a 302 inside the iframe fetch request.
    return { confirmationUrl };
  }

  return redirect("/app/billing");
};

export default function BillingPage() {
  const { currentPlan, success } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isLoading = navigation.state === "submitting";
  const shopify = useAppBridge();

  useEffect(() => {
    if (success) {
      shopify.toast.show("Subscription activated successfully!");
    }
  }, [success, shopify]);

  useEffect(() => {
    if (actionData?.confirmationUrl) {
      console.log("[Billing Flow] Client executing window.open to confirmationUrl:", actionData.confirmationUrl);
      window.open(actionData.confirmationUrl, "_top");
    }
  }, [actionData]);

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
