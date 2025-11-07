import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@repo/ui';
import { Badge } from '@repo/ui';
import { Button } from '@repo/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui';
import { Skeleton } from '@repo/ui';
import { useToast } from '@/hooks/use-toast';
import {
  CONTRACT_LABELS,
  REQUIRED_CONTRACT_TYPES,
  ContractDto,
  ContractStatus,
  ContractType,
  GenerateContractsPayload,
  fetchContractStatuses,
  generateContracts,
} from '../api';
import DocumentSigning from './DocumentSigning';
import { downloadContract as triggerDownload } from '../api';
import { cn } from '@/lib/utils';
import { AlertCircle, Download, FilePlus2, FileText, Loader2, RefreshCw, Send, ShieldCheck } from 'lucide-react';

const OPTIONAL_CONTRACT_TYPES: ContractType[] = ['VSC', 'GAP', 'TIRE_WHEEL', 'ODOMETER', 'TRADE_IN'];
const STATUS_LABELS: Record<ContractStatus, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  VIEWED: 'Viewed',
  SIGNED: 'Signed',
  COMPLETED: 'Completed',
  VOIDED: 'Voided',
};

const STATUS_STYLES: Record<ContractStatus, string> = {
  DRAFT: 'bg-muted text-muted-foreground border-border/60',
  SENT: 'bg-blue-100 text-blue-700 border-blue-200',
  VIEWED: 'bg-sky-100 text-sky-700 border-sky-200',
  SIGNED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  VOIDED: 'bg-destructive/10 text-destructive border-destructive/50',
};

interface ProductContractsProps {
  dealId: string;
}

type ContractRow = {
  type: ContractType;
  label: string;
  required: boolean;
  contract: ContractDto | undefined;
};

export default function ProductContracts({ dealId }: ProductContractsProps) {
  const { toast } = useToast();
  const [signingContracts, setSigningContracts] = useState<ContractDto[]>([]);
  const [isSigningOpen, setSigningOpen] = useState(false);

  const {
    data: status,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['fi', 'contracts', dealId],
    queryFn: () => fetchContractStatuses(dealId),
    enabled: Boolean(dealId),
  });

  const generateMutation = useMutation({
    mutationFn: async (payload: GenerateContractsPayload) => generateContracts(payload),
    onSuccess: () => {
      toast({ title: 'Contracts generated', description: 'Documents have been created successfully.' });
      refetch();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to generate contracts';
      toast({ title: 'Generation failed', description: message, variant: 'destructive' });
    },
  });

  const contractMap = useMemo(() => {
    const map = new Map<ContractType, ContractDto>();
    status?.contracts.forEach((contract) => {
      map.set(contract.type, contract);
    });
    return map;
  }, [status]);

  const requiredRows: ContractRow[] = useMemo(
    () =>
      REQUIRED_CONTRACT_TYPES.map((type) => ({
        type,
        label: CONTRACT_LABELS[type],
        required: true,
        contract: contractMap.get(type),
      })),
    [contractMap],
  );

  const optionalRows: ContractRow[] = useMemo(
    () =>
      OPTIONAL_CONTRACT_TYPES.map((type) => ({
        type,
        label: CONTRACT_LABELS[type],
        required: false,
        contract: contractMap.get(type),
      })),
    [contractMap],
  );

  const handleGenerate = (types: ContractType[]) => {
    if (!types.length) {
      toast({ title: 'Nothing to generate', description: 'All selected contracts are already available.', variant: 'destructive' });
      return;
    }
    generateMutation.mutate({ dealId, contracts: types.map((type) => ({ type })) });
  };

  const handleGeneratePending = () => {
    const pendingTypes = requiredRows
      .filter((row) => !row.contract || (row.contract.status !== 'COMPLETED' && row.contract.status !== 'SIGNED'))
      .map((row) => row.type);
    const missingOptional = optionalRows.filter((row) => !row.contract).map((row) => row.type);
    handleGenerate([...new Set([...pendingTypes, ...missingOptional])]);
  };

  const handleOpenSigning = (contracts: ContractDto[]) => {
    if (!contracts.length) {
      toast({ title: 'No contracts selected', description: 'Generate documents before sending for signature.', variant: 'destructive' });
      return;
    }
    const withoutPdf = contracts.find((contract) => !contract.pdfUrl);
    if (withoutPdf) {
      toast({
        title: 'Missing PDF',
        description: `Regenerate ${withoutPdf.name} to create a PDF before sending.`,
        variant: 'destructive',
      });
      return;
    }
    setSigningContracts(contracts);
    setSigningOpen(true);
  };

  const pendingContracts = useMemo(
    () => status?.contracts.filter((contract) => contract.status === 'DRAFT' || contract.status === 'VIEWED') ?? [],
    [status],
  );

  const renderRow = (row: ContractRow) => {
    const statusLabel = row.contract ? STATUS_LABELS[row.contract.status] : 'Not generated';
    const statusClass = row.contract ? STATUS_STYLES[row.contract.status] : 'bg-slate-200 text-slate-700 border-slate-300';
    const lastUpdated = row.contract?.completedAt ?? row.contract?.signedAt ?? row.contract?.viewedAt ?? row.contract?.sentAt;

    return (
      <TableRow key={row.type} className="hover:bg-muted/40">
        <TableCell className="font-medium">
          <div>
            <div>{row.label}</div>
            <div className="text-xs text-muted-foreground">{row.required ? 'Required document' : 'Product document'}</div>
          </div>
        </TableCell>
        <TableCell className="w-40">
          <Badge variant="outline" className={cn('border', statusClass)}>
            {statusLabel}
          </Badge>
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {row.contract ? (lastUpdated ? new Date(lastUpdated).toLocaleString() : '—') : 'Not yet generated'}
        </TableCell>
        <TableCell className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleGenerate([row.type])}
            disabled={generateMutation.isPending || isFetching}
          >
            {generateMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FilePlus2 className="mr-2 h-4 w-4" />
            )}
            Generate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => (row.contract ? handleOpenSigning([row.contract]) : toast({
                  title: 'Contract not available',
                  description: 'Generate the document before sending for signature.',
                  variant: 'destructive',
                }))}
            disabled={!row.contract || isFetching}
          >
            <Send className="mr-2 h-4 w-4" /> Send
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => (row.contract?.pdfUrl ? window.open(row.contract.pdfUrl, '_blank', 'noopener,noreferrer') : toast({
                  title: 'No PDF available',
                  description: 'Generate the contract to preview the PDF.',
                  variant: 'destructive',
                }))}
            disabled={!row.contract?.pdfUrl}
          >
            <FileText className="mr-2 h-4 w-4" /> View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => (row.contract ? triggerDownload(row.contract.id) : toast({
                  title: 'Contract not available',
                  description: 'Generate the document before downloading.',
                  variant: 'destructive',
                }))}
            disabled={!row.contract}
          >
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
        </TableCell>
      </TableRow>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Contracts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {status?.allSigned ? (
        <Alert className="border-emerald-500/40 bg-emerald-50 text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>All required contracts signed</AlertTitle>
          <AlertDescription>
            Every required document has been signed. You may proceed to finalize the deal.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-amber-300 bg-amber-50 text-amber-700">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Pending signatures</AlertTitle>
          <AlertDescription>
            Generate and send outstanding contracts to unlock the “All Signed” milestone.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold">Required Contracts</h3>
          <p className="text-sm text-muted-foreground">Generate, send, and track signature status for the core deal documents.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleGeneratePending}
            disabled={generateMutation.isPending || isFetching}
          >
            {generateMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Generate Pending
          </Button>
          <Button
            onClick={() => handleOpenSigning(pendingContracts)}
            disabled={!pendingContracts.length}
          >
            <Send className="mr-2 h-4 w-4" /> Send Pending
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="w-[420px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{requiredRows.map(renderRow)}</TableBody>
          </Table>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-base font-semibold">Product Contracts</h3>
        <p className="text-sm text-muted-foreground">
          Generate ancillary product agreements for optional protections selected on the deal.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="w-[420px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{optionalRows.map(renderRow)}</TableBody>
          </Table>
        </CardContent>
      </Card>

      <DocumentSigning
        open={isSigningOpen}
        onOpenChange={setSigningOpen}
        dealId={dealId}
        contracts={signingContracts}
        onSent={() => {
          refetch();
          setSigningContracts([]);
        }}
      />
    </div>
  );
}
