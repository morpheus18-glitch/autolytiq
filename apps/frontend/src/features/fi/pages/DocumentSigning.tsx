import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui';
import { Button } from '@repo/ui';
import { Input } from '@repo/ui';
import { Label } from '@repo/ui';
import { Textarea } from '@repo/ui';
import { Badge } from '@repo/ui';
import { useToast } from '@repo/ui';
import type { ContractDto, ContractSignerDto, SendContractsPayload } from '../api';
import { sendContracts } from '../api';

interface DocumentSigningProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealId: string;
  contracts: ContractDto[];
  onSent: () => void;
}

function buildInitialSigners(contracts: ContractDto[]): ContractSignerDto[] {
  if (!contracts.length) {
    return [];
  }

  const contractWithSigners = contracts.find((contract) => contract.signers?.length) ?? contracts[0];
  const signers = (contractWithSigners.signers ?? []).map((signer, index) => ({
    ...signer,
    routingOrder: signer.routingOrder ?? index + 1,
  }));

  if (!signers.length) {
    const defaultRole = contracts.length > 1 ? 'BUYER' : 'SIGNER';
    return [
      {
        name: '',
        email: '',
        role: defaultRole,
        roleLabel: defaultRole === 'BUYER' ? 'Buyer' : 'Signer',
        routingOrder: 1,
      },
    ];
  }

  return signers;
}

export default function DocumentSigning({ open, onOpenChange, dealId, contracts, onSent }: DocumentSigningProps) {
  const { toast } = useToast();
  const [signers, setSigners] = useState<ContractSignerDto[]>(() => buildInitialSigners(contracts));
  const [message, setMessage] = useState('');

  const contractIds = useMemo(() => contracts.map((contract) => contract.id), [contracts]);

  useEffect(() => {
    if (open) {
      setSigners(buildInitialSigners(contracts));
      setMessage('');
    }
  }, [open, contracts]);

  const mutation = useMutation({
    mutationFn: async (payload: SendContractsPayload) => sendContracts(payload),
    onSuccess: (result) => {
      toast({
        title: 'Contracts sent for signature',
        description: `Envelope ${result.envelopeId} dispatched to recipients`,
      });
      onSent();
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to send contracts for signature';
      toast({ title: 'Send failed', description: message, variant: 'destructive' });
    },
  });

  const handleSignerChange = (index: number, key: keyof ContractSignerDto, value: string) => {
    setSigners((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [key]: key === 'routingOrder' ? Number(value) || 1 : value,
      };
      return next;
    });
  };

  const handleAddSigner = () => {
    setSigners((prev) => [
      ...prev,
      {
        name: '',
        email: '',
        role: 'SIGNER',
        roleLabel: 'Signer',
        routingOrder: prev.length + 1,
      },
    ]);
  };

  const handleRemoveSigner = (index: number) => {
    setSigners((prev) => prev.filter((_, idx) => idx !== index).map((signer, idx) => ({ ...signer, routingOrder: idx + 1 })));
  };

  const hasValidSigners = signers.length > 0 && signers.every((signer) => signer.name.trim() && signer.email.trim());

  const handleSubmit = () => {
    if (!hasValidSigners) {
      toast({ title: 'Missing signer details', description: 'Each signer requires a name and email address.', variant: 'destructive' });
      return;
    }

    mutation.mutate({ dealId, contractIds, signers, message: message.trim() || undefined });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send for Signature</DialogTitle>
          <DialogDescription>
            {contracts.length === 1
              ? `The document “${contracts[0]?.name ?? 'Contract'}” will be sent to the recipients below.`
              : `${contracts.length} documents will be sent as a single DocuSign envelope.`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {contracts.map((contract) => (
              <Badge key={contract.id} variant="outline" className="px-2 py-1 text-xs font-medium">
                {contract.name}
              </Badge>
            ))}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground">Recipients</h4>
              <Button variant="outline" size="sm" onClick={handleAddSigner} disabled={mutation.isPending}>
                <Plus className="mr-2 h-4 w-4" /> Add Signer
              </Button>
            </div>
            <div className="space-y-4">
              {signers.map((signer, index) => (
                <div key={index} className="grid gap-3 rounded-lg border border-dashed border-border/60 p-4">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor={`signer-name-${index}`}>Name</Label>
                      <Input
                        id={`signer-name-${index}`}
                        value={signer.name}
                        onChange={(event) => handleSignerChange(index, 'name', event.target.value)}
                        placeholder="Full name"
                        disabled={mutation.isPending}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`signer-email-${index}`}>Email</Label>
                      <Input
                        id={`signer-email-${index}`}
                        type="email"
                        value={signer.email}
                        onChange={(event) => handleSignerChange(index, 'email', event.target.value)}
                        placeholder="name@example.com"
                        disabled={mutation.isPending}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="space-y-1">
                      <Label htmlFor={`signer-role-${index}`}>Role</Label>
                      <Input
                        id={`signer-role-${index}`}
                        value={signer.role}
                        onChange={(event) => handleSignerChange(index, 'role', event.target.value.toUpperCase())}
                        placeholder="BUYER"
                        disabled={mutation.isPending}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`signer-label-${index}`}>Role Label</Label>
                      <Input
                        id={`signer-label-${index}`}
                        value={signer.roleLabel ?? ''}
                        onChange={(event) => handleSignerChange(index, 'roleLabel', event.target.value)}
                        placeholder="Buyer"
                        disabled={mutation.isPending}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`signer-order-${index}`}>Routing Order</Label>
                      <Input
                        id={`signer-order-${index}`}
                        type="number"
                        min={1}
                        value={signer.routingOrder ?? index + 1}
                        onChange={(event) => handleSignerChange(index, 'routingOrder', event.target.value)}
                        disabled={mutation.isPending}
                      />
                    </div>
                  </div>
                  {signers.length > 1 && (
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleRemoveSigner(index)}
                        disabled={mutation.isPending}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Remove
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="signing-message">Message to recipients</Label>
            <Textarea
              id="signing-message"
              placeholder="Optional instructions for the customer"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              disabled={mutation.isPending}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!hasValidSigners || mutation.isPending} className="min-w-[120px]">
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending
              </>
            ) : (
              'Send Envelope'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
