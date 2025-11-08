/**
 * Widget Definitions Seeder
 * Creates widget definitions for dashboard system
 */

import { PrismaClient } from '@prisma/client';
import { WIDGET_DEFINITIONS } from '../data/widgetDefinitions';

/**
 * Seed widget definitions
 * Creates all available dashboard widgets
 */
export async function seedWidgetDefinitions(prisma: PrismaClient) {
  console.log('\n📊 Seeding widget definitions...');

  // Check if widgets already exist
  const existingCount = await prisma.widgetDefinition.count();
  if (existingCount > 0) {
    console.log(`  ℹ️  ${existingCount} widget definitions already exist, skipping...`);
    return;
  }

  // Create all widget definitions in parallel
  const widgetRecords = await Promise.all(
    WIDGET_DEFINITIONS.map((widget) =>
      prisma.widgetDefinition.create({
        data: {
          key: widget.key,
          name: widget.name,
          description: widget.description,
          category: widget.category,
          type: widget.type,
          defaultSize: widget.defaultSize,
          minSize: widget.minSize,
          maxSize: widget.maxSize,
          permissions: widget.permissions,
          dataSource: widget.dataSource,
          refreshInterval: widget.refreshInterval,
          componentPath: widget.componentPath,
          icon: widget.icon,
          active: true,
        },
      })
    )
  );

  console.log(`  ✓ Created ${widgetRecords.length} widget definitions`);

  // Group by category for summary
  const byCategory = widgetRecords.reduce<Record<string, number>>(
    (acc, widget) => {
      acc[widget.category] = (acc[widget.category] || 0) + 1;
      return acc;
    },
    {}
  );

  console.log('  Widget breakdown by category:');
  Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .forEach(([category, count]) => {
      console.log(`    - ${category}: ${count} widgets`);
    });

  return widgetRecords;
}
