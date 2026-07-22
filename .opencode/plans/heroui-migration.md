# TeaShop: UI Polish + HeroUI Migration + bugs-fixed Branch

## Design Read

Reading this as: POS management system for tea/coffee shops, with a warm-brand functional language, leaning toward HeroUI v3 (component library) + teashop warm-brown palette.

**Scope clarification:** The design-taste-frontend skill (Section 13) states dashboards/data-tables/multi-step-forms are out of scope. TeaShop is primarily these. The skill's principles apply selectively to **landing surfaces** (Login, Dashboard landing sections, POS product grid) and **persistent chrome** (Sidebar, TopBar). Data tables and management CRUD pages follow HeroUI's built-in design, not the skill's aesthetic directives.

---

## Three Dials (adapted for POS context)

| Dial | Value | Rationale |
|------|-------|-----------|
| DESIGN_VARIANCE | 5 | POS needs predictability + slight warmth. Not artsy chaos, not sterile symmetry. |
| MOTION_INTENSITY | 3 | POS workers need speed, not animation. Hover反馈 + loading states only. |
| VISUAL_DENSITY | 6 | POS screens pack info. More than a landing page, less than a cockpit. |

---

## Phase 1: HeroUI Migration (DaisyUI → HeroUI v3)

### 1.1 Setup

**Branch:** `feature/heroui-migration` from `main`

**Dependencies:**
```bash
cd client
npm install @heroui/styles @heroui/react
npm uninstall daisyui @heroicons/react heroicons
```

**CSS entry (`client/src/index.css`):**
```css
@import "tailwindcss";
@import "@heroui/styles";

@theme {
  --color-teashop-50: #fdf8f0;
  --color-teashop-100: #f5ebe0;
  --color-teashop-200: #e8d5b7;
  --color-teashop-300: #d4b896;
  --color-teashop-400: #c49a6c;
  --color-teashop-500: #a67c52;
  --color-teashop-600: #8b6340;
  --color-teashop-700: #6d4c33;
  --color-teashop-800: #4a3422;
  --color-teashop-900: #2d1f14;
}
```

Remove: `@plugin "daisyui"`, all DaisyUI CSS overrides (`.table`, `.btn`, `.modal-box`, `.alert`, `.input:focus`, `.select:focus`, `.textarea:focus`).

### 1.2 Component Mapping (17 files)

| DaisyUI (className) | HeroUI (Component) |
|---|---|
| `<button className="btn btn-primary">` | `<Button variant="primary">` |
| `<button className="btn btn-ghost btn-sm">` | `<Button variant="ghost" size="sm">` |
| `<button className="btn btn-outline">` | `<Button variant="outline">` |
| `<input className="input input-bordered">` | `<Input>` |
| `<select className="select select-bordered">` | `<Select>` |
| `<input type="checkbox" className="checkbox">` | `<Checkbox>` |
| `<input type="range" className="range">` | `<Slider>` |
| `<span className="badge badge-*">` | `<Chip color="*" variant="soft">` |
| `<table className="table">` | `<Table>` |
| `<dialog className="modal">` | `<Modal>` compound components |
| `<span className="loading loading-spinner">` | `<Spinner>` |
| `<div className="dropdown">` | `<Dropdown>` |
| `<div className="alert alert-error">` | `<Alert color="danger">` |

### 1.3 Files by Migration Complexity

**Tier 1 — Spinner only (5 files, trivial):**
1. `client/src/App.tsx`
2. `client/src/components/ProtectedRoute.tsx`
3. `client/src/components/ManagerRoute.tsx`
4. `client/src/pages/manager/Dashboard.tsx`
5. `client/src/pages/manager/Reports.tsx`

**Tier 2 — Button + Input + Spinner (3 files, low):**
6. `client/src/pages/Login.tsx`
7. `client/src/components/Pagination.tsx`
8. `client/src/pages/staff/Dashboard.tsx`

**Tier 3 — Dropdown + Button (1 file, medium):**
9. `client/src/components/Layout/TopBar.tsx`

**Tier 4 — Table + Badge + Modal (5 files, high):**
10. `client/src/pages/staff/OrderHistory.tsx`
11. `client/src/pages/staff/AttendanceHistory.tsx`
12. `client/src/pages/manager/MenuManagement.tsx`
13. `client/src/pages/manager/InventoryManagement.tsx`
14. `client/src/pages/manager/AccountManagement.tsx`
15. `client/src/pages/manager/AttendanceManagement.tsx`

**Tier 5 — Full POS (1 file, highest complexity):**
16. `client/src/pages/staff/CreateOrder.tsx` — 13+ DaisyUI classes: Input, Button, Modal, Slider, Checkbox, Spinner

### 1.4 HeroUI Modal Pattern (biggest structural change)

DaisyUI uses native `<dialog className="modal modal-open">`. HeroUI uses compound components:

```tsx
// Before (DaisyUI)
<dialog className="modal modal-open">
  <div className="modal-box">
    <h3>Title</h3>
    <div>Content</div>
    <div className="modal-action">
      <button className="btn btn-ghost">Cancel</button>
      <button className="btn btn-primary">Submit</button>
    </div>
  </div>
  <form method="dialog" className="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

// After (HeroUI)
<Modal.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
  <Modal.Container>
    <Modal.Dialog>
      <Modal.CloseTrigger />
      <Modal.Header>
        <Modal.Heading>Title</Modal.Heading>
      </Modal.Header>
      <Modal.Body>Content</Modal.Body>
      <Modal.Footer>
        <Button slot="close" variant="ghost">Cancel</Button>
        <Button>Submit</Button>
      </Modal.Footer>
    </Modal.Dialog>
  </Modal.Container>
</Modal.Backdrop>
```

### 1.5 Build Verification

Run `npm run build` after each tier to catch TypeScript errors early.

---

## Phase 2: Design Polish (Taste Skill Principles)

Apply selectively to surfaces where the skill is in scope.

### 2.1 Foundation Fixes (P0)

| Fix | File | Change |
|-----|------|--------|
| Page title | `client/index.html` | `<title>client-temp</title>` → `<title>TeaShop POS</title>` |
| Theme wiring | `index.css` | Map `teashop-*` to HeroUI CSS variables as primary/secondary/accent |
| Remove credential hints | `Login.tsx` | Delete the `staff01-15 | manager01-03 | Pass: 123456` line |
| Remove version footer | `Sidebar.tsx` | Delete `v1.0.0` text |
| Fix hardcoded `bg-white` | Sidebar, TopBar, Login, Dashboards, CreateOrder | Replace with HeroUI semantic tokens (`bg-background` or `bg-content1`) |

### 2.2 Login Page Polish (P1 — Landing Surface)

The login is the first thing every user sees. Apply taste skill Section 4.5 (Interactive UI States):

- **Entrance animation:** Subtle fade-up on the card (HeroUI provides this via Modal/animation APIs, or CSS `@keyframes`)
- **Background:** Replace flat `bg-base-200` with a subtle gradient using `teashop-50`/`teashop-100` palette
- **Brand icon:** Keep `BowlSteam` but refine the icon container (softer radius, subtle shadow)
- **Form language:** Unify to all Vietnamese (labels + placeholders)
- **Loading state:** Use HeroUI `Button isPending` instead of manual spinner swap

### 2.3 Sidebar Polish (P2 — Persistent Chrome)

- **Active indicator:** Add a left-border accent (`border-l-2 border-primary`) for clearer active state
- **Duplicate icon fix:** Replace second `ChartBar` (Reports) with `TrendUp` from Phosphor
- **Brand color:** Once theme is wired, the `bg-primary` logo box will automatically use tea-brown

### 2.4 TopBar Polish (P2 — Persistent Chrome)

- **User initials:** Replace generic `User` icon with first-letter initials circle
- **Role badge:** Style role as a small colored chip instead of raw uppercase text
- **Page context:** Add current page title on the left side (replaces empty desktop space)

### 2.5 Staff Dashboard Polish (P1 — Landing Surface)

- **Greeting:** Add "Xin chao, [Name]" with current time
- **Promote check-in/out:** Move to top of page (it's the first daily action)
- **Replace `alert()`:** Use HeroUI Toast or Alert component for error feedback
- **Extract StatCard:** Create reusable component to eliminate copy-pasted card markup
- **CTA prominence:** Make "Tao don moi" button more visually prominent (full-width or larger)

### 2.6 Manager Dashboard Polish (P1 — Landing Surface)

- **Greeting:** Same pattern as Staff Dashboard
- **Quick-link hierarchy:** Differentiate cards by usage frequency (Menu/Inventory larger, Reports smaller)
- **Extract StatCard:** Reuse from Staff Dashboard

### 2.7 CreateOrder POS Polish (P0 — Core Working Surface)

This is the highest-impact screen. Staff spend 80%+ of their time here.

**Product Grid:**
- **Increase tap targets:** Wider cards for tablet use (minimum 44px touch targets)
- **Category color coding:** Subtle left-border or badge color per category
- **Product images:** Render actual `product.image` field when available, category-specific emoji fallback

**Cart Panel:**
- **Quantity controls:** Add +/- buttons on cart items for rapid adjustment
- **Larger delete button:** Minimum 44px touch target (currently 12px icon with no padding)
- **Item count badge:** Show "(3)" next to "Don hang" header
- **Total in submit button:** Show total inside the "Tao don" button

**Product Modal:**
- **Sugar/Ice presets:** Replace range sliders with labeled preset buttons (Vietnamese common preferences: "Khong duong", "It duong", "Binh thuong", "Nhieu duong")
- **Running total:** Show price preview inside modal as options change
- **Larger quantity controls:** Bigger +/- buttons for touch

### 2.8 Cross-Cutting Polish

| Pattern | Current | Fix |
|---------|---------|-----|
| `window.alert()` for errors | CreateOrder, Staff Dashboard | HeroUI Toast/Alert component |
| Duplicated stat card markup | Both Dashboards | Shared `<StatCard>` component |
| No loading skeletons | Every page has own spinner block | Shared skeleton component at layout level |
| No empty states | Tables show nothing | HeroUI Table `renderEmptyState` with helpful messages |

---

## Phase 3: Bug Fixes + New `bugs-fixed` Branch

### 3.1 Delete old branch
```bash
git push origin --delete bugs-fixed
git branch -D bugs-fixed
```

### 3.2 Create new from polished main
```bash
git checkout main
git checkout -b bugs-fixed
```

### 3.3 Apply fixes (4 bugs)

**CR01** — `server/src/utils/calculateOrderTotal.ts`:
```typescript
// Current (buggy): ignores toppings
const basePrice = item.product as any;
return total + (basePrice.price || 0) * item.quantity;

// Fixed: includes topping prices
const basePrice = (item.product as any).price || 0;
const toppingPrice = item.toppings.reduce(
  (sum, t) => sum + t.price * t.quantity, 0
);
return total + (basePrice * item.quantity) + toppingPrice;
```

**CR02** — `server/src/utils/updateInventoryOnOrder.ts`:
```typescript
// Current (buggy): ignores size multiplier
$inc: { quantity: -ing.baseQuantity * item.quantity }

// Fixed: applies size multiplier
const multiplier = product.sizeMultipliers[item.size] || 1.0;
const deductAmount = ing.baseQuantity * multiplier * item.quantity;
$inc: { quantity: -deductAmount }
```

**PR01** — `server/src/routes/orders.ts`:
```typescript
// Current (buggy): no pagination
const orders = await Order.find(filter).sort({ createdAt: -1 });
res.json({ orders });

// Fixed: pagination
const pageNum = parseInt(page as string);
const limitNum = parseInt(limit as string);
const skip = (pageNum - 1) * limitNum;
const [orders, total] = await Promise.all([
  Order.find(filter).skip(skip).limit(limitNum).sort({ createdAt: -1 }).populate('userId', 'name username'),
  Order.countDocuments(filter)
]);
res.json({ orders, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
```

**NEW** — `server/src/routes/auth.ts` (missing endpoint):
```typescript
// Add GET /users endpoint for Account Management page
router.get('/users', requireAuth, requireManager, async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ users });
});
```

---

## Execution Order

| Step | Action | Branch |
|------|--------|--------|
| 1 | Create `feature/heroui-migration` from `main` | feature/heroui-migration |
| 2 | Install HeroUI, remove DaisyUI + unused deps | feature/heroui-migration |
| 3 | Update `index.css` (CSS entry point) | feature/heroui-migration |
| 4 | Migrate Tier 1 files (spinner only) | feature/heroui-migration |
| 5 | Build check | feature/heroui-migration |
| 6 | Migrate Tier 2 files (button+input) | feature/heroui-migration |
| 7 | Build check | feature/heroui-migration |
| 8 | Migrate Tier 3 file (TopBar dropdown) | feature/heroui-migration |
| 9 | Build check | feature/heroui-migration |
| 10 | Migrate Tier 4 files (table+modal) | feature/heroui-migration |
| 11 | Build check | feature/heroui-migration |
| 12 | Migrate Tier 5 file (CreateOrder POS) | feature/heroui-migration |
| 13 | Build check | feature/heroui-migration |
| 14 | Apply Phase 2 design polish | feature/heroui-migration |
| 15 | Build check + visual verification | feature/heroui-migration |
| 16 | Merge to `main` | main |
| 17 | Delete old `bugs-fixed` branch | main |
| 18 | Create new `bugs-fixed` from `main` | bugs-fixed |
| 19 | Apply CR01, CR02, PR01, NEW fixes | bugs-fixed |
| 20 | Server build check | bugs-fixed |

---

## Risk Notes

1. **HeroUI Modal** is the biggest structural change. DaisyUI uses native `<dialog>`, HeroUI uses compound React components. Every modal in the app (CreateOrder, MenuManagement, InventoryManagement, AccountManagement, AttendanceManagement) needs rewriting.

2. **HeroUI Select** may differ from native `<select>`. Verify API during implementation.

3. **HeroUI Slider** replaces `<input type="range">` but is a controlled React component.

4. **Taste skill scope limit:** Dashboards and data tables are explicitly out of scope for the skill's aesthetic directives (Section 13). Design polish on those surfaces follows HeroUI's built-in design system, not the skill's bento/editorial/kinetic patterns.

5. **Build verification:** Run `npm run build` after each migration tier to catch errors early.
