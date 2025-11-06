import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
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
  const [, setLocation] = useLocation();

  const handleLogin = () => {
    setLocation("/login");
  };

  return (
    <div className="landing-surface text-foreground">
      <div className="relative mx-auto flex w-full max-w-6xl flex-col px-4 pb-16 pt-6 sm:px-6 lg:px-10 lg:pb-24">
        <div className="absolute inset-x-10 top-24 h-[420px] rounded-full blur-3xl hero-spotlight" aria-hidden="true" />
        <div className="absolute inset-0 grid-overlay opacity-50 dark:opacity-25" aria-hidden="true" />

        <header className="relative z-10 mb-10 flex flex-col gap-4 sm:mb-14 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img src="/aiq-logo.png" alt="AutolytiQ" className="h-10 w-10" />
            <div className="flex flex-col text-left">
              <span className="text-lg font-semibold leading-tight">AutolytiQ</span>
              <span className="text-xs uppercase tracking-[0.28em] text-muted-foreground/80">
                Sales · Analytics · AI
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Button
              onClick={handleLogin}
              className="btn-embossed rounded-xl px-4 py-2 text-sm"
              data-testid="button-login-header"
            >
              Log In
            </Button>
          </div>
        </header>

        <main className="relative z-10 flex flex-1 flex-col gap-16">
          <section className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-8">
              <Badge variant="info" className="inline-flex w-fit items-center gap-2">
                <Sparkles className="h-3 w-3" />
                <span className="text-xs font-semibold uppercase tracking-[0.24em]">
                  AutolytiQ Intelligence Cloud
                </span>
              </Badge>
              <div className="space-y-5">
                <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  Modern revenue orchestration for <span className="text-brand-gradient">automotive operators</span>
                </h1>
                <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Unite desking, deal desk, analytics, and AI-guided decisioning inside one responsive workspace designed to feel effortless on every device.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  onClick={handleLogin}
                  size="lg"
                  className="btn-embossed rounded-xl px-7 py-4 text-base"
                  data-testid="button-get-started"
                >
                  Launch the platform
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={handleLogin}
                  size="lg"
                  className="btn-embossed rounded-xl px-7 py-4 text-base"
                  data-testid="button-book-demo"
                >
                  Book a live demo
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[{
                  label: "Deal velocity",
                  value: "48%",
                  description: "Faster pencil-to-close time"
                }, {
                  label: "Analytics adoption",
                  value: "92%",
                  description: "Teams using live insights"
                }, {
                  label: "Margin lift",
                  value: "+$487",
                  description: "Gross per vehicle gains"
                }].map((stat) => (
                  <div key={stat.label} className="glass-card stat-card rounded-2xl px-4 py-5 shadow-card-xl">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                      {stat.label}
                    </span>
                    <div className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">{stat.value}</div>
                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{stat.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative w-full max-w-xl">
              <div className="blurred-border glass-card shadow-card-xl">
                <div className="relative rounded-[28px] bg-white/90 p-5 dark:bg-white/5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground/70">
                        Real-time insights
                      </p>
                      <h3 className="mt-1 text-xl font-semibold sm:text-2xl">Revenue intelligence pulse</h3>
                    </div>
                    <Badge variant="info">
                      Live sync
                    </Badge>
                  </div>
                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                      title: "Inventory turn",
                      metric: "21 days",
                      tone: "text-secondary"
                    }, {
                      icon: ShieldCheck,
                      title: "Compliance",
                      metric: "Audit clean",
                      tone: "text-foreground"
                    }].map(({ icon: Icon, title, metric, tone }) => (
                      <div key={title} className="rounded-2xl border border-border/70 bg-white/80 p-4 dark:bg-white/5">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Icon className="h-5 w-5" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-muted-foreground/75">{title}</p>
                            <p className={cn("text-lg font-semibold", tone)}>{metric}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 text-sm text-muted-foreground">
                    AutolytiQ continuously harmonizes ML pricing, deal desk approvals, desking, and OEM incentives in a single workflow.
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="relative flex flex-col gap-8">
            <div className="flex flex-col gap-3 text-center text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground/80 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:text-left">
              <span className="text-muted-foreground">Trusted by digitally-native dealer groups</span>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-muted-foreground/60 sm:justify-start">
                <span className="tracking-[0.18em]">OmniAuto</span>
                <span className="tracking-[0.18em]">Vantage Mobility</span>
                <span className="tracking-[0.18em]">Quantum Motors</span>
                <span className="tracking-[0.18em]">PrimeEV</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                <div key={title} className="glass-card flex min-h-[168px] flex-col justify-between rounded-2xl p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="text-base font-semibold text-foreground">{title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="glass-card rounded-3xl p-6 sm:p-8">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                  <Globe className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground/70">Global sales fabric</p>
                  <h3 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">One connected revenue command center</h3>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {["Sales velocity forecasting", "Machine-generated desking playbooks", "Customer DNA stitched across channels", "Pricing intelligence with OEM incentive fusion"].map((item) => (
                  <div key={item} className="rounded-2xl border border-border/60 bg-white/80 p-4 text-sm font-medium text-foreground dark:bg-white/5">
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-primary/15 bg-primary/5 p-5 text-sm leading-relaxed text-muted-foreground">
                AutolytiQ harmonizes data and workflows for showroom, digital retail, F&I, and service to deliver premium customer experiences while protecting margins.
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6 sm:p-8">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <LineChart className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground/70">AI outcomes</p>
                  <h3 className="mt-2 text-xl font-semibold text-foreground">Measured impact, quarter over quarter</h3>
                </div>
              </div>
              <div className="mt-6 space-y-4">
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
                  <div key={title} className="rounded-2xl border border-border/60 bg-white/80 p-4 dark:bg-white/5 sm:p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-base font-semibold text-foreground">{title}</h4>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
                      </div>
                      <span className="text-lg font-semibold text-primary">{metric}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="glass-card rounded-3xl px-6 py-8 text-center shadow-card-xl sm:px-8 sm:py-10">
            <div className="mx-auto max-w-2xl space-y-6">
              <h2 className="text-balance text-3xl font-semibold text-foreground sm:text-4xl">
                Deliver the premium automotive journey your buyers expect
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                AutolytiQ is the branded digital showroom and deal desk trusted by the industry’s most progressive dealer groups.
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  onClick={handleLogin}
                  size="lg"
                  className="brand-gradient rounded-xl px-6 py-4 text-base font-semibold shadow-brand sm:px-8"
                  data-testid="button-login-cta"
                >
                  Enter the AutolytiQ experience
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleLogin}
                  className="rounded-xl border-border/70 px-6 py-4 text-base font-semibold text-foreground hover:border-primary/35 hover:text-primary sm:px-8"
                >
                  Explore solutions deck
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </section>

          <div className="fine-print mx-auto mt-8 max-w-3xl space-y-2 text-center sm:text-left">
            <p>
              AutolytiQ enforces SOC 2 Type II, GDPR, and CCPA controls with continuous monitoring across data pipelines, integrations, and user access policies.
            </p>
            <p>
              Need assistance onboarding your teams? Email <a href="mailto:support@autolytiq.com">support@autolytiq.com</a> for tailored rollout guidance.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
