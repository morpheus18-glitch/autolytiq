import * as React from 'react';
import { Button } from '@repo/ui';

export interface PaymentPanelProps {
  dealId: string;
  lockedPayment: number | null;
  onLockPayment: (payment: number) => void;
  onUnlockPayment: () => void;
}

export function PaymentPanel({
  dealId,
  lockedPayment,
  onLockPayment,
  onUnlockPayment
}: PaymentPanelProps) {
  const [targetPayment, setTargetPayment] = React.useState<number>(500);

  const handleLock = () => {
    onLockPayment(targetPayment);
  };

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">Payment Simulator</h3>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-text-secondary block mb-1">
            Target Payment
          </label>
          <input
            type="number"
            value={targetPayment}
            onChange={(e) => setTargetPayment(Number(e.target.value))}
            className="w-full px-3 py-2 border border-border-base rounded text-sm"
            disabled={lockedPayment !== null}
          />
        </div>

        {lockedPayment !== null ? (
          <div className="bg-accent-primary/10 border border-accent-primary/20 rounded p-3">
            <p className="text-xs font-medium text-accent-primary mb-1">
              Payment Locked: ${lockedPayment}/mo
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={onUnlockPayment}
            >
              Unlock
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="primary"
            onClick={handleLock}
          >
            Lock Payment
          </Button>
        )}

        <div className="text-xs text-text-secondary pt-2">
          <p>• Sliders for down payment, term, rate (not implemented)</p>
          <p>• Real-time Rust calculation (not wired)</p>
          <p>• "Stage This Deal" button (not implemented)</p>
        </div>
      </div>
    </div>
  );
}
