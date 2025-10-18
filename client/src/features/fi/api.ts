import { API_BASE_URL } from '@/config/api';
import { apiRequest } from '@/lib/queryClient';

export interface DealParticipant {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface DealVehicle {
  id: string;
  year?: number;
  make?: string;
  model?: string;
  vin?: string;
}

export interface DealJacketDto {
  id: string;
  tenantId: string;
  dealNumber: string;
  status: string;
  sellingPrice: string;
  tradeValue?: string | null;
  tradePayoff?: string | null;
  netTrade?: string | null;
  cashDown: string;
  amountFinanced: string;
  lenderId?: string | null;
  apr?: string | null;
  term?: number | null;
  monthlyPayment?: string | null;
  fiProducts: unknown;
  totalFiGross?: string | null;
  dealDate: string;
  contractDate?: string | null;
  fundedDate?: string | null;
  deliveredDate?: string | null;
  customer: DealParticipant;
  vehicle: DealVehicle;
  salesperson: DealParticipant;
  fiManager?: DealParticipant | null;
}

export interface DealDocumentDto {
  id: string;
  dealId: string;
  type: string;
  category: string;
  name: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  downloadUrl?: string;
}

export async function fetchDealJacket(dealId: string) {
  const res = await apiRequest(`/fi/deals/${dealId}`);
  return res.json() as Promise<DealJacketDto>;
}

export async function updateDealJacket(dealId: string, payload: Partial<Record<string, unknown>>) {
  const res = await apiRequest('PUT', `/fi/deals/${dealId}`, payload);
  return res.json() as Promise<DealJacketDto>;
}

export async function listDealDocuments(dealId: string) {
  const res = await apiRequest(`/fi/deals/${dealId}/documents`);
  return res.json() as Promise<DealDocumentDto[]>;
}

function resolveApiUrl(path: string) {
  if (path.startsWith('http')) {
    return path;
  }
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function uploadDealDocument(
  dealId: string,
  input: { type: string; category: string; name?: string; file: File },
) {
  const formData = new FormData();
  formData.append('type', input.type);
  formData.append('category', input.category);
  if (input.name) {
    formData.append('name', input.name);
  }
  formData.append('file', input.file);

  const response = await fetch(resolveApiUrl(`/fi/deals/${dealId}/documents/upload`), {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to upload document');
  }

  return (await response.json()) as DealDocumentDto;
}

export async function deleteDealDocument(dealId: string, documentId: string) {
  const response = await fetch(resolveApiUrl(`/fi/deals/${dealId}/documents/${documentId}`), {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to delete document');
  }
}
