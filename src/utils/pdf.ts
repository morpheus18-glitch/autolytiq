import PDFDocument from 'pdfkit';
import type { DealStructure, GrossCalculation, PaymentCalculation } from '../domain/desking/types.js';

type PdfDoc = InstanceType<typeof PDFDocument>;

export interface WorksheetPrintPayload {
  readonly dealId: string;
  readonly worksheetId: string;
  readonly customerName: string;
  readonly vehicle: {
    vin: string;
    year: number;
    make: string;
    model: string;
    trim?: string | null;
    stockNumber?: string | null;
  };
  readonly salesperson?: string | null;
  readonly structure: DealStructure;
  readonly payment: PaymentCalculation;
  readonly gross?: GrossCalculation | null;
  readonly totals: Record<string, unknown>;
  readonly versionLabel?: string | null;
}

function formatCurrency(value: number | undefined | null) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function writeSectionTitle(doc: PdfDoc, title: string) {
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').fontSize(12).text(title);
  doc.moveDown(0.25);
  doc.strokeColor('#d0d0d0').lineWidth(1).moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
  doc.moveDown(0.35);
  doc.font('Helvetica').fontSize(10);
}

function writeKeyValue(doc: PdfDoc, label: string, value: string | number) {
  doc.font('Helvetica-Bold').text(`${label}:`, { continued: true });
  doc.font('Helvetica').text(` ${value}`);
}

export async function renderWorksheetPreview(payload: WorksheetPrintPayload): Promise<Buffer> {
  const doc: PdfDoc = new PDFDocument({ margin: 48, size: 'LETTER' });
  const chunks: Buffer[] = [];

  doc.on('data', (chunk: Buffer) => {
    chunks.push(chunk);
  });

  const completion = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  doc.font('Helvetica-Bold').fontSize(18).text('Deal Worksheet', { align: 'left' });
  doc.font('Helvetica').fontSize(10).text(`Deal ID: ${payload.dealId}`);
  doc.text(`Worksheet: ${payload.worksheetId}`);
  if (payload.versionLabel) {
    doc.text(`Version: ${payload.versionLabel}`);
  }

  doc.moveDown();
  writeSectionTitle(doc, 'Customer & Vehicle');
  writeKeyValue(doc, 'Customer', payload.customerName);
  writeKeyValue(doc, 'Salesperson', payload.salesperson ?? 'Unassigned');
  writeKeyValue(doc, 'Vehicle', `${payload.vehicle.year} ${payload.vehicle.make} ${payload.vehicle.model}${payload.vehicle.trim ? ` ${payload.vehicle.trim}` : ''}`);
  writeKeyValue(doc, 'VIN', payload.vehicle.vin);
  if (payload.vehicle.stockNumber) {
    writeKeyValue(doc, 'Stock #', payload.vehicle.stockNumber);
  }

  writeSectionTitle(doc, 'Payment Summary');
  writeKeyValue(doc, 'Amount Financed', formatCurrency(payload.payment.amountFinanced));
  writeKeyValue(doc, 'APR', `${(payload.payment.apr * 100).toFixed(2)}%`);
  writeKeyValue(doc, 'Term', `${payload.payment.termMonths} months`);
  writeKeyValue(doc, 'Monthly Payment', formatCurrency(payload.payment.monthlyPayment));
  if (payload.payment.dueAtSigning) {
    writeKeyValue(doc, 'Due at Signing', formatCurrency(payload.payment.dueAtSigning));
  }

  writeSectionTitle(doc, 'Deal Structure');
  writeKeyValue(doc, 'Sale Price', formatCurrency(payload.structure.pricing.salePrice));
  if (payload.structure.pricing.msrp) {
    writeKeyValue(doc, 'MSRP', formatCurrency(payload.structure.pricing.msrp));
  }
  if (payload.structure.trade?.allowance) {
    writeKeyValue(doc, 'Trade Allowance', formatCurrency(payload.structure.trade.allowance));
  }
  if (payload.structure.trade?.payoff) {
    writeKeyValue(doc, 'Trade Payoff', formatCurrency(payload.structure.trade.payoff));
  }
  if (payload.structure.cashDown?.total) {
    writeKeyValue(doc, 'Cash Down', formatCurrency(payload.structure.cashDown.total));
  }

  if (payload.structure.backendProducts?.length) {
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('Backend Products');
    doc.font('Helvetica');
    payload.structure.backendProducts.forEach((product) => {
      doc.text(`• ${product.name} (${product.code}) — ${formatCurrency(product.price)}`);
    });
  }

  if (payload.structure.fees.length) {
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('Fees');
    doc.font('Helvetica');
    payload.structure.fees.forEach((fee) => {
      doc.text(`• ${fee.label} (${fee.code}) — ${formatCurrency(fee.amount)}`);
    });
  }

  writeSectionTitle(doc, 'Financial Summary');
  Object.entries(payload.totals).forEach(([key, value]) => {
    if (typeof value === 'number') {
      writeKeyValue(doc, key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()), formatCurrency(value));
    }
  });

  if (payload.gross) {
    writeSectionTitle(doc, 'Gross Breakdown');
    writeKeyValue(doc, 'Front-End Gross', formatCurrency(payload.gross.frontEnd));
    writeKeyValue(doc, 'Back-End Gross', formatCurrency(payload.gross.backEnd));
    if (payload.gross.financeReserve) {
      writeKeyValue(doc, 'Finance Reserve', formatCurrency(payload.gross.financeReserve));
    }
    if (payload.gross.docFee) {
      writeKeyValue(doc, 'Doc Fee', formatCurrency(payload.gross.docFee));
    }
    if (payload.gross.pack) {
      writeKeyValue(doc, 'Pack', formatCurrency(payload.gross.pack));
    }
    writeKeyValue(doc, 'Total Gross', formatCurrency(payload.gross.total));
  }

  doc.end();

  return completion;
}
