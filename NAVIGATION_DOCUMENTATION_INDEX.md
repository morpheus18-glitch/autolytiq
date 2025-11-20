# AutolytiQ Frontend Navigation & Routing Documentation Index

Complete documentation of the AutolytiQ frontend application's navigation and routing system.

---

## Documentation Files

### 1. README_NAVIGATION_EXPLORATION.md (11 KB)
**Start here** - Quick overview and navigation

Contains:
- Summary of what was explored
- Quick reference to all 4 documentation files
- Key findings at a glance
- Navigation architecture overview
- Component hierarchy diagram
- Quick reference for main files
- Responsive behavior table
- Authentication flow
- Exploration statistics
- Key takeaways
- Technologies used

**Best for**: Getting a quick overview of the entire navigation system

---

### 2. NAVIGATION_AND_ROUTING_STRUCTURE.md (20 KB)
**Most comprehensive** - Complete technical reference

Contains:
- Main application entry point (main.tsx, App.tsx)
- Routing configuration with all 165+ routes organized by domain
- Detailed descriptions of all 5 navigation components:
  - TopNavigation
  - Sidebar
  - CollapsibleSidebar
  - MobileFooterMenu
  - MobileNav
- Layout components (AppShell, MobileLayout)
- Navigation configuration (WORKFLOW_SECTIONS, MOBILE items, QUICK_ACTIONS)
- Authentication and route protection flow
- Routing patterns and dynamic routes
- Mobile-specific navigation details
- Active route detection methods
- Quick actions and search functionality
- Navigation state management patterns
- Component hierarchy tree
- Custom hooks used
- File structure overview
- Styling and theming
- Error handling and loading states
- Summary of 16 key points

**Best for**: In-depth understanding of how navigation and routing works

---

### 3. NAVIGATION_VISUAL_GUIDE.md (27 KB)
**Most visual** - Diagrams and flowcharts

Contains ASCII art diagrams for:
- Application architecture flow
- Authenticated user layout structure
- Top navigation structure (desktop/tablet)
- Mobile navigation (bottom bar and overlay)
- Route filtering flow diagram
- Responsive breakpoints diagram
- Active route detection process
- Page component loading flow
- Navigation state management structure
- Authentication guard pattern
- Deep linking examples
- Component lifecycle sequences
- Summary of architecture components

**Best for**: Visual learners who need to see the architecture

---

### 4. NAVIGATION_FILES_INVENTORY.md (16 KB)
**Most detailed** - Complete file listing

Contains:
- Core application files locations
- Routing files
- All 5 navigation components with file sizes and line counts
- Layout components
- Configuration files
- Page components organized by domain:
  - Root pages (9 files)
  - Admin pages (22 files)
  - Accounting pages (20 files)
  - Analytics pages (2 files)
  - Auth pages (2 files)
  - Communications pages (5 files)
  - Customer pages (4 files)
  - Desking pages (5 files)
  - Deal pages (1 file)
  - Inventory pages (6 files)
  - Finance pages (4 files)
  - Leads pages (4 files)
  - Reports pages (4 files)
  - Service pages (7 files)
  - Settings pages (12 files)
  - Misc pages (50+ files)
- Feature-specific navigation (F&I feature - 10 files)
- Component library (30+ UI components)
- Custom components by domain
- Hooks, utilities, context, stores, styling
- File count summary
- Key file relationships

**Best for**: Finding specific files or understanding file organization

---

## How to Use This Documentation

### For Quick Understanding
1. Start with: **README_NAVIGATION_EXPLORATION.md**
2. Then view: **NAVIGATION_VISUAL_GUIDE.md** for architecture diagrams

### For Learning Implementation Details
1. Read: **NAVIGATION_AND_ROUTING_STRUCTURE.md** (sections 1-10)
2. Reference: **NAVIGATION_VISUAL_GUIDE.md** for visual clarification
3. Check: **NAVIGATION_FILES_INVENTORY.md** for specific file locations

### For Finding Specific Components
1. Search: **NAVIGATION_FILES_INVENTORY.md** for file paths
2. Read: **NAVIGATION_AND_ROUTING_STRUCTURE.md** for component details
3. View: **NAVIGATION_VISUAL_GUIDE.md** for relationship diagrams

### For Understanding Routes
1. Read: **NAVIGATION_AND_ROUTING_STRUCTURE.md** section 2 (Routing Configuration)
2. Check: **NAVIGATION_VISUAL_GUIDE.md** Route Filtering Flow
3. Look up: **NAVIGATION_FILES_INVENTORY.md** for page file locations

### For Mobile Development
1. Check: **NAVIGATION_AND_ROUTING_STRUCTURE.md** section 8 (Mobile Navigation)
2. View: **NAVIGATION_VISUAL_GUIDE.md** Mobile Navigation diagram
3. Find files: **NAVIGATION_FILES_INVENTORY.md** mobile components section

---

## Key Information at a Glance

### Total Routes: 165+

Organized by domain:
- Admin: 22 routes
- Accounting: 20 routes
- Settings: 12 routes
- Service: 7 routes
- Inventory: 6 routes
- Communications: 5 routes
- Desking: 5 routes
- Finance: 4 routes
- Customer: 4 routes
- Leads: 4 routes
- Reports: 4 routes
- Deals: 2 routes
- Analytics: 2 routes
- Auth: 2 routes
- Root level: 7 routes
- Misc: 50+ routes

### 5 Main Navigation Components

1. **TopNavigation** - Primary header navigation (540 lines)
2. **Sidebar** - Alternative full-page navigation (235 lines)
3. **CollapsibleSidebar** - Desktop collapsible sidebar (212 lines)
4. **MobileFooterMenu** - Bottom navigation for mobile (234 lines)
5. **MobileNav** - Sheet drawer for mobile (87 lines)

### 8 Workflow Sections

1. Inventory
2. CRM & Leads
3. Sales Process
4. Finance & Insurance
5. Service
6. Intelligence (Analytics)
7. Reports
8. Accounting

### Router: Wouter
Lightweight client-side router with:
- 165+ lazy-loaded routes
- Dynamic route matching
- Wildcard support
- URL parameter support

### Authentication
- Uses `useAuth()` hook
- Role-based route filtering
- Section-level permissions
- Wildcard `'*'` grants all access

### Mobile Support
- 3+ responsive breakpoints
- Bottom tab bar (4 items)
- Expandable overlay menu
- Safe area support
- Touch-optimized UI

### Total Files: 250+

- Navigation components: 5
- Layout components: 2
- Routes: 1 file (165+ definitions)
- Page components: 150+
- UI components: 30+
- Custom components: 40+
- Hooks: 3+
- Utilities: 4+

---

## File Locations

All files in: `/root/autolytiq/apps/frontend/src/`

### Key Files
- `main.tsx` - Entry point
- `App.tsx` - Root component with router
- `routes/index.tsx` - All route definitions
- `config/navigation.ts` - Navigation configuration
- `components/top-navigation.tsx` - Main navigation
- `components/mobile-footer-menu.tsx` - Mobile navigation
- `components/layout/app-shell.tsx` - App shell wrapper
- `components/layouts/MobileLayout.tsx` - Mobile layout

### Key Directories
- `components/` - React components
- `pages/` - Routable pages
- `hooks/` - Custom hooks
- `config/` - Configuration files
- `lib/` - Utility functions
- `contexts/` - Context providers

---

## Navigation Technologies

- **React 18.3.1** - UI framework
- **Wouter** - Routing library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Query** - Server state
- **Zustand** - Global state (optional)
- **Radix UI** - Headless components

---

## Related Documentation

Additional docs in the AutolytiQ project:
- `/root/autolytiq/apps/frontend/README.md` - Frontend README
- `/root/autolytiq/QUICK-START.md` - Quick start guide
- `/root/autolytiq/README.md` - Main project README

---

## Questions & Answers

**Q: Which file defines all the routes?**
A: `/root/autolytiq/apps/frontend/src/routes/index.tsx` - contains 165+ route definitions

**Q: Which file contains navigation structure?**
A: `/root/autolytiq/apps/frontend/src/config/navigation.ts` - contains WORKFLOW_SECTIONS and menu items

**Q: Which component is the main navigation?**
A: `TopNavigation` in `/root/autolytiq/apps/frontend/src/components/top-navigation.tsx`

**Q: How does mobile navigation work?**
A: MobileFooterMenu provides bottom tab bar (4 items) with expandable overlay menu for full navigation

**Q: How are routes protected?**
A: useAuth() hook filters routes based on user's allowedRoutes and navigationSections

**Q: Where is the page content wrapped?**
A: AppShell (app-shell.tsx) wraps content with TopNavigation header and MobileFooterMenu footer

**Q: How is the current page highlighted in navigation?**
A: Active route detection using useLocation() hook and path matching algorithms

**Q: How many navigation components are there?**
A: 5 main navigation components (TopNavigation, Sidebar, CollapsibleSidebar, MobileFooterMenu, MobileNav)

---

## Getting Started

1. Start with: **README_NAVIGATION_EXPLORATION.md**
2. Understand architecture: **NAVIGATION_VISUAL_GUIDE.md**
3. Learn details: **NAVIGATION_AND_ROUTING_STRUCTURE.md**
4. Find files: **NAVIGATION_FILES_INVENTORY.md**

---

## Document Statistics

- **Total Documentation**: 4 markdown files
- **Total Pages**: ~74 pages of content
- **Total File Size**: ~74 KB
- **Total Words**: ~15,000+
- **Diagrams**: 15+
- **Code Examples**: 20+
- **Files Catalogued**: 250+
- **Routes Documented**: 165+
- **Components Detailed**: 50+

---

**Last Updated**: November 4, 2025
**Created**: November 4, 2025
**Project**: AutolytiQ Frontend Navigation & Routing
**Status**: Complete

