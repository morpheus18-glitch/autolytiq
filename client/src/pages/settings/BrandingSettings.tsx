import { z } from 'zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { ColorPicker } from '@/components/settings/ColorPicker';
import { ImageUploader } from '@/components/settings/ImageUploader';
import { RichTextEditor } from '@/components/settings/RichTextEditor';
import { ToggleSwitch } from '@/components/settings/ToggleSwitch';
import { useSettingsSection } from './useSettingsSection';

const formSchema = z.object({
  primaryColor: z.string().default('#2563EB'),
  secondaryColor: z.string().default('#7C3AED'),
  accentColor: z.string().default('#10B981'),
  successColor: z.string().default('#10B981'),
  warningColor: z.string().default('#F59E0B'),
  errorColor: z.string().default('#EF4444'),
  logoUrl: z.string().optional().default(''),
  darkLogoUrl: z.string().optional().default(''),
  faviconUrl: z.string().optional().default(''),
  emailHeaderHtml: z.string().default(''),
  emailFooterHtml: z.string().default(''),
  customThemeEnabled: z.boolean().default(false),
  fontFamily: z.enum(['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat']).default('Inter'),
  borderRadius: z.number().min(0).max(20).default(8),
});

export type BrandingSettingsForm = z.infer<typeof formSchema>;

const defaultValues: BrandingSettingsForm = {
  primaryColor: '#2563EB',
  secondaryColor: '#7C3AED',
  accentColor: '#10B981',
  successColor: '#10B981',
  warningColor: '#F59E0B',
  errorColor: '#EF4444',
  logoUrl: '',
  darkLogoUrl: '',
  faviconUrl: '',
  emailHeaderHtml: '',
  emailFooterHtml: '',
  customThemeEnabled: false,
  fontFamily: 'Inter',
  borderRadius: 8,
};

async function uploadBrandAsset(type: 'logo' | 'darkLogo' | 'favicon', file: File): Promise<string> {
  const formData = new FormData();
  formData.append('logo', file);
  formData.append('type', type);
  const response = await fetch(`/api/settings/branding/upload-logo?type=${type}`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to upload asset');
  }
  const json = (await response.json()) as { url?: string };
  if (!json?.url) {
    throw new Error('Upload did not return a URL');
  }
  return json.url;
}

async function deleteBrandAsset(type: 'logo' | 'darkLogo' | 'favicon'): Promise<void> {
  const response = await fetch(`/api/settings/branding/logo/${type}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to remove asset');
  }
}

export function BrandingSettings(): JSX.Element {
  const { form, query, mutation, onSubmit } = useSettingsSection<BrandingSettingsForm>({
    endpoint: 'branding',
    schema: formSchema,
    defaultValues,
    successMessage: 'Brand preferences saved',
  });

  if (query.isLoading) {
    return <Skeleton className="h-[600px] w-full" />;
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Color Palette</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="primaryColor"
              render={({ field }) => (
                <ColorPicker label="Primary" value={field.value} onChange={field.onChange} />
              )}
            />
            <FormField
              control={form.control}
              name="secondaryColor"
              render={({ field }) => (
                <ColorPicker label="Secondary" value={field.value} onChange={field.onChange} />
              )}
            />
            <FormField
              control={form.control}
              name="accentColor"
              render={({ field }) => (
                <ColorPicker label="Accent" value={field.value} onChange={field.onChange} />
              )}
            />
            <FormField
              control={form.control}
              name="successColor"
              render={({ field }) => (
                <ColorPicker label="Success" value={field.value} onChange={field.onChange} />
              )}
            />
            <FormField
              control={form.control}
              name="warningColor"
              render={({ field }) => (
                <ColorPicker label="Warning" value={field.value} onChange={field.onChange} />
              )}
            />
            <FormField
              control={form.control}
              name="errorColor"
              render={({ field }) => (
                <ColorPicker label="Error" value={field.value} onChange={field.onChange} />
              )}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Logos & Assets</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <ImageUploader
                  label="Primary Logo"
                  currentImage={field.value}
                  onUpload={async (file) => {
                    const url = await uploadBrandAsset('logo', file);
                    field.onChange(url);
                  }}
                  onRemove={async () => {
                    await deleteBrandAsset('logo');
                    field.onChange('');
                  }}
                />
              )}
            />
            <FormField
              control={form.control}
              name="darkLogoUrl"
              render={({ field }) => (
                <ImageUploader
                  label="Dark Mode Logo"
                  currentImage={field.value}
                  onUpload={async (file) => {
                    const url = await uploadBrandAsset('darkLogo', file);
                    field.onChange(url);
                  }}
                  onRemove={async () => {
                    await deleteBrandAsset('darkLogo');
                    field.onChange('');
                  }}
                />
              )}
            />
            <FormField
              control={form.control}
              name="faviconUrl"
              render={({ field }) => (
                <ImageUploader
                  label="Favicon"
                  currentImage={field.value}
                  onUpload={async (file) => {
                    const url = await uploadBrandAsset('favicon', file);
                    field.onChange(url);
                  }}
                  onRemove={async () => {
                    await deleteBrandAsset('favicon');
                    field.onChange('');
                  }}
                />
              )}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Email Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="emailHeaderHtml"
              render={({ field }) => (
                <RichTextEditor label="Email Header" value={field.value} onChange={field.onChange} />
              )}
            />
            <FormField
              control={form.control}
              name="emailFooterHtml"
              render={({ field }) => (
                <RichTextEditor label="Email Footer" value={field.value} onChange={field.onChange} />
              )}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Customer Portal Theme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="customThemeEnabled"
              render={({ field }) => (
                <ToggleSwitch
                  enabled={field.value}
                  onChange={field.onChange}
                  label="Enable custom portal theme"
                  description="Override default styling for the customer experience."
                />
              )}
            />
            <FormField
              control={form.control}
              name="fontFamily"
              render={({ field }) => (
                <FormItem className="max-w-sm">
                  <FormLabel>Font Family</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Lato">Lato</SelectItem>
                      <SelectItem value="Montserrat">Montserrat</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="borderRadius"
              render={({ field }) => (
                <FormItem className="max-w-sm">
                  <FormLabel>Border Radius ({field.value}px)</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={20}
                      step={1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0] ?? 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="rounded border border-border bg-card p-6">
              <p className="text-sm font-medium text-muted-foreground">Live Preview</p>
              <div className="mt-4 flex flex-wrap gap-4">
                <div
                  className="rounded px-4 py-2 text-white"
                  style={{ backgroundColor: form.watch('primaryColor'), borderRadius: `${form.watch('borderRadius')}px` }}
                >
                  Primary Button
                </div>
                <div
                  className="rounded px-4 py-2 text-white"
                  style={{ backgroundColor: form.watch('secondaryColor'), borderRadius: `${form.watch('borderRadius')}px` }}
                >
                  Secondary Button
                </div>
                <div
                  className="rounded px-4 py-2 text-white"
                  style={{ backgroundColor: form.watch('accentColor'), borderRadius: `${form.watch('borderRadius')}px` }}
                >
                  Accent Badge
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Save Branding'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

export default BrandingSettings;
