import { S3Client } from '@aws-sdk/client-s3';
import { config } from './env.config.js';

const r2Endpoint = config.r2.accountId
  ? `https://${config.r2.accountId}.r2.cloudflarestorage.com`
  : 'https://mock-account.r2.cloudflarestorage.com';

export const s3Client = new S3Client({
  region: 'auto',
  endpoint: r2Endpoint,
  credentials: {
    accessKeyId: config.r2.accessKeyId || 'mock-access-key',
    secretAccessKey: config.r2.secretAccessKey || 'mock-secret-key',
  },
});
