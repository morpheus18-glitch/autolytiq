/**
 * Generate PII-safe deal summary for pasting into customer chat
 *
 * Sanitizes sensitive information while preserving deal structure
 * Used by "Paste to Chat" feature in Deal Studio
 */

import type { DealStructure, PaymentCalculation } from '@/contexts/DealStudioContext';

export interface ChatSummaryOptions {
  /** Include F&I products in summary */
  includeFI?: boolean;
  /** Include trade-in details */
  includeTrade?: boolean;
  /** Format style */
  format?: 'detailed' | 'compact';
}

/**
 * Generate customer-safe deal summary (no PII, no internal profit data)
 */
export function generateChatSummary(
  deal: DealStructure,
  payment: PaymentCalculation | null,
  options: ChatSummaryOptions = {}
): string {
  const {
    includeFI = true,
    includeTrade = true,
    format = 'detailed',
  } = options;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const lines: string[] = [];

  if (format === 'detailed') {
    lines.push('🚗 Deal Structure Summary');
    lines.push('');
    lines.push(`💰 Sale Price: ${formatCurrency(deal.salePrice)}`);
    lines.push(`⬇️  Down Payment: ${formatCurrency(deal.downPayment)}`);
    lines.push('');
    lines.push(`📅 Term: ${deal.term} months`);
    lines.push(`📊 APR: ${deal.apr.toFixed(2)}%`);
    lines.push('');

    if (payment) {
      lines.push(`✨ Monthly Payment: ${formatCurrency(payment.monthlyPayment)}`);
      lines.push(`📈 Total Amount Financed: ${formatCurrency(payment.amountFinanced)}`);
      lines.push('');
    }

    // Trade-in (if applicable)
    if (includeTrade && (deal.tradeValue > 0 || deal.tradePayoff > 0)) {
      const netTrade = deal.tradeValue - deal.tradePayoff;
      lines.push('🔄 Trade-In');
      lines.push(`  Value: ${formatCurrency(deal.tradeValue)}`);
      if (deal.tradePayoff > 0) {
        lines.push(`  Payoff: ${formatCurrency(deal.tradePayoff)}`);
        lines.push(`  Net: ${formatCurrency(netTrade)}`);
      }
      lines.push('');
    }

    // F&I Products
    if (includeFI) {
      const fiProducts: string[] = [];
      if (deal.warranty > 0) fiProducts.push(`Extended Warranty (${formatCurrency(deal.warranty)})`);
      if (deal.gap > 0) fiProducts.push(`GAP Insurance (${formatCurrency(deal.gap)})`);
      if (deal.maintenance > 0) fiProducts.push(`Maintenance Plan (${formatCurrency(deal.maintenance)})`);
      if (deal.paintProtection > 0) fiProducts.push(`Paint Protection (${formatCurrency(deal.paintProtection)})`);

      if (fiProducts.length > 0) {
        lines.push('🛡️  Protection Products');
        fiProducts.forEach((product) => {
          lines.push(`  • ${product}`);
        });
        lines.push('');
      }
    }

    lines.push('---');
    lines.push('Let me know if you have any questions! 😊');
  } else {
    // Compact format
    lines.push(`${formatCurrency(deal.salePrice)} @ ${deal.apr.toFixed(2)}% for ${deal.term} mos`);
    lines.push(`Down: ${formatCurrency(deal.downPayment)}`);
    if (payment) {
      lines.push(`Payment: ${formatCurrency(payment.monthlyPayment)}/mo`);
    }

    if (includeTrade && deal.tradeValue > 0) {
      const netTrade = deal.tradeValue - deal.tradePayoff;
      lines.push(`Trade: ${formatCurrency(netTrade)}`);
    }

    if (includeFI) {
      const fiCount = [deal.warranty, deal.gap, deal.maintenance, deal.paintProtection].filter((x) => x > 0).length;
      if (fiCount > 0) {
        lines.push(`Includes ${fiCount} protection product${fiCount > 1 ? 's' : ''}`);
      }
    }
  }

  return lines.join('\n');
}

/**
 * Generate SMS-safe compact summary (160 char limit)
 */
export function generateSMSSummary(
  deal: DealStructure,
  payment: PaymentCalculation | null
): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!payment) {
    return `${formatCurrency(deal.salePrice)}, ${formatCurrency(deal.downPayment)} down, ${deal.term}mo @ ${deal.apr.toFixed(2)}%`;
  }

  return `${formatCurrency(payment.monthlyPayment)}/mo: ${formatCurrency(deal.salePrice)}, ${formatCurrency(deal.downPayment)} down, ${deal.term}mo @ ${deal.apr.toFixed(2)}%`;
}

/**
 * Generate email-safe summary with HTML formatting
 */
export function generateEmailSummary(
  deal: DealStructure,
  payment: PaymentCalculation | null
): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const lines: string[] = [];

  lines.push('<div style="font-family: Arial, sans-serif; max-width: 600px;">');
  lines.push('<h2 style="color: #2563eb;">Vehicle Deal Summary</h2>');
  lines.push('<table style="width: 100%; border-collapse: collapse;">');

  const addRow = (label: string, value: string, bold = false) => {
    lines.push('<tr style="border-bottom: 1px solid #e5e7eb;">');
    lines.push(`<td style="padding: 12px 8px; color: #6b7280;">${label}</td>`);
    lines.push(`<td style="padding: 12px 8px; text-align: right; ${bold ? 'font-weight: bold; font-size: 18px;' : ''} color: #111827;">${value}</td>`);
    lines.push('</tr>');
  };

  addRow('Sale Price', formatCurrency(deal.salePrice));
  addRow('Down Payment', formatCurrency(deal.downPayment));
  addRow('Term', `${deal.term} months`);
  addRow('APR', `${deal.apr.toFixed(2)}%`);

  if (payment) {
    addRow('Monthly Payment', formatCurrency(payment.monthlyPayment), true);
  }

  if (deal.tradeValue > 0) {
    const netTrade = deal.tradeValue - deal.tradePayoff;
    addRow('Trade-In Value', formatCurrency(netTrade));
  }

  lines.push('</table>');

  // F&I Products
  const fiProducts: string[] = [];
  if (deal.warranty > 0) fiProducts.push(`Extended Warranty (${formatCurrency(deal.warranty)})`);
  if (deal.gap > 0) fiProducts.push(`GAP Insurance (${formatCurrency(deal.gap)})`);
  if (deal.maintenance > 0) fiProducts.push(`Maintenance Plan (${formatCurrency(deal.maintenance)})`);
  if (deal.paintProtection > 0) fiProducts.push(`Paint Protection (${formatCurrency(deal.paintProtection)})`);

  if (fiProducts.length > 0) {
    lines.push('<h3 style="color: #2563eb; margin-top: 24px;">Protection Products</h3>');
    lines.push('<ul style="color: #374151;">');
    fiProducts.forEach((product) => {
      lines.push(`<li style="margin-bottom: 8px;">${product}</li>`);
    });
    lines.push('</ul>');
  }

  lines.push('<p style="color: #6b7280; font-size: 14px; margin-top: 24px;">');
  lines.push('Please let me know if you have any questions about this proposal.');
  lines.push('</p>');
  lines.push('</div>');

  return lines.join('\n');
}
