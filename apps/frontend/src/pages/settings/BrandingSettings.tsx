import { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui';
import { Button } from '@repo/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui';
import { Skeleton } from '@repo/ui';
import { Slider } from '@repo/ui';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@repo/ui';
import { ColorPicker } from '@/components/settings/ColorPicker.tsx';
import { ImageUploader } from '@/components/settings/ImageUploader.tsx';
import { RichTextEditor } from '@/components/settings/RichTextEditor.tsx';
import { ToggleSwitch } from '@/components/settings/ToggleSwitch.tsx';
import {
  brandingSettingsSchema,
  defaultBrandingSettings,
  type BrandingSettings,
} from '@shared/settings-schema';
import { useSettingsSection } from './useSettingsSection';

const LOGO_ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];
const FAVICON_ACCEPTED_TYPES = ['image/png', 'image/svg+xml', 'image/x-icon'];
const BRAND_ASSET_MAX_SIZE = 500 * 1024;

type UploadableBrandAsset = 'logo' | 'darkLogo' | 'favicon' | 'invoiceHeader' | 'purchaseAgreementHeader';

async function uploadBrandAsset(type: UploadableBrandAsset, file: File): Promise<string> {
  const formData = new FormData();
  formData.append('logo', file);
  formData.append('type', type);

  const response = await fetch(`/api/settings/branding/upload-logo?type=${encodeURIComponent(type)}`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Unable to upload branding asset');
  }

  const payload = (await response.json()) as { url?: string };
  if (!payload?.url) {
    throw new Error('Upload response did not include a file URL');
  }

  return payload.url;
}

async function deleteBrandAsset(type: UploadableBrandAsset): Promise<void> {
  const response = await fetch(`/api/settings/branding/logo/${encodeURIComponent(type)}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Unable to remove branding asset');
  }
}

function createDefaultValues(): BrandingSettings {
  return {
    ...defaultBrandingSettings,
    colors: { ...defaultBrandingSettings.colors },
    logos: { ...defaultBrandingSettings.logos },
    emailBranding: { ...defaultBrandingSettings.emailBranding },
    documentBranding: { ...defaultBrandingSettings.documentBranding },
    portalTheme: { ...defaultBrandingSettings.portalTheme },
  };
}

export function BrandingSettings(): JSX.Element {
  const defaultValues = useMemo(() => createDefaultValues(), []);
  const { form, query, mutation, onSubmit } = useSettingsSection<BrandingSettings>({
    endpoint: 'branding',
    schema: brandingSettingsSchema,
    defaultValues,
    successMessage: 'Brand preferences saved',
  });
  const [isEmailPreviewOpen, setEmailPreviewOpen] = useState(false);

  const colors = form.watch('colors');
  const portalTheme = form.watch('portalTheme');
  const emailHeaderHtml = form.watch('emailBranding.headerHtml');
  const emailFooterHtml = form.watch('emailBranding.footerHtml');

  const emailPreviewHtml = useMemo(() => {
    const primary = colors?.primary ?? defaultBrandingSettings.colors.primary;
    const secondary = colors?.secondary ?? defaultBrandingSettings.colors.secondary;
    const accent = colors?.accent ?? defaultBrandingSettings.colors.accent;

    const headerContent = emailHeaderHtml?.trim().length ? emailHeaderHtml : '<h2 style="margin:0">Welcome!</h2>';
    const footerContent = emailFooterHtml?.trim().length
      ? emailFooterHtml
      : '<p style="margin:0">© 2024 Your Dealership. All rights reserved.</p>';

    return `
      <div style="font-family: 'Inter', sans-serif; background-color: #f3f4f6; padding: 24px;">
        <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border-top: 6px solid ${primary}; box-shadow: 0 10px 40px rgba(15, 23, 42, 0.12);">
          <div style="padding: 28px; background: ${primary}; color: #ffffff;">
            ${headerContent}
          </div>
          <div style="padding: 28px; color: #111827; line-height: 1.6;">
            <p style="margin-bottom: 16px;">Hi {{customerName}},</p>
            <p style="margin-bottom: 16px;">Thank you for choosing our dealership. Here's a quick summary of your upcoming visit.</p>
            <a href="#" style="display:inline-block; padding: 12px 24px; background:${accent}; color:#ffffff; border-radius:8px; text-decoration:none; font-weight:600;">View Appointment</a>
          </div>
          <div style="padding: 24px; background: ${secondary}; color: #ffffff;">
            ${footerContent}
          </div>
        </div>
      </div>
    `;
  }, [colors?.accent, colors?.primary, colors?.secondary, emailFooterHtml, emailHeaderHtml]);

  if (query.isLoading) {
    return <Skeleton className="h-[720px] w-full" />;
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
              name="colors.primary"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ColorPicker label="Primary" value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="colors.secondary"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ColorPicker label="Secondary" value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="colors.accent"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ColorPicker label="Accent" value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="colors.success"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ColorPicker label="Success" value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="colors.warning"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ColorPicker label="Warning" value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="colors.error"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ColorPicker label="Error" value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2">
              <div className="rounded-lg border border-border bg-card/70 p-6">
                <p className="text-sm font-medium text-muted-foreground">Live Preview</p>
                <div className="mt-4 flex flex-wrap gap-4">
                  <div
                    className="rounded px-4 py-2 text-sm font-semibold text-white shadow-sm"
                    style={{ backgroundColor: colors?.primary, borderRadius: '999px' }}
                  >
                    Primary Button
                  </div>
                  <div
                    className="rounded px-4 py-2 text-sm font-semibold text-white shadow-sm"
                    style={{ backgroundColor: colors?.secondary, borderRadius: '999px' }}
                  >
                    Secondary Button
                  </div>
                  <div
                    className="rounded px-3 py-1 text-xs font-semibold text-white"
                    style={{ backgroundColor: colors?.accent, borderRadius: '12px' }}
                  >
                    Accent Badge
                  </div>
                  <div className="flex items-center gap-2 rounded border border-border bg-background px-4 py-2 text-xs">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: colors?.success }} />
                    Success state
                  </div>
                  <div className="flex items-center gap-2 rounded border border-border bg-background px-4 py-2 text-xs">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: colors?.warning }} />
                    Warning state
                  </div>
                  <div className="flex items-center gap-2 rounded border border-border bg-background px-4 py-2 text-xs">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: colors?.error }} />
                    Error state
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Logos & Assets</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            <FormField
              control={form.control}
              name="logos.logo"
              render={({ field }) => (
                <FormItem>
                  <ImageUploader
                    label="Primary Logo"
                    currentImage={field.value || undefined}
                    onUpload={async (file) => {
                      const url = await uploadBrandAsset('logo', file);
                      field.onChange(url);
                    }}
                    onRemove={async () => {
                      await deleteBrandAsset('logo');
                      field.onChange('');
                    }}
                    acceptedTypes={LOGO_ACCEPTED_TYPES}
                    maxSize={BRAND_ASSET_MAX_SIZE}
                    description="PNG, JPG, or SVG up to 500KB"
                    disabled={mutation.isPending}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logos.darkLogo"
              render={({ field }) => (
                <FormItem>
                  <ImageUploader
                    label="Dark Mode Logo"
                    currentImage={field.value || undefined}
                    onUpload={async (file) => {
                      const url = await uploadBrandAsset('darkLogo', file);
                      field.onChange(url);
                    }}
                    onRemove={async () => {
                      await deleteBrandAsset('darkLogo');
                      field.onChange('');
                    }}
                    acceptedTypes={LOGO_ACCEPTED_TYPES}
                    maxSize={BRAND_ASSET_MAX_SIZE}
                    description="Optimized for dark backgrounds"
                    disabled={mutation.isPending}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logos.favicon"
              render={({ field }) => (
                <FormItem>
                  <ImageUploader
                    label="Favicon"
                    currentImage={field.value || undefined}
                    onUpload={async (file) => {
                      const url = await uploadBrandAsset('favicon', file);
                      field.onChange(url);
                    }}
                    onRemove={async () => {
                      await deleteBrandAsset('favicon');
                      field.onChange('');
                    }}
                    acceptedTypes={FAVICON_ACCEPTED_TYPES}
                    maxSize={BRAND_ASSET_MAX_SIZE}
                    description="SVG, PNG, or ICO up to 500KB"
                    disabled={mutation.isPending}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">Email Branding</CardTitle>
            </div>
            <Button type="button" variant="outline" onClick={() => setEmailPreviewOpen(true)}>
              Preview Email
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="emailBranding.headerHtml"
              render={({ field }) => (
                <FormItem>
                  <RichTextEditor
                    label="Header HTML"
                    value={field.value}
                    onChange={field.onChange}
                    description="Customize the hero section for branded emails."
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emailBranding.footerHtml"
              render={({ field }) => (
                <FormItem>
                  <RichTextEditor
                    label="Footer HTML"
                    value={field.value}
                    onChange={field.onChange}
                    description="Include legal disclaimers, contact details, and unsubscribe links."
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Document Branding</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="documentBranding.invoiceHeaderImageUrl"
              render={({ field }) => (
                <FormItem>
                  <ImageUploader
                    label="Invoice Header Image"
                    currentImage={field.value || undefined}
                    onUpload={async (file) => {
                      const url = await uploadBrandAsset('invoiceHeader', file);
                      field.onChange(url);
                    }}
                    onRemove={async () => {
                      await deleteBrandAsset('invoiceHeader');
                      field.onChange('');
                    }}
                    acceptedTypes={LOGO_ACCEPTED_TYPES}
                    maxSize={BRAND_ASSET_MAX_SIZE}
                    description="Optional image displayed at the top of invoices"
                    disabled={mutation.isPending}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="documentBranding.purchaseAgreementHeaderImageUrl"
              render={({ field }) => (
                <FormItem>
                  <ImageUploader
                    label="Purchase Agreement Header"
                    currentImage={field.value || undefined}
                    onUpload={async (file) => {
                      const url = await uploadBrandAsset('purchaseAgreementHeader', file);
                      field.onChange(url);
                    }}
                    onRemove={async () => {
                      await deleteBrandAsset('purchaseAgreementHeader');
                      field.onChange('');
                    }}
                    acceptedTypes={LOGO_ACCEPTED_TYPES}
                    maxSize={BRAND_ASSET_MAX_SIZE}
                    description="Optional header image for purchase agreements"
                    disabled={mutation.isPending}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="documentBranding.invoiceHeaderHtml"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <RichTextEditor
                    label="Invoice Header HTML"
                    value={field.value}
                    onChange={field.onChange}
                    description="Displayed above invoice line items when no image is provided."
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="documentBranding.invoiceFooterHtml"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <RichTextEditor
                    label="Invoice Footer HTML"
                    value={field.value}
                    onChange={field.onChange}
                    description="Terms, payment instructions, and compliance language."
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="documentBranding.purchaseAgreementHeaderHtml"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <RichTextEditor
                    label="Purchase Agreement Header"
                    value={field.value}
                    onChange={field.onChange}
                    description="HTML fallback if no header image is provided."
                  />
                  <FormMessage />
                </FormItem>
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
              name="portalTheme.enabled"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ToggleSwitch
                      enabled={field.value}
                      onChange={field.onChange}
                      label="Enable Custom Theme"
                      description="Override the default customer portal styling."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="portalTheme.fontFamily"
              render={({ field }) => (
                <FormItem className="max-w-sm">
                  <FormLabel>Font Family</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!portalTheme?.enabled}>
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
              name="portalTheme.borderRadius"
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
                      disabled={!portalTheme?.enabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div
              className="rounded-lg border border-border bg-card/60 p-6"
              style={{
                fontFamily: portalTheme?.enabled ? portalTheme.fontFamily : undefined,
                borderRadius: portalTheme?.enabled ? `${portalTheme.borderRadius}px` : undefined,
              }}
            >
              <p className="text-sm font-medium text-muted-foreground">Live Preview</p>
              <div className="mt-4 space-y-4">
                <div
                  className="flex items-center justify-between rounded px-4 py-3 text-sm font-semibold text-white shadow"
                  style={{ backgroundColor: colors?.primary, borderRadius: portalTheme?.enabled ? `${portalTheme.borderRadius}px` : undefined }}
                >
                  <span>Primary action</span>
                  <span className="text-xs uppercase" style={{ color: colors?.accent }}>
                    Accent Link
                  </span>
                </div>
                <div
                  className="rounded border border-border bg-background/80 p-4 text-sm text-muted-foreground"
                  style={{ borderRadius: portalTheme?.enabled ? `${portalTheme.borderRadius}px` : undefined }}
                >
                  <p className="font-medium text-foreground">Customer Dashboard</p>
                  <p className="mt-1">Preview of cards, inputs, and alerts using your palette.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className="rounded px-3 py-1 text-xs font-semibold text-white"
                      style={{ backgroundColor: colors?.success }}
                    >
                      Success
                    </span>
                    <span
                      className="rounded px-3 py-1 text-xs font-semibold text-white"
                      style={{ backgroundColor: colors?.warning }}
                    >
                      Warning
                    </span>
                    <span
                      className="rounded px-3 py-1 text-xs font-semibold text-white"
                      style={{ backgroundColor: colors?.error }}
                    >
                      Error
                    </span>
                  </div>
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
      <Dialog open={isEmailPreviewOpen} onOpenChange={setEmailPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription>
              Preview how transactional and marketing emails will render with your current branding.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto rounded-md border border-border bg-background">
            <div dangerouslySetInnerHTML={{ __html: emailPreviewHtml }} />
          </div>
        </DialogContent>
      </Dialog>
    </Form>
  );
}

export default BrandingSettings;
