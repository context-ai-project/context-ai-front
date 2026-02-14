# Phase 5b GitHub Issues - Quick Copy/Paste

Use these templates to create issues directly in GitHub.

---

## MAIN ISSUE

**Title:** `Phase 5b: Prototype Alignment - UI/UX Updates`

**Labels:** `enhancement`, `ui/ux`, `phase-5b`, `design`

**Body:**
```markdown
## 🎯 Objective
Align the current project with the visual design, layout, and component structure from the prototype, while maintaining the architecture defined in AGENTS.md.

## 📋 Context
We have a fully functional prototype with:
- Sidebar-based navigation (shadcn/ui)
- Teal color scheme (#2D9D8E)
- Brain icon branding
- Landing page with complete sections
- Dark sidebar with collapsible navigation

## 📦 Sub-tasks

- [ ] #[5b.1] Update Design System (Colors & Theme) - 30 min
- [ ] #[5b.2] Implement Sidebar Component - 1-2 hrs
- [ ] #[5b.3] Update Dashboard Layout with Sidebar - 1 hr
- [ ] #[5b.4] Create Landing Page Components - 3-4 hrs
- [ ] #[5b.5] Update Logo and Branding - 30 min
- [ ] #[5b.6] Adapt Chat and Dashboard Pages - 1-2 hrs

## 📊 Implementation Order
1. 5b.1 (Colors) → Foundation
2. 5b.2 (Sidebar) → Core component
3. 5b.3 (Layout) → Integration
4. 5b.6 (Pages) → Adaptation
5. 5b.5 (Logo) → Branding
6. 5b.4 (Landing) → Marketing

## ✅ Success Criteria
- [ ] All UI matches prototype design
- [ ] Sidebar navigation is responsive
- [ ] Color scheme updated to teal
- [ ] Landing page complete
- [ ] Brain logo throughout
- [ ] Code follows AGENTS.md
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] i18n maintained

## 📚 References
- Prototype: `context-ai-prototype/`
- Guidelines: `AGENTS.md`
- Detailed specs: `.github/PHASE_5B_ISSUES.md`

**Estimated Time:** 7-10 hours
```

---

## SUB-ISSUE 1

**Title:** `5b.1: Update color scheme to teal and import prototype theme variables`

**Labels:** `enhancement`, `ui/ux`, `phase-5b`, `styling`

**Body:**
```markdown
## 🎯 Objective
Update global CSS variables to match prototype's teal color scheme.

## 📝 Files to Modify
- `src/app/globals.css`

## 🎨 Changes
Update CSS variables:
```css
--primary: 166 72% 40%;           /* Teal */
--sidebar-background: 220 20% 7%; /* Dark sidebar */
--sidebar-primary: 166 72% 45%;   /* Teal accent */
```

## ✅ Acceptance Criteria
- [ ] Primary color is teal (#2D9D8E)
- [ ] Sidebar has dark theme
- [ ] All CSS variables from prototype imported
- [ ] WCAG AA contrast maintained

## 📚 Reference
- Source: `context-ai-prototype/app/globals.css`

**Priority:** 🔴 High (blocks other tasks)
**Estimated Time:** 30 minutes
```

---

## SUB-ISSUE 2

**Title:** `5b.2: Implement collapsible sidebar navigation with shadcn/ui`

**Labels:** `enhancement`, `component`, `phase-5b`, `ui/ux`

**Body:**
```markdown
## 🎯 Objective
Implement sidebar navigation component based on shadcn/ui.

## 📝 Files to Create
- `src/components/ui/sidebar.tsx` (copy from prototype)
- `src/components/ui/use-mobile.tsx`
- `src/components/dashboard/AppSidebar.tsx` (adapted)

## 🔑 Key Features
- Brain icon logo + "Context.ai" branding
- Navigation: Overview, AI Chat, Knowledge
- User avatar from Auth0
- Logout button
- Collapsible on desktop
- Drawer on mobile

## 🔄 Adaptations
- Replace mock data with `useSession()` from NextAuth
- Use next-intl for translations
- Add locale prefix to routes (`/es/chat`, `/en/chat`)
- Integrate with `LanguageSelector`

## ✅ Acceptance Criteria
- [ ] Sidebar renders correctly
- [ ] Navigation with locale prefix works
- [ ] Active state highlights
- [ ] Auth0 user info displays
- [ ] Logout works
- [ ] Responsive (mobile drawer)
- [ ] Follows AGENTS.md structure
- [ ] TypeScript types defined
- [ ] JSDoc comments added

## 📚 Reference
- Source: `context-ai-prototype/components/ui/sidebar.tsx`
- Source: `context-ai-prototype/components/dashboard/app-sidebar.tsx`

**Priority:** 🔴 High
**Estimated Time:** 1-2 hours
**Depends on:** #[5b.1]
```

---

## SUB-ISSUE 3

**Title:** `5b.3: Refactor protected layout to use sidebar instead of navbar`

**Labels:** `enhancement`, `layout`, `phase-5b`

**Body:**
```markdown
## 🎯 Objective
Update protected routes layout to use sidebar instead of top navbar.

## 📝 Files to Modify
- `src/app/[locale]/(protected)/layout.tsx`

## 🏗️ Structure Change
Replace top navbar with sidebar layout:
```typescript
<SidebarProvider defaultOpen>
  <AppSidebar />
  <SidebarInset>
    <header className="flex h-14 items-center gap-3 border-b px-6">
      <SidebarTrigger />
      <div className="flex-1" />
      <LanguageSelector />
    </header>
    <main className="flex-1 overflow-auto p-6">
      {children}
    </main>
  </SidebarInset>
</SidebarProvider>
```

## ✅ Acceptance Criteria
- [ ] Sidebar layout implemented
- [ ] Header with trigger and language selector
- [ ] Main content scrolls independently
- [ ] All existing pages render correctly
- [ ] Session data available
- [ ] Responsive

## 📚 Reference
- Source: `context-ai-prototype/app/[locale]/dashboard/layout.tsx`

**Priority:** 🔴 High
**Estimated Time:** 1 hour
**Depends on:** #[5b.2]
```

---

## SUB-ISSUE 4

**Title:** `5b.4: Build complete landing page with hero, features, and CTA sections`

**Labels:** `enhancement`, `feature`, `phase-5b`, `landing-page`

**Body:**
```markdown
## 🎯 Objective
Create professional landing page for unauthenticated users.

## 📝 Files to Create
- `src/components/landing/LandingNavbar.tsx`
- `src/components/landing/HeroSection.tsx`
- `src/components/landing/FeaturesSection.tsx`
- `src/components/landing/HowItWorksSection.tsx`
- `src/components/landing/UseCasesSection.tsx`
- `src/components/landing/CtaFooter.tsx`

## 📝 Files to Modify
- `src/app/[locale]/page.tsx`

## 🌟 Components

### LandingNavbar
- Fixed header with blur backdrop
- Brain logo + navigation links
- Language switcher
- Sign In + Get Started buttons
- Mobile menu

### HeroSection
- Large heading with gradient
- Subtitle + CTA buttons
- Hero image

### FeaturesSection
- 3-column grid
- Icons + descriptions
- Features: Semantic Search, Multi-Sector, Real-time Chat, Citations, Analytics, Secure

### HowItWorksSection
- 3-4 step process
- Numbered steps with icons

### UseCasesSection
- Department tabs (HR, Engineering, Sales)
- Examples per sector

### CtaFooter
- Final call-to-action

## 🔄 Adaptations
Replace `useDictionary()` with `useTranslations('landing')`

## 📚 Translation Keys
Add to `messages/en.json` and `messages/es.json`:
```json
{
  "landing": {
    "hero": { "title": "...", "subtitle": "...", "cta": "..." },
    "features": { ... },
    "howItWorks": { ... },
    "useCases": { ... },
    "cta": { ... }
  }
}
```

## ✅ Acceptance Criteria
- [ ] All 6 components created
- [ ] Home page uses landing components
- [ ] Translations added (en + es)
- [ ] next-intl integration working
- [ ] Locale routing working
- [ ] Follows AGENTS.md
- [ ] JSDoc comments
- [ ] TypeScript types
- [ ] Responsive design

## 📚 Reference
- Source: `context-ai-prototype/components/landing/*.tsx`

**Priority:** 🟡 Medium (can be parallel)
**Estimated Time:** 3-4 hours
```

---

## SUB-ISSUE 5

**Title:** `5b.5: Replace MessageSquare logo with Brain icon across application`

**Labels:** `enhancement`, `ui/ux`, `phase-5b`, `branding`

**Body:**
```markdown
## 🎯 Objective
Update all MessageSquare logos to Brain icon for consistent branding.

## 📝 Files to Check
- `src/components/shared/Navbar.tsx`
- `src/components/dashboard/AppSidebar.tsx`
- `src/components/landing/LandingNavbar.tsx`
- Any other files with MessageSquare

## 🔄 Change
```typescript
// Before
import { MessageSquare } from 'lucide-react';
<MessageSquare className="h-8 w-8 text-blue-600" />

// After
import { Brain } from 'lucide-react';
<Brain className="h-8 w-8 text-primary" />
```

## 🎨 Branding Guidelines
- **Icon:** Brain (lucide-react)
- **Name:** "Context.ai"
- **Color:** Teal (`text-primary`)
- **Sizes:** h-8 w-8 (header), h-5 w-5 (sidebar)

## ✅ Acceptance Criteria
- [ ] Brain icon in all navigation
- [ ] "Context.ai" name consistent
- [ ] Teal color applied
- [ ] No MessageSquare imports remain

**Priority:** 🟢 Low (quick win)
**Estimated Time:** 30 minutes
```

---

## SUB-ISSUE 6

**Title:** `5b.6: Update chat and dashboard pages to work with sidebar layout`

**Labels:** `enhancement`, `page`, `phase-5b`

**Body:**
```markdown
## 🎯 Objective
Adapt chat and dashboard pages for sidebar layout.

## 📝 Files to Modify
- `src/app/[locale]/(protected)/chat/page.tsx` (adjust)

## 📝 Files to Create
- `src/app/[locale]/(protected)/dashboard/page.tsx`

## 🎨 Changes

### Chat Page
Adjust for sidebar (remove hardcoded viewport heights)

### Dashboard Page (New)
Create overview page with:
- Stats cards (Total Queries, Documents, Users, Accuracy)
- Recent activity section
- Grid layout (responsive)

## 📚 Translation Keys
Add to messages:
```json
{
  "dashboard": {
    "title": "Dashboard Overview",
    "subtitle": "Monitor your activity",
    "stats": { ... },
    "recentActivity": "Recent Activity"
  }
}
```

## ✅ Acceptance Criteria
- [ ] Chat works with sidebar layout
- [ ] Dashboard page created with stats
- [ ] Both pages responsive
- [ ] Translations added
- [ ] No layout issues
- [ ] TypeScript compiles

## 📚 Reference
- Source: `context-ai-prototype/app/[locale]/dashboard/page.tsx`

**Priority:** 🟡 Medium
**Estimated Time:** 1-2 hours
**Depends on:** #[5b.3]
```

---

## 📊 Quick Summary

| Issue | Title | Time | Priority | Depends On |
|-------|-------|------|----------|------------|
| 5b.1 | Colors & Theme | 30min | 🔴 High | - |
| 5b.2 | Sidebar Component | 1-2hrs | 🔴 High | 5b.1 |
| 5b.3 | Dashboard Layout | 1hr | 🔴 High | 5b.2 |
| 5b.4 | Landing Page | 3-4hrs | 🟡 Medium | - |
| 5b.5 | Logo Update | 30min | 🟢 Low | - |
| 5b.6 | Pages Adaptation | 1-2hrs | 🟡 Medium | 5b.3 |

**Total Estimated Time:** 7-10 hours

---

## 🔗 Links to Add After Creating Issues

After creating all issues in GitHub, update the main issue with actual issue numbers:

```markdown
## 📦 Sub-tasks

- [ ] #123 5b.1: Update Design System (Colors & Theme)
- [ ] #124 5b.2: Implement Sidebar Component
- [ ] #125 5b.3: Update Dashboard Layout
- [ ] #126 5b.4: Create Landing Page Components
- [ ] #127 5b.5: Update Logo and Branding
- [ ] #128 5b.6: Adapt Chat and Dashboard Pages
```

