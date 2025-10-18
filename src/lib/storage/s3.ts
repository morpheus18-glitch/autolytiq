import { DeleteObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'node:crypto';
import net from 'node:net';
import { env } from '../../config/env.js';

const DEFAULT_SIGNED_URL_TTL = 900; // 15 minutes
const S3_URL_PATTERN = /https?:\/\/[^/]+\/(.+)/;

function assertS3Config() {
  if (!env.S3_BUCKET || !env.AWS_REGION || !env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('S3 storage is not configured. Missing credentials or bucket configuration.');
  }
}

function createClient() {
  assertS3Config();
  return new S3Client({
    region: env.AWS_REGION!,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

let client: S3Client | null = null;

function getClient() {
  if (!client) {
    client = createClient();
  }
  return client;
}

export function buildDealDocumentKey(options: { tenantId: string; dealId: string; documentId: string; originalName: string }) {
  const sanitizedName = options.originalName.trim().toLowerCase().replace(/[^a-z0-9.\-]+/g, '-');
  return ['deal-jackets', options.tenantId, options.dealId, options.documentId, `${Date.now()}-${sanitizedName}`]
    .filter(Boolean)
    .join('/');
}

export function buildComplianceDocumentKey(options: {
  tenantId: string;
  dealId: string;
  documentType: string;
  fileName: string;
}) {
  const sanitizedType = options.documentType.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const sanitizedName = options.fileName.trim().toLowerCase().replace(/[^a-z0-9.\-]+/g, '-');
  return ['deal-jackets', options.tenantId, options.dealId, 'compliance', `${Date.now()}-${sanitizedType}-${sanitizedName}`]
    .filter(Boolean)
    .join('/');
}

export function buildContractDocumentKey(options: { tenantId: string; dealId: string; contractId: string; type: string }) {
  const sanitizedType = options.type.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return [
    'deal-jackets',
    options.tenantId,
    options.dealId,
    'contracts',
    `${options.contractId}-${Date.now()}-${sanitizedType}.pdf`,
  ]
    .filter(Boolean)
    .join('/');
}

export function resolvePublicUrl(key: string) {
  if (env.S3_CLOUDFRONT_URL) {
    return `${env.S3_CLOUDFRONT_URL.replace(/\/$/, '')}/${key}`;
  }
  return `https://${env.S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
}

export function extractKeyFromUrl(url: string): string | null {
  if (!url) {
    return null;
  }
  if (env.S3_CLOUDFRONT_URL && url.startsWith(env.S3_CLOUDFRONT_URL)) {
    return url.slice(env.S3_CLOUDFRONT_URL.length).replace(/^\//, '');
  }
  const match = url.match(S3_URL_PATTERN);
  return match?.[1] ?? null;
}

export async function uploadBufferToS3({
  key,
  body,
  contentType,
  metadata,
}: {
  key: string;
  body: Buffer;
  contentType: string;
  metadata?: Record<string, string>;
}) {
  const uploader = new Upload({
    client: getClient(),
    params: {
      Bucket: env.S3_BUCKET!,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: metadata,
    },
  });

  await uploader.done();

  return {
    key,
    url: resolvePublicUrl(key),
  };
}

export async function deleteFromS3(key: string) {
  await getClient().send(
    new DeleteObjectCommand({
      Bucket: env.S3_BUCKET!,
      Key: key,
    }),
  );
}

export async function getSignedDownloadUrl(key: string, expiresIn = DEFAULT_SIGNED_URL_TTL) {
  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET!,
    Key: key,
  });

  return getSignedUrl(getClient(), command, { expiresIn });
}

export async function runVirusScan(buffer: Buffer) {
  const host = env.CLAMAV_HOST;
  if (!host) {
    return { clean: true as const };
  }

  const port = env.CLAMAV_PORT ?? 3310;
  return new Promise<{ clean: boolean; signature?: string }>((resolve, reject) => {
    const socket = net.createConnection({ host, port }, () => {
      socket.write('zINSTREAM\0');
      const chunkSize = 64 * 1024;
      for (let offset = 0; offset < buffer.length; offset += chunkSize) {
        const chunk = buffer.subarray(offset, Math.min(buffer.length, offset + chunkSize));
        const size = Buffer.alloc(4);
        size.writeUInt32BE(chunk.length, 0);
        socket.write(size);
        socket.write(chunk);
      }
      const zero = Buffer.alloc(4);
      zero.writeUInt32BE(0, 0);
      socket.write(zero);
    });

    let response = '';
    socket.on('data', (data) => {
      response += data.toString();
    });

    socket.on('end', () => {
      if (response.includes('FOUND')) {
        resolve({ clean: false, signature: response.trim() });
      } else {
        resolve({ clean: true as const });
      }
    });

    socket.on('error', (error) => {
      reject(error);
    });
  });
}

export function generateDocumentId() {
  return crypto.randomUUID();
}
