# iOS Quality Standards for AutolytiQ Mobile

## Typography (SF Pro / Inter Style)

### Headers
- **Large Title**: 34px, -0.02em tracking, 700 weight, line-height 1.1
- **Title 1**: 28px, -0.015em tracking, 700 weight, line-height 1.15
- **Title 2**: 22px, -0.01em tracking, 600 weight, line-height 1.2
- **Title 3**: 20px, normal tracking, 600 weight, line-height 1.25

### Body Text
- **Body**: 17px, normal tracking, 400 weight, line-height 1.4
- **Subheadline**: 15px, normal tracking, 400 weight, line-height 1.35
- **Footnote**: 13px, normal tracking, 400 weight, line-height 1.3
- **Caption**: 12px, normal tracking, 400 weight, line-height 1.3

## Spacing (8pt Grid)

```
4px  = 0.5 unit
8px  = 1 unit
12px = 1.5 units
16px = 2 units
20px = 2.5 units
24px = 3 units
32px = 4 units
40px = 5 units
48px = 6 units
```

### Card Spacing
- **Card padding**: 16px (vertical) × 16px (horizontal)
- **Between cards**: 12px gap
- **Section spacing**: 24px
- **Screen padding**: 16px left/right

## Colors (iOS System Colors Inspired)

### Backgrounds
- **Primary**: #000000 (dark) / #FFFFFF (light)
- **Secondary**: #1C1C1E (dark) / #F2F2F7 (light)
- **Tertiary**: #2C2C2E (dark) / #FFFFFF (light)
- **Grouped**: #000000 (dark) / #F2F2F7 (light)

### Labels
- **Primary**: rgba(255,255,255,1.0) (dark) / rgba(0,0,0,0.85) (light)
- **Secondary**: rgba(255,255,255,0.55) (dark) / rgba(0,0,0,0.55) (light)
- **Tertiary**: rgba(255,255,255,0.25) (dark) / rgba(0,0,0,0.25) (light)

### Separators
- **Opaque**: rgba(255,255,255,0.15) (dark) / rgba(0,0,0,0.08) (light)
- **Non-opaque**: rgba(255,255,255,0.06) (dark) / rgba(0,0,0,0.04) (light)

## Touch Targets

- **Minimum**: 44pt = 68px at 1.54x (iPhone standard)
- **Recommended**: 48pt = 74px
- **Comfortable**: 56pt = 86px
- **List rows**: 44pt minimum height

## Animations (Spring Physics)

### Timing Functions
```css
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-in-out-smooth: cubic-bezier(0.45, 0, 0.55, 1);
```

### Durations
- **Fast**: 150ms (button taps)
- **Normal**: 250ms (transitions)
- **Slow**: 350ms (complex animations)

### Scale Transforms
- **Button press**: scale(0.96) with ease-out-back
- **Card tap**: scale(0.98) with ease-out-expo
- **Active state**: scale(0.95) for 80ms

## Borders & Shadows

### Borders
- **AVOID**: Heavy borders (1px+)
- **USE**: Hairline separators (0.5px)
- **USE**: Subtle background fills instead

### Shadows
- **None**: Default for most cards
- **Subtle**: 0 1px 3px rgba(0,0,0,0.08) for elevated
- **Medium**: 0 4px 12px rgba(0,0,0,0.12) for modals

## iOS Patterns

### List Cells
```
┌─────────────────────────────┐
│ Icon  Title          Badge  │ ← 44pt min height
│       Subtitle       Arrow  │ ← Inset separator (16px from left)
├─────────────────────────────┤
```

### Cards
```
┌─────────────────────────────┐
│  ┌───────────────────────┐  │ ← No outer border
│  │                       │  │
│  │   Content             │  │ ← Clean, minimal
│  │                       │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

### Bottom Tabs
```
┌───┬───┬───┬───┐
│ ● │   │   │   │ ← Active: filled icon + label
│Home│Work│Rep│Set│ ← Inactive: outline icon + dimmed label
└───┴───┴───┴───┘
     ↑ 72pt height, safe area padding
```

## Implementation Checklist

### Remove
- [ ] Heavy card borders (use subtle bg instead)
- [ ] Drop shadows on every card (reserve for elevation)
- [ ] Linear timing functions (use spring/expo)
- [ ] Small touch targets (< 44pt)
- [ ] Harsh color contrasts

### Add
- [ ] Inset list separators (like iOS Settings)
- [ ] Spring-based animations
- [ ] Generous line-height (1.4+ for body text)
- [ ] Bold, confident headers (700 weight, tight tracking)
- [ ] Subtle, tasteful opacity for secondary text

### Polish
- [ ] Optical alignment (not just math)
- [ ] Content-first hierarchy
- [ ] Smooth 60fps scrolling
- [ ] Instant tap feedback (no delay)
- [ ] Natural gesture response
