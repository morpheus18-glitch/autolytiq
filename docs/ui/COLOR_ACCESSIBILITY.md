# Color Accessibility - WCAG Compliance Tools

Complete toolkit for ensuring WCAG 2.1 color contrast compliance in your design system.

## Components

### ColorContrastChecker

Visual component for checking and displaying WCAG color contrast compliance.

```tsx
import { ColorContrastChecker } from '@repo/ui';

// Basic usage
<ColorContrastChecker
  foreground="#000000"
  background="#FFFFFF"
/>

// Customized
<ColorContrastChecker
  foreground="#0EA5E9"
  background="#1E293B"
  showLargeText={true}
  showBadges={true}
  showSwatches={true}
  className="my-4"
/>
```

**Features:**
- 🎨 Visual color swatches and preview
- 📊 Contrast ratio display (e.g., 4.5:1)
- ✅ AA/AAA compliance badges
- 📋 Detailed compliance breakdown
- 🌓 Supports normal and large text

## Utilities

### getContrastRatio()

Calculate the contrast ratio between two colors.

```typescript
import { getContrastRatio } from '@repo/ui';

const ratio = getContrastRatio('#000000', '#FFFFFF');
// Returns: 21 (perfect contrast)

const ratio2 = getContrastRatio('#0EA5E9', '#1E293B');
// Returns: 4.52
```

### checkContrast()

Full WCAG compliance check with detailed results.

```typescript
import { checkContrast } from '@repo/ui';

const result = checkContrast('#0EA5E9', '#1E293B');
// Returns:
// {
//   ratio: 4.52,
//   AA: {
//     normal: true,  // ✓ Passes (≥ 4.5:1)
//     large: true    // ✓ Passes (≥ 3:1)
//   },
//   AAA: {
//     normal: false, // ✗ Fails (< 7:1)
//     large: true    // ✓ Passes (≥ 4.5:1)
//   }
// }
```

### getSuggestedForeground()

Automatically select black or white for optimal contrast.

```typescript
import { getSuggestedForeground } from '@repo/ui';

const textColor = getSuggestedForeground('#0EA5E9');
// Returns: '#000000' (black has better contrast)

const textColor2 = getSuggestedForeground('#1E293B');
// Returns: '#FFFFFF' (white has better contrast)
```

### isDark()

Check if a color is "dark" (luminance < 0.5).

```typescript
import { isDark } from '@repo/ui';

isDark('#000000'); // true
isDark('#FFFFFF'); // false
isDark('#1E293B'); // true
```

### getComplianceLevel()

Get the WCAG compliance level for a contrast ratio.

```typescript
import { getComplianceLevel } from '@repo/ui';

getComplianceLevel(7.5);       // 'AAA'
getComplianceLevel(4.5);       // 'AA'
getComplianceLevel(3.0);       // 'Fail'
getComplianceLevel(3.0, true); // 'AA' (large text)
```

## Hooks

### useColorContrast()

React hook for checking color contrast compliance.

```tsx
import { useColorContrast } from '@repo/ui';

function ColorPicker() {
  const [bg, setBg] = useState('#1E293B');
  const [fg, setFg] = useState('#0EA5E9');

  const { result, isAccessible, suggestedForeground } = useColorContrast({
    foreground: fg,
    background: bg,
    minRatio: 4.5 // AA standard for normal text
  });

  return (
    <div>
      <p>Contrast: {result.ratio}:1</p>
      <p>Accessible: {isAccessible ? '✓' : '✗'}</p>
      <p>Suggested: {suggestedForeground}</p>
    </div>
  );
}
```

### useAccessibleForeground()

Auto-select accessible text color for a background.

```tsx
import { useAccessibleForeground } from '@repo/ui';

function Card({ backgroundColor, children }) {
  const textColor = useAccessibleForeground(backgroundColor);

  return (
    <div style={{ backgroundColor, color: textColor }}>
      {children}
    </div>
  );
}
```

## WCAG Standards

### Level AA (Minimum)
- **Normal Text**: 4.5:1 contrast ratio
- **Large Text** (≥18pt or ≥14pt bold): 3:1 contrast ratio

### Level AAA (Enhanced)
- **Normal Text**: 7:1 contrast ratio
- **Large Text**: 4.5:1 contrast ratio

## Real-World Examples

### Design System Validation

```tsx
import { checkContrast } from '@repo/ui';

const brandColors = {
  primary: '#0EA5E9',
  background: '#1E293B'
};

const result = checkContrast(brandColors.primary, brandColors.background);

if (!result.AA.normal) {
  console.warn('Brand colors do not meet AA standards!');
}
```

### Dynamic Theme Generator

```tsx
import { useColorContrast, getSuggestedForeground } from '@repo/ui';

function ThemeGenerator({ backgroundColor }) {
  const textColor = getSuggestedForeground(backgroundColor);

  const { result } = useColorContrast({
    foreground: textColor,
    background: backgroundColor
  });

  return (
    <div
      style={{
        backgroundColor,
        color: textColor
      }}
      className="p-4 rounded"
    >
      <p>This text has {result.ratio}:1 contrast</p>
      <p>Compliance: {result.AA.normal ? 'AA ✓' : 'AA ✗'}</p>
    </div>
  );
}
```

### Accessibility Audit Tool

```tsx
import { ColorContrastChecker } from '@repo/ui';

function AccessibilityAudit() {
  const colorPairs = [
    { fg: '#000000', bg: '#FFFFFF', name: 'Default' },
    { fg: '#0EA5E9', bg: '#1E293B', name: 'Primary on Dark' },
    { fg: '#F59E0B', bg: '#FFFFFF', name: 'Warning' },
  ];

  return (
    <div className="space-y-4">
      <h2>Color Accessibility Audit</h2>
      {colorPairs.map((pair) => (
        <div key={pair.name}>
          <h3>{pair.name}</h3>
          <ColorContrastChecker
            foreground={pair.fg}
            background={pair.bg}
          />
        </div>
      ))}
    </div>
  );
}
```

## TypeScript Support

All utilities and components are fully typed:

```typescript
import type {
  ContrastResult,
  ColorContrastCheckerProps,
  UseColorContrastOptions,
  UseColorContrastReturn
} from '@repo/ui';

const result: ContrastResult = checkContrast('#000', '#FFF');
```

## Best Practices

1. **Always check normal text**: Default to AA standards (4.5:1)
2. **Use getSuggestedForeground()**: For dynamic themes
3. **Test in both modes**: Check light and dark mode separately
4. **Document exceptions**: If you must violate standards, document why
5. **Audit regularly**: Use ColorContrastChecker in design reviews

## Resources

- [WCAG 2.1 Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Accessible Colors](https://accessible-colors.com/)
