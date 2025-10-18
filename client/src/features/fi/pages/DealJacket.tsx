import { useCallback, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  CalendarDays,
  Download,
  Eye,
  FileText,
  ShieldCheck,
  Trash,
  Upload,
  Users,
  Wallet,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import DealStatusBadge from '../components/DealStatusBadge';
import DocumentViewer from '../components/DocumentViewer';
import {
  DealDocumentDto,
  DealJacketDto,
  deleteDealDocument,
  fetchDealJacket,
  listDealDocuments,
  updateDealJacket,
  uploadDealDocument,
} from '../api';
import { cn } from '@/lib/utils';

const documentTypeOptions = [
  { label: 'Contract', value: 'contract' },
  { label: 'Credit Application', value: 'credit' },
  { label: 'Compliance', value: 'compliance' },
  { label: 'Funding', value: 'funding' },
  { label: 'Other', value: 'other' },
];

const documentCategoryOptions = ['Contracts', 'Credit', 'Compliance', 'Funding', 'Other'];

function formatCurrency(value?: string | null) {
  if (!value) return '—';
  const number = Number(value);
  if (Number.isNaN(number)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(number);
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function groupDocuments(documents: DealDocumentDto[]) {
  const map = new Map<string, DealDocumentDto[]>();
  for (const doc of documents) {
    const key = doc.category || 'Other';
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(doc);
  }
  return Array.from(map.entries()).map(([category, docs]) => ({
    category,
    documents: docs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()),
  }));
}

export default function DealJacketPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeTab, setActiveTab] = useState('documents');
  const [viewerDocument, setViewerDocument] = useState<DealDocumentDto | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DealDocumentDto | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedType, setSelectedType] = useState('contract');
  const [selectedCategory, setSelectedCategory] = useState('Contracts');
  const [documentName, setDocumentName] = useState('');

  const {
    data: deal,
    isLoading: dealLoading,
    isError,
  } = useQuery<DealJacketDto>({
    queryKey: ['fi', 'deal', id],
    queryFn: () => fetchDealJacket(id!),
    enabled: Boolean(id),
  });

  const {
    data: documents = [],
    isLoading: documentsLoading,
  } = useQuery<DealDocumentDto[]>({
    queryKey: ['fi', 'deal', id, 'documents'],
    queryFn: () => listDealDocuments(id!),
    enabled: Boolean(id),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<Record<string, unknown>>) => updateDealJacket(id!, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(['fi', 'deal', id], updated);
      toast({ title: 'Deal updated' });
    },
    onError: (error: any) => {
      toast({
        title: 'Unable to update deal',
        description: error?.message ?? 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      uploadDealDocument(id!, {
        file,
        type: selectedType,
        category: selectedCategory,
        name: documentName.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fi', 'deal', id, 'documents'] });
      setDocumentName('');
      toast({ title: 'Document uploaded' });
    },
    onError: (error: any) => {
      toast({
        title: 'Upload failed',
        description: error?.message ?? 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => deleteDealDocument(id!, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fi', 'deal', id, 'documents'] });
      toast({ title: 'Document removed' });
    },
    onError: (error: any) => {
      toast({
        title: 'Unable to remove document',
        description: error?.message ?? 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });

  const groupedDocuments = useMemo(() => groupDocuments(documents), [documents]);

  const handleBack = useCallback(() => {
    setLocation('/finance');
  }, [setLocation]);

  const handleFileSelection = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      const file = files[0];
      uploadMutation.mutate(file);
    },
    [uploadMutation],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      handleFileSelection(event.dataTransfer.files);
    },
    [handleFileSelection],
  );

  const handleDelete = useCallback(() => {
    if (!pendingDelete) return;
    deleteMutation.mutate(pendingDelete.id);
    setPendingDelete(null);
  }, [deleteMutation, pendingDelete]);

  if (dealLoading) {
    return (
      <div className="space-y-6 px-6 py-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-12">
          <Skeleton className="h-[400px] rounded-lg lg:col-span-4" />
          <Skeleton className="h-[400px] rounded-lg lg:col-span-8" />
        </div>
      </div>
    );
  }

  if (isError || !deal) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground" />
        <div>
          <h2 className="text-lg font-semibold">Deal not found</h2>
          <p className="text-sm text-muted-foreground">The requested deal jacket could not be located.</p>
        </div>
        <Button onClick={handleBack}>Return to F&amp;I dashboard</Button>
      </div>
    );
  }

  const fiProducts = Array.isArray(deal.fiProducts) ? (deal.fiProducts as any[]) : [];

  return (
    <div className="space-y-6 px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" onClick={handleBack} className="inline-flex items-center gap-2 px-0 text-sm">
            <ArrowLeft className="h-4 w-4" /> Back to F&amp;I dashboard
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">Deal #{deal.dealNumber}</h1>
            <DealStatusBadge status={deal.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {deal.customer.firstName} {deal.customer.lastName} · {deal.vehicle.year} {deal.vehicle.make} {deal.vehicle.model}
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" /> Deal: {formatDate(deal.dealDate)}
            </span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Contract: {formatDate(deal.contractDate)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Wallet className="h-3.5 w-3.5" /> Funded: {formatDate(deal.fundedDate)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => updateMutation.mutate({ status: 'Funded' })}>
            Mark as Funded
          </Button>
          <Button onClick={() => updateMutation.mutate({ status: 'Delivered' })}>Mark Delivered</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" /> Customer &amp; Team
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">Customer</h3>
                <p className="mt-1 font-medium">
                  {deal.customer.firstName} {deal.customer.lastName}
                </p>
                {deal.customer.email && <p className="text-muted-foreground">{deal.customer.email}</p>}
              </div>
              <div className="grid gap-3">
                <div>
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground">Salesperson</h3>
                  <p className="mt-1 text-sm">
                    {deal.salesperson.firstName} {deal.salesperson.lastName}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground">F&amp;I Manager</h3>
                  <p className="mt-1 text-sm">
                    {deal.fiManager
                      ? `${deal.fiManager.firstName} ${deal.fiManager.lastName}`
                      : 'Not assigned'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" /> Vehicle &amp; Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">Vehicle</h3>
                <p className="mt-1 font-medium">
                  {deal.vehicle.year} {deal.vehicle.make} {deal.vehicle.model}
                </p>
                {deal.vehicle.vin && <p className="text-muted-foreground">VIN: {deal.vehicle.vin}</p>}
              </div>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Sale Price</span>
                  <span className="font-medium">{formatCurrency(deal.sellingPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cash Down</span>
                  <span className="font-medium">{formatCurrency(deal.cashDown)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount Financed</span>
                  <span className="font-medium">{formatCurrency(deal.amountFinanced)}</span>
                </div>
                <div className="flex justify-between">
                  <span>APR</span>
                  <span className="font-medium">{deal.apr ? `${Number(deal.apr).toFixed(2)}%` : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Term</span>
                  <span className="font-medium">{deal.term ? `${deal.term} mo` : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment</span>
                  <span className="font-medium">{formatCurrency(deal.monthlyPayment)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wallet className="h-4 w-4" /> F&amp;I Products
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {fiProducts.length ? (
                <ul className="space-y-2">
                  {fiProducts.map((product: any, index: number) => (
                    <li key={`${product.name}-${index}`} className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2">
                      <div>
                        <p className="font-medium">{product.name ?? 'Accessory'}</p>
                        {product.termMonths && (
                          <p className="text-xs text-muted-foreground">{product.termMonths} months</p>
                        )}
                      </div>
                      <div className="text-right">
                        {product.price && <p className="font-semibold">{formatCurrency(String(product.price))}</p>}
                        {product.cost && (
                          <p className="text-xs text-muted-foreground">Cost {formatCurrency(String(product.cost))}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No F&amp;I products added yet.</p>
              )}
              <div className="flex justify-between text-sm font-medium">
                <span>Total F&amp;I Gross</span>
                <span>{formatCurrency(deal.totalFiGross)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex flex-wrap justify-start gap-2">
              <TabsTrigger value="credit">Credit</TabsTrigger>
              <TabsTrigger value="lenders">Lenders</TabsTrigger>
              <TabsTrigger value="menu">Menu</TabsTrigger>
              <TabsTrigger value="contracts">Contracts</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="funding">Funding</TabsTrigger>
            </TabsList>
            <TabsContent value="credit" className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
              Credit workflows coming soon.
            </TabsContent>
            <TabsContent value="lenders" className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
              Lender submissions and decisions will appear here.
            </TabsContent>
            <TabsContent value="menu" className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
              Build out menu presentations for customers.
            </TabsContent>
            <TabsContent value="contracts" className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
              Digital contracting integrations will live here.
            </TabsContent>
            <TabsContent value="funding" className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
              Track funding checklist completion and lender stipulations.
            </TabsContent>
            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Upload className="h-4 w-4" /> Upload Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="document-type">Document Type</Label>
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger id="document-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {documentTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="document-category">Category</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger id="document-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {documentCategoryOptions.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="document-name">Display Name</Label>
                      <Input
                        id="document-name"
                        placeholder="Retail Installment Contract"
                        value={documentName}
                        onChange={(event) => setDocumentName(event.target.value)}
                      />
                    </div>
                  </div>
                  <div
                    onDragOver={(event) => {
                      event.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={cn(
                      'flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/40 bg-muted/30 px-6 py-12 text-center transition',
                      isDragging && 'border-primary bg-primary/5',
                    )}
                  >
                    <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium">Drag &amp; drop to upload</p>
                    <p className="text-xs text-muted-foreground">PDF, PNG, or JPG up to 50MB</p>
                    <div className="mt-4 flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploadMutation.isPending}
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-2"
                      >
                        <Upload className="h-4 w-4" /> Choose file
                      </Button>
                      {uploadMutation.isPending && <span className="text-xs text-muted-foreground">Uploading…</span>}
                    </div>
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={(event) => handleFileSelection(event.target.files)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Deal Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  {documentsLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-16 rounded-md" />
                      <Skeleton className="h-16 rounded-md" />
                    </div>
                  ) : groupedDocuments.length ? (
                    <div className="space-y-6">
                      {groupedDocuments.map(({ category, documents: docs }) => (
                        <div key={category} className="space-y-3">
                          <h3 className="text-sm font-semibold text-muted-foreground">{category}</h3>
                          <div className="space-y-3">
                            {docs.map((document) => (
                              <div
                                key={document.id}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card/60 px-4 py-3"
                              >
                                <div>
                                  <p className="font-medium">{document.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Uploaded {formatDate(document.uploadedAt)} · {Math.round(document.fileSize / 1024)} KB
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="sm" onClick={() => setViewerDocument(document)} className="gap-2">
                                    <Eye className="h-4 w-4" /> View
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(document.downloadUrl ?? document.fileUrl, '_blank', 'noopener')}
                                    className="gap-2"
                                  >
                                    <Download className="h-4 w-4" /> Download
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => setPendingDelete(document)}
                                    disabled={deleteMutation.isPending}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                      <FileText className="h-8 w-8" />
                      <p>No documents have been uploaded yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <DocumentViewer
        open={Boolean(viewerDocument)}
        title={viewerDocument?.name ?? 'Document'}
        url={viewerDocument?.downloadUrl ?? viewerDocument?.fileUrl ?? ''}
        onOpenChange={(open) => !open && setViewerDocument(null)}
      />

      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove document?</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-muted-foreground">
            This document will be removed from the deal jacket and the underlying file will be deleted from storage.
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteMutation.isPending}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
