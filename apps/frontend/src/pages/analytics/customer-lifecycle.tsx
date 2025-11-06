import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Badge, Tabs, TabsContent, TabsList, TabsTrigger, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Select, Progress, StatCard } from "@repo/ui";
import { Search, Filter, Download, Eye, TrendingUp, Globe, Clock, Target, Users, Activity } from "lucide-react";

const customerJourneyData = [
  {
    id: "CJ-001",
    customerId: "C-12345",
    name: "Jennifer Martinez",
    email: "jennifer.m@email.com",
    startDate: "2024-01-15",
    currentStage: "research",
    purchaseIntent: 85,
    totalSessions: 47,
    totalPageViews: 342,
    timeSpent: "18h 32m",
    websites: [
      { site: "AutoTrader", visits: 12, timeSpent: "4h 15m" },
      { site: "Cars.com", visits: 8, timeSpent: "2h 45m" },
      { site: "CarGurus", visits: 15, timeSpent: "5h 22m" },
      { site: "Dealer Website", visits: 12, timeSpent: "6h 10m" }
    ],
    searchTerms: ["honda civic 2024", "best compact cars", "honda financing", "civic safety rating"],
    behavior: {
      viewedVehicles: 23,
      savedVehicles: 5,
      requestedInfo: 3,
      calculatorUse: 8,
      financingViews: 12
    },
    lifecycle: [
      { stage: "awareness", date: "2024-01-15", duration: "3 days" },
      { stage: "interest", date: "2024-01-18", duration: "7 days" },
      { stage: "consideration", date: "2024-01-25", duration: "5 days" },
      { stage: "research", date: "2024-01-30", duration: "ongoing" }
    ],
    signals: [
      { type: "high_intent", signal: "Visited financing page 12 times", strength: 95 },
      { type: "comparison", signal: "Compared 3 vehicles extensively", strength: 88 },
      { type: "local_search", signal: "Searched for local inventory 8 times", strength: 92 },
      { type: "price_check", signal: "Used payment calculator 8 times", strength: 85 }
    ]
  },
  {
    id: "CJ-002",
    customerId: "C-12346",
    name: "Michael Chen",
    email: "m.chen@email.com",
    startDate: "2024-01-10",
    currentStage: "decision",
    purchaseIntent: 96,
    totalSessions: 63,
    totalPageViews: 487,
    timeSpent: "28h 45m",
    websites: [
      { site: "AutoTrader", visits: 18, timeSpent: "6h 30m" },
      { site: "Cars.com", visits: 12, timeSpent: "4h 15m" },
      { site: "CarGurus", visits: 22, timeSpent: "8h 20m" },
      { site: "Dealer Website", visits: 11, timeSpent: "9h 40m" }
    ],
    searchTerms: ["toyota camry vs honda accord", "best financing deals", "toyota dealer near me", "camry incentives"],
    behavior: {
      viewedVehicles: 31,
      savedVehicles: 8,
      requestedInfo: 6,
      calculatorUse: 15,
      financingViews: 22
    },
    lifecycle: [
      { stage: "awareness", date: "2024-01-10", duration: "2 days" },
      { stage: "interest", date: "2024-01-12", duration: "6 days" },
      { stage: "consideration", date: "2024-01-18", duration: "8 days" },
      { stage: "research", date: "2024-01-26", duration: "6 days" },
      { stage: "decision", date: "2024-02-01", duration: "ongoing" }
    ],
    signals: [
      { type: "ready_to_buy", signal: "Scheduled test drive appointment", strength: 98 },
      { type: "financing_ready", signal: "Applied for pre-approval", strength: 95 },
      { type: "dealer_contact", signal: "Called dealership 3 times", strength: 92 },
      { type: "urgency", signal: "Visited inventory daily for 5 days", strength: 89 }
    ]
  }
];

const aggregatedInsights = {
  totalTrackedCustomers: 1247,
  averageJourneyLength: "18.5 days",
  conversionRate: 12.8,
  topDropoffStage: "consideration",
  averageSessionsBeforePurchase: 42,
  topPurchaseSignals: [
    { signal: "Multiple financing page visits", accuracy: 94 },
    { signal: "Payment calculator usage", accuracy: 91 },
    { signal: "Local inventory searches", accuracy: 89 },
    { signal: "Comparison shopping behavior", accuracy: 87 }
  ]
};

export default function CustomerLifecycleTracking() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStage, setSelectedStage] = useState("all");
  const [selectedIntent, setSelectedIntent] = useState("all");

  const filteredCustomers = customerJourneyData.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = selectedStage === "all" || customer.currentStage === selectedStage;
    const matchesIntent = selectedIntent === "all" || 
                         (selectedIntent === "high" && customer.purchaseIntent >= 80) ||
                         (selectedIntent === "medium" && customer.purchaseIntent >= 50 && customer.purchaseIntent < 80) ||
                         (selectedIntent === "low" && customer.purchaseIntent < 50);
    
    return matchesSearch && matchesStage && matchesIntent;
  });

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'awareness':
        return "bg-gray-100 text-gray-800";
      case 'interest':
        return "bg-blue-100 text-blue-800";
      case 'consideration':
        return "bg-yellow-100 text-yellow-800";
      case 'research':
        return "bg-orange-100 text-orange-800";
      case 'decision':
        return "bg-green-100 text-green-800";
      case 'purchase':
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getIntentColor = (intent: number) => {
    if (intent >= 80) return "text-green-600";
    if (intent >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getSignalStrengthColor = (strength: number) => {
    if (strength >= 90) return "bg-green-500";
    if (strength >= 80) return "bg-yellow-500";
    return "bg-orange-500";
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Customer Lifecycle Tracking</h1>
          <p style={{ marginTop: '0.25rem' }}>Track every online shopper's journey from awareness to purchase</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline">
            <Download style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            <span>Export Journey Data</span>
          </Button>
          <Button>
            <Target style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            <span>Setup Tracking</span>
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        <StatCard
          label="Tracked Customers"
          value={aggregatedInsights.totalTrackedCustomers.toLocaleString()}
          change="+23% this month"
          icon={<Users />}
        />

        <StatCard
          label="Avg Journey Length"
          value={aggregatedInsights.averageJourneyLength}
          change="From first visit to purchase"
          icon={<Clock />}
          iconBg="bg-accent-primary/10"
          iconColor="text-accent-primary"
        />

        <StatCard
          label="Conversion Rate"
          value={`${aggregatedInsights.conversionRate}%`}
          change="+2.3% vs last month"
          icon={<Target />}
          iconBg="bg-accent-success/10"
          iconColor="text-accent-success"
        />

        <StatCard
          label="Avg Sessions"
          value={aggregatedInsights.averageSessionsBeforePurchase}
          change="Before purchase"
          icon={<Activity />}
          iconBg="bg-accent-warning/10"
          iconColor="text-accent-warning"
        />
      </div>

      <Tabs defaultValue="journeys">
        <TabsList>
          <TabsTrigger value="journeys">Customer Journeys</TabsTrigger>
          <TabsTrigger value="insights">Behavioral Insights</TabsTrigger>
          <TabsTrigger value="signals">Purchase Signals</TabsTrigger>
        </TabsList>

        <TabsContent value="journeys">
          <Card>
            <CardContent style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '0.75rem', top: '0.75rem', width: '1rem', height: '1rem' }} />
                    <Input
                      placeholder="Search by customer name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                </div>
                <Select value={selectedStage} onValueChange={setSelectedStage}>
                  <option value="all">All Stages</option>
                  <option value="awareness">Awareness</option>
                  <option value="interest">Interest</option>
                  <option value="consideration">Consideration</option>
                  <option value="research">Research</option>
                  <option value="decision">Decision</option>
                  <option value="purchase">Purchase</option>
                </Select>
                <Select value={selectedIntent} onValueChange={setSelectedIntent}>
                  <option value="all">All Intent Levels</option>
                  <option value="high">High (80%+)</option>
                  <option value="medium">Medium (50-79%)</option>
                  <option value="low">Low (&lt;50%)</option>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {filteredCustomers.map((customer) => (
              <Card key={customer.id}>
                <CardContent style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{customer.name}</h3>
                        <Badge variant="default">
                          {customer.currentStage}
                        </Badge>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Target style={{ width: '1rem', height: '1rem' }} />
                          <span style={{ fontWeight: 600 }}>
                            {customer.purchaseIntent}% Intent
                          </span>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{customer.email}</p>
                      <p style={{ fontSize: '0.75rem' }}>Journey started: {customer.startDate}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.875rem' }}>Total Activity</p>
                      <p style={{ fontWeight: 600 }}>{customer.totalSessions} sessions</p>
                      <p style={{ fontSize: '0.875rem' }}>{customer.totalPageViews} page views</p>
                      <p style={{ fontSize: '0.875rem' }}>{customer.timeSpent} spent</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                    <div>
                      <h4 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Journey Timeline</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {customer.lifecycle.map((stage, index) => (
                          <div key={stage.stage} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: '0.75rem',
                              height: '0.75rem',
                              borderRadius: '9999px',
                              backgroundColor: index === customer.lifecycle.length - 1 ? 'var(--accent-primary)' : 'var(--border)'
                            }}></div>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: '0.875rem', fontWeight: 500, textTransform: 'capitalize' }}>{stage.stage}</p>
                              <p style={{ fontSize: '0.75rem' }}>{stage.date} • {stage.duration}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Website Activity</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {customer.websites.map((site) => (
                          <div key={site.site} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', borderRadius: '0.375rem' }}>
                            <div>
                              <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{site.site}</p>
                              <p style={{ fontSize: '0.75rem' }}>{site.visits} visits • {site.timeSpent}</p>
                            </div>
                            <Globe style={{ width: '1rem', height: '1rem' }} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Purchase Signals</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {customer.signals.slice(0, 3).map((signal, index) => (
                          <div key={index} style={{ padding: '0.5rem', borderRadius: '0.375rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                              <p style={{ fontSize: '0.75rem', fontWeight: 500 }}>{signal.type.replace('_', ' ')}</p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <div style={{
                                  width: '0.5rem',
                                  height: '0.5rem',
                                  borderRadius: '9999px',
                                  backgroundColor: signal.strength >= 90 ? 'var(--accent-success)' : signal.strength >= 80 ? 'var(--accent-warning)' : 'var(--accent-danger)'
                                }}></div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{signal.strength}%</span>
                              </div>
                            </div>
                            <p style={{ fontSize: '0.75rem' }}>{signal.signal}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem' }}>
                      <span>Viewed: {customer.behavior.viewedVehicles} vehicles</span>
                      <span>Saved: {customer.behavior.savedVehicles}</span>
                      <span>Info Requests: {customer.behavior.requestedInfo}</span>
                      <span>Calculator Use: {customer.behavior.calculatorUse}</span>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye style={{ width: '0.75rem', height: '0.75rem', marginRight: '0.25rem' }} />
                      <span>View Full Journey</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginTop: '1rem' }}>
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel Analysis</CardTitle>
                <CardDescription>Drop-off rates at each journey stage</CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Awareness</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>100%</span>
                    </div>
                    <Progress value={100} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Interest</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>67%</span>
                    </div>
                    <Progress value={67} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Consideration</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>43%</span>
                    </div>
                    <Progress value={43} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Research</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>28%</span>
                    </div>
                    <Progress value={28} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Decision</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>18%</span>
                    </div>
                    <Progress value={18} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Purchase</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>12.8%</span>
                    </div>
                    <Progress value={12.8} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Purchase Predictors</CardTitle>
                <CardDescription>Behavioral signals with highest accuracy</CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {aggregatedInsights.topPurchaseSignals.map((signal, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '0.5rem' }}>
                      <div>
                        <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{signal.signal}</p>
                        <p style={{ fontSize: '0.75rem' }}>Prediction accuracy</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{signal.accuracy}%</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <div style={{
                            width: '0.5rem',
                            height: '0.5rem',
                            borderRadius: '9999px',
                            backgroundColor: signal.accuracy >= 90 ? 'var(--accent-success)' : 'var(--accent-warning)'
                          }}></div>
                          <span style={{ fontSize: '0.75rem' }}>High accuracy</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="signals">
          <Card style={{ marginTop: '1rem' }}>
            <CardHeader>
              <CardTitle>Real-Time Purchase Signal Monitoring</CardTitle>
              <CardDescription>
                Live tracking of high-intent behaviors across all customer journeys
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div style={{ textAlign: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>47</p>
                    <p style={{ fontSize: '0.875rem' }}>Critical Intent</p>
                    <p style={{ fontSize: '0.75rem' }}>95%+ probability</p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>123</p>
                    <p style={{ fontSize: '0.875rem' }}>High Intent</p>
                    <p style={{ fontSize: '0.75rem' }}>80-94% probability</p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>298</p>
                    <p style={{ fontSize: '0.875rem' }}>Medium Intent</p>
                    <p style={{ fontSize: '0.75rem' }}>60-79% probability</p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>779</p>
                    <p style={{ fontSize: '0.875rem' }}>Early Stage</p>
                    <p style={{ fontSize: '0.75rem' }}>&lt;60% probability</p>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>Recent High-Intent Activities</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                      <div>
                        <p style={{ fontWeight: 500 }}>Jennifer Martinez completed credit application</p>
                        <p style={{ fontSize: '0.875rem' }}>2 minutes ago • 98% purchase probability</p>
                      </div>
                      <Button size="sm" variant="outline">Contact Now</Button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                      <div>
                        <p style={{ fontWeight: 500 }}>Michael Chen scheduled test drive for tomorrow</p>
                        <p style={{ fontSize: '0.875rem' }}>15 minutes ago • 94% purchase probability</p>
                      </div>
                      <Button size="sm" variant="outline">Prepare Vehicle</Button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                      <div>
                        <p style={{ fontWeight: 500 }}>Sarah Johnson used payment calculator 12 times today</p>
                        <p style={{ fontSize: '0.875rem' }}>1 hour ago • 87% purchase probability</p>
                      </div>
                      <Button size="sm" variant="outline">Send Offer</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}