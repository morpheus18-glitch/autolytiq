// ============================================================
// FILE REVIEW STATUS: ✅ APPROVED - KEEP
// Reviewed: 2025-11-08 13:50
// Action: Keep in apps/frontend/
// Reason: Enforces design system usage, critical for consistency
// ============================================================

/**
 * ESLint Configuration for AutolytiQ Frontend
 * Enforces component library usage and bans inline Tailwind
 */

export default [
  {
    ignores: ['src/_backup/**', 'dist/**', 'node_modules/**'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      // Ban inline className with bg-, text-, border-, rounded-, px-, py-, p-, m-, etc. patterns
      // These should use components from @repo/ui instead
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXAttribute[name.name="className"] Literal[value=/bg-|text-(?!balance)|border-(?!0)|rounded-|px-|py-|p-|m-|w-(?!full|screen)|h-(?!full|screen)|flex|grid|items-|justify-|gap-/]',
          message: 'Use components from @repo/ui instead of inline Tailwind classes. Import from "@repo/ui".',
        },
        {
          selector: 'JSXAttribute[name.name="className"] TemplateLiteral',
          message: 'Avoid template literals for className. Use components from @repo/ui with proper variants instead.',
        },
      ],

      // Ban direct Radix UI imports - must use wrapped components from @repo/ui
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@radix-ui/*'],
              message: 'Import Radix components from @repo/ui instead of directly from @radix-ui. This ensures consistent styling and behavior.',
            },
          ],
        },
      ],
    },
  },
];
