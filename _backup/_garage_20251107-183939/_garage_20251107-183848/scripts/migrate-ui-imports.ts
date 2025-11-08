#!/usr/bin/env tsx
/**
 * UI Import Migration Script
 *
 * Migrates imports from duplicate UI folder to official @repo/ui package.
 * Handles component name mismatches and variant differences.
 *
 * Usage:
 *   pnpm tsx scripts/migrate-ui-imports.ts [--dry-run] [--file path/to/file.tsx]
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// Component mapping: duplicate name → official name (if different)
const COMPONENT_MAPPING: Record<string, string> = {
  // Exact matches (most components)
  Button: 'Button',
  Card: 'Card',
  Badge: 'Badge',
  Input: 'Input',
  Select: 'Select',
  Checkbox: 'Checkbox',
  Switch: 'Switch',
  Label: 'Label',
  Textarea: 'Textarea',
  Slider: 'Slider',
  Progress: 'Progress',
  Skeleton: 'Skeleton',
  Avatar: 'Avatar',
  Accordion: 'Accordion',
  Alert: 'Alert',
  Tabs: 'Tabs',
  Table: 'Table',
  Tooltip: 'Tooltip',
  Popover: 'Popover',

  // Special cases
  'dialog': 'Modal',           // dialog.tsx → Modal from @repo/ui
  'sheet': 'Sheet',            // Same name
  'dropdown-menu': 'Dropdown', // dropdown-menu.tsx → Dropdown
  'radio-group': 'Radio',      // radio-group.tsx → Radio/RadioGroup
  'alert-dialog': 'Modal',     // alert-dialog → Modal (with variant)
  'hover-card': 'Popover',     // hover-card → Popover (similar)

  // Components to skip (no equivalent yet)
  'chart': null,               // Keep in app (domain-specific)
  'command': null,             // TODO: Move to @repo/ui later
  'calendar': 'Calendar',      // @repo/ui has Calendar
  'form': null,                // Keep in app (React Hook Form wrapper)
  'money': null,               // TODO: Move to @repo/ui later
  'module-header': null,       // Keep in app (domain-specific)
  'tab-navigation': 'Tabs',    // Use Tabs from @repo/ui
};

// Import patterns to match
const IMPORT_PATTERNS = [
  // Named imports: import { Button } from "@/components/ui/button"
  /import\s+{([^}]+)}\s+from\s+['"]@\/components\/ui\/([^'"]+)['"]/g,
  // Default imports: import Button from "@/components/ui/button"
  /import\s+(\w+)\s+from\s+['"]@\/components\/ui\/([^'"]+)['"]/g,
];

interface MigrationResult {
  file: string;
  changes: number;
  skipped: string[];
  warnings: string[];
}

function getOfficialComponentName(duplicateName: string): string | null {
  // Normalize: "button" → "Button", "dropdown-menu" → "Dropdown"
  const normalized = duplicateName
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');

  return COMPONENT_MAPPING[duplicateName] || COMPONENT_MAPPING[normalized] || null;
}

function migrateImports(content: string, filePath: string): MigrationResult {
  const result: MigrationResult = {
    file: filePath,
    changes: 0,
    skipped: [],
    warnings: [],
  };

  let newContent = content;

  // Pattern 1: Named imports
  newContent = newContent.replace(
    /import\s+{([^}]+)}\s+from\s+['"]@\/components\/ui\/([^'"]+)['"]/g,
    (match, namedImports, modulePath) => {
      const fileName = modulePath.split('/').pop(); // "button" from "ui/button"
      const officialName = getOfficialComponentName(fileName);

      if (!officialName) {
        result.skipped.push(fileName);
        return match; // Keep original
      }

      // Parse named imports: "Button, buttonVariants"
      const imports = namedImports.split(',').map((s: string) => s.trim());
      const migratedImports = imports
        .map((imp: string) => {
          // Handle "Button as CustomButton"
          if (imp.includes(' as ')) {
            const [original, alias] = imp.split(' as ').map(s => s.trim());
            return `${officialName} as ${alias}`;
          }

          // Handle variants: "buttonVariants" → keep as-is if exists
          if (imp.endsWith('Variants')) {
            const baseName = imp.replace('Variants', '');
            const official = getOfficialComponentName(baseName.toLowerCase());
            if (official) {
              return `${official.toLowerCase()}Variants`;
            }
          }

          return imp; // Keep sub-components as-is (CardHeader, etc.)
        })
        .join(', ');

      result.changes++;
      return `import { ${migratedImports} } from '@repo/ui'`;
    }
  );

  // Pattern 2: Default imports
  newContent = newContent.replace(
    /import\s+(\w+)\s+from\s+['"]@\/components\/ui\/([^'"]+)['"]/g,
    (match, componentName, modulePath) => {
      const fileName = modulePath.split('/').pop();
      const officialName = getOfficialComponentName(fileName);

      if (!officialName) {
        result.skipped.push(fileName);
        return match;
      }

      result.changes++;

      // If importing default but official uses named export
      if (componentName !== officialName) {
        result.warnings.push(
          `Default import "${componentName}" from "${fileName}" → named import "${officialName}"`
        );
        return `import { ${officialName} as ${componentName} } from '@repo/ui'`;
      }

      return `import { ${officialName} } from '@repo/ui'`;
    }
  );

  // Check if content changed
  if (newContent !== content) {
    return { ...result, newContent } as any;
  }

  return result;
}

async function migrateFile(filePath: string, dryRun: boolean): Promise<MigrationResult> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const result: any = migrateImports(content, filePath);

  if (result.changes > 0 && !dryRun) {
    fs.writeFileSync(filePath, result.newContent, 'utf-8');
  }

  return result;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const singleFile = args.find(arg => arg.startsWith('--file='))?.split('=')[1];

  console.log('🔧 UI Import Migration Tool');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No files will be modified\n');
  }

  // Collect files to migrate
  let files: string[] = [];

  if (singleFile) {
    files = [singleFile];
  } else {
    // Find all TS/TSX files in frontend/src (exclude node_modules, dist)
    files = await glob('apps/frontend/src/**/*.{ts,tsx}', {
      ignore: ['**/node_modules/**', '**/dist/**', '**/*.d.ts'],
    });
  }

  console.log(`📁 Found ${files.length} files to analyze\n`);

  const results: MigrationResult[] = [];
  let totalChanges = 0;
  let filesModified = 0;

  for (const file of files) {
    const result = await migrateFile(file, dryRun);

    if (result.changes > 0) {
      results.push(result);
      totalChanges += result.changes;
      filesModified++;

      console.log(`✅ ${file}`);
      console.log(`   ${result.changes} import(s) migrated`);

      if (result.skipped.length > 0) {
        console.log(`   ⏭️  Skipped: ${result.skipped.join(', ')}`);
      }

      if (result.warnings.length > 0) {
        result.warnings.forEach(w => console.log(`   ⚠️  ${w}`));
      }

      console.log('');
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n📊 SUMMARY:`);
  console.log(`   Files analyzed:  ${files.length}`);
  console.log(`   Files modified:  ${filesModified}`);
  console.log(`   Total changes:   ${totalChanges}`);

  if (dryRun) {
    console.log(`\n💡 Run without --dry-run to apply changes`);
  } else {
    console.log(`\n✅ Migration complete! Run typecheck to verify:`);
    console.log(`   pnpm --filter @repo/frontend typecheck`);
  }
}

main().catch(console.error);
