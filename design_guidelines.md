# Design Guidelines: Point of Sale (POS) System

## Design Approach
**System-Based Approach**: Drawing from Linear and Notion's clean, productivity-focused patterns. POS systems require clarity, efficiency, and trust—prioritizing usability over visual experimentation.

## Typography Hierarchy
- **Font Family**: Inter (Google Fonts) for all text—excellent readability at small sizes, professional appearance
- **Headings**: 
  - H1: text-4xl md:text-5xl, font-bold
  - H2: text-3xl md:text-4xl, font-semibold
  - H3: text-xl md:text-2xl, font-semibold
- **Body Text**: text-base, font-normal, leading-relaxed
- **Small Text** (labels, captions): text-sm, font-medium
- **Buttons**: text-sm md:text-base, font-semibold, uppercase tracking-wide

## Layout System
**Spacing Primitives**: Tailwind units of **2, 4, 6, 8, 12, 16**
- Component padding: p-4 to p-8
- Section spacing: py-12 md:py-16 lg:py-20
- Card/container gaps: gap-6 to gap-8
- Form field spacing: space-y-6

**Container Strategy**:
- Max-width: max-w-6xl for content sections
- Auth pages: max-w-md centered cards
- Full-width header/footer with inner max-w-6xl

## Component Library

### Landing Page Structure
1. **Header/Navigation**
   - Sticky navigation with logo left, primary CTA right
   - Height: h-16, backdrop-blur for depth
   - Navigation links: hidden md:flex (mobile: hamburger menu)

2. **Hero Section** (80vh)
   - Split layout: 50% compelling headline + 50% hero image
   - Hero image: Modern POS terminal in use, clean retail environment
   - Headline: Large, bold statement about streamlining sales
   - Dual CTA buttons: Primary "Start Free Trial" + Secondary "Watch Demo"
   - Trust indicators below CTAs: "No credit card required • 14-day trial"

3. **Features Grid** (3 columns desktop, stack mobile)
   - Icon + title + description cards
   - Icons: Use Heroicons (outline style)
   - Cards: subtle border, rounded-lg, p-6
   - Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3, gap-8

4. **Benefits/Use Cases** (2-column alternating)
   - Image left, text right (alternating pattern)
   - Images: POS dashboard screenshots, inventory management, sales reports
   - Each section: py-16 with generous spacing

5. **Social Proof Section**
   - 2-3 column testimonial cards
   - Include customer logo, quote, name, business type
   - Cards: rounded-xl, p-8, border

6. **Final CTA Section**
   - Centered, focused: "Ready to modernize your business?"
   - Primary CTA + supporting text about free trial
   - Background: subtle gradient or pattern for distinction

7. **Footer**
   - 4-column grid: Product, Company, Resources, Contact
   - Newsletter signup form
   - Social links + copyright

### Sign In Page
- **Layout**: Centered card (max-w-md) on clean background
- **Card Structure**:
  - Logo at top (mb-8)
  - Heading: "Sign in to your account"
  - Form fields with floating labels or top labels
  - "Remember me" checkbox + "Forgot password?" link (flex justify-between)
  - Full-width submit button
  - Divider with "or" text
  - Secondary option: "Don't have an account? Sign up"
- **Card styling**: rounded-2xl, p-8 md:p-12, shadow-xl

### Sign Up Page
- **Similar structure to Sign In** but expanded form
- **Additional fields**: Business name, Phone number
- **Terms acceptance checkbox** (required)
- **Progress indication**: If multi-step, show step indicator
- **Card**: same max-w-md centered approach

### Form Components
- **Input Fields**:
  - Height: h-12
  - Padding: px-4
  - Border: rounded-lg, border-2 (focus state uses accent color)
  - Typography: text-base
  - Spacing between fields: space-y-6

- **Primary Buttons**:
  - Background: Tomato accent (#FF6347)
  - Full-width on mobile, auto-width desktop
  - Height: h-12
  - Rounded: rounded-lg
  - Text: font-semibold, uppercase, tracking-wide
  - When over images: backdrop-blur-sm, bg-opacity-90

- **Secondary Buttons**:
  - Border style with accent color border
  - Same dimensions as primary

### Navigation
- **Desktop**: Horizontal menu in header
- **Mobile**: Slide-out drawer (right-side)
- **Active state**: Accent color underline or background highlight

## Images

**Hero Section**:
- Large hero image (right 50% of hero split-layout)
- Content: Modern POS terminal being used in bright, professional retail setting
- Style: High-quality, bright, professional photography

**Features/Benefits Sections**:
- Dashboard screenshots showing clean POS interface
- Inventory management screens
- Sales analytics/reports visualization
- Mobile POS app in action
- All images: Rounded corners (rounded-lg or rounded-xl)

**Testimonial Section**:
- Customer/business logos (grayscale for uniformity)

## Accessibility
- All form inputs have associated labels
- Focus states clearly visible with accent color rings (ring-2 ring-offset-2)
- Sufficient contrast ratios maintained
- Keyboard navigation fully supported
- ARIA labels for icon-only buttons

## Animations
**Minimal and purposeful**:
- Smooth page transitions (fade-in)
- Button hover: slight scale (scale-105)
- Card hover: subtle shadow increase
- No scroll-triggered animations

## Responsive Breakpoints
- Mobile-first approach
- Key breakpoints: md:768px, lg:1024px, xl:1280px
- Stack columns on mobile, expand on desktop
- Touch-friendly tap targets (min 44px) on mobile

This design creates a professional, trustworthy POS system that prioritizes clarity and conversion while maintaining visual appeal through clean layouts and strategic imagery.