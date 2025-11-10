# Mobile UI Polish - Cash App Inspired Design

## Design Principles (Cash App Style)

### 1. **Visual Hierarchy**
- Clear separation between sections
- Generous white space
- Bold, confident typography
- Reduced visual noise

### 2. **Portrait-First Layout**
- Optimized for 375x667 (iPhone SE) to 428x926 (iPhone 14 Pro Max)
- Single-column layouts
- Comfortable thumb zones
- No horizontal scrolling

### 3. **Polish & Refinement**
- Subtle shadows (not heavy drop shadows)
- Smooth animations (200-300ms)
- Haptic-like feedback (scale animations)
- Rounded corners (12-16px for cards)

### 4. **Cash App UI Patterns**
- Large, tappable cards (min 72px height)
- Clear call-to-action buttons
- Status indicators with icons
- Inline actions (swipe reveals)
- Pull-to-refresh with elegant spinner

## Implementation Checklist

### Typography
- [ ] Increase header sizes (28px → 32px)
- [ ] Bold weights for primary text (600 → 700)
- [ ] Tighter letter-spacing (-0.01em)
- [ ] Consistent line heights (1.2 for headers, 1.5 for body)

### Spacing
- [ ] Increase card padding (16px → 20px)
- [ ] Add more vertical rhythm (16px gaps → 20px)
- [ ] Reduce density - more breathing room
- [ ] Consistent 4px/8px/12px/16px/20px/24px scale

### Colors
- [ ] Higher contrast text (increase opacity)
- [ ] Softer backgrounds (reduce harsh whites)
- [ ] Accent colors pop more (increase saturation)
- [ ] Subtle card borders (1px with low opacity)

### Cards
- [ ] Border radius: 16px (was 8px)
- [ ] Shadow: 0 2px 8px rgba(0,0,0,0.08)
- [ ] Border: 1px solid rgba(0,0,0,0.06)
- [ ] Padding: 20px (was 16px)

### Touch Targets
- [ ] Increase min height to 56px (was 44px)
- [ ] Add more padding around tap areas
- [ ] Larger swipe zones
- [ ] Better visual feedback on tap

### Animations
- [ ] Faster transitions (200ms → 150ms)
- [ ] Ease-out timing functions
- [ ] Scale down on tap: 0.98 → 0.96
- [ ] Smooth color transitions

### Bottom Navigation
- [ ] Increase height to 72px (was 64px)
- [ ] Larger icons (24px → 28px)
- [ ] More prominent active state
- [ ] Add subtle background glow on active

## Key Changes for Portrait Mode

1. **Header Compression**
   - Reduce header padding (save vertical space)
   - Sticky headers with blur backdrop

2. **Card Layout**
   - Stack vertically (no grids)
   - Full-width cards with side padding
   - Increased card heights for touch

3. **List Optimization**
   - Dense list items for data feeds
   - Swipe actions more prominent
   - Clear visual separators

4. **Tab Bar**
   - Fixed to bottom (already done)
   - Safe area padding for iPhone notch
   - Backdrop blur effect
