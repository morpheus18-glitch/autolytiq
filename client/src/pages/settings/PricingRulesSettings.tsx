import * as React from 'react';
import { z } from 'zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { ToggleSwitch } from '@/components/settings/ToggleSwitch';
import { useSettingsSection } from './useSettingsSection';

const adjustmentRangeSchema = z
  .object({
    min: z.number().min(-15).max(20),
    max: z.number().min(-15).max(20),
  })
  .superRefine((value, ctx) => {
    if (value.min > value.max) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Minimum adjustment must be less than maximum adjustment.',
        path: ['max'],
      });
    }
  });

const pricingRulesSchema = z.object({
  aiPricingEnabled: z.boolean().default(true),
  strategy: z.enum(['MARKET_COMPETITIVE', 'PREMIUM', 'VOLUME']).default('MARKET_COMPETITIVE'),
  aiAdjustmentRange: adjustmentRangeSchema.default({ min: -5, max: 10 }),
  marginRules: z
    .object({
      new: z.number().min(0),
      used: z.number().min(0),
      cpo: z.number().min(0),
    })
    .default({ new: 2000, used: 1500, cpo: 1800 }),
  dealStructure: z
    .object({
      defaultDealPack: z.number().min(0),
      fiMinimum: z.number().min(0),
    })
    .default({ defaultDealPack: 500, fiMinimum: 800 }),
  agingDiscounts: z
    .object({
      days30: z.number().min(-100).max(0),
      days60: z.number().min(-100).max(0),
      days90: z.number().min(-100).max(0),
      days120: z.number().min(-100).max(0),
    })
    .default({ days30: -2, days60: -5, days90: -8, days120: -12 }),
  approvalThresholds: z
    .object({
      frontGross: z.number().min(0),
      finance: z.number().min(0),
    })
    .default({ frontGross: 1000, finance: 500 }),
});

export type PricingRulesForm = z.infer<typeof pricingRulesSchema>;

const defaultValues: PricingRulesForm = {
  aiPricingEnabled: true,
  strategy: 'MARKET_COMPETITIVE',
  aiAdjustmentRange: { min: -5, max: 10 },
  marginRules: { new: 2000, used: 1500, cpo: 1800 },
  dealStructure: { defaultDealPack: 500, fiMinimum: 800 },
  agingDiscounts: { days30: -2, days60: -5, days90: -8, days120: -12 },
  approvalThresholds: { frontGross: 1000, finance: 500 },
};

export function PricingRulesSettings(): JSX.Element {
  const { form, query, mutation, onSubmit } = useSettingsSection<PricingRulesForm>({
    endpoint: 'pricing-rules',
    schema: pricingRulesSchema,
    defaultValues,
    successMessage: 'Pricing rules updated',
  });

  if (query.isLoading) {
    return <Skeleton className="h-[600px] w-full" />;
  }

  const handleNumberChange = (onChange: (value: number) => void) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      if (value === '') {
        onChange(0);
        return;
      }
      onChange(Number(value));
    };

  const clampRangeValue = (value: number) => Math.min(Math.max(value, -15), 20);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Pricing Rules &amp; Thresholds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-10">
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">AI Pricing</h3>
              <FormField
                control={form.control}
                name="aiPricingEnabled"
                render={({ field }) => (
                  <ToggleSwitch
                    enabled={field.value}
                    onChange={field.onChange}
                    label="Enable AI Pricing"
                    description="Automatically adjust vehicle prices based on market conditions and sales performance."
                  />
                )}
              />
              <div className="grid gap-6 lg:grid-cols-2">
                <FormField
                  control={form.control}
                  name="strategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AI Pricing Strategy</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MARKET_COMPETITIVE">Market Competitive</SelectItem>
                          <SelectItem value="PREMIUM">Premium</SelectItem>
                          <SelectItem value="VOLUME">Volume</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose how aggressively AI should adjust pricing relative to market benchmarks.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="aiAdjustmentRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AI Adjustment Range (%)</FormLabel>
                      <FormDescription>
                        Define the allowable range for AI-driven price adjustments (-15% to +20%).
                      </FormDescription>
                      <div className="space-y-4">
                        <Slider
                          min={-15}
                          max={20}
                          step={1}
                          value={[field.value.min, field.value.max]}
                          onValueChange={([min, max]) => {
                            const nextMin = clampRangeValue(min);
                            const nextMax = clampRangeValue(max);
                            field.onChange({
                              min: Math.min(nextMin, nextMax),
                              max: Math.max(nextMin, nextMax),
                            });
                          }}
                          aria-label="AI adjustment range"
                        />
                        <div className="flex items-center gap-4">
                          <div className="flex flex-1 flex-col">
                            <span className="text-xs text-muted-foreground">Minimum</span>
                            <Input
                              type="number"
                              min={-15}
                              max={20}
                              value={field.value.min}
                              onChange={(event) => {
                                const next = clampRangeValue(Number(event.target.value || '-15'));
                                const clampedMin = Math.min(next, field.value.max);
                                field.onChange({ ...field.value, min: clampedMin });
                              }}
                            />
                          </div>
                          <div className="flex flex-1 flex-col">
                            <span className="text-xs text-muted-foreground">Maximum</span>
                            <Input
                              type="number"
                              min={-15}
                              max={20}
                              value={field.value.max}
                              onChange={(event) => {
                                const next = clampRangeValue(Number(event.target.value || '0'));
                                const clampedMax = Math.max(next, field.value.min);
                                field.onChange({ ...field.value, max: clampedMax });
                              }}
                            />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          AI adjustments will stay between {field.value.min}% and {field.value.max}%.
                        </p>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Margin Rules</h3>
              <p className="text-sm text-muted-foreground">
                Establish minimum acceptable front gross targets by vehicle type to protect profitability.
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="marginRules.new"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Vehicles ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={50}
                          value={field.value}
                          onChange={handleNumberChange(field.onChange)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="marginRules.used"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Used Vehicles ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={50}
                          value={field.value}
                          onChange={handleNumberChange(field.onChange)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="marginRules.cpo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPO Vehicles ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={50}
                          value={field.value}
                          onChange={handleNumberChange(field.onChange)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Deal Structure</h3>
                <FormField
                  control={form.control}
                  name="dealStructure.defaultDealPack"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Deal Pack ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={50}
                          value={field.value}
                          onChange={handleNumberChange(field.onChange)}
                        />
                      </FormControl>
                      <FormDescription>Applied to each deal when calculating gross profit.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dealStructure.fiMinimum"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>F&amp;I Minimum ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={50}
                          value={field.value}
                          onChange={handleNumberChange(field.onChange)}
                        />
                      </FormControl>
                      <FormDescription>Minimum reserve and product penetration expected from F&amp;I.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Approval Thresholds</h3>
                <FormField
                  control={form.control}
                  name="approvalThresholds.frontGross"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manager Approval Threshold ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={50}
                          value={field.value}
                          onChange={handleNumberChange(field.onChange)}
                        />
                      </FormControl>
                      <FormDescription>
                        Deals below this front gross require sales manager approval before submission.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="approvalThresholds.finance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Finance Approval Threshold ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={50}
                          value={field.value}
                          onChange={handleNumberChange(field.onChange)}
                        />
                      </FormControl>
                      <FormDescription>
                        Deals below this F&amp;I income require finance manager review.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Aging Discounts</h3>
              <p className="text-sm text-muted-foreground">
                Automatically discount aged inventory to keep pricing aligned with lot aging targets.
              </p>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <FormField
                  control={form.control}
                  name="agingDiscounts.days30"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>30 Days (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={-100}
                          max={0}
                          step={1}
                          value={field.value}
                          onChange={handleNumberChange(field.onChange)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="agingDiscounts.days60"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>60 Days (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={-100}
                          max={0}
                          step={1}
                          value={field.value}
                          onChange={handleNumberChange(field.onChange)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="agingDiscounts.days90"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>90 Days (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={-100}
                          max={0}
                          step={1}
                          value={field.value}
                          onChange={handleNumberChange(field.onChange)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="agingDiscounts.days120"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>120+ Days (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={-100}
                          max={0}
                          step={1}
                          value={field.value}
                          onChange={handleNumberChange(field.onChange)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Save Pricing Rules'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

export default PricingRulesSettings;
