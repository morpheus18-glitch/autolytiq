import { z } from 'zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettingsSection } from './useSettingsSection';

const formSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  website: z
    .string()
    .url('Provide a valid URL starting with https://')
    .or(z.literal(''))
    .optional()
    .transform((value) => value ?? ''),
});

export type DealershipSettingsForm = z.infer<typeof formSchema>;

const defaultValues: DealershipSettingsForm = {
  businessName: '',
  email: '',
  phone: '',
  website: '',
};

export function DealershipSettings(): JSX.Element {
  const { form, query, mutation, onSubmit } = useSettingsSection<DealershipSettingsForm>({
    endpoint: 'dealership',
    schema: formSchema,
    defaultValues,
    successMessage: 'Dealership profile updated',
  });

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-[260px] w-full" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Dealership Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Premier Auto Group" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="info@dealership.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="(555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://www.premierauto.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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

export default DealershipSettings;
