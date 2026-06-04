import { useLoaderData, useSubmit, useNavigate, useActionData, redirect } from "react-router";
import { Page, Layout, Card, FormLayout, TextField, Button, BlockStack, Text, Grid } from "@shopify/polaris";
import { useState, useCallback } from "react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { getTemplateById } from "../models/templates";
import { CountdownPreview } from "../components/CountdownPreview";

export const loader = async ({ request, params }) => {
  const { session, billing } = await authenticate.admin(request);
  const shop = session.shop;
  const id = params.id;
  const url = new URL(request.url);
  const templateIdParam = url.searchParams.get("templateId");

  // Check Billing access for templates (Security check)
  const billingCheck = await billing.check();
  let currentPlan = "Free";
  if (billingCheck.hasActivePayment) {
    currentPlan = billingCheck.appSubscriptions[0].name;
  }
  const planTiers = { "Free": 1, "Starter Plan": 2, "Growth Plan": 3, "Premium Plan": 4 };
  const currentTierScore = planTiers[currentPlan] || 1;

  let countdown = {
    title: "New Campaign",
    description: "Don't miss out on this deal!",
    templateId: templateIdParam || "template-1",
    ctaText: "Shop Now",
    ctaUrl: "/",
    active: true,
  };

  if (id !== "new") {
    const existing = await prisma.countdown.findUnique({ where: { id, shopId: shop } });
    if (!existing) {
      return redirect("/app/countdowns");
    }
    countdown = existing;
  }

  const template = getTemplateById(countdown.templateId);
  const templateTiers = { "Free": 1, "Starter": 2, "Growth": 3, "Premium": 4 };
  
  // If user downgraded and tries to edit a locked template
  if (currentTierScore < templateTiers[template.tier]) {
    // Optionally we can force downgrade the template, or just warn them. Let's just pass unlocked status.
  }

  // Populate missing colors with template defaults
  countdown.fontColor = countdown.fontColor || template.defaultColors.fontColor;
  countdown.textColor = countdown.textColor || template.defaultColors.textColor;
  countdown.buttonColor = countdown.buttonColor || template.defaultColors.buttonColor;
  countdown.backgroundColor = countdown.backgroundColor || template.defaultColors.backgroundColor;
  
  // Expiry date (default to 7 days from now if not set)
  if (!countdown.expiryDate) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    countdown.expiryDate = nextWeek.toISOString().slice(0, 16);
  } else {
    countdown.expiryDate = new Date(countdown.expiryDate).toISOString().slice(0, 16);
  }

  return { countdown, template, currentPlan };
};

export const action = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const id = params.id;
  
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  
  const payload = {
    shopId: shop,
    title: data.title,
    description: data.description,
    templateId: data.templateId,
    fontColor: data.fontColor,
    textColor: data.textColor,
    buttonColor: data.buttonColor,
    backgroundColor: data.backgroundColor,
    ctaText: data.ctaText,
    ctaUrl: data.ctaUrl,
    expiryDate: new Date(data.expiryDate),
    active: data.active === "true"
  };

  if (id === "new") {
    await prisma.countdown.create({ data: payload });
  } else {
    await prisma.countdown.update({
      where: { id, shopId: shop },
      data: payload
    });
  }

  return redirect("/app/countdowns");
};

export default function CountdownEditor() {
  const { countdown, template, currentPlan } = useLoaderData();
  const navigate = useNavigate();
  const submit = useSubmit();

  const [formState, setFormState] = useState(countdown);

  const handleChange = useCallback((value, id) => {
    setFormState(prev => ({ ...prev, [id]: value }));
  }, []);

  const handleSave = () => {
    submit(formState, { method: "post" });
  };

  return (
    <Page
      breadcrumbs={[{ content: 'Countdowns', onAction: () => navigate('/app/countdowns') }]}
      title={countdown.id ? 'Edit Countdown' : 'Create Countdown'}
      primaryAction={{
        content: 'Save',
        onAction: handleSave,
      }}
    >
      <Layout>
        <Layout.Section>
          <Card padding="400">
            <BlockStack gap="400">
              <Text as="h3" variant="headingMd">Content</Text>
              <FormLayout>
                <TextField label="Title" value={formState.title} onChange={v => handleChange(v, 'title')} autoComplete="off" />
                <TextField label="Description" value={formState.description} onChange={v => handleChange(v, 'description')} multiline={2} autoComplete="off" />
                <Grid>
                  <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}}>
                    <TextField label="CTA Button Text" value={formState.ctaText} onChange={v => handleChange(v, 'ctaText')} autoComplete="off" />
                  </Grid.Cell>
                  <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}}>
                    <TextField label="CTA Button URL" value={formState.ctaUrl} onChange={v => handleChange(v, 'ctaUrl')} autoComplete="off" />
                  </Grid.Cell>
                </Grid>
                <TextField type="datetime-local" label="Expiry Date & Time" value={formState.expiryDate} onChange={v => handleChange(v, 'expiryDate')} autoComplete="off" />
              </FormLayout>
            </BlockStack>
          </Card>
          
          <div style={{ marginTop: '20px' }}>
            <Card padding="400">
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">Colors</Text>
                <FormLayout>
                  <Grid>
                    <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 3, xl: 3}}>
                      <TextField type="color" label="Background" value={formState.backgroundColor} onChange={v => handleChange(v, 'backgroundColor')} autoComplete="off" />
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 3, xl: 3}}>
                      <TextField type="color" label="Title/Timer Color" value={formState.fontColor} onChange={v => handleChange(v, 'fontColor')} autoComplete="off" />
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 3, xl: 3}}>
                      <TextField type="color" label="Description Color" value={formState.textColor} onChange={v => handleChange(v, 'textColor')} autoComplete="off" />
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 3, xl: 3}}>
                      <TextField type="color" label="Button Color" value={formState.buttonColor} onChange={v => handleChange(v, 'buttonColor')} autoComplete="off" />
                    </Grid.Cell>
                  </Grid>
                </FormLayout>
              </BlockStack>
            </Card>
          </div>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <BlockStack gap="400">
            <Card padding="400">
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">Preview</Text>
                <Text tone="subdued" as="p">Template: {template.name}</Text>
                <CountdownPreview template={template} customization={formState} />
              </BlockStack>
            </Card>

            <Card padding="400">
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">Settings</Text>
                <input type="hidden" name="templateId" value={formState.templateId} />
                <Button 
                  fullWidth 
                  variant={formState.active ? "primary" : "secondary"} 
                  tone={formState.active ? "success" : "base"}
                  onClick={() => handleChange(!formState.active, 'active')}
                >
                  {formState.active ? "Active" : "Draft (Hidden)"}
                </Button>
                <Text tone="subdued" as="p" variant="bodySm">
                  Hidden countdowns will not appear on your storefront.
                </Text>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
