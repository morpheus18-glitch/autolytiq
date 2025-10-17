import { useEffect } from 'react';
import { useForm, type DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type ZodType } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { fetchSettingsSection, updateSettingsSection } from '@/lib/settingsApi';

interface UseSettingsSectionOptions<TFormValues> {
  endpoint: string;
  schema: ZodType<TFormValues>;
  defaultValues: DefaultValues<TFormValues>;
  successMessage: string;
}

export function useSettingsSection<TFormValues>({
  endpoint,
  schema,
  defaultValues,
  successMessage,
}: UseSettingsSectionOptions<TFormValues>) {
  const form = useForm<TFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const queryKey = ['settings', endpoint];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchSettingsSection(endpoint, schema, defaultValues as TFormValues),
  });

  useEffect(() => {
    if (query.data) {
      form.reset(query.data);
    }
  }, [form, query.data]);

  const mutation = useMutation({
    mutationFn: async (values: TFormValues) => updateSettingsSection(endpoint, schema, values),
    onSuccess: (data) => {
      form.reset(data);
      queryClient.setQueryData(queryKey, data);
      toast({ title: successMessage });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to save changes.';
      toast({ title: 'Save failed', description: message, variant: 'destructive' });
    },
  });

  const handleSubmit = form.handleSubmit((values) => mutation.mutate(values));

  return {
    form,
    query,
    mutation,
    onSubmit: handleSubmit,
  };
}
