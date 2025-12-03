# SproutDrive Design Guidelines

## Design Approach

**Selected System: Linear-inspired Design System**  
Justification: SproutDrive is a data-heavy business productivity tool requiring clarity, efficiency, and intuitive workflows. Linear's design principles excel at balancing visual polish with functional density - perfect for non-technical users managing complex inventory, orders, and analytics. The clean aesthetic reduces cognitive load while maintaining professional credibility.

**Core Principles:**
- Functional clarity over decoration
- Information hierarchy through typography and spacing
- Consistent, predictable interaction patterns
- Mobile-first responsive design for delivery staff

---

## Typography

**Font Stack: Inter (Google Fonts)**
- Headings (H1): 32px / font-semibold
- Headings (H2): 24px / font-semibold  
- Headings (H3): 18px / font-semibold
- Body: 15px / font-normal
- Small/Meta: 13px / font-normal
- Buttons/Labels: 14px / font-medium

**Hierarchy Rules:**
- Dashboard metrics: 36px bold numbers, 13px light labels
- Table headers: 13px uppercase, letter-spacing-wide, font-semibold
- Form labels: 14px font-medium
- Data values in tables: 15px font-normal

---

## Layout System

**Spacing Scale (Tailwind units):**
Primary scale: 2, 3, 4, 6, 8, 12, 16, 24
- Component padding: p-4, p-6, p-8
- Section spacing: mb-8, mb-12, mb-16
- Card spacing: p-6 for content, p-4 for compact
- Form field gaps: gap-4, gap-6

**Grid Structure:**
- Container: max-w-7xl mx-auto px-4 lg:px-8
- Two-column layouts: grid-cols-1 lg:grid-cols-2 gap-6
- Three-column cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
- Dashboard metrics: grid-cols-2 md:grid-cols-4 gap-4

---

## Component Library

### Navigation
**Top Navigation Bar:**
- Fixed header with h-16, backdrop-blur, border-b
- Logo left, navigation center, user menu right
- Navigation items: px-4, hover:bg-opacity-10 transitions
- Mobile: Hamburger menu, slide-in drawer

**Sidebar (Owner/Admin):**
- w-64, fixed left, h-screen with overflow-y-auto
- Grouped menu sections with dividers (border-b, my-2)
- Active state: full-width accent indicator (border-l-4)
- Icons: 20px, mr-3 from Heroicons

### Dashboard Cards
**Metric Cards:**
- Rounded-lg, border, p-6
- Large number (36px) with small label below
- Icon top-right (24px, opacity-50)
- Grid layout for 2-4 metrics

**Info Cards:**
- Rounded-lg, border, p-6, hover:shadow-md transition
- Header with title and action icon
- Content area with clear hierarchy
- Footer with metadata (text-sm, opacity-70)

### Forms
**Input Fields:**
- Full-width, h-10, rounded-md, border, px-3
- Focus: ring-2 ring-offset-1
- Label above: mb-2, font-medium, text-sm
- Error state: border-red-500, text-red-600 message below

**Form Layout:**
- Single column on mobile, grid-cols-2 on desktop for compact fields
- Full-width for textareas and selects
- Submit button: w-full sm:w-auto, bottom-right aligned

### Tables
**Data Tables:**
- Full-width, border, rounded-lg
- Header: bg-gray-50, border-b-2, sticky top-0
- Rows: border-b, hover:bg-gray-50
- Cell padding: px-4 py-3
- Actions column: right-aligned, icon buttons
- Mobile: Cards replace table rows

### Buttons
**Primary Action:**
- h-10, px-6, rounded-md, font-medium
- Full-width on mobile, inline-flex items-center

**Secondary:**
- h-10, px-4, rounded-md, border, font-medium

**Icon Buttons:**
- h-8 w-8, rounded-md, flex items-center justify-center
- Used for table actions, close buttons

### Modals & Overlays
**Modal:**
- Centered overlay, max-w-2xl, rounded-lg
- Header: p-6, border-b with title and close button
- Body: p-6, max-h-96 overflow-y-auto
- Footer: p-6, border-t, flex justify-end gap-3

**Alerts/Notifications:**
- Fixed top-right, w-96, p-4, rounded-lg, border-l-4
- Auto-dismiss after 5s
- Icon left, message center, close right

### Charts (Analytics)
**Chart Containers:**
- Rounded-lg, border, p-6
- Title and date filter header: flex justify-between mb-6
- Chart area: minimum h-64
- Use Chart.js with clean, minimal styling

### Special Components
**Planting Calendar:**
- Grid showing 7-10 days ahead
- Each day: card with date, beds ready, kg available
- Visual indicator for low stock days

**Delivery Checklist:**
- List with checkboxes, customer name, ordered vs delivered inputs
- Expandable rows for details
- Summary footer with totals

**Van Alert Cards:**
- Warning style: border-l-4 amber, bg-amber-50
- Urgent style: border-l-4 red, bg-red-50
- Icon, title, expiry date, action button

---

## Images

**Dashboard Hero (Owner):**
- Header area with subtle background pattern or gradient
- Height: h-32, contains welcome message and quick stats
- No large hero image needed - functional dashboard focus

**Empty States:**
- Simple illustration placeholders for empty tables/lists
- Center-aligned, max-w-sm, opacity-50
- Text: "No suppliers added yet" with add button below

**Icons Throughout:**
- Heroicons (outline style) via CDN
- 20px for navigation, 16px for inline, 24px for cards
- Consistent usage: Truck for delivery, Chart for analytics, Package for inventory

---

## Responsive Behavior

**Breakpoints:**
- Mobile: < 640px - Single column, full-width cards, stacked forms
- Tablet: 640-1024px - Two columns where applicable
- Desktop: > 1024px - Full layout with sidebar

**Mobile-Specific:**
- Bottom navigation bar for Staff/Delivery role (easier thumb access)
- Tables convert to stacked cards
- Hide sidebar, show hamburger menu
- Larger touch targets (min-h-12 for buttons)

---

## Accessibility
- All form inputs with proper labels and error states
- Focus states visible on all interactive elements (ring-2)
- Sufficient contrast ratios for text
- Keyboard navigation support throughout
- ARIA labels for icon-only buttons

---

## Animation
**Minimal and Purposeful:**
- Transitions: transition-all duration-200 for hover states
- Loading spinners: Rotate animation on data fetch
- Modal/drawer: Slide and fade-in (duration-300)
- No scroll animations or decorative motion