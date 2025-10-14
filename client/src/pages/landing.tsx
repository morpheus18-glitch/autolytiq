import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Cpu,
  Globe,
  Layers3,
  LineChart,
  Radar,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/login";
  };

  return (
    <div className="landing-surface min-h-screen text-foreground">
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pb-12 pt-8 sm:px-8 lg:px-10 lg:pb-20">
        <div className="absolute inset-x-12 top-20 h-[480px] rounded-full blur-3xl hero-spotlight" aria-hidden="true" />
        <div className="absolute inset-0 grid-overlay opacity-60 dark:opacity-30" aria-hidden="true" />

        <header className="relative z-10 mb-12 flex items-center justify-between gap-4 sm:mb-16">
          <div className="flex items-center gap-3">
            <img src="/aiq-logo.png" alt="AutolytiQ" className="h-10 w-10" />
            <div className="flex flex-col">
              <span className="text-lg font-semibold leading-tight">AutolytiQ</span>
              <span className="text-xs uppercase tracking-[0.28em] text-muted-foreground/80">Sales · Analytics · AI</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Button
              onClick={handleLogin}
              className="brand-gradient rounded-xl px-4 py-2 text-sm font-semibold shadow-brand"
              data-testid="button-login-header"
            >
              Log In
            </Button>
          </div>
        </header>

        <main className="relative z-10 flex flex-1 flex-col gap-16">
          <section className="flex flex-col items-start gap-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-8">
              <Badge className="badge-glow rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-primary">
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em]">
                  <Sparkles className="h-3 w-3" />
                  AutolytiQ Intelligence Cloud
                </span>
              </Badge>
              <div className="space-y-5">
                <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  A branded command center for <span className="text-brand-gradient">high-velocity automotive sales</span>
                </h1>
                <p className="max-w-xl text-lg text-muted-foreground sm:text-xl">
                  Orchestrate your dealership with a single AI-powered fabric that unifies inventory, pricing, customer journeys,
                  and profitability analytics into one immaculate experience.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button
                  onClick={handleLogin}
                  size="lg"
                  className="brand-gradient rounded-xl px-8 py-5 text-base font-semibold shadow-brand"
                  data-testid="button-get-started"
                >
                  Launch the platform
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleLogin}
                  className="rounded-xl border-primary/40 bg-white/40 px-8 py-5 text-base font-semibold text-primary hover:border-primary/60 hover:text-primary dark:bg-white/10"
                >
                  Book a live demo
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[{
                  label: "Faster deal velocity",
                  value: "48%",
                  description: "Average reduction in pencil-to-close time"
                }, {
                  label: "Analytics adoption",
                  value: "92%",
                  description: "Teams executing data-backed pricing decisions"
                }, {
                  label: "AI-guided margin",
                  value: "+$487",
                  description: "Gross per vehicle gained with AutolytiQ"
                }].map((stat) => (
                  <div key={stat.label} className="glass-card stat-card rounded-2xl px-5 py-6 shadow-card-xl">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
                      {stat.label}
                    </span>
                    <div className="mt-3 text-3xl font-semibold text-foreground">{stat.value}</div>
                    <p className="mt-2 text-sm text-muted-foreground">{stat.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative w-full max-w-xl">
              <div className="blurred-border glass-card shadow-card-xl">
                <div className="relative rounded-[28px] bg-white/80 p-6 dark:bg-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground/70">
                        Real-time insights
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold">Revenue intelligence pulse</h3>
                    </div>
                    <Badge className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      Live sync
                    </Badge>
                  </div>
                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[{
                      icon: LineChart,
                      title: "Predictive sales",
                      metric: "+18%",
                      tone: "text-primary"
                    }, {
                      icon: Users,
                      title: "Customer lift",
                      metric: "7.4x",
                      tone: "text-accent"
                    }, {
                      icon: BarChart3,
                      title: "Inventory turnover",
                      metric: "21 days",
                      tone: "text-secondary"
                    }, {
                      icon: ShieldCheck,
                      title: "Compliance status",
                      metric: "Audit clean",
                      tone: "text-foreground"
                    }].map(({ icon: Icon, title, metric, tone }) => (
                      <div key={title} className="rounded-2xl border border-border/70 bg-white/70 p-4 dark:bg-white/5">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Icon className="h-5 w-5" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-muted-foreground/80">{title}</p>
                            <p className={cn("text-lg font-semibold", tone)}>{metric}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 text-sm text-primary">
                    AutolytiQ continuously harmonizes ML pricing, deal desk approvals, desking, and OEM incentives in a single
                    workflow.
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="relative flex flex-col gap-10">
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground/80">
              <span>Trusted by digitally-native dealer groups</span>
              <div className="flex flex-wrap items-center gap-3 text-muted-foreground/60">
                <span>OmniAuto</span>
                <span>Vantage Mobility</span>
                <span>Quantum Motors</span>
                <span>PrimeEV</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {[{
                icon: Brain,
                title: "Predictive deal desk",
                description: "AI-guided pencils surface the most profitable payment structures in seconds."
              }, {
                icon: Cpu,
                title: "Analytics fabric",
                description: "A unified semantic layer blending DMS, CRM, OEM, and market data for rapid insights."
              }, {
                icon: Layers3,
                title: "Operations automation",
                description: "Workflow engines orchestrate approvals, contracting, and compliance automatically."
              }, {
                icon: Radar,
                title: "Inventory intelligence",
                description: "Live market scans price every VIN against regional demand and supply pressures."
              }].map(({ icon: Icon, title, description }) => (
                <div key={title} className="glass-card rounded-2xl p-6">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div className="glass-card rounded-3xl p-8">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                  <Globe className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground/70">Global sales fabric</p>
                  <h3 className="mt-2 text-2xl font-semibold text-foreground">One connected revenue command center</h3>
                </div>
              </div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {["Sales velocity forecasting", "Machine-generated desking playbooks", "Customer DNA stitched across channels", "Pricing intelligence with OEM incentive fusion"].map((item) => (
                  <div key={item} className="rounded-2xl border border-border/70 bg-white/70 p-4 text-sm font-medium text-foreground dark:bg-white/5">
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-transparent bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 p-6">
                <p className="text-sm text-muted-foreground">
                  AutolytiQ harmonizes data and workflows for showroom, digital retail, F&I, and service to deliver premium
                  customer experiences while protecting margins.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-8">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <LineChart className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground/70">AI Outcomes</p>
                  <h3 className="mt-2 text-xl font-semibold">Measured impact, quarter over quarter</h3>
                </div>
              </div>
              <div className="mt-6 space-y-5">
                {[{
                  title: "Lead conversion uplift",
                  description: "AI prioritization sequences the right shopper moments across channels.",
                  metric: "+33%"
                }, {
                  title: "Gross profit per rooftop",
                  description: "Margin guardrails adapt with market signals and OEM incentive changes.",
                  metric: "+$187K"
                }, {
                  title: "F&I attachment rate",
                  description: "Contextual recommendations increase product adoption at the point of sale.",
                  metric: "+22%"
                }].map(({ title, description, metric }) => (
                  <div key={title} className="rounded-2xl border border-border/70 bg-white/70 p-4 dark:bg-white/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-semibold text-foreground">{title}</h4>
                        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                      </div>
                      <span className="text-lg font-semibold text-brand-gradient">{metric}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="glass-card rounded-3xl px-8 py-10 text-center shadow-card-xl">
            <div className="mx-auto max-w-2xl space-y-6">
              <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                Deliver the premium automotive journey your buyers expect
              </h2>
              <p className="text-lg text-muted-foreground">
                AutolytiQ is the branded digital showroom and deal desk trusted by the industry’s most progressive dealer groups.
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  onClick={handleLogin}
                  size="lg"
                  className="brand-gradient rounded-xl px-8 py-5 text-base font-semibold shadow-brand"
                  data-testid="button-login-cta"
                >
                  Enter the AutolytiQ experience
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handleLogin}
                  className="rounded-xl px-8 py-5 text-base font-semibold text-primary hover:bg-primary/10"
                >
                  Explore solutions deck
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
