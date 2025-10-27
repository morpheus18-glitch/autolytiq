import { cp } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const srcProtoDir = path.join(projectRoot, 'src', 'proto');
const distProtoDir = path.join(projectRoot, 'dist', 'proto');

async function copyProtoSchemas() {
  if (!existsSync(srcProtoDir)) {
    console.warn(`Skipping proto copy: source directory not found at ${srcProtoDir}`);
    return;
  }

  await cp(srcProtoDir, distProtoDir, { recursive: true, force: true });
}

copyProtoSchemas().catch((error) => {
  console.error('Failed to copy proto schemas into build output:', error);
  process.exitCode = 1;
});
