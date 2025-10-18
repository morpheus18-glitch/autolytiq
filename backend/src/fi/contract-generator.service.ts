import PDFDocument from 'pdfkit';
import { uploadBufferToS3, buildContractDocumentKey } from '../lib/storage/s3.js';
import { getContractDisplayName, type ContractType, type ContractSigner } from './contracts.types.js';

export interface ContractPricingSummary {
  sellingPrice: number;
  cashDown: number;
  tradeValue?: number | null;
  tradePayoff?: number | null;
  amountFinanced: number;
  apr?: number | null;
  termMonths?: number | null;
  monthlyPayment?: number | null;
  fees?: Array<{ label: string; amount: number }>;
  products?: Array<{ name: string; price: number; provider?: string | null }>;
}

export interface ContractVehicleSummary {
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  mileage?: number | null;
  stockNumber?: string | null;
}

export interface ContractCustomerSummary {
  fullName: string;
  email?: string | null;
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
}

export interface ContractDealContext {
  contractId: string;
  tenantId: string;
  dealId: string;
  dealNumber: string;
  type: ContractType;
  name: string;
  generatedBy: string;
  signers: ContractSigner[];
  pricing: ContractPricingSummary;
  vehicle: ContractVehicleSummary;
  customer: ContractCustomerSummary;
  coBuyer?: ContractCustomerSummary | null;
  lenderName?: string | null;
  contractData?: Record<string, unknown>;
}

interface PdfGenerationResult {
  key: string;
  url: string;
  buffer: Buffer;
}

async function renderPdf(context: ContractDealContext): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'LETTER', margin: 36 });
  const chunks: Buffer[] = [];

  doc.on('data', (chunk) => chunks.push(chunk as Buffer));

  const title = getContractDisplayName(context.type);

  doc.font('Helvetica-Bold').fontSize(18).text(title, { align: 'center' });
  doc.moveDown();

  doc
    .fontSize(10)
    .font('Helvetica')
    .text(`Contract ID: ${context.contractId}`)
    .text(`Deal Number: ${context.dealNumber}`)
    .text(`Generated: ${new Date().toLocaleString('en-US')}`)
    .text(`Prepared By: ${context.generatedBy}`);

  doc.moveDown();

  renderSection(doc, 'Buyer Information', buildCustomerBlock(context.customer));
  if (context.coBuyer) {
    renderSection(doc, 'Co-Buyer Information', buildCustomerBlock(context.coBuyer));
  }

  renderSection(doc, 'Vehicle', buildVehicleBlock(context.vehicle));
  renderSection(doc, 'Financing', buildPricingBlock(context.pricing));

  if (context.contractData && Object.keys(context.contractData).length > 0) {
    renderSection(doc, 'Additional Terms', context.contractData);
  }

  renderSignerSection(doc, context.signers);

  doc.end();

  return await new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (error) => reject(error));
  });
}

function renderSection(doc: PDFKit.PDFDocument, title: string, data: Record<string, unknown>) {
  doc
    .moveDown(0.5)
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor('#1f2933')
    .text(title)
    .moveDown(0.25)
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#111827');

  const entries = Object.entries(data);
  for (const [label, value] of entries) {
    if (value === undefined || value === null || value === '') continue;
    if (typeof value === 'object' && !Array.isArray(value)) {
      doc.font('Helvetica-Bold').text(label);
      renderNestedObject(doc, value as Record<string, unknown>);
      doc.moveDown(0.1);
      continue;
    }

    doc
      .font('Helvetica-Bold')
      .text(`${label}: `, { continued: true })
      .font('Helvetica')
      .text(String(value));
  }
}

function renderNestedObject(doc: PDFKit.PDFDocument, data: Record<string, unknown>, indent = 20) {
  const entries = Object.entries(data);
  for (const [label, value] of entries) {
    if (value === undefined || value === null || value === '') continue;
    if (typeof value === 'object' && !Array.isArray(value)) {
      doc.font('Helvetica-Bold').text(`${label}:`);
      renderNestedObject(doc, value as Record<string, unknown>, indent + 10);
      continue;
    }

    doc
      .font('Helvetica-Bold')
      .text(`${label}: `, { continued: true, indent })
      .font('Helvetica')
      .text(String(value));
  }
}

function buildCustomerBlock(customer: ContractCustomerSummary): Record<string, unknown> {
  return {
    Name: customer.fullName,
    Email: customer.email ?? '—',
    Phone: customer.phone ?? '—',
    Address: [customer.addressLine1, customer.addressLine2].filter(Boolean).join(', '),
    City: customer.city ?? '—',
    State: customer.state ?? '—',
    'Postal Code': customer.postalCode ?? '—',
  };
}

function buildVehicleBlock(vehicle: ContractVehicleSummary): Record<string, unknown> {
  return {
    VIN: vehicle.vin,
    Year: vehicle.year,
    Make: vehicle.make,
    Model: vehicle.model,
    Trim: vehicle.trim ?? '—',
    Mileage: vehicle.mileage ?? '—',
    'Stock #': vehicle.stockNumber ?? '—',
  };
}

function formatCurrency(value?: number | null) {
  if (value === undefined || value === null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function buildPricingBlock(pricing: ContractPricingSummary): Record<string, unknown> {
  const summary: Record<string, unknown> = {
    'Selling Price': formatCurrency(pricing.sellingPrice),
    'Cash Down': formatCurrency(pricing.cashDown),
    'Trade Value': formatCurrency(pricing.tradeValue ?? null),
    'Trade Payoff': formatCurrency(pricing.tradePayoff ?? null),
    'Amount Financed': formatCurrency(pricing.amountFinanced),
  };

  if (pricing.apr !== undefined && pricing.apr !== null) {
    summary.APR = `${pricing.apr.toFixed(3)}%`;
  }

  if (pricing.termMonths) {
    summary['Term (months)'] = pricing.termMonths;
  }

  if (pricing.monthlyPayment !== undefined && pricing.monthlyPayment !== null) {
    summary['Monthly Payment'] = formatCurrency(pricing.monthlyPayment);
  }

  if (pricing.fees?.length) {
    summary.Fees = pricing.fees.map((fee) => `${fee.label}: ${formatCurrency(fee.amount)}`);
  }

  if (pricing.products?.length) {
    summary['Protection Products'] = pricing.products.map((product) =>
      [product.name, product.provider].filter(Boolean).join(' — ') + ` (${formatCurrency(product.price)})`,
    );
  }

  return summary;
}

function renderSignerSection(doc: PDFKit.PDFDocument, signers: ContractSigner[]) {
  doc.moveDown(1);
  doc.font('Helvetica-Bold').fontSize(12).text('Signatures');
  doc.moveDown(0.5);

  const startY = doc.y;
  const columnWidth = (doc.page.width - doc.page.margins.left - doc.page.margins.right) / 2;
  const rowHeight = 90;

  signers.forEach((signer, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = doc.page.margins.left + column * columnWidth;
    const y = startY + row * rowHeight;

    doc
      .lineWidth(0.5)
      .strokeColor('#9ca3af')
      .rect(x, y, columnWidth - 12, rowHeight - 12)
      .stroke();

    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor('#111827')
      .text(`${signer.roleLabel ?? signer.role}`, x + 12, y + 12, { width: columnWidth - 36 });

    doc
      .font('Helvetica')
      .fontSize(10)
      .text(`Name: ${signer.name}`, { width: columnWidth - 36 })
      .text(`Email: ${signer.email}`, { width: columnWidth - 36 })
      .text(`Routing Order: ${signer.routingOrder ?? 1}`, { width: columnWidth - 36 });

    const signatureY = y + rowHeight - 30;
    doc
      .moveTo(x + 12, signatureY)
      .lineTo(x + columnWidth - 24, signatureY)
      .stroke();
    doc.font('Helvetica').fontSize(9).text('Signature', x + 12, signatureY + 4);
    doc
      .moveTo(x + 12, signatureY + 18)
      .lineTo(x + columnWidth - 24, signatureY + 18)
      .stroke();
    doc.font('Helvetica').fontSize(9).text('Date', x + 12, signatureY + 22);
  });
}

export class ContractGeneratorService {
  async generate(context: ContractDealContext): Promise<PdfGenerationResult> {
    const buffer = await renderPdf(context);

    const key = buildContractDocumentKey({
      tenantId: context.tenantId,
      dealId: context.dealId,
      contractId: context.contractId,
      type: context.type,
    });

    const upload = await uploadBufferToS3({
      key,
      body: buffer,
      contentType: 'application/pdf',
      metadata: {
        contractId: context.contractId,
        dealId: context.dealId,
        tenantId: context.tenantId,
        type: context.type,
      },
    });

    return { key: upload.key, url: upload.url, buffer };
  }
}

export const contractGeneratorService = new ContractGeneratorService();
