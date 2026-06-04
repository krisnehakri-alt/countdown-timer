import { useLoaderData, useNavigate, useSubmit } from "react-router";
import {
  Page,
  Card,
  ResourceList,
  ResourceItem,
  Text,
  Badge,
  Button,
  InlineStack,
  BlockStack,
  EmptyState
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { getTemplateById } from "../models/templates";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  const countdowns = await prisma.countdown.findMany({
    where: { shopId: session.shop },
    orderBy: { createdAt: 'desc' }
  });

  return { countdowns };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");
  const id = formData.get("id");

  if (action === "delete") {
    await prisma.countdown.delete({
      where: { id, shopId: session.shop }
    });
  } else if (action === "toggle") {
    const active = formData.get("active") === "true";
    await prisma.countdown.update({
      where: { id, shopId: session.shop },
      data: { active: !active }
    });
  } else if (action === "duplicate") {
    const countdown = await prisma.countdown.findUnique({ where: { id, shopId: session.shop } });
    if (countdown) {
      await prisma.countdown.create({
        data: {
          shopId: countdown.shopId,
          title: countdown.title + " (Copy)",
          description: countdown.description,
          templateId: countdown.templateId,
          fontColor: countdown.fontColor,
          textColor: countdown.textColor,
          buttonColor: countdown.buttonColor,
          backgroundColor: countdown.backgroundColor,
          ctaText: countdown.ctaText,
          ctaUrl: countdown.ctaUrl,
          expiryDate: countdown.expiryDate,
          active: false
        }
      });
    }
  }

  return { success: true };
};

export default function CountdownsPage() {
  const { countdowns } = useLoaderData();
  const navigate = useNavigate();
  const submit = useSubmit();

  const toggleActive = (id, active) => {
    submit({ action: "toggle", id, active: active.toString() }, { method: "post" });
  };

  const deleteCountdown = (id) => {
    if (confirm("Are you sure you want to delete this countdown?")) {
      submit({ action: "delete", id }, { method: "post" });
    }
  };

  const duplicateCountdown = (id) => {
    submit({ action: "duplicate", id }, { method: "post" });
  };

  return (
    <Page
      title="My Countdowns"
      primaryAction={{
        content: 'Create Countdown',
        onAction: () => navigate('/app/templates'),
      }}
    >
      <Card padding="0">
        {countdowns.length === 0 ? (
          <EmptyState
            heading="Manage your countdowns"
            action={{content: 'Create Countdown', onAction: () => navigate('/app/templates')}}
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>You haven't created any countdowns yet.</p>
          </EmptyState>
        ) : (
          <ResourceList
            resourceName={{ singular: 'countdown', plural: 'countdowns' }}
            items={countdowns}
            renderItem={(item) => {
              const { id, title, templateId, active, expiryDate } = item;
              const template = getTemplateById(templateId);

              return (
                <ResourceItem
                  id={id}
                  onClick={() => navigate(`/app/countdown/${id}`)}
                >
                  <InlineStack align="space-between" blockAlign="center">
                    <BlockStack gap="100">
                      <Text variant="bodyMd" fontWeight="bold" as="h3">
                        {title}
                      </Text>
                      <Text variant="bodySm" tone="subdued">
                        Template: {template.name}
                      </Text>
                      <Text variant="bodySm" tone="subdued">
                        Expires: {new Date(expiryDate).toLocaleString()}
                      </Text>
                    </BlockStack>
                    
                    <InlineStack gap="300" blockAlign="center">
                      <Badge tone={active ? "success" : "info"}>
                        {active ? "Active" : "Draft"}
                      </Badge>
                      
                      <Button onClick={(e) => { e.stopPropagation(); toggleActive(id, active); }}>
                        {active ? "Disable" : "Enable"}
                      </Button>
                      <Button onClick={(e) => { e.stopPropagation(); duplicateCountdown(id); }}>
                        Duplicate
                      </Button>
                      <Button tone="critical" onClick={(e) => { e.stopPropagation(); deleteCountdown(id); }}>
                        Delete
                      </Button>
                    </InlineStack>
                  </InlineStack>
                </ResourceItem>
              );
            }}
          />
        )}
      </Card>
    </Page>
  );
}
