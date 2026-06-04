import { useLoaderData } from "react-router";
import { Page, Card, Text, BlockStack, IndexTable, Badge } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const countdowns = await prisma.countdown.findMany({
    where: { shopId: shop },
    include: {
      analytics: true
    }
  });

  const tableData = countdowns.map(c => {
    let views = 0;
    let clicks = 0;
    c.analytics.forEach(a => {
      if (a.eventType === "VIEW") views++;
      if (a.eventType === "CLICK") clicks++;
    });
    
    return {
      id: c.id,
      title: c.title,
      status: c.active,
      views,
      clicks,
      ctr: views > 0 ? ((clicks / views) * 100).toFixed(2) + "%" : "0%"
    };
  });

  return { tableData };
};

export default function AnalyticsPage() {
  const { tableData } = useLoaderData();

  const resourceName = { singular: 'countdown', plural: 'countdowns' };

  return (
    <Page title="Analytics">
      <BlockStack gap="500">
        <Text as="p" tone="subdued">Track impressions, clicks, and conversions across all your active countdown campaigns.</Text>
        <Card padding="0">
          <IndexTable
            resourceName={resourceName}
            itemCount={tableData.length}
            headings={[
              { title: 'Countdown' },
              { title: 'Status' },
              { title: 'Views' },
              { title: 'Clicks' },
              { title: 'Conversion Rate (CTR)' },
            ]}
            selectable={false}
          >
            {tableData.map(({ id, title, status, views, clicks, ctr }, index) => (
              <IndexTable.Row id={id} key={id} position={index}>
                <IndexTable.Cell>
                  <Text variant="bodyMd" fontWeight="bold" as="span">{title}</Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Badge tone={status ? "success" : "info"}>{status ? "Active" : "Draft"}</Badge>
                </IndexTable.Cell>
                <IndexTable.Cell>{views}</IndexTable.Cell>
                <IndexTable.Cell>{clicks}</IndexTable.Cell>
                <IndexTable.Cell>
                  <Text as="span" fontWeight="bold" tone={parseFloat(ctr) > 2 ? "success" : "base"}>{ctr}</Text>
                </IndexTable.Cell>
              </IndexTable.Row>
            ))}
          </IndexTable>
        </Card>
      </BlockStack>
    </Page>
  );
}
