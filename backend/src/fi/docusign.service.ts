import { env } from '../config/env.js';
import { BadRequest } from '../lib/errors.js';
import type { ContractType, ContractSigner } from './contracts.types.js';

interface EnvelopeDocumentInput {
  documentId: string;
  name: string;
  pdfUrl: string;
  type: ContractType;
}

interface EnvelopeSignerInput extends ContractSigner {
  recipientId: string;
}

interface SendEnvelopeOptions {
  dealId: string;
  emailSubject: string;
  emailBody?: string;
  documents: EnvelopeDocumentInput[];
  signers: EnvelopeSignerInput[];
}

interface DocuSignTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface TabCoordinates {
  signHereTabs?: Array<{ pageNumber: number; x: number; y: number }>;
  dateSignedTabs?: Array<{ pageNumber: number; x: number; y: number }>;
  textTabs?: Array<{ pageNumber: number; x: number; y: number; tabLabel: string }>;
}

const FALLBACK_TABS: TabCoordinates = {
  signHereTabs: [{ pageNumber: 1, x: 72, y: 640 }],
  dateSignedTabs: [{ pageNumber: 1, x: 72, y: 680 }],
  textTabs: [{ pageNumber: 1, x: 72, y: 620, tabLabel: 'Printed Name' }],
};

const CONTRACT_TAB_COORDINATES: Record<ContractType, Record<string, TabCoordinates>> = {
  RISC: buildDualSignerTabs(520),
  BUYERS_ORDER: buildDualSignerTabs(500),
  VSC: buildDualSignerTabs(480),
  GAP: buildDualSignerTabs(480),
  TIRE_WHEEL: buildDualSignerTabs(470),
  ODOMETER: buildDualSignerTabs(420),
  BILL_OF_SALE: buildDualSignerTabs(520),
  TILA: buildDualSignerTabs(480),
  PRIVACY: buildDualSignerTabs(460),
  ARBITRATION: buildDualSignerTabs(500),
  TRADE_IN: buildDualSignerTabs(500),
  POA: {
    BUYER: {
      signHereTabs: [{ pageNumber: 1, x: 72, y: 540 }],
      dateSignedTabs: [{ pageNumber: 1, x: 400, y: 540 }],
      textTabs: [
        { pageNumber: 1, x: 72, y: 520, tabLabel: 'Buyer Printed Name' },
        { pageNumber: 1, x: 72, y: 500, tabLabel: 'Buyer Address' },
      ],
    },
    DEALER_REP: {
      signHereTabs: [{ pageNumber: 1, x: 72, y: 440 }],
      dateSignedTabs: [{ pageNumber: 1, x: 400, y: 440 }],
      textTabs: [{ pageNumber: 1, x: 72, y: 420, tabLabel: 'Authorized Representative' }],
    },
  },
};

function buildDualSignerTabs(baseY: number): Record<string, TabCoordinates> {
  return {
    BUYER: {
      signHereTabs: [{ pageNumber: 1, x: 72, y: baseY }],
      dateSignedTabs: [{ pageNumber: 1, x: 400, y: baseY }],
      textTabs: [{ pageNumber: 1, x: 72, y: baseY - 20, tabLabel: 'Buyer Printed Name' }],
    },
    CO_BUYER: {
      signHereTabs: [{ pageNumber: 1, x: 72, y: baseY - 80 }],
      dateSignedTabs: [{ pageNumber: 1, x: 400, y: baseY - 80 }],
      textTabs: [{ pageNumber: 1, x: 72, y: baseY - 100, tabLabel: 'Co-Buyer Printed Name' }],
    },
    DEALER_REP: {
      signHereTabs: [{ pageNumber: 1, x: 72, y: baseY - 160 }],
      dateSignedTabs: [{ pageNumber: 1, x: 400, y: baseY - 160 }],
      textTabs: [{ pageNumber: 1, x: 72, y: baseY - 180, tabLabel: 'Dealer Representative' }],
    },
  };
}

function assertDocuSignConfig() {
  const required = [
    env.DOCUSIGN_BASE_URL,
    env.DOCUSIGN_INTEGRATOR_KEY,
    env.DOCUSIGN_USER_ID,
    env.DOCUSIGN_AUTH_JWT,
    env.DOCUSIGN_ACCOUNT_ID,
  ];

  if (required.some((value) => !value)) {
    throw BadRequest('DocuSign configuration is incomplete. Please set all DocuSign environment variables.');
  }
}

async function fetchPdf(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to download contract PDF from storage (HTTP ${response.status})`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

class DocuSignService {
  private token: { accessToken: string; expiresAt: number } | null = null;

  private async getAccessToken(): Promise<string> {
    assertDocuSignConfig();
    const now = Date.now();
    if (this.token && this.token.expiresAt > now + 60000) {
      return this.token.accessToken;
    }

    const body = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: env.DOCUSIGN_AUTH_JWT!,
    });

    const response = await fetch(`${env.DOCUSIGN_BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`DocuSign authentication failed: ${message}`);
    }

    const json = (await response.json()) as DocuSignTokenResponse;
    const expiresAt = Date.now() + (json.expires_in - 60) * 1000;
    this.token = { accessToken: json.access_token, expiresAt };

    return json.access_token;
  }

  private resolveTabs(type: ContractType, signer: ContractSigner): TabCoordinates {
    const typeTabs = CONTRACT_TAB_COORDINATES[type];
    if (!typeTabs) {
      return FALLBACK_TABS;
    }
    const roleKey = signer.role.toUpperCase();
    return typeTabs[roleKey] ?? FALLBACK_TABS;
  }

  async sendEnvelope(options: SendEnvelopeOptions) {
    const accessToken = await this.getAccessToken();

    const documents = await Promise.all(
      options.documents.map(async (document, index) => {
        const buffer = await fetchPdf(document.pdfUrl);
        return {
          documentBase64: buffer.toString('base64'),
          name: document.name,
          fileExtension: 'pdf',
          documentId: document.documentId || `${index + 1}`,
        };
      }),
    );

    const signers = options.signers.map((signer, index) => {
      const signHereTabs: Array<{ documentId: string; pageNumber: number; xPosition: number; yPosition: number }> = [];
      const dateSignedTabs: Array<{ documentId: string; pageNumber: number; xPosition: number; yPosition: number }> = [];
      const textTabs: Array<{ documentId: string; pageNumber: number; xPosition: number; yPosition: number; tabLabel: string }> = [];

      options.documents.forEach((document, documentIndex) => {
        const docId = document.documentId || `${documentIndex + 1}`;
        const tabs = this.resolveTabs(document.type, signer);
        tabs.signHereTabs?.forEach((tab) => {
          signHereTabs.push({
            documentId: docId,
            pageNumber: tab.pageNumber,
            xPosition: tab.x,
            yPosition: tab.y,
          });
        });
        tabs.dateSignedTabs?.forEach((tab) => {
          dateSignedTabs.push({
            documentId: docId,
            pageNumber: tab.pageNumber,
            xPosition: tab.x,
            yPosition: tab.y,
          });
        });
        tabs.textTabs?.forEach((tab) => {
          textTabs.push({
            documentId: docId,
            pageNumber: tab.pageNumber,
            xPosition: tab.x,
            yPosition: tab.y,
            tabLabel: tab.tabLabel,
          });
        });
      });

      return {
        email: signer.email,
        name: signer.name,
        recipientId: signer.recipientId,
        roleName: signer.role,
        routingOrder: String(signer.routingOrder ?? index + 1),
        tabs: {
          signHereTabs,
          dateSignedTabs,
          textTabs,
        },
      };
    });

    const payload = {
      emailSubject: options.emailSubject,
      emailBlurb: options.emailBody ?? undefined,
      status: 'sent',
      documents,
      recipients: {
        signers,
      },
      eventNotification: {
        url: `${env.API_URL}/api/fi/contracts/webhook`,
        loggingEnabled: 'true',
        requireAcknowledgment: 'true',
        envelopeEvents: [
          { envelopeEventStatusCode: 'sent' },
          { envelopeEventStatusCode: 'delivered' },
          { envelopeEventStatusCode: 'completed' },
          { envelopeEventStatusCode: 'voided' },
        ],
        includeDocuments: 'true',
      },
      customFields: {
        textCustomFields: [
          {
            name: 'dealId',
            value: options.dealId,
            show: 'false',
          },
        ],
      },
    };

    const response = await fetch(`${env.DOCUSIGN_BASE_URL}/restapi/v2.1/accounts/${env.DOCUSIGN_ACCOUNT_ID}/envelopes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-DocuSign-Authentication': JSON.stringify({
          Username: env.DOCUSIGN_USER_ID,
          IntegratorKey: env.DOCUSIGN_INTEGRATOR_KEY,
        }),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`DocuSign envelope creation failed: ${message}`);
    }

    return response.json();
  }
}

export const docuSignService = new DocuSignService();
