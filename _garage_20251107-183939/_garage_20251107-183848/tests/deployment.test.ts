import { describe, it, expect, beforeAll } from 'vitest';

/**
 * Deployment validation tests
 * These tests verify that the build artifacts are correct
 */

describe('Deployment Validation', () => {
  describe('Build Artifacts', () => {
    it('backend build should exist', async () => {
      const fs = await import('fs');
      const path = await import('path');
      
      const backendDist = path.resolve(process.cwd(), 'apps/backend/dist/index.js');
      expect(fs.existsSync(backendDist)).toBe(true);
    });

    it('frontend build should exist', async () => {
      const fs = await import('fs');
      const path = await import('path');
      
      const frontendDist = path.resolve(process.cwd(), 'apps/frontend/dist/index.html');
      expect(fs.existsSync(frontendDist)).toBe(true);
    });

    it('shared package should be built', async () => {
      const fs = await import('fs');
      const path = await import('path');
      
      const sharedDist = path.resolve(process.cwd(), 'packages/shared/dist/index.js');
      expect(fs.existsSync(sharedDist)).toBe(true);
    });

    it('tokens package should be built', async () => {
      const fs = await import('fs');
      const path = await import('path');
      
      const tokensDist = path.resolve(process.cwd(), 'packages/tokens/dist/index.js');
      expect(fs.existsSync(tokensDist)).toBe(true);
    });
  });

  describe('Docker Configuration', () => {
    it('docker-compose.yml should be valid YAML', async () => {
      const fs = await import('fs');
      const yaml = await import('js-yaml');
      
      const dockerCompose = fs.readFileSync('docker-compose.yml', 'utf8');
      const parsed = yaml.load(dockerCompose);
      
      expect(parsed).toBeDefined();
      expect(parsed.services).toBeDefined();
    });

    it('docker-compose should define required services', async () => {
      const fs = await import('fs');
      const yaml = await import('js-yaml');
      
      const dockerCompose = fs.readFileSync('docker-compose.yml', 'utf8');
      const parsed = yaml.load(dockerCompose) as any;
      
      expect(parsed.services.backend).toBeDefined();
      expect(parsed.services.frontend).toBeDefined();
      expect(parsed.services.postgres).toBeDefined();
      expect(parsed.services.redis).toBeDefined();
    });

    it('backend service should have correct healthcheck', async () => {
      const fs = await import('fs');
      const yaml = await import('js-yaml');
      
      const dockerCompose = fs.readFileSync('docker-compose.yml', 'utf8');
      const parsed = yaml.load(dockerCompose) as any;
      
      expect(parsed.services.backend.healthcheck).toBeDefined();
      const healthcheckTest = parsed.services.backend.healthcheck.test;
      expect(Array.isArray(healthcheckTest)).toBe(true);
      expect(healthcheckTest.some((item: string) => item.includes('/ready'))).toBe(true);
    });

    it('frontend service should have correct healthcheck', async () => {
      const fs = await import('fs');
      const yaml = await import('js-yaml');
      
      const dockerCompose = fs.readFileSync('docker-compose.yml', 'utf8');
      const parsed = yaml.load(dockerCompose) as any;
      
      expect(parsed.services.frontend.healthcheck).toBeDefined();
      const healthcheckTest = parsed.services.frontend.healthcheck.test;
      expect(Array.isArray(healthcheckTest)).toBe(true);
      expect(healthcheckTest.some((item: string) => item.includes('/health'))).toBe(true);
    });
  });

  describe('Dockerfile Validation', () => {
    it('backend Dockerfile should exist', async () => {
      const fs = await import('fs');
      
      expect(fs.existsSync('infrastructure/docker/Dockerfile.backend')).toBe(true);
    });

    it('frontend Dockerfile should exist', async () => {
      const fs = await import('fs');
      
      expect(fs.existsSync('infrastructure/docker/Dockerfile.frontend')).toBe(true);
    });

    it('ml Dockerfile should exist', async () => {
      const fs = await import('fs');
      
      expect(fs.existsSync('infrastructure/docker/Dockerfile.ml')).toBe(true);
    });
  });

  describe('Environment Configuration', () => {
    it('should have example environment files', async () => {
      const fs = await import('fs');
      
      expect(fs.existsSync('.env.example')).toBe(true);
      expect(fs.existsSync('.env.production.example')).toBe(true);
    });
  });

  describe('Package Configuration', () => {
    it('pnpm-workspace.yaml should be valid', async () => {
      const fs = await import('fs');
      const yaml = await import('js-yaml');
      
      const workspace = fs.readFileSync('pnpm-workspace.yaml', 'utf8');
      const parsed = yaml.load(workspace);
      
      expect(parsed).toBeDefined();
    });

    it('root package.json should have deployment scripts', async () => {
      const fs = await import('fs');
      
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      expect(pkg.scripts.build).toBeDefined();
      expect(pkg.scripts.start).toBeDefined();
      expect(pkg.scripts['build:prod']).toBeDefined();
    });
  });

  describe('Prisma Configuration', () => {
    it('Prisma schema should exist', async () => {
      const fs = await import('fs');
      
      expect(fs.existsSync('packages/db/schema.prisma')).toBe(true);
    });

    it('Prisma schema should have required models', async () => {
      const fs = await import('fs');
      
      const schema = fs.readFileSync('packages/db/schema.prisma', 'utf8');
      
      // Check for essential models
      expect(schema).toContain('model Tenant');
      expect(schema).toContain('model User');
      expect(schema).toContain('datasource db');
      expect(schema).toContain('generator client');
    });
  });

  describe('Scripts', () => {
    it('validation script should be executable', async () => {
      const fs = await import('fs');
      
      const stats = fs.statSync('scripts/validate-deployment.sh');
      // Check if executable bit is set (Unix-like systems)
      expect(stats.mode & 0o111).toBeGreaterThan(0);
    });

    it('health check script should be executable', async () => {
      const fs = await import('fs');
      
      const stats = fs.statSync('scripts/deployment-health-check.sh');
      expect(stats.mode & 0o111).toBeGreaterThan(0);
    });
  });
});
