import type { ReactNode } from 'react';

export type LayoutRecipe = 'grid' | 'list' | 'masonry';

export interface LayoutConfig {
  recipe: LayoutRecipe;
  columns?: number;
  gap?: number;
}

/**
 * Apply layout recipe to widget components
 */
export function applyLayoutRecipe(
  widgets: ReactNode[],
  config: LayoutConfig
): ReactNode {
  const { recipe, columns = 2, gap = 4 } = config;

  switch (recipe) {
    case 'grid':
      return {
        type: 'div',
        className: `grid gap-${gap}`,
        style: { gridTemplateColumns: `repeat(${columns}, 1fr)` },
        children: widgets,
      };

    case 'list':
      return {
        type: 'div',
        className: `flex flex-col gap-${gap}`,
        children: widgets,
      };

    case 'masonry':
      // Simplified masonry (CSS columns)
      return {
        type: 'div',
        className: `columns-${columns} gap-${gap}`,
        children: widgets,
      };

    default:
      return widgets;
  }
}
