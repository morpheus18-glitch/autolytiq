import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { ImageUploader } from '@/components/settings/ImageUploader';
import {
  DAY_LABELS,
  dealershipSettingsSchema,
  defaultDealershipSettings,
  type DealershipSettings,
} from '@shared/settings-schema';
import { useSettingsSection } from './useSettingsSection';

async function uploadDealershipLogo(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('logo', file);

  const response = await fetch('/api/settings/dealership/logo', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to upload dealership logo');
  }

  const payload = (await response.json()) as { url?: string };
  if (!payload?.url) {
    throw new Error('Upload response did not include a URL');
  }

  return payload.url;
}

async function deleteDealershipLogo(): Promise<void> {
  const response = await fetch('/api/settings/dealership/logo', {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to remove dealership logo');
  }
}

function createDefaultValues(): DealershipSettings {
  return {
    ...defaultDealershipSettings,
    address: { ...defaultDealershipSettings.address },
    businessHours: defaultDealershipSettings.businessHours.map((hour) => ({ ...hour })),
  };
}

export function DealershipSettings(): JSX.Element {
  const defaultValues = useMemo(() => createDefaultValues(), []);
  const { form, query, mutation, onSubmit } = useSettingsSection<DealershipSettings>({
    endpoint: 'dealership',
    schema: dealershipSettingsSchema,
    defaultValues,
    successMessage: 'Dealership profile saved successfully',
  });

  const businessHours = form.watch('businessHours');

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[520px] w-full" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Business Profile</CardTitle>
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
              name="dealerLicenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dealer License Number</FormLabel>
                  <FormControl>
                    <Input placeholder="DL-123456" {...field} />
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
                  <FormLabel>Primary Email</FormLabel>
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
              name="websiteUrl"
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
            <FormField
              control={form.control}
              name="taxId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax ID / EIN</FormLabel>
                  <FormControl>
                    <Input placeholder="12-3456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="docFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Doc Fee</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={Number.isFinite(field.value) ? field.value : ''}
                        onChange={(event) => {
                          const nextValue = event.target.value;
                          if (nextValue === '') {
                            field.onChange(Number.NaN);
                          } else {
                            field.onChange(Number(nextValue));
                          }
                        }}
                        onBlur={() => {
                          if (!Number.isFinite(field.value)) {
                            field.onChange(0);
                          }
                        }}
                        className="pl-7"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="registrationFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Fee</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={Number.isFinite(field.value) ? field.value : ''}
                        onChange={(event) => {
                          const nextValue = event.target.value;
                          if (nextValue === '') {
                            field.onChange(Number.NaN);
                          } else {
                            field.onChange(Number(nextValue));
                          }
                        }}
                        onBlur={() => {
                          if (!Number.isFinite(field.value)) {
                            field.onChange(0);
                          }
                        }}
                        className="pl-7"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stateSalesTaxRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State Sales Tax Rate</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step="0.1"
                        value={Number.isFinite(field.value) ? field.value : ''}
                        onChange={(event) => {
                          const nextValue = event.target.value;
                          if (nextValue === '') {
                            field.onChange(Number.NaN);
                          } else {
                            field.onChange(Number(nextValue));
                          }
                        }}
                        onBlur={() => {
                          if (!Number.isFinite(field.value)) {
                            field.onChange(0);
                          }
                        }}
                        className="pr-10"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        %
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Location</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="address.street"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main Street" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Austin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="TX"
                      maxLength={2}
                      {...field}
                      onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.zip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP Code</FormLabel>
                  <FormControl>
                    <Input placeholder="73301" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Business Hours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[160px,1fr,1fr,120px] items-center gap-4 text-sm font-medium text-muted-foreground">
              <span>Day</span>
              <span>Opens</span>
              <span>Closes</span>
              <span>Status</span>
            </div>
            <div className="space-y-3">
              {businessHours?.map((hour, index) => (
                <div
                  key={hour.day}
                  className="grid grid-cols-[160px,1fr,1fr,120px] items-center gap-4 rounded border border-border bg-card/30 p-3"
                >
                  <span className="text-sm font-medium text-foreground">{DAY_LABELS[hour.day]}</span>
                  <FormField
                    control={form.control}
                    name={`businessHours.${index}.openTime`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="time" disabled={hour.closed} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`businessHours.${index}.closeTime`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="time" disabled={hour.closed} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`businessHours.${index}.closed`}
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-end gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          {field.value ? 'Closed' : 'Open'}
                        </span>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(value) => {
                              field.onChange(value);
                              if (!value) {
                                const openPath = `businessHours.${index}.openTime` as const;
                                const closePath = `businessHours.${index}.closeTime` as const;
                                const currentOpen = form.getValues(openPath) || '09:00';
                                const currentClose = form.getValues(closePath) || '18:00';
                                form.setValue(openPath, currentOpen);
                                form.setValue(closePath, currentClose);
                              }
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Brand Assets</CardTitle>
          </CardHeader>
          <CardContent className="max-w-xl">
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <ImageUploader
                  label="Dealership Logo"
                  currentImage={field.value || undefined}
                  onUpload={async (file) => {
                    const url = await uploadDealershipLogo(file);
                    field.onChange(url);
                  }}
                  onRemove={async () => {
                    await deleteDealershipLogo();
                    field.onChange('');
                  }}
                  acceptedTypes={['image/png', 'image/jpeg']}
                  maxSize={2 * 1024 * 1024}
                  description="Upload a high-resolution PNG or JPG up to 2MB."
                />
              )}
            />
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Save Dealership Settings'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

export default DealershipSettings;
