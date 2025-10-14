import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Users,
  ShieldCheck,
  Smartphone,
  LineChart,
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/login";
  };

  const heroMetrics = [
    { label: "Sales cycle", value: "-22%", caption: "Faster time-to-close" },
    { label: "AI deal accuracy", value: "98%", caption: "Pricing confidence" },
    { label: "Mobile usage", value: "74%", caption: "Workflows on phone" }
  ];

  const featureHighlights = [
    {
      icon: TrendingUp,
      title: "Predictive revenue intelligence",
      description: "Forecast opportunities with machine learning tuned to local market demand, incentives, and margin targets."
    },
    {
      icon: Users,
      title: "Customer journey CRM",
      description: "Coordinate every shopper touchpoint with real-time alerts, enriched profiles, and guided outreach playbooks."
    },
    {
      icon: ShieldCheck,
      title: "Deal desk with guardrails",
      description: "Deploy finance-ready offers, instant verifications, and compliance checklists that keep every team in sync."
    }
  ];

  return (
    <div className="min-h-screen text-foreground">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-x-[-35%] top-[-20%] h-72 bg-gradient-to-br from-primary/25 to-transparent blur-3xl opacity-50" />
          <div className="absolute inset-x-[-45%] bottom-[-25%] h-96 bg-gradient-to-tl from-secondary/20 via-transparent to-transparent blur-3xl opacity-40 dark:opacity-70" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-20 sm:pt-14 lg:pt-20 space-y-16">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-primary">
              <Sparkles className="h-3 w-3" />
              AutolytiQ
            </div>
            <Button
              onClick={handleLogin}
              variant="ghost"
              className="self-start sm:self-auto rounded-full border border-border/70 bg-white/80 px-4 py-2 text-sm font-medium shadow-sm hover:bg-primary/10"
              data-testid="button-login-header"
            >
              Log in
            </Button>
          </header>

          {/* Hero */}
          <section className="space-y-8 text-center sm:text-left">
            <div className="space-y-4">
              <p className="inline-flex items-center gap-2 mx-auto sm:mx-0 rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
                <Smartphone className="h-3.5 w-3.5" />
                Built for mobile-first teams
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight tracking-tight">
                Close more deals with an AutolytiQ workspace that travels from showroom to curbside.
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto sm:mx-0">
                Manage analytics, pricing, and customer engagement from a single responsive hub. AutolytiQ layers AI coaching and on-device workflows so every advisor stays on message, on brand, and on quota.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 justify-center sm:justify-start">
              <Button
                onClick={handleLogin}
                size="lg"
                className="w-full sm:w-auto rounded-full bg-primary px-6 py-3 text-base font-semibold shadow-[0_20px_40px_-24px_rgba(59,130,246,0.75)] hover:bg-primary/90"
                data-testid="button-get-started"
              >
                Launch platform
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="w-full sm:w-auto rounded-full border border-border/70 px-6 py-3 text-base font-semibold hover:bg-primary/10"
                onClick={handleLogin}
              >
                Book a walkthrough
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {heroMetrics.map((metric) => (
                <div key={metric.label} className="soft-card rounded-2xl p-4 sm:p-5 text-left">
                  <div className="text-sm uppercase tracking-[0.25em] text-muted-foreground mb-1">{metric.label}</div>
                  <div className="text-2xl font-semibold text-primary">{metric.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{metric.caption}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Feature highlights */}
          <section className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-semibold">Everything your sales, service, and analytics teams need</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featureHighlights.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="soft-card rounded-2xl p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h3 className="text-lg font-semibold leading-tight">{feature.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Mobile experience */}
          <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 lg:gap-10 items-start">
            <div className="soft-card rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
                  <LineChart className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Mobile-first command center</h3>
                  <p className="text-sm text-muted-foreground">Designed for thumb reach, quick filters, and responsive cards.</p>
                </div>
              </div>

              <ul className="space-y-4 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  Adaptive panels collapse into swipeable stacks for instant context switching between leads, deals, and vehicles.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  On-device AI suggests next best actions, finance options, and follow-up prompts as conditions change.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  Offline cache keeps appointments, quotes, and compliance docs available during test drives or service lots.
                </li>
              </ul>

              <p className="fine-print">Data encrypted in transit and at rest. SOC 2 Type II controls validated annually.</p>
            </div>

            <div className="soft-card rounded-3xl p-6 sm:p-8 flex flex-col gap-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Plug into the tools you already trust</h3>
                <p className="text-sm text-muted-foreground">
                  Seamless integrations with DMS, OEM incentive feeds, VoIP, and marketing automation mean AutolytiQ becomes the connective tissue across your dealership tech stack.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                <div className="rounded-xl border border-border/70 px-4 py-3">CDK + Tekion sync</div>
                <div className="rounded-xl border border-border/70 px-4 py-3">OEM incentive API</div>
                <div className="rounded-xl border border-border/70 px-4 py-3">Marketing automation</div>
                <div className="rounded-xl border border-border/70 px-4 py-3">Call center & SMS</div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="soft-card rounded-3xl p-8 sm:p-10 text-center sm:text-left space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-semibold">Ready to modernize every deal conversation?</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Join the automotive teams closing smarter with AutolytiQ. Your first workspace is configured with tailored playbooks and data guardrails in under a week.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <Button
                onClick={handleLogin}
                size="lg"
                className="w-full sm:w-auto rounded-full bg-secondary px-6 py-3 text-base font-semibold text-secondary-foreground hover:bg-secondary/90"
                data-testid="button-login-cta"
              >
                Secure sign in
              </Button>
              <span className="fine-print sm:ml-2">No installation downtime • SOC 2 & GDPR aligned • 24/7 support</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
