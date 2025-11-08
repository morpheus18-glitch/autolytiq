import { Card, CardContent, CardHeader, PageHeader, StatCard } from "@repo/ui";
import { TrendingUp, TrendingDown, DollarSign, Users } from "lucide-react";

export default function Analytics() {
  return (
    <div style={{ flex: 1, overflow: 'hidden' }}>
      <PageHeader
        title="Analytics"
        description="Analyze your dealership performance"
      />

      <main style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <StatCard
            label="Revenue Growth"
            value="12.5%"
            change="+2.1% from last month"
            icon={<TrendingUp />}
            iconBg="bg-accent-success/10"
            iconColor="text-accent-success"
          />

          <StatCard
            label="Conversion Rate"
            value="18.7%"
            change="+1.2% from last month"
            icon={<Users />}
            iconBg="bg-accent-primary/10"
            iconColor="text-accent-primary"
          />

          <StatCard
            label="Average Deal Size"
            value="$32,450"
            change="+5.3% from last month"
            icon={<DollarSign />}
            iconBg="bg-accent-success/10"
            iconColor="text-accent-success"
          />

          <StatCard
            label="Inventory Turnover"
            value="45 days"
            change="-3.2% from last month"
            icon={<TrendingDown />}
            iconBg="bg-accent-danger/10"
            iconColor="text-accent-danger"
          />
        </div>

        <Card>
          <CardHeader>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Performance Analytics</h3>
          </CardHeader>
          <CardContent>
            <div style={{ height: '16rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Charts and analytics will be displayed here
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
