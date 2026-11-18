# Code Loom — Existing Project Analysis

> Updated: 2026-11-16 | Phase 0 — Analysis & Plan (Verified against `c:\Local Disk (D)\my private\codeloom\MainSite\codeloom_web_fe`)

---

## 1. Overview

The existing project lives at `c:\Local Disk (D)\my private\codeloom\MainSite\codeloom_web_fe\`. It is a **client-side-only** single-page application:

| Aspect | Detail |
|---|---|
| Stack | Vite 6.2 + React 19 + React Router 7.5 + Tailwind CSS 4.1.3 + DaisyUI 5.0.16 |
| Language | TypeScript 5.7 |
| Backend / DB / Auth | **None** — 100% hard-coded in `.tsx` and `.json` files |
| i18n | Hacky Google Translate widget injection in `NavBar` (no real i18n) |
| SEO | `react-helmet-async` used only on Home; `scripts/sitemap-generator.js` only generates 3 URLs (`/`, `/about`, `/services`); `public/robots.txt` points to `https://yourdomain.com/sitemap.xml` |
| Deployment | AWS CodeBuild → S3 + CloudFront (`buildspec.yml` exposes S3 bucket & CloudFront IDs) |

---

## 2. Directory Structure & Assets Inventory

### 2.1 Public Assets (`public/`)
- `codeloom_full_logo.png` & `codeloom_full_logo.svg` — Full horizontal logo
- `codeloom_icon.png` & `codeloom_icon.svg` — Brand icon / mark
- `robots.txt` — Broken (`yourdomain.com`)
- `_redirects` — SPA fallback (`/* /index.html 200`)
- `vite.svg` — Unused default

### 2.2 Source Assets (`src/assets/`)
- `hero_image.png` — Hero banner graphic
- `img/Eventify.png` & `img/event_logo.png` — EventLoom logos
- `img/event_web_cover_img.png` — EventLoom cover image
- `img/photo_logo.png` — CaptureLoom logo
- `img/CaptureLoom_cover_img.jpg` — CaptureLoom cover image
- `img/promoloom logo.png` — PromoLoom logo (has space in filename)
- `img/promo_loon_cover.png` — PromoLoom cover image (typo `loon` in filename)

---

## 3. Exact Content to Migrate (Seed Data Source)

### 3.1 Development Services (`src/features/Common/DevServiceData.json`) — 8 Services
1. **Web Application Development**
   - Short: "Custom web apps for businesses and enterprises"
   - Long: "We build responsive, high-performance web applications tailored to your unique business needs. Our solutions deliver seamless user experiences across all devices, from e-commerce platforms to enterprise products, engineered for security, speed, and growth."
   - Features: Custom frontend interfaces, Scalable backend systems, Third-party service connections, Cloud hosting solutions, Data protection measures.
2. **Software Product Development**
   - Short: "End-to-end solutions from idea to product"
   - Long: "Turn your vision into a market-ready product with our comprehensive development process. We specialize in taking concepts from initial ideation through prototype development to full-scale deployment, ensuring solutions that truly solve your target audience's needs."
   - Features: Minimum viable product creation, Multiple platform compatibility, Flexible development approach, Speed and efficiency enhancements, Usage tracking and reporting.
3. **Mobile Application Development**
   - Short: "iOS & Android apps with native/hybrid approaches"
   - Long: "We craft applications that users love and engage with daily. Our apps are optimized for all device sizes, with offline capabilities and seamless backend integration, following platform-specific design guidelines for intuitive usability."
   - Features: Platform-specific app development, Cross-platform solutions, Mobile user experience refinement, Offline operation capabilities, Store submission assistance.
4. **Testing & Quality Assurance**
   - Short: "Comprehensive quality assurance services"
   - Long: "Our rigorous process ensures your software performs flawlessly under all conditions. We combine automated checks with manual testing to identify issues early, while performance and security verification guarantee your application can handle real-world demands."
   - Features: Automated test scripts, System speed evaluation, Vulnerability assessments, Multi-device verification, Development pipeline integration.
5. **Maintenance & Support**
   - Short: "Ongoing software care and updates"
   - Long: "Our services ensure your software remains secure, current, and optimized as your business evolves. From critical updates to performance improvements and feature expansions, we provide reliable support tailored to your needs."
   - Features: Continuous system monitoring, Critical updates application, Speed and efficiency improvements, Priority assistance channels, System documentation updates.
6. **UX Engineering**
   - Short: "Human-centered digital experiences"
   - Long: "We design interfaces that don't just work, but delight. Through user research, iterative prototyping, and accessibility-focused development, we create intuitive experiences that drive engagement and conversion across all devices and user scenarios."
   - Features: User behavior analysis, Interactive element design, Universal access compliance, Visual consistency systems, Loading speed optimization.
7. **IoT Development**
   - Short: "Connected solutions for smart environments"
   - Long: "Bridge the physical and digital worlds with our expertise. We develop complete ecosystems that collect, analyze, and act on data in real time, prioritizing reliability, security, and actionable insights from your connected devices."
   - Features: Local data processing, Device connectivity solutions, Live monitoring interfaces, Device network management, Data pattern forecasting.
8. **Technical Consulting**
   - Short: "Strategic guidance for technology initiatives"
   - Long: "Navigate complex technology decisions with confidence. Our services provide the expertise you need to evaluate system structures, select optimal solutions, and plan scalable growth while aligning with business goals."
   - Features: System structure evaluation, Technology stack analysis, Growth planning, Expert team supplementation, Leadership-level guidance.

*(Plus 3 new Social Media Marketing & Growth services per Master Prompt Section 14)*

### 3.2 Process / Dev Cycle (`DevCycle.tsx`) — 5 Phases
1. **Discovery Workshop** — Requirement gathering, Goal alignment, Scope definition
2. **Strategic Design** — Wireframe, UI/UX mockups, Client approvals
3. **Agile Development** — Sprint planning, Weekly builds, Continuous feedback
4. **Quality Assurance** — Automated testing, User acceptance testing, Performance optimization
5. **Launch & Scale** — Deployment, Training, Ongoing support

### 3.3 FAQs (`FAQ.tsx`) — 3 Existing + Social Growth FAQs
1. **What services does Code Loom offer?** — Custom web/mobile app development, AI/ML integration, Cloud solutions & DevOps, UI/UX design, Software modernization.
2. **Do you work with startups/students?** — Startups: MVP-focused packages with scalable architecture. Students: Academic project support with documentation.
3. **How long does a typical project take?** — MVP (Minimum Viable Product): 3–6 weeks; Mid-size app: 3–6 months; Enterprise: Phased rollout.

### 3.4 Offers (`Offers.tsx`) — 2 Offers
1. **for An Academic Project** — "Custom software solutions for student projects - from concept to functional prototype. We transform your ideas into deployable systems with documented code perfect for coursework and requirements."
2. **for Small Business Boost** — "Budget-friendly software application tailored for growing businesses. We create tools that streamline operations, enhance customer engagement, and boost growth—with startup-appropriate timelines and pricing for your business." (Fixed trailing incomplete sentence from old code).

### 3.5 About: Team Roles (`Team.tsx`) & Vision/Mission/Values (`VisionMission.tsx`)
- **Team Intro**: "At Code Loom, we've assembled a powerhouse of technical talent dedicated to crafting exceptional software."
- **6 Roles**: Frontend Developers, Backend Engineers, QA Analysts, UI/UX Designers, Business Analysts, Solution Architects.
- **Vision**: "To be the most trusted partner for transformative digital solutions where technology meets human potential."
- **Mission**: "To engineer transformative digital solutions that empower businesses and exceed expectations through technical mastery, relentless innovation, and partnership-driven development."
- **Core Values (5)**:
  1. **Excellence in Execution** (*Good enough isn't in our vocabulary*) — Obsession with clean, maintainable code; Rigorous QA and performance optimization; Continuous learning and tech stack evolution.
  2. **Client Success First** (*We win when you win*) — Deep collaboration from day one; Transparent communication at all stages; ROI-driven development priorities.
  3. **Innovation with Purpose** (*Solving real problems, not chasing trends*) — Practical application of AI/ML, blockchain, IoT; Fail-fast experimentation mindset; Future-proof architectural decisions.
  4. **Ownership Mentality** (*Every team member acts like a founder*) — End-to-end accountability for projects; Proactive problem solving; Pride in craftsmanship.
  5. **Human-Centric Technology** (*Code should serve people, not the other way around*) — Accessibility-focused design; Ethical AI implementation; Intuitive user experiences.

### 3.6 Products (3)
1. **EventLoom** (`/products/eventloom`)
   - Tagline: "Your one-stop solution for managing events, inventory, and more."
   - Description: 2 paragraphs covering Customers, Administrators, and Event Organizers, package customization (Basic, Pro, Premium), slip upload payment tracking, district delivery fee calculation, refundable items, and reporting.
   - 11 Key Features: Multi-Role Access, Event Package Customization, Order & Payment Management, Dynamic Delivery Pricing, Inventory & Refund Tracking, Automated Notifications, Admin Control Panel, Reporting & Analytics, Secure Authentication, CSV-Based Grouping Tool, Blueprint Designer.
2. **CaptureLoom** (`/products/captureloom`)
   - Tagline: "Weave Perfection into Every Shoot – The Photographer’s Command Center"
   - Description: 2 paragraphs covering photography business management, role-based control, workflow automation, team assignments, inventory tracking, AI-driven booking reminders, and client review workflows.
   - 8 Key Features: Role-Based Workflow Control, Smart Package Builder, Team-Centric Job Assignments, Equipment Tracking System, Unified Booking Hub, Photo Delivery & Reviews, Revenue Analytics, Integrated Messaging.
3. **PromoLoom** (`/products/promoloom`)
   - Tagline: "Go Viral or Go Home – AI-Powered Event Promotion & Ticketing"
   - Description: 2 paragraphs covering AI-driven hype tools, dynamic ticketing, real-time analytics, TikTok-style promo videos, NFT passes, influencer collaboration hubs, and AR filters.
   - 7 Key Features: Viral Ticketing Campaigns, Dynamic Pricing Engine, Influencer Collaboration Hub, Real-Time Social ROI, NFT & VIP Passes, One-Click Multi-Posting, AR Event Filters.

---

## 4. Defects & Technical Debt Fixed in Rebuild
1. **Unresolved Git merge conflict** in `src/pages/Home.tsx` (`<<<<<<< HEAD`).
2. **Exposed AWS S3/CloudFront identifiers** in `buildspec.yml` — dropped completely.
3. **12+ external Unsplash/ftcdn hot-linked images** — replaced with local/optimised media library support.
4. **Misleading filenames & copy-paste bugs** (`Gratick_start`, `PartyCrafter`, `Eventify_Key_Features.json` duplicated across all 3 products, `promo_loon_cover.png` typo, `alt="PARTY CRAFTERS"` on all products).
5. **7 unused Google Fonts** loaded via blocking `@import` in `index.css` — replaced with self-hosted `next/font` (`Inter`, `Space Grotesk`, `Noto Sans Sinhala`).
6. **Hard-coded copyright year `2025`** — replaced with dynamic year & admin-editable footer.
