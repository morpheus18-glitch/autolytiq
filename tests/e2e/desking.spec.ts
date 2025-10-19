import { test, expect, request as playwrightRequest } from '@playwright/test';
import crypto from 'node:crypto';

const baseApiUrl = process.env.PLAYWRIGHT_API_URL;
const authToken = process.env.PLAYWRIGHT_AUTH_TOKEN;
const tenantId = process.env.PLAYWRIGHT_TENANT_ID;
const dealId = process.env.PLAYWRIGHT_DEAL_ID;
const customerId = process.env.PLAYWRIGHT_CUSTOMER_ID;
const vehicleId = process.env.PLAYWRIGHT_VEHICLE_ID;
const salespersonId = process.env.PLAYWRIGHT_SALESPERSON_ID;

const shouldSkip = !baseApiUrl || !authToken || !tenantId || !dealId || !customerId || !vehicleId;

test.describe('Desking end-to-end', () => {
  test.skip(shouldSkip, 'Playwright e2e requires API, auth, and seeded deal context');

  test('pencil optimize select print counter flow', async () => {
    const api = await playwrightRequest.newContext({
      baseURL: `${baseApiUrl}/api/desking/${dealId}`,
      extraHTTPHeaders: {
        Authorization: `Bearer ${authToken}`,
        'x-tenant-id': tenantId!,
      },
    });

    const worksheetId = `pw-${crypto.randomUUID()}`;
    const structure = {
      pricing: {
        salePrice: 42000,
        dealerDiscounts: [{ label: 'Spring savings', amount: 500 }],
        accessories: [{ label: 'All-weather mats', amount: 199 }],
      },
      fees: [
        { code: 'doc', label: 'Documentation', amount: 495 },
        { code: 'dmv', label: 'DMV', amount: 325 },
      ],
      taxes: [{ jurisdiction: 'CA', rate: 0.0825, amount: 3350 }],
      cashDown: { total: 2500, customerCash: 2000, tradeEquity: 500 },
      backendProducts: [{ code: 'GAP', name: 'GAP Coverage', price: 895, cost: 350 }],
    };

    const payment = {
      amountFinanced: 36000,
      apr: 6.25,
      termMonths: 72,
      monthlyPayment: 598.32,
      dueAtSigning: 2500,
    };

    const totals = {
      salePrice: structure.pricing.salePrice,
      tradeAllowance: 0,
      tradePayoff: 0,
      tradeEquity: 500,
      cashDown: 2500,
      fees: 820,
      backendProducts: 895,
      taxes: 3350,
      amountFinanced: payment.amountFinanced,
      dueAtSigning: payment.dueAtSigning,
      frontEndGross: 2800,
      backEndGross: 1100,
      financeReserve: 450,
      totalGross: 4350,
    };

    const saveResponse = await api.post('/worksheet', {
      data: {
        worksheetId,
        customerId,
        vehicleId,
        salespersonId,
        status: 'PENCILED',
        structure,
        totals,
        payment,
        aiScore: 0.78,
        commitVersion: {
          label: 'Manager Pencil',
          grossBreakdown: {
            frontEnd: totals.frontEndGross!,
            backEnd: totals.backEndGross!,
            financeReserve: totals.financeReserve,
            docFee: 495,
            pack: 300,
            total: totals.totalGross!,
          },
          closeProbability: 0.62,
          approvalProbability: 0.71,
          aiScore: 0.78,
        },
      },
    });
    expect(saveResponse.ok()).toBeTruthy();
    const saveJson = await saveResponse.json();
    const worksheetVersionId: string = saveJson.data.version?.id ?? saveJson.data.worksheet.currentVersionId;
    expect(worksheetVersionId).toBeTruthy();

    const optimizePayload = {
      dealId,
      worksheetId,
      versionId: worksheetVersionId,
      structure,
      customerProfile: {
        firstName: 'Alex',
        lastName: 'Rivera',
        creditScore: 710,
        creditTier: 'TIER_2',
        residenceType: 'RENT',
        monthlyIncome: 6500,
      },
      vehicle: {
        vin: '1HGBH41JXMN109186',
        year: 2023,
        make: 'Honda',
        model: 'Accord',
      },
      currentPayment: payment,
      goals: {
        targetPayment: 575,
        minimumGross: 3500,
      },
      constraints: {
        maxTerm: 84,
        minCashDown: 1500,
      },
    };

    const optimizeResponse = await api.post('/optimize', { data: optimizePayload });
    expect(optimizeResponse.ok()).toBeTruthy();
    const optimizeJson = await optimizeResponse.json();
    const optimizedVersionId: string = optimizeJson.data.version?.id ?? worksheetVersionId;

    const selectResponse = await api.post('/version/select', {
      data: {
        worksheetId,
        versionId: optimizedVersionId,
      },
    });
    expect(selectResponse.ok()).toBeTruthy();

    const printResponse = await api.post('/worksheet/print', {
      data: {
        worksheetId,
        versionId: optimizedVersionId,
      },
    });
    expect(printResponse.ok()).toBeTruthy();

    const counterResponse = await api.post('/counter', {
      data: {
        dealId,
        worksheetId,
        versionId: optimizedVersionId,
        customerInput: {
          customerConcern: 'Need lower monthly payment to fit budget',
          requestedPayment: 560,
          requestedCashDown: 2000,
        },
      },
    });
    expect(counterResponse.ok()).toBeTruthy();
    const counterJson = await counterResponse.json();
    expect(counterJson.data.counter.id).toBeTruthy();

    await api.dispose();
  });
});
