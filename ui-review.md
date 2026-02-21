# UI Code Review

## Summary
The reviewed UI has strong structure and consistent use of core layout primitives, but color/theming and component consistency checks show significant issues. There is widespread hardcoded color usage (`hex`, fixed Tailwind palette names, and inline gradients), repeated custom Card style overrides, and several dead/inconsistent interaction patterns. Several requested brand component files under `src/components/brand` are not present, so app pages are not using the intended shared brand abstractions.

## Issues by File

### src/app/(public)/layout.tsx
- [WARN] Hardcoded light-theme colors instead of semantic tokens: `bg-white`, `text-[#1e1b4b]`, `border-indigo-100`, `bg-white/95`, `text-[#f59e0b]`, `hover:border-[#f59e0b]`.
- [WARN] Action button gradient and text colors are fixed (`from-[#1e1b4b] via-[#312e81] to-[#f59e0b]`), which prevents dark-mode and theme updates.

### src/app/(public)/page.tsx
- [WARN] Multiple hardcoded color tokens and explicit palette classes (`text-[#1e1b4b]`, `text-[#f59e0b]`, `text-slate-700`, `bg-[#fcfcff]`, `from-[#...]`, `to-[#...]`).
- [WARN] Inline gradient colors in JSX bypass design tokens and break theme agility: 
  - `style={{ background: "radial-gradient(circle at center, rgba(245,158,11,0.35) ... ) }}`
  - `style={{ background: "radial-gradient(circle at center, rgba(30,27,75,0.22) ... ) }}`
- [WARN] Frequent Card overrides using fixed borders/backgrounds and shadows: e.g. `Card className="h-full border-[#e2e8f0] bg-white/95 shadow-sm"`, `Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white ..."`, making Card styling inconsistent and theme-hostile.
- [WARN] Dark-mode is effectively unsupported across this page due pervasive explicit `text-slate-700`, `text-white`, `bg-white/95`, `to-[#...]` etc.

### src/app/(app)/dashboard/page.tsx
- [WARN] Non-semantic color classes used instead of brand tokens (`from-emerald-500`, `from-cyan-500`, `to-rose-600`, `text-emerald`, `text-rose`, etc.).
- [WARN] Card presentation repeatedly overrides base component with `border`, `shadow-sm`, `hover:shadow-md`, `shadow-sm`, `border` plus `card-hover`, which can create inconsistent visual depth and spacing across app surfaces.
- [INFO] No use of the requested brand component suite (`PageHeader`, `StatCard`, `Section`) on this page.

### src/app/courses/page.tsx
- [WARN] Search UI is inert: `searchQuery` state is set via input but never used in filtering or querying, making the control non-functional.
- [WARN] Cards are used as click targets (`Card ... onClick={() => setSelectedDomain(domain.id)}`) while rendering as non-interactive containers; this is an accessibility risk for keyboard users.
- [WARN] Similar hardcoded domain styling with non-token color classes (`from-emerald-500`, `from-violet-500`, `from-amber-500`, `from-slate-*`, `to-slate-*`, etc.) and fixed `border-0 shadow-md` overrides.
- [WARN] `TabsTrigger` values use `value={domain.slug}`, but click handler sets `setSelectedDomain(domain.id)`, which can desynchronize state when IDs and slugs diverge.
- [INFO] No use of shared brand components (`PageHeader`, `StatCard`, `Section`).

### src/app/achievements/page.tsx
- [WARN] Non-token palette in `categoryColors` fallback (`from-slate-400 to-slate-500`) and other fixed hues (`text-rose`, `bg-amber/20`, `text-amber`).
- [WARN] `Card` modifiers use `border-0 shadow-md` in many places, fighting the shared Card styling system.
- [INFO] No use of shared brand components (`PageHeader`, `StatCard`, `Section`).

### src/app/certifications/page.tsx
- [WARN] Multiple fixed palette classes and amber-dependent semantics: `bg-amber/20`, `text-amber`, and fixed status colors in badges.
- [WARN] Card overrides (`border-0 shadow-md`) repeatedly bypass shared Card defaults.
- [WARN] Non-null assertion on optional data: `new Date(cert.completedAt!).toLocaleDateString()` can throw if data shape changes or `completedAt` is missing.
- [INFO] No use of shared brand components (`PageHeader`, `StatCard`, `Section`).

### src/app/analytics/page.tsx
- [WARN] Hardcoded color classes not using semantic tokens (`text-emerald`, `text-amber`, `text-rose`, `text-violet`).
- [WARN] Repeated fixed card treatments (`border-0 shadow-md`) against base Card component default styles.
- [WARN] Uses fixed progress-bar color via `style={{ height: ... , minHeight: '8px' }}` (dimensional style, not color) and class `gradient-brand`; color token is fine, but no semantic class for chart fill text/status values.
- [INFO] No use of shared brand components (`PageHeader`, `StatCard`, `Section`).

### src/components/layout/header.tsx
- [WARN] Hardcoded white/light effects used directly on brand chrome: `bg-white/10`, `shadow-indigo-500/25`, `group-hover:shadow-indigo-500/40`.
- [WARN] Notification badge (`<span ... bg-rose ... aria-label="New notifications available" />`) marks decorative status with `aria-label` on a non-interactive element, which has no accessibility effect.
- [INFO] Search button advertises keyboard shortcut in `aria-label` but has no implementation binding in this component.

### src/components/layout/sidebar.tsx
- [WARN] Unused import: `X` from `lucide-react` is imported but never used.
- [WARN] Sidebar promo panel and shadows use fixed contrast assumptions (`text-white`, `bg-white/10`), but overall structure could benefit from semantic tokening to remain consistent across modes.

### src/components/layout/main-layout.tsx
- [INFO] Layout scaffolding is clean, but `defaultUser` is hardcoded (`Test User`) and not sourced from auth, which makes header identity and avatar non-real for production users.

### src/components/brand/index.ts
- [CRITICAL] File path is missing in the workspace; review requested file cannot be read/evaluated as part of this pass.

### src/components/brand/page-header.tsx
- [CRITICAL] File path is missing in the workspace; review requested file cannot be read/evaluated as part of this pass.

### src/components/brand/stat-card.tsx
- [CRITICAL] File path is missing in the workspace; review requested file cannot be read/evaluated as part of this pass.

### src/components/brand/section.tsx
- [CRITICAL] File path is missing in the workspace; review requested file cannot be read/evaluated as part of this pass.

### src/components/brand/empty-state.tsx
- [CRITICAL] File path is missing in the workspace; review requested file cannot be read/evaluated as part of this pass.

### src/components/brand/domain-badge.tsx
- [CRITICAL] File path is missing in the workspace; review requested file cannot be read/evaluated as part of this pass.

### src/app/globals.css
- [INFO] This file defines most of the app’s custom utility classes used in reviewed files (`card-hover`, `gradient-brand`, `gradient-text-gold`, `gradient-success`, `animate-float`, `animate-shimmer`, `sidebar-active`, etc.).
- [INFO] No inline hardcoded component colors were found in this file in a way that violates the UI-page tokenization requirement, but it does define many fixed oklch values as root design tokens, which is expected for design-system style variables.

## Undefined CSS Utilities
- `card-hover` ✅ (defined in `src/app/globals.css`)
- `gradient-success` ✅ (defined in `src/app/globals.css`)
- `gradient-text-gold` ✅ (defined in `src/app/globals.css`)
- `gradient-text-brand` ⚠️ not defined, but also not referenced in reviewed files
- `animate-guru-entrance` ⚠️ not defined, not referenced in reviewed files
- `animate-chakra` ⚠️ not defined, not referenced in reviewed files
- `animate-flame` ⚠️ not defined, not referenced in reviewed files
- `animate-lotus-bloom` ⚠️ not defined, not referenced in reviewed files
- `animate-sacred-glow` ⚠️ not defined, not referenced in reviewed files
- `animate-float` ✅ (defined in `src/app/globals.css`)
- `gradient-brand` ✅ (defined in `src/app/globals.css`)

## Recommendations
1. Standardize color usage across all app routes by replacing fixed palette/hex values with semantic Tailwind variables (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-card`) and map brand gradients through design tokens.
2. Stop overriding `Card` defaults (`border-0`, `shadow-md/shadow-lg`, `shadow-sm`, ad hoc borders) unless a variant is explicitly required; introduce dedicated card variants in one place instead.
3. Resolve the missing `/src/components/brand/*` module set or update all pages to consume the intended shared components (`PageHeader`, `StatCard`, `Section`) for consistent visual language and fewer regressions.
4. Fix interaction/accessibility regressions by replacing clickable Card containers with buttons/links and ensuring keyboard support; specifically in `src/app/courses/page.tsx` make domain cards true interactive controls.
5. Remove dead/fragile behavior: wire `searchQuery` into course filtering, align domain `slug` vs `id` state transitions, remove unused imports (`X`), and harden optional data usage (`cert.completedAt`) before date parsing.
