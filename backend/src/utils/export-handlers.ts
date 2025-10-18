import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import type { Font } from 'exceljs';
import nodemailer from 'nodemailer';
import type { TransportOptions } from 'nodemailer';
import { FinancialStatementResult, StatementSection } from './financial-statement-generator.js';

export type ExportFormat = 'pdf' | 'excel' | 'quickbooks';

export interface ExportOptions {
  title: string;
  subtitle?: string;
}

export interface EmailOptions {
  to: string[];
  subject: string;
  html: string;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function renderSectionToPdf(doc: PDFDocument, section: StatementSection) {
  doc.font('Helvetica-Bold').fontSize(12).text(section.label, { underline: true });
  doc.moveDown(0.25);
  doc.font('Helvetica').fontSize(10);
  for (const account of section.accounts) {
    const line = `${account.accountNumber} ${account.accountName}`;
    doc.text(line, { continued: true });
    doc.text(formatCurrency(account.total), { align: 'right' });
    if (account.entries.length > 0) {
      doc.fontSize(8);
      for (const entry of account.entries) {
        doc.text(
          `  • ${entry.postingDate.slice(0, 10)} ${entry.entryNumber} ${entry.memo ?? ''} (${formatCurrency(
            entry.debit - entry.credit,
          )})`,
        );
      }
      doc.fontSize(10);
    }
  }
  doc.font('Helvetica-Bold').text(`Section Total: ${formatCurrency(section.total)}`, { align: 'right' });
  doc.moveDown();
}

export async function exportStatementToPdf(
  statement: FinancialStatementResult,
  options: ExportOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.font('Helvetica-Bold').fontSize(18).text(options.title, { align: 'center' });
    if (options.subtitle) {
      doc.moveDown(0.5);
      doc.fontSize(12).text(options.subtitle, { align: 'center' });
    }
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(10).text(`Period: ${statement.period.startDate} to ${statement.period.endDate}`);
    doc.text(`Generated: ${statement.generatedAt}`);
    doc.moveDown();

    for (const section of statement.sections) {
      renderSectionToPdf(doc, section);
    }

    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(12).text('Summary Totals');
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(10);
    for (const [key, value] of Object.entries(statement.totals)) {
      doc.text(`${key}: ${formatCurrency(value)}`);
    }

    doc.end();
  });
}

export async function exportStatementToExcel(
  statement: FinancialStatementResult,
  options: ExportOptions,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Statement');

  sheet.columns = [
    { header: 'Account Number', key: 'accountNumber', width: 18 },
    { header: 'Account Name', key: 'accountName', width: 40 },
    { header: 'Amount', key: 'amount', width: 18 },
  ];

  const titleRow = sheet.addRow([options.title]);
  titleRow.font = { bold: true, size: 16 } as Font;
  sheet.mergeCells('A1:C1');
  const periodRow = sheet.addRow(['Period', `${statement.period.startDate} → ${statement.period.endDate}`]);
  periodRow.font = { italic: true } as Font;
  sheet.mergeCells('A2:C2');
  sheet.addRow([]);

  for (const section of statement.sections) {
    const headerRow = sheet.addRow([section.label]);
    headerRow.font = { bold: true } as Font;
    sheet.mergeCells(`A${headerRow.number}:C${headerRow.number}`);
    for (const account of section.accounts) {
      sheet.addRow([account.accountNumber, account.accountName, account.total]);
      for (const entry of account.entries) {
        sheet.addRow([
          `  ${entry.entryNumber}`,
          `${entry.postingDate.slice(0, 10)} ${entry.memo ?? ''}`,
          entry.debit - entry.credit,
        ]);
      }
    }
    sheet.addRow(['', 'Section Total', section.total]);
    sheet.addRow([]);
  }

  const totalsHeader = sheet.addRow(['Statement Totals']);
  totalsHeader.font = { bold: true } as Font;
  sheet.mergeCells(`A${totalsHeader.number}:C${totalsHeader.number}`);
  for (const [key, value] of Object.entries(statement.totals)) {
    sheet.addRow([key, '', value]);
  }

  sheet.getColumn('amount').numFmt = '$#,##0.00;[Red]($#,##0.00)';

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export function exportStatementToQuickBooks(statement: FinancialStatementResult): Buffer {
  const lines: string[] = [];
  lines.push('!TRNS\tTRNSID\tTRNSTYPE\tDATE\tACCNT\tAMOUNT\tNAME\tMEMO');
  lines.push('!SPL\tSPLID\tTRNSTYPE\tDATE\tACCNT\tAMOUNT\tNAME\tMEMO');
  lines.push('!ENDTRNS');

  let transactionCounter = 1;
  for (const section of statement.sections) {
    for (const account of section.accounts) {
      const memo = `${section.label} - ${account.accountName}`;
      const amount = account.total;
      const formattedAmount = amount.toFixed(2);
      const date = statement.period.endDate.slice(0, 10);
      lines.push(
        `TRNS\t${transactionCounter}\tGENERAL JOURNAL\t${date}\t${account.accountName}\t${formattedAmount}\t\t${memo}`,
      );
      lines.push(
        `SPL\t${transactionCounter}\tGENERAL JOURNAL\t${date}\tRetained Earnings\t${(-amount).toFixed(2)}\t\t${memo}`,
      );
      lines.push('ENDTRNS');
      transactionCounter += 1;
    }
  }

  return Buffer.from(lines.join('\n'), 'utf8');
}

export async function sendReportEmail(
  transportOptions: TransportOptions,
  emailOptions: EmailOptions,
): Promise<void> {
  const transporter = nodemailer.createTransport(transportOptions);
  await transporter.sendMail({
    from: transportOptions.auth && 'user' in transportOptions.auth ? transportOptions.auth.user : 'no-reply@autolytiq.com',
    to: emailOptions.to,
    subject: emailOptions.subject,
    html: emailOptions.html,
    attachments: emailOptions.attachments,
  });
}
