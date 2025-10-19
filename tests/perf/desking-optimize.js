/* global __ENV */
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.K6_API_URL ?? 'http://localhost:5000/api/desking';
const DEAL_ID = __ENV.K6_DEAL_ID;
const TENANT_ID = __ENV.K6_TENANT_ID;
const AUTH_TOKEN = __ENV.K6_AUTH_TOKEN;
const WORKSHEET_ID = __ENV.K6_WORKSHEET_ID ?? 'k6-worksheet';

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${AUTH_TOKEN ?? ''}`,
  'x-tenant-id': TENANT_ID ?? '',
};

const structure = {
  pricing: {
    salePrice: 41000,
    dealerDiscounts: [{ label: 'Event', amount: 750 }],
  },
  fees: [
    { code: 'doc', label: 'Documentation', amount: 495 },
    { code: 'title', label: 'Title', amount: 120 },
  ],
  taxes: [{ jurisdiction: 'IL', rate: 0.075, amount: 3075 }],
  cashDown: { total: 2000, customerCash: 1500, tradeEquity: 500 },
};

const payment = {
  amountFinanced: 35000,
  apr: 6.15,
  termMonths: 72,
  monthlyPayment: 572.48,
};

export const options = {
  vus: Number(__ENV.K6_VUS ?? 10),
  duration: __ENV.K6_DURATION ?? '1m',
  thresholds: {
    http_req_duration: ['p(95)<400'],
  },
};

export default function () {
  if (!DEAL_ID || !TENANT_ID || !AUTH_TOKEN) {
    sleep(1);
    return;
  }

  const url = `${BASE_URL}/${DEAL_ID}/optimize`;
  const payload = JSON.stringify({
    dealId: DEAL_ID,
    worksheetId: WORKSHEET_ID,
    structure,
    customerProfile: {
      firstName: 'Load',
      lastName: 'Tester',
      creditScore: 705,
      creditTier: 'TIER_2',
      residenceType: 'RENT',
      monthlyIncome: 6200,
    },
    vehicle: {
      vin: '1C4RJFBG3LC123456',
      year: 2022,
      make: 'Jeep',
      model: 'Grand Cherokee',
    },
    currentPayment: payment,
    goals: { targetPayment: 550 },
    constraints: { maxTerm: 84 },
  });

  const response = http.post(url, payload, { headers });
  check(response, {
    'status is created': (res) => res.status === 201,
  });

  sleep(1);
}
