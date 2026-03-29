# Rehab Cost Estimator — Full Build Specification

## Product: The Solo Closer — Rehab Cost Estimator
## Type: Single-File HTML App (Browser-Based)
## Price: TBD (likely $14.99–$19.99)
## Audience: Real estate investors (flippers, wholesalers, BRRRR), contractors bidding rehab jobs
## Distribution: Etsy (HTML file download) + Netlify (hosted web version)

---

## 1. PRODUCT OVERVIEW

### What It Does
A step-by-step wizard that walks a real estate investor (or contractor) through every room and system in a property, collects repair items with quantities and costs, and produces a professional PDF rehab estimate. After completing the estimate, the user can optionally switch to an **Invoice Generator** mode that converts the estimate data into a contractor-ready invoice — all within the same HTML file.

### Why It Exists
Every rehab estimator on Etsy is a static Excel spreadsheet or Google Sheet. The SaaS alternatives (FlipperForce, REI BlackBook, BiggerPockets Pro) charge $39–$99/month. There is **zero competition** on Etsy for an interactive, browser-based rehab estimator with PDF export, invoice generation, and no subscription fees. This is the exact gap The Solo Closer exploits with every HTML app.

### Competitive Differentiators
- **Interactive HTML app** — not a spreadsheet. Runs in any browser, no Excel required.
- **One-time purchase** — replaces $39–$99/month SaaS rehab tools.
- **Built-in invoice generator** — no separate tool needed for contractor billing.
- **Auto-calculated cost per square foot** on the final PDF — instant market comparison.
- **Works offline** (HTML download) AND online (Netlify hosted link).
- **Mobile-responsive** — usable on phone, tablet, and desktop.
- **localStorage persistence** — save multiple estimates, revisit and edit anytime.
- **Professional PDF export** — looks like it came from a funded operation, not a spreadsheet.

---

## 2. DESIGN SYSTEM

Follow the established Solo Closer design system exactly as implemented in the Deal Analyzer (`index.html`), Deal Packet Generator (`deal-packet-generator.html`), and Creative Finance Calculator.

### Colors
```css
--navy: #1B2A4A;
--navy-deep: #0F1A2E;
--navy-light: #253A5C;
--blue: #4472C4;
--blue-bright: #5B8BD6;
--blue-muted: #3A6AB8;
--blue-pale: #D6E4F0;
--blue-ghost: #EBF0FA;
--blue-tint: #F4F7FC;
--white: #FFFFFF;
--gray-50: #F8F9FB;
--gray-100: #F0F2F5;
--gray-200: #E1E5EB;
--gray-300: #CDD3DC;
--gray-400: #9DA5B4;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--green: #22C55E;
--green-bg: #DCFCE7;
--green-text: #166534;
--yellow: #F59E0B;
--yellow-bg: #FEF9C3;
--yellow-text: #854D0E;
--red: #EF4444;
--red-bg: #FEE2E2;
--red-text: #991B1B;
--orange: #F97316;
```

### Typography
- **Display headings:** Bebas Neue (use sparingly — PDF headers, hero sections)
- **Body text / UI:** DM Sans (weights: 300, 400, 500, 600, 700)
- **Data / numbers / currency:** JetBrains Mono (weights: 400, 500, 600, 700)
- **Base font size:** 15px
- **Google Fonts import:** Same pattern as Deal Analyzer

### Spacing & Layout
- **Border radius:** 10px (standard), 6px (small), 14px (large)
- **Shadows:** Use the same `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl` system
- **Transitions:** `0.25s cubic-bezier(0.4, 0, 0.2, 1)`

### Component Patterns
Reference the Deal Analyzer and Deal Packet Generator for:
- `.card` containers with consistent padding and shadow
- `.form-label` and `.form-input` styling
- `.btn`, `.btn-primary`, `.btn-secondary` button styles
- Step progress indicators with numbered circles and connectors
- Toast notifications for save/load/export feedback
- Modal confirmations for destructive actions (new estimate, delete)

---

## 3. APP ARCHITECTURE

### Single HTML File
- All CSS embedded in `<style>` tags
- All JavaScript embedded in `<script>` tags
- No external dependencies except Google Fonts CDN
- File should work when opened locally (double-click to open in browser) AND when served from Netlify

### Netlify Compatibility
- No server-side code required — pure static HTML/CSS/JS
- All data stored client-side via localStorage
- No API calls, no backend, no database
- The same file deployed to Netlify should work identically to the local version
- Include proper `<meta>` viewport tag for mobile: `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">`

### Mobile Responsiveness (CRITICAL)
The Netlify-hosted version will be used on phones. The app MUST be fully usable on:
- **Desktop** (1200px+): Full layout with sidebar
- **Tablet** (768px–1199px): Collapsed sidebar, stacked form fields
- **Mobile portrait** (320px–767px): Single column, touch-friendly inputs, hamburger menu for saved estimates
- **Mobile landscape**: Ensure no horizontal overflow

Responsive patterns to follow (reference Deal Packet Generator):
- Sidebar transforms to slide-out drawer on mobile with overlay
- Form rows collapse from multi-column to single column
- Step progress bar shows numbers only (hides labels) on small screens
- All touch targets minimum 44px × 44px
- Currency inputs should be large enough to tap and type on phone keyboard
- Use `inputmode="decimal"` on currency/number fields for proper mobile keyboard

---

## 4. STEP-BY-STEP WIZARD

The app uses a linear wizard flow. Each step is a panel that slides into view. The user can navigate forward/back or click completed step indicators to jump between steps.

### Step Progress Bar
Same pattern as Deal Analyzer and Deal Packet Generator:
- Numbered circles connected by lines
- Active step highlighted in navy/blue
- Completed steps show green checkmark
- Clickable to jump to any completed step
- On mobile: show numbers only, hide step names

---

### STEP 0: WELCOME / SAVED ESTIMATES (Landing Screen)

**Purpose:** Entry point. Show saved estimates (if any) and option to start new.

**UI Elements:**
- App logo/branding: "RC" in a rounded square (same pattern as "DA" in Deal Analyzer)
- Title: "Rehab Cost Estimator"
- Subtitle: "Professional rehab estimates in minutes — no spreadsheets, no subscriptions."
- **Saved Estimates Panel:**
  - Dropdown or card list of previously saved estimates (from localStorage)
  - Each shows: property address, date created, total estimate amount
  - Buttons: Load, Duplicate, Delete
- **"+ New Estimate" button** — clears form and starts at Step 1
- If no saved estimates, show a clean empty state with a big "Start Your First Estimate" button

**localStorage key:** `tsc_rehab_estimates` (array of estimate objects)
**Active estimate key:** `tsc_active_rehab_id`

---

### STEP 1: PROPERTY INFORMATION

**Purpose:** Capture basic property details that contextualize the estimate.

**Fields:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Property Address | text | Yes | Free text — street, city, state, zip |
| Property Type | select | Yes | Options: Single Family, Multi-Family (2-4), Townhouse, Condo, Mobile Home |
| Bedrooms | number | No | Integer |
| Bathrooms | number | No | Allows 0.5 increments (1, 1.5, 2, 2.5, etc.) |
| Total Square Footage | number | Yes | Used for cost-per-sqft calculation on PDF |
| Year Built | number | No | 4-digit year |
| Lot Size (sq ft) | number | No | |
| Stories | select | No | 1, 1.5, 2, 3+ |
| Foundation Type | select | No | Slab, Crawl Space, Basement, Pier & Beam |
| Garage | select | No | None, 1-Car Attached, 2-Car Attached, 1-Car Detached, 2-Car Detached |
| Property Condition | select | No | Options: Cosmetic Rehab, Moderate Rehab, Full Gut Rehab, Fire/Flood Damage |
| Rehab Level / Finish Quality | select | No | Options: Builder Grade, Mid-Range, High-End, Luxury |
| Notes | textarea | No | General notes about property condition |

**Auto-formatting:**
- Square footage: comma-separated (e.g., 1,850)
- Year built: 4-digit validation

**Navigation:** Next → Step 2

---

### STEP 2: EXTERIOR

**Purpose:** Capture all exterior repair/replacement items.

**Category Structure:**
Each category is a collapsible accordion section. Within each category, show common line items. Each line item has:
- **Item name** (pre-filled, editable)
- **Quantity** (number input, default 1)
- **Unit** (pre-filled based on item — e.g., "sq ft", "linear ft", "each", "per unit")
- **Unit Cost** (currency input — user enters their local cost)
- **Line Total** (auto-calculated: quantity × unit cost, displayed in JetBrains Mono)
- **Notes** (optional small text field for each line item)

**Exterior Categories & Default Line Items:**

**Roof**
- Tear-off existing roof | per sq (100 sq ft)
- New shingles (architectural) | per sq
- New shingles (3-tab) | per sq
- Roof decking / sheathing repair | per sheet
- Flashing replacement | linear ft
- Ridge vent | linear ft
- Gutters & downspouts | linear ft
- Fascia / soffit repair | linear ft
- Chimney repair / cap | each

**Siding & Exterior Walls**
- Vinyl siding | per sq ft
- Wood siding repair | per sq ft
- Stucco repair | per sq ft
- Brick repointing / repair | per sq ft
- Exterior paint (full) | per sq ft
- Exterior paint (touch-up) | lump sum
- Power washing | lump sum

**Windows & Exterior Doors**
- Window replacement (standard) | each
- Window replacement (large/bay) | each
- Window repair / reglaze | each
- Exterior door (entry) | each
- Exterior door (sliding glass) | each
- Storm door | each
- Garage door replacement | each
- Garage door opener | each

**Foundation & Structure**
- Foundation crack repair | linear ft
- Foundation waterproofing | linear ft
- Pier / post repair | each
- Grading / drainage correction | lump sum
- Sill plate replacement | linear ft
- Structural beam repair | each

**Landscaping & Grading**
- Tree removal | each
- Bush / shrub removal | each
- Sod / grass seed | per sq ft
- Mulch / rock beds | per sq ft
- Fence repair | linear ft
- Fence replacement | linear ft
- Driveway repair (concrete) | per sq ft
- Driveway repair (asphalt) | per sq ft
- Walkway / patio repair | per sq ft
- Deck repair | per sq ft
- Deck replacement | per sq ft
- Retaining wall | linear ft

**Miscellaneous Exterior**
- Debris removal / dumpster | each
- Permit fees | lump sum
- Exterior lighting | each
- Mailbox replacement | each
- House numbers / signage | each

**UI Features:**
- "Add Custom Item" button at the bottom of each category (user can add their own line items)
- Category subtotal shown at bottom of each accordion section
- Running total for all exterior work shown in a sticky summary bar
- Expand/collapse all toggle

**Navigation:** Back → Step 1 | Next → Step 3

---

### STEP 3: INTERIOR

**Purpose:** Capture all interior repair/replacement items.

**Same line-item structure as Step 2** (item name, qty, unit, unit cost, line total, notes).

**Interior Categories & Default Line Items:**

**Kitchen**
- Cabinet replacement (full) | linear ft
- Cabinet refacing | linear ft
- Cabinet hardware | per set
- Countertops (laminate) | per sq ft
- Countertops (granite/quartz) | per sq ft
- Countertops (butcher block) | per sq ft
- Backsplash tile | per sq ft
- Sink replacement | each
- Faucet replacement | each
- Garbage disposal | each
- Dishwasher | each
- Range / oven | each
- Microwave (over-range) | each
- Refrigerator | each
- Range hood / vent | each
- Kitchen flooring | per sq ft
- Kitchen lighting | each
- Kitchen paint | lump sum

**Bathrooms**
- Bathtub replacement | each
- Bathtub refinishing | each
- Shower replacement (prefab) | each
- Shower tile (custom) | per sq ft
- Toilet replacement | each
- Vanity replacement | each
- Bathroom faucet | each
- Mirror replacement | each
- Bathroom exhaust fan | each
- Bathroom tile floor | per sq ft
- Bathroom lighting | each
- Bathroom paint | lump sum
- Towel bars / accessories | per set
- Glass shower door | each

**Flooring**
- Hardwood (install) | per sq ft
- Hardwood (refinish) | per sq ft
- Laminate / LVP | per sq ft
- Tile (ceramic/porcelain) | per sq ft
- Carpet (install) | per sq ft
- Carpet (remove) | per sq ft
- Subfloor repair | per sq ft
- Floor leveling | per sq ft
- Baseboards / trim | linear ft
- Transition strips | each

**Painting & Drywall**
- Interior paint (full house) | per sq ft
- Interior paint (per room) | per room
- Drywall repair (small patch) | each
- Drywall repair (full sheet) | per sheet
- Drywall installation (new) | per sq ft
- Texture / skim coat | per sq ft
- Wallpaper removal | per sq ft
- Popcorn ceiling removal | per sq ft
- Crown molding | linear ft
- Chair rail / wainscoting | linear ft
- Door / trim paint | per door

**Doors & Trim**
- Interior door replacement | each
- Interior door hardware | each
- Closet doors (bi-fold) | each
- Closet doors (sliding) | each
- Door frame / casing | each
- Window trim / casing | each
- Stair railing / banister | linear ft

**Miscellaneous Interior**
- Smoke / CO detectors | each
- Interior lighting (per fixture) | each
- Ceiling fan | each
- Closet shelving / organizer | each
- Stair treads | each
- Fireplace repair | lump sum
- Built-in shelving | linear ft

**Same UI features as Step 2:** collapsible accordions, custom items, category subtotals, running total.

**Navigation:** Back → Step 2 | Next → Step 4

---

### STEP 4: MECHANICAL SYSTEMS

**Purpose:** Major systems — HVAC, plumbing, electrical.

**HVAC**
- Furnace replacement | each
- AC condenser replacement | each
- Full HVAC system (furnace + AC) | each
- Ductwork repair | linear ft
- Ductwork replacement (full) | lump sum
- Thermostat (smart) | each
- Thermostat (standard) | each
- Mini-split installation | each
- Boiler repair | lump sum
- Boiler replacement | each
- Radiator replacement | each
- HVAC service / tune-up | each

**Plumbing**
- Water heater (tank) | each
- Water heater (tankless) | each
- Main sewer line repair | lump sum
- Main water line repair | lump sum
- Re-pipe (full house, copper) | lump sum
- Re-pipe (full house, PEX) | lump sum
- Drain line repair | each
- Hose bib / outdoor faucet | each
- Sump pump | each
- Water softener | each
- Gas line repair / install | each
- Plumbing rough-in (new fixture) | each

**Electrical**
- Panel upgrade (100A to 200A) | each
- Panel replacement | each
- Full house rewire | lump sum
- Outlet replacement | each
- Outlet addition (new) | each
- GFCI outlet installation | each
- Light switch replacement | each
- Dedicated circuit (appliance) | each
- Ceiling fan wiring | each
- Recessed lighting (per can) | each
- Exterior outlet / light | each
- Doorbell (wired / smart) | each
- Smoke detector (hardwired) | each
- EV charger outlet (240V) | each

**Navigation:** Back → Step 3 | Next → Step 5

---

### STEP 5: SUMMARY & ADJUSTMENTS

**Purpose:** Review all costs, apply adjustments, see the full picture.

**Display:**
- **Category breakdown table** showing each major category (Exterior, Interior, Mechanical) with subtotals
- Within each, show sub-category totals (Roof, Siding, Kitchen, etc.)
- **Grand Subtotal** — sum of all line items
- **Contingency %** — slider or dropdown (5%, 10%, 15%, 20%, 25%) with editable override. Default 10%.
- **Contingency Amount** — auto-calculated (subtotal × contingency %)
- **Contractor Overhead & Profit** — optional percentage (0%, 10%, 15%, 20%, 25%). Default 0%. This is for investors who want to account for GC markup.
- **Contractor O&P Amount** — auto-calculated
- **Permits & Fees** — manual currency input (default $0)
- **Holding Costs During Rehab** — optional manual input
- **GRAND TOTAL** — subtotal + contingency + O&P + permits + holding costs
- **Cost Per Square Foot** — GRAND TOTAL ÷ property square footage (from Step 1). Displayed prominently in a highlight box. This is a KEY feature — auto-calculated, always visible on this summary and on the PDF.

**Visual Elements:**
- Horizontal bar chart or stacked bar showing cost breakdown by category
- Color-coded categories (use brand blues/greens/oranges)
- Highlight box for cost per square foot with a label like "Rehab Cost: $XX.XX / sq ft" — displayed in a navy card with large JetBrains Mono text

**Navigation:** Back → Step 4 | Next → Step 6

---

### STEP 6: EXPORT & INVOICE

**Purpose:** Export the estimate as PDF, and optionally generate a contractor invoice.

**Two Sub-Tabs within this step:**

#### Tab A: Rehab Estimate PDF

**User Inputs for PDF branding:**
- Your Name / Company Name
- Phone
- Email
- Website (optional)
- Company Logo (image upload, stored as base64 in localStorage)
- Prepared For (client/property owner name — optional)
- Custom disclaimer / notes for footer

**"Save as Default Profile"** button — saves branding info to localStorage so it auto-fills on future estimates (same pattern as Deal Packet Generator's wholesaler profile: `tsc_rehab_profile`).

**PDF Preview / Export:**
- "Preview & Print" button opens a new window with a print-optimized HTML page
- The PDF includes:
  - **Header:** Company branding, "Rehab Cost Estimate" title, property address, date
  - **Property Summary:** Type, beds/baths, sqft, year built, condition, finish level
  - **Cost Breakdown Table:** Every line item organized by category with quantities, unit costs, and line totals. Only items with values > $0 are shown.
  - **Summary Section:** Subtotal, contingency, O&P, permits, holding costs, **GRAND TOTAL**
  - **Cost Per Square Foot** — displayed prominently in a highlight box on the PDF. Format: "Estimated Rehab: $XX.XX per sq ft" alongside the total sqft.
  - **Notes / Disclaimer** at bottom
  - **Footer:** "Prepared by [Company Name] | [Date] | Generated by The Solo Closer"
- Print-optimized CSS: white background, clean typography, proper page breaks, `@page` rules
- PDF design style: Clean, professional — reference the Deal Analyzer PDF export pattern

#### Tab B: Invoice Generator

**Purpose:** Convert the completed estimate into a contractor invoice. This is the same data, repackaged.

**Additional Invoice-Specific Fields:**
| Field | Type | Notes |
|-------|------|-------|
| Invoice Number | text | Auto-generated (INV-001, INV-002...) with manual override |
| Invoice Date | date | Defaults to today |
| Due Date | date | Defaults to 30 days from today |
| Bill To — Name | text | Client / property owner / investor name |
| Bill To — Company | text | Optional |
| Bill To — Address | text | Optional |
| Bill To — Email | text | Optional |
| Bill To — Phone | text | Optional |
| Payment Terms | select | Due on Receipt, Net 15, Net 30, Net 45, Net 60, Custom |
| Payment Methods | text | e.g., "Check, Zelle, Wire Transfer" |
| Deposit Required | currency | Optional — if entered, shows deposit line on invoice |
| Deposit Paid | currency | Optional — shows balance due |
| Additional Notes | textarea | "Thank you for your business" type notes |
| Tax Rate % | number | Optional — 0% default. If entered, applies tax to subtotal. |

**Invoice PDF Output:**
- Professional invoice layout
- "INVOICE" header with invoice number and dates
- From (contractor) and Bill To (client) blocks side by side
- Itemized table (same line items from estimate, only items > $0)
- Subtotal, Tax (if applicable), Contingency, Total Due
- Deposit line (if entered) with Balance Due
- Payment terms and methods
- Notes / disclaimer
- Footer with company branding

**Key Behavior:** The invoice pre-populates ALL line items from the estimate. The user doesn't re-enter anything — they just add the invoice-specific fields (bill to, terms, etc.) and export.

**Navigation:** Back → Step 5

---

## 5. SAVE / LOAD SYSTEM

### localStorage Structure

Follow the same pattern as the Deal Packet Generator (`tsc_deal_packets`).

**Estimate Storage:**
```javascript
// Key: tsc_rehab_estimates
// Value: Array of estimate objects
[
  {
    id: "rehab_1711234567890",
    address: "123 Main St, Newark NJ",
    createdAt: "2026-03-29T14:30:00Z",
    updatedAt: "2026-03-29T15:45:00Z",
    totalEstimate: 45000,
    sqft: 1850,
    costPerSqft: 24.32,
    propertyInfo: { ... },       // Step 1 data
    exteriorItems: { ... },      // Step 2 data
    interiorItems: { ... },      // Step 3 data
    mechanicalItems: { ... },    // Step 4 data
    adjustments: { ... },        // Step 5 data (contingency, O&P, etc.)
    invoiceData: { ... },        // Step 6 Tab B data (if any)
  },
  // ... more estimates
]

// Key: tsc_active_rehab_id
// Value: ID string of the currently loaded estimate

// Key: tsc_rehab_profile
// Value: Object with default branding info
{
  name: "Ronny T",
  company: "Solo Investments LLC",
  phone: "(917) 564-1380",
  email: "ron@example.com",
  website: "",
  logo: "data:image/png;base64,...",
  disclaimer: "This estimate is for budgeting purposes..."
}
```

### Save Behavior
- **Auto-save** on every field change (debounced — save 500ms after last input)
- Manual "Save" button also available in toolbar
- Toast notification: "Estimate saved" (same toast pattern as Deal Analyzer)

### Load Behavior
- On app load, check for `tsc_active_rehab_id` and auto-load that estimate
- If no active estimate, show Welcome screen with saved estimates list

### Additional Data Management
- **Duplicate** an estimate (deep copy with new ID and "(Copy)" appended to address)
- **Delete** an estimate (with modal confirmation)
- **Export as JSON** — download the estimate data as a .json file (same pattern as Deal Analyzer's `downloadDeal()`)
- **Import from JSON** — upload a previously exported .json file to restore an estimate

---

## 6. TOPBAR / TOOLBAR

Reference the Deal Analyzer's topbar pattern:

**Desktop Topbar:**
- App logo: "RC" in blue rounded square
- App name: "Rehab Cost Estimator"
- Current property address (updates as user types in Step 1)
- Action buttons (icon + text on desktop, icon-only on mobile):
  - "+ New" — start new estimate (with confirmation modal)
  - "Save" — manual save to localStorage
  - "Export JSON" — download estimate data
  - "Import JSON" — upload estimate data
  - "Print PDF" — goes to Step 6 Tab A export

**Mobile Topbar:**
- Hamburger menu for saved estimates drawer
- App name
- Compact action buttons

---

## 7. PDF EXPORT PATTERN

Follow the Deal Analyzer's `exportPDF()` pattern exactly:

1. Collect all current data with a `collectEstimateData()` function
2. Build a complete HTML string with inline styles (no external CSS — the PDF is a self-contained HTML page)
3. Open in a new window with `window.open()`
4. Trigger `window.print()` after a 400ms delay (allows fonts to load)
5. Use `@page { size: letter; margin: 0.5in; }` for proper print formatting
6. White background, dark text — print-friendly
7. Use `-webkit-print-color-adjust: exact; print-color-adjust: exact;` for colored headers/badges
8. Google Fonts loaded in the PDF HTML: DM Sans + JetBrains Mono
9. Proper `page-break-inside: avoid` on key sections
10. Header with navy background, white text (matches brand)

---

## 8. MOBILE-SPECIFIC CONSIDERATIONS

### Touch Interactions
- All buttons minimum 44px touch target
- Accordion category headers should be easy to tap
- Swipe-friendly scrolling on long category lists
- No hover-only interactions — everything must work with tap

### Input Optimization
- Currency fields: `inputmode="decimal"` for numeric keypad on mobile
- Number fields: `inputmode="numeric"`
- Proper `autocomplete` attributes where relevant
- Auto-focus management when navigating between steps

### Performance
- Debounce recalculation on input (don't recalculate on every keystroke — wait 150ms)
- Minimize DOM manipulation during rapid input
- Lazy-load accordion contents if needed for performance on large estimate sheets

### Viewport
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

### Responsive Breakpoints (same as existing apps)
```css
/* Desktop: default styles */
/* Tablet: max-width 900px */
/* Mobile: max-width 600px */
/* Small mobile: max-width 380px */
```

---

## 9. INVOICE-SPECIFIC PATTERNS

### Auto-Numbering
- Invoice numbers auto-increment from localStorage counter
- Key: `tsc_rehab_invoice_counter` (integer, starts at 1)
- Format: `INV-001`, `INV-002`, etc.
- User can override the number manually

### Invoice vs. Estimate Visual Distinction
- The Estimate PDF header says "REHAB COST ESTIMATE" in navy
- The Invoice PDF header says "INVOICE" in navy
- Different layout: invoice has From/To blocks, payment terms, deposit info
- Same line items, same branding, different document purpose

### Tax Calculation
- If tax rate > 0%, apply to subtotal (before contingency/O&P)
- Display: Subtotal → Tax → Contingency → O&P → Total
- Most rehab work is labor + materials, so tax handling varies by state. Keep it simple — one flat rate applied to the subtotal.

---

## 10. DATA VALIDATION & UX POLISH

### Input Formatting (same patterns as Deal Analyzer)
- Currency fields: strip to raw number on focus, format with $ and commas on blur
- Number fields: format with commas on blur
- Phone fields: auto-format to (XXX) XXX-XXXX

### Empty States
- If no line items have values in a category, show a subtle "No items estimated" message
- Categories with $0 subtotal should still be visible but visually muted
- On the PDF, only include categories/items where cost > $0

### Toasts
- "Estimate saved" — on save
- "Estimate deleted" — on delete
- "Profile saved" — on default profile save
- "Loaded: [address]" — on load
- "Error: Invalid file" — on bad import

### Modals
- "Start a New Estimate?" — confirmation with "This will clear all current data"
- "Delete Estimate?" — confirmation with estimate address shown
- Same modal styling as Deal Analyzer (centered card, icon, title, text, two buttons)

---

## 11. CUSTOM LINE ITEMS

Users MUST be able to add their own line items to any category. This is critical for real-world use — no pre-built list covers every possible repair.

### "Add Custom Item" Button
- Appears at the bottom of each category accordion
- Creates a new row with:
  - Editable item name (placeholder: "Custom item...")
  - Quantity input
  - Unit selector (dropdown: each, sq ft, linear ft, per unit, lump sum, per room, per sq)
  - Unit cost input
  - Auto-calculated line total
  - Delete button (X) to remove the custom item
- Custom items are saved with the estimate in localStorage

---

## 12. OPTIONAL ENHANCEMENTS (Nice-to-Have)

These are secondary features — build the core first, add these if time allows:

- **Estimate Templates:** Pre-built "Cosmetic Rehab", "Moderate Rehab", "Full Gut Rehab" templates that pre-fill typical items and rough cost ranges. User selects a template on the welcome screen, then adjusts to their specific property.
- **Photo Uploads:** Allow user to upload 1-2 photos per category for reference. Stored as base64 in localStorage. Included in PDF.
- **Comparison Mode:** Side-by-side view of two saved estimates for the same property (before/after contractor bids).
- **Quick Estimate Mode:** A simplified view that just asks for the major categories (kitchen, bath, roof, etc.) with lump-sum inputs — skips the line-item detail. Good for quick napkin math before a walkthrough.

---

## 13. FILE NAMING & BRANDING

- **HTML filename:** `rehab-cost-estimator.html`
- **App title in topbar:** "Rehab Cost Estimator"
- **App logo:** "RC" in blue rounded square (same size/style as "DA" in Deal Analyzer)
- **Footer on PDF:** "Generated by The Solo Closer — thesolocloser.etsy.com"
- **localStorage prefix:** `tsc_rehab_` (consistent with `tsc_deal_packets`, `tsc_wholesaler_profile`)

---

## 14. TESTING CHECKLIST

Before shipping, verify:

- [ ] Opens and runs locally by double-clicking the HTML file
- [ ] Deploys to Netlify with no errors
- [ ] All steps navigable forward and back
- [ ] Step indicators update correctly (active, completed, clickable)
- [ ] All line items calculate correctly (qty × unit cost = line total)
- [ ] Category subtotals are accurate
- [ ] Grand total = subtotal + contingency + O&P + permits + holding
- [ ] Cost per square foot calculates correctly
- [ ] Save to localStorage works — reload page and data persists
- [ ] Load saved estimate restores all fields correctly
- [ ] Duplicate creates a proper deep copy
- [ ] Delete removes estimate with confirmation
- [ ] Export JSON downloads a valid file
- [ ] Import JSON restores estimate correctly
- [ ] PDF export opens in new window and prints cleanly
- [ ] PDF only shows items with cost > $0
- [ ] PDF includes cost per square foot prominently
- [ ] Invoice tab pre-populates from estimate data
- [ ] Invoice PDF generates correctly with all invoice-specific fields
- [ ] Invoice numbering auto-increments
- [ ] Default profile saves and auto-fills
- [ ] Custom line items can be added, edited, and deleted
- [ ] Custom line items persist in localStorage
- [ ] Mobile responsive — test at 375px, 768px, 1200px widths
- [ ] Touch targets are 44px+ on mobile
- [ ] Currency inputs show numeric keypad on mobile
- [ ] No horizontal scroll on any screen size
- [ ] Toasts appear for save/load/delete/export actions
- [ ] Modals appear for destructive actions
- [ ] Google Fonts load correctly (DM Sans, JetBrains Mono)
- [ ] All currency values use JetBrains Mono font
- [ ] Color scheme matches Solo Closer brand (navy, blue, green, gray)

---

## 15. REFERENCE FILES

When building, reference these existing Solo Closer apps for established patterns:

1. **Deal Analyzer** (`index.html`) — Step wizard, sidebar, topbar, PDF export, save/load JSON, currency formatting, responsive layout, toast notifications
2. **Deal Packet Generator** (`deal-packet-generator.html`) — localStorage multi-record save/load, welcome screen with saved records, default profile save, 7-step wizard, theme selection, PDF export via new window + print
3. **Creative Finance Calculator** — Design system implementation, pricing at $29.99, complex financial calculations, side-by-side comparison features

The Rehab Cost Estimator should feel like it belongs in the same product family. Same visual language, same interaction patterns, same level of polish.

---

## END OF SPECIFICATION
