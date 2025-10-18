import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Info,
  Layers,
  MinusCircle,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type {
  FIProductDto,
  MenuAvailabilityDto,
  MenuBuildPayload,
  MenuOptionDto,
  MenuOptionProductDto,
  MenuPresentationDto,
} from '../api';
import {
  buildMenuConfiguration,
  fetchFiProductDetails,
  fetchMenuConfiguration,
  selectMenuOption,
} from '../api';

type MenuOptionCode = 'A' | 'B' | 'C' | 'D';

const optionCodes: MenuOptionCode[] = ['A', 'B', 'C', 'D'];

function formatCurrency(value?: number | null) {
  if (value === null || value === undefined) {
    return '—';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

function formatPaymentImpact(value?: number | null) {
  if (value === null || value === undefined) {
    return '—';
  }
  const formatted = formatCurrency(Math.abs(value));
  if (value === 0) {
    return '$0.00';
  }
  return value > 0 ? `+${formatted}` : `-${formatted}`;
}

function getOptionAssignments(options: MenuOptionDto[] | undefined) {
  const assignments: Record<MenuOptionCode, string[]> = {
    A: [],
    B: [],
    C: [],
    D: [],
  };

  if (!options) {
    return assignments;
  }

  for (const option of options) {
    assignments[option.code as MenuOptionCode] = option.products.map((product) => product.id);
  }

  return assignments;
}

interface ProductModalState {
  optionCode: MenuOptionCode;
  productId: string;
  snapshot: MenuOptionProductDto;
}

export default function MenuPresentationPage() {
  const { id: dealId } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'manager' | 'customer'>('manager');
  const [assignments, setAssignments] = useState<Record<MenuOptionCode, string[]>>({
    A: [],
    B: [],
    C: [],
    D: [],
  });
  const [productModal, setProductModal] = useState<ProductModalState | null>(null);

  const menuQuery = useQuery<MenuPresentationDto>({
    queryKey: ['fi', 'menu', dealId],
    queryFn: () => fetchMenuConfiguration(dealId!),
    enabled: Boolean(dealId),
  });

  const productDetailsQuery = useQuery<FIProductDto | null>({
    queryKey: ['fi', 'products', productModal?.productId ?? null],
    queryFn: async () => {
      if (!productModal) {
        return null;
      }
      return fetchFiProductDetails(productModal.productId);
    },
    enabled: Boolean(productModal?.productId),
  });

  useEffect(() => {
    if (!menuQuery.data) {
      return;
    }
    setAssignments(getOptionAssignments(menuQuery.data.configuration.options));
  }, [menuQuery.data]);

  const buildMenuMutation = useMutation({
    mutationFn: (payload: MenuBuildPayload) => buildMenuConfiguration(payload),
    onSuccess: (response) => {
      if (dealId) {
        queryClient.setQueryData(['fi', 'menu', dealId], response);
        queryClient.invalidateQueries({ queryKey: ['fi', 'deal', dealId] });
      }
      setAssignments(getOptionAssignments(response.configuration.options));
      toast({ title: 'Menu updated', description: 'Finance menu options have been saved.' });
    },
    onError: (error: any) => {
      toast({
        title: 'Unable to build menu',
        description: error?.message ?? 'An unexpected error occurred while saving the menu.',
        variant: 'destructive',
      });
    },
  });

  const selectOptionMutation = useMutation({
    mutationFn: (optionCode: string | null) => selectMenuOption(dealId!, { optionCode }),
    onSuccess: (response, optionCode) => {
      if (dealId) {
        queryClient.setQueryData(['fi', 'menu', dealId], response);
        queryClient.invalidateQueries({ queryKey: ['fi', 'deal', dealId] });
      }
      setAssignments(getOptionAssignments(response.configuration.options));
      setProductModal(null);
      toast({
        title: optionCode ? `Option ${optionCode} selected` : 'Selection cleared',
        description: optionCode
          ? 'The customer selection has been applied to the deal.'
          : 'No menu option is currently selected.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Unable to capture selection',
        description: error?.message ?? 'An unexpected error occurred while saving the selection.',
        variant: 'destructive',
      });
    },
  });

  const menu = menuQuery.data;
  const isLoading = menuQuery.isLoading;
  const isError = menuQuery.isError;
  const availableProducts = menu?.availableProducts ?? [];
  const activeProduct = productDetailsQuery.data ?? productModal?.snapshot ?? null;
  const baseMonthly = menu?.baseMonthlyPayment ?? null;

  const handleAddProduct = (optionCode: MenuOptionCode, productId: string) => {
    setAssignments((prev) => {
      if (prev[optionCode].includes(productId)) {
        return prev;
      }
      return { ...prev, [optionCode]: [...prev[optionCode], productId] };
    });
  };

  const handleRemoveProduct = (optionCode: MenuOptionCode, productId: string) => {
    setAssignments((prev) => ({
      ...prev,
      [optionCode]: prev[optionCode].filter((id) => id !== productId),
    }));
  };

  const handleBuildMenu = () => {
    if (!dealId) {
      return;
    }
    const payload: MenuBuildPayload = {
      dealId,
      options: optionCodes.map((code) => ({
        code,
        label: `Option ${code}`,
        productIds: Array.from(new Set(assignments[code])),
      })),
    };
    buildMenuMutation.mutate(payload);
  };

  const handleSelectOption = (optionCode: MenuOptionCode | null) => {
    if (!dealId) {
      return;
    }
    selectOptionMutation.mutate(optionCode);
  };

  const openProductModal = (optionCode: MenuOptionCode, product: MenuOptionProductDto) => {
    setProductModal({ optionCode, productId: product.id, snapshot: product });
  };

  const handleCloseModal = () => {
    setProductModal(null);
  };

  const renderProductCard = (entry: MenuAvailabilityDto) => {
    const { product, eligible, reasons } = entry;
    const isAssigned = optionCodes.some((code) => assignments[code].includes(product.id));

    return (
      <Card key={product.id} className="transition hover:shadow-md">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base font-semibold">{product.name}</CardTitle>
            <Badge variant={eligible ? 'default' : 'destructive'} className="flex items-center gap-1">
              {eligible ? <ShieldCheck className="h-3.5 w-3.5" /> : <MinusCircle className="h-3.5 w-3.5" />}
              {eligible ? 'Eligible' : 'Not Eligible'}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{product.category}</span>
            <Separator orientation="vertical" className="h-4" />
            <span>{product.provider}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-muted-foreground">{product.description}</p>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span>Retail Price</span>
              <span className="font-medium">{formatCurrency(product.retailPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span>Dealer Cost</span>
              <span>{formatCurrency(product.cost)}</span>
            </div>
            <div className="flex justify-between">
              <span>Markup</span>
              <span>{formatCurrency(product.markup)}</span>
            </div>
          </div>
          {!eligible && reasons.length > 0 && (
            <div className="space-y-1 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
              <p className="font-medium">Eligibility restrictions</p>
              <ul className="list-disc space-y-1 pl-4">
                {reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {optionCodes.map((code) => {
              const alreadyAssigned = assignments[code].includes(product.id);
              return (
                <Button
                  key={`${product.id}-${code}`}
                  size="sm"
                  variant={alreadyAssigned ? 'secondary' : 'outline'}
                  disabled={!eligible || alreadyAssigned}
                  onClick={() => handleAddProduct(code, product.id)}
                >
                  <Plus className="mr-1 h-4 w-4" /> Option {code}
                </Button>
              );
            })}
          </div>
          {isAssigned && (
            <p className="text-xs text-muted-foreground">This product is currently included in a menu option.</p>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderOptionSummary = (code: MenuOptionCode, option: MenuOptionDto | undefined) => {
    const currentIds = assignments[code];
    const productSnapshots: MenuOptionProductDto[] = currentIds.length
      ? currentIds
          .map((id) =>
            option?.products.find((product) => product.id === id) ??
            availableProducts.find((entry) => entry.product.id === id)?.product ??
            null,
          )
          .filter((product): product is MenuOptionProductDto => Boolean(product))
      : option?.products ?? [];

    if (productSnapshots.length === 0) {
      return (
        <div className="rounded-lg border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
          Products will appear here once added to this option.
        </div>
      );
    }

    const derivedRetail = productSnapshots.reduce((sum, product) => sum + (product.retailPrice ?? 0), 0);
    const derivedMarkup = productSnapshots.reduce((sum, product) => sum + (product.markup ?? 0), 0);
    const displayRetail = option?.totalRetail ?? derivedRetail;
    const displayMarkup = option?.totalMarkup ?? derivedMarkup;
    const displayImpact = option?.paymentImpact ?? null;

    return (
      <div className="space-y-3">
        <div className="grid gap-2 rounded-lg border border-border/50 bg-muted/40 p-3 text-sm">
          <div className="flex justify-between">
            <span>Total Retail</span>
            <span className="font-semibold">{formatCurrency(displayRetail)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Markup</span>
            <span>{formatCurrency(displayMarkup)}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Impact</span>
            <span>
              {displayImpact !== null
                ? formatPaymentImpact(displayImpact)
                : 'Calculated after saving'}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          {productSnapshots.map((product) => (
            <div key={product.id} className="flex items-start justify-between gap-3 rounded-lg border border-border/40 p-3">
              <div>
                <p className="text-sm font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.provider}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => handleRemoveProduct(code, product.id)}>
                <MinusCircle className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const managerView = useMemo(() => {
    if (!menu) {
      return null;
    }

    return (
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Layers className="h-5 w-5" /> Available Finance Products
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableProducts.length === 0 && (
                <p className="text-sm text-muted-foreground">No active F&amp;I products are configured for this tenant.</p>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                {availableProducts.map((entry) => renderProductCard(entry))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <CheckCircle2 className="h-5 w-5" /> Menu Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {optionCodes.map((code) => {
                const option = menu.configuration.options.find((entry) => entry.code === code);
                return (
                  <div key={code} className="space-y-2 rounded-lg border border-border/60 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">Option {code}</p>
                        <p className="text-xs text-muted-foreground">
                          {assignments[code].length} product{assignments[code].length === 1 ? '' : 's'} selected
                        </p>
                      </div>
                    </div>
                    {renderOptionSummary(code, option)}
                  </div>
                );
              })}
              <Button
                className="w-full"
                onClick={handleBuildMenu}
                disabled={buildMenuMutation.isPending || !dealId}
              >
                {buildMenuMutation.isPending ? 'Saving menu…' : 'Save Menu Configuration'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }, [availableProducts, assignments, buildMenuMutation.isPending, dealId, menu]);

  const customerView = useMemo(() => {
    if (!menu || menu.configuration.options.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Configure the finance menu before presenting options to the customer.
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {menu.configuration.options.map((option) => {
          const isSelected = menu.configuration.selectedOption === option.code;
          const monthlyPayment =
            baseMonthly !== null && option.paymentImpact !== null
              ? baseMonthly + option.paymentImpact
              : null;

          return (
            <Card
              key={option.code}
              className={cn(
                'relative border-2 transition hover:shadow-lg',
                isSelected ? 'border-primary shadow-primary/20' : 'border-border/70',
              )}
            >
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">Option {option.code}</CardTitle>
                  {isSelected ? (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" /> Selected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Circle className="h-4 w-4" /> Available
                    </Badge>
                  )}
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Monthly Payment</span>
                    <span className="font-semibold">{formatCurrency(monthlyPayment)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Change from base</span>
                    <span>{formatPaymentImpact(option.paymentImpact)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Total Investment</span>
                    <span>{formatCurrency(option.totalRetail)}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {option.products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-start justify-between gap-3 rounded-lg border border-border/60 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.provider}</p>
                      </div>
                      <Button variant="link" size="sm" onClick={() => openProductModal(option.code as MenuOptionCode, product)}>
                        Details
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full"
                  disabled={selectOptionMutation.isPending}
                  onClick={() => handleSelectOption(option.code as MenuOptionCode)}
                >
                  {isSelected ? 'Selected' : 'Select Option'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Decline All Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              Customers can decline all F&amp;I products and proceed with the base payment.
            </p>
            <Button
              variant="outline"
              className="w-full"
              disabled={selectOptionMutation.isPending}
              onClick={() => handleSelectOption(null)}
            >
              Decline All Options
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }, [baseMonthly, menu, selectOptionMutation.isPending]);

  if (!dealId) {
    return (
      <div className="px-6 py-10">
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Deal identifier is required to present the finance menu.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-6 py-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setLocation(`/fi/deal-jackets/${dealId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Deal Jacket
        </Button>
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'manager' | 'customer')}>
          <TabsList>
            <TabsTrigger value="manager">Manager View</TabsTrigger>
            <TabsTrigger value="customer">Customer View</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Finance Menu Presentation</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Build finance menu options, review payment impact, and capture customer selections to keep the deal jacket in sync.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : isError || !menu ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Unable to load finance menu configuration. Please try again later.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Info className="h-5 w-5" /> Deal Financing Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs uppercase text-muted-foreground">Base Monthly Payment</p>
                <p className="text-base font-semibold">{formatCurrency(menu.baseMonthlyPayment)}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Amount Financed</p>
                <p className="text-base font-semibold">{formatCurrency(menu.baseAmountFinanced)}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">APR</p>
                <p className="text-base font-semibold">{menu.apr !== null ? `${menu.apr.toFixed(2)}%` : '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Term</p>
                <p className="text-base font-semibold">
                  {menu.term !== null ? `${menu.term} months` : '—'}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">{viewMode === 'manager' ? managerView : customerView}</div>
        </div>
      )}

      <Dialog open={Boolean(productModal)} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{activeProduct?.name ?? 'Product Details'}</DialogTitle>
            <DialogDescription>
              Review coverage information with the customer before adding the option to their deal.
            </DialogDescription>
          </DialogHeader>
          {activeProduct ? (
            <ScrollArea className="max-h-80 pr-4">
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Provider</p>
                  <p className="font-medium">{activeProduct.provider}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Category</p>
                  <p>{activeProduct.category}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Retail Price</p>
                  <p className="font-medium">{formatCurrency(activeProduct.retailPrice)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Description</p>
                  <p className="text-muted-foreground">{activeProduct.description}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Coverage Details</p>
                  <pre className="whitespace-pre-wrap rounded-md bg-muted/60 p-3 text-xs">
                    {JSON.stringify(activeProduct.coverageDetails, null, 2)}
                  </pre>
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">Loading product details…</div>
          )}
          <div className="mt-4 flex justify-end">
            <Button
              onClick={() =>
                productModal && handleSelectOption(productModal.optionCode)
              }
              disabled={selectOptionMutation.isPending}
            >
              Add Option {productModal?.optionCode ?? ''} to My Deal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
