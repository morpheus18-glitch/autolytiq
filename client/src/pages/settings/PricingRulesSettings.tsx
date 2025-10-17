import { z } from 'zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleSwitch } from '@/components/settings/ToggleSwitch';
import { useSettingsSection } from './useSettingsSection';

const formSchema = z.object({
  aiPricingEnabled: z.boolean().default(true),
  pricingStrategy: z.enum(['MARKET_COMPETITIVE', 'PREMIUM', 'VOLUME']).default('MARKET_COMPETITIVE'),
  minMargin: z.number().min(0).default(1500),
  maxDiscount: z.number().min(0).max(20).default(10),
});

export type PricingRulesForm = z.infer<typeof formSchema>;

const defaultValues: PricingRulesForm = {
  aiPricingEnabled: true,
  pricingStrategy: 'MARKET_COMPETITIVE',
  minMargin: 1500,
  maxDiscount: 10,
};

export function PricingRulesSettings(): JSX.Element {
  const { form, query, mutation, onSubmit } = useSettingsSection<PricingRulesForm>({
    endpoint: 'pricing-rules',
    schema: formSchema,
    defaultValues,
    successMessage: 'Pricing rules updated',
  });

  if (query.isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">AI Pricing Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="aiPricingEnabled"
              render={({ field }) => (
                <ToggleSwitch
                  enabled={field.value}
                  onChange={field.onChange}
                  label="Enable AI-driven pricing recommendations"
                  description="Automatically adjust vehicle pricing based on market and performance data."
                />
              )}
            />
            <FormField
              control={form.control}
              name="pricingStrategy"
              render={({ field }) => (
                <FormItem className="max-w-md">
                  <FormLabel>Pricing Strategy</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MARKET_COMPETITIVE">Market Competitive</SelectItem>
                      <SelectItem value="PREMIUM">Premium</SelectItem>
                      <SelectItem value="VOLUME">Volume</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="minMargin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Front Gross ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="100"
                        {...field}
                        onChange={(event) => field.onChange(Number(event.target.value || '0'))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxDiscount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Discount (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={20}
                        step="0.5"
                        {...field}
                        onChange={(event) => field.onChange(Number(event.target.value || '0'))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

export default PricingRulesSettings;
