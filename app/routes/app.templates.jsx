import { useLoaderData, useNavigate } from "react-router";
import { Page, Card, Text, Button, Badge, BlockStack, InlineStack, Modal, Grid } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useState } from "react";
import { templates } from "../models/templates";
import { CountdownPreview } from "../components/CountdownPreview";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { session, billing } = await authenticate.admin(request);

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
    console.error("[Templates Loader] billing.check() failed, falling back to DB:", err.message);
    try {
      const shop = session.shop;
      const shopRecord = await prisma.shop.findUnique({ where: { shop } });
      if (shopRecord?.plan) currentPlan = shopRecord.plan;
    } catch (dbErr) {
      console.error("[Templates Loader] DB fallback failed:", dbErr.message);
    }
  }

  return { currentPlan };
};

export default function TemplatesPage() {
  const { currentPlan } = useLoaderData();
  const navigate = useNavigate();
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const planTiers = {
    "Free": 1,
    "Starter Plan": 2,
    "Growth Plan": 3,
    "Premium Plan": 4
  };

  const currentTierScore = planTiers[currentPlan] || 1;

  const isTemplateUnlocked = (tier) => {
    const templateTiers = {
      "Free": 1,
      "Starter": 2,
      "Growth": 3,
      "Premium": 4
    };
    return currentTierScore >= templateTiers[tier];
  };

  return (
    <Page title="Template Gallery" subtitle="Choose a premium countdown design to increase your sales.">
      <BlockStack gap="500">
        <Grid>
          {templates.map(template => {
            const unlocked = isTemplateUnlocked(template.tier);
            return (
              <Grid.Cell key={template.id} columnSpan={{xs: 6, sm: 6, md: 4, lg: 6, xl: 6}}>
                <Card padding="400">
                  <BlockStack gap="400">
                    <InlineStack align="space-between" blockAlign="center">
                      <Text variant="headingMd" as="h3">{template.name}</Text>
                      {unlocked ? (
                        <Badge tone="success">Unlocked</Badge>
                      ) : (
                        <Badge tone="critical">Requires {template.tier}</Badge>
                      )}
                    </InlineStack>
                    
                    <div style={{ padding: '20px 0', minHeight: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '100%' }}>
                        <CountdownPreview template={template} />
                      </div>
                    </div>

                    <InlineStack align="end" gap="200">
                      <Button onClick={() => setPreviewTemplate(template)}>Live Preview</Button>
                      {unlocked ? (
                        <Button variant="primary" onClick={() => navigate(`/app/countdown/new?templateId=${template.id}`)}>
                          Use Template
                        </Button>
                      ) : (
                        <Button variant="primary" tone="success" onClick={() => navigate("/app/billing")}>
                          Upgrade to Unlock
                        </Button>
                      )}
                    </InlineStack>
                  </BlockStack>
                </Card>
              </Grid.Cell>
            );
          })}
        </Grid>
      </BlockStack>

      <Modal
        open={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        title={`Preview: ${previewTemplate?.name}`}
        size="large"
      >
        <Modal.Section>
          {previewTemplate && (
            <BlockStack gap="400">
              <Text as="p">{previewTemplate.description}</Text>
              <div style={{ margin: '20px 0' }}>
                <CountdownPreview template={previewTemplate} />
              </div>
            </BlockStack>
          )}
        </Modal.Section>
      </Modal>
    </Page>
  );
}
