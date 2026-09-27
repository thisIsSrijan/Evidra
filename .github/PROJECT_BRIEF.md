You are building "Evidra" — an AI media intelligence platform for NGOs and
sustainability orgs, for a hackathon (Code Cubicles 6.0, Cloudinary's problem
statement — "AI-Powered Impact & Sustainability Media Platform"). I will send you
build instructions ONE STEP AT A TIME across many messages. Do NOT start building
yet. Just read this brief, confirm you understand it, and wait for Step 1.

PRODUCT
GroundTruth turns raw field photos/videos from NGO projects into organized,
searchable, provably-authentic evidence and donor-ready impact reports.

THE THREE PILLARS (this is our differentiator — every feature should serve one of these):
1. Provenance Chain — every uploaded asset is fingerprinted at ingestion using its
   Cloudinary public_id + version + a signed delivery URL + extracted EXIF/geodata.
   Each asset gets a public "/verify/[assetId]" page showing the untouched original,
   its transformation history, and a "chain of custody" confirming nothing was altered.
   This is the anti-greenwashing / donor-trust feature.
2. Auto-Pairing Before/After Engine — cluster assets by project + location + capture
   date + visual/semantic similarity (Cloudinary tags/captions + Gemini reasoning),
   auto-suggest before→after pairs, and render them as an interactive draggable
   comparison slider.
3. One-Click Impact Story Generator — Gemini writes a narrative report from a
   cluster of evidence; the app auto-assembles a shareable visual (image collage or
   short video montage, built with Cloudinary transformations) alongside it.

TECH STACK (fixed, do not substitute):
- Next.js 14+, App Router, TypeScript
- MongoDB with Mongoose
- Cloudinary (unsigned/signed uploads, AI Content Analysis add-on for auto-tagging
  and captioning, structured/contextual metadata, g_auto cropping, transformation
  API for before/after sliders and collages, video transformation for montages)
- Tailwind CSS (custom theme, no default palette)
- Framer Motion for all animation
- Google Gemini API for: natural-language semantic search parsing, before/after
  pairing reasoning, and narrative report generation
- No UI component libraries (no shadcn, no MUI) — everything hand-built to match (can use only for very basic components which doesnt make sense to write scratch code)
  the design system below, so it does not look like a generic AI-generated app

DESIGN SYSTEM (must be followed exactly in every step, no default Tailwind blue/gray):
Colors:
  ink        #0F1210   (primary dark background)
  ink-soft   #171B18   (card/section background)
  bone       #F5F1E8   (primary light text / light-mode background)
  moss       #3F5A44   (brand primary — buttons, links)
  moss-bright #6B8F6E  (hover/active states)
  clay       #D98E4A   (single warm accent — CTAs, "verified" badges, data
                         callouts ONLY — never used as a base color)
  mist       #9AA79D   (secondary text, borders, dividers)

Typography:
  Display/headings: "Fraunces" (Google Fonts, variable) — use high optical size
    and slight negative letter-spacing at large sizes.
  Body/UI: "General Sans" (Fontshare) with fallback "Inter", system-ui, sans-serif.
  Left-align all paragraph text. No centered body copy blocks.

Motion (Framer Motion), non-negotiable house rules:
  - Custom cubic-bezier easing [0.22, 1, 0.36, 1] everywhere, never default ease.
  - Scroll-linked reveals using useScroll/useTransform, not just mount fade-ins.
  - Image reveals use a clip-path wipe, not opacity fades.
  - Primary CTA buttons have a subtle magnetic-cursor hover effect.
  - Before/after comparisons are a real drag interaction (useMotionValue), not CSS-only.
  - Respect prefers-reduced-motion and disable non-essential motion for that setting.

Icons/illustrations: hand-built single-weight stroke SVGs (leaf, satellite-pin,
lens, fingerprint motifs) — never emoji, never a generic icon library's default set.

Layout: strictly mobile-first. Marketing pages: single column, large type, generous
vertical spacing, expanding to a grid at md/lg breakpoints. App/dashboard: bottom
tab bar on mobile, becomes a left sidebar at lg breakpoint.

DATA MODEL (MongoDB, to be implemented in Step 1):
  User        { name, email, orgName, role, createdAt }
  Project     { name, description, location {lat, lng, label}, ownerId, createdAt }
  Asset       { projectId, cloudinaryPublicId, cloudinaryVersion, resourceType
                (image/video), phase (before/after/progress/unclassified),
                capturedAt, aiTags [], aiCaption, semanticEmbeddingText,
                geo {lat, lng}, provenanceHash, uploadedBy, createdAt }
  Pairing     { projectId, beforeAssetId, afterAssetId, confidence, status
                (suggested/confirmed/rejected), createdAt }
  Report      { projectId, title, narrative, assetIds [], coverAssetId,
                shareSlug, createdAt }