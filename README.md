# Evidra | GroundTruth
> **Cryptographic Provenance, Multimodal Auto-Pairing, and One-Click Impact Stories for Conservation & ESG Field Media.**

---

### Project Pitch

Evidra (GroundTruth) transforms unstructured, skeptical field photos and videos from grassroots environmental initiatives into irrefutable, donor-ready proof. By unifying a **Cryptographic Provenance Chain** (SHA-256 custody fingerprints, EXIF temporal stamps, and Cloudinary vault immutability), an autonomous **Auto-Pairing Engine** (Gemini multimodal spatial-temporal clustering that uncovers true Before/After ecological pairs), and a **One-Click Impact Story Generator** (synthesizing factual, non-hyperbolic narratives paired with dynamically transformed Cloudinary composite visual covers), Evidra bridges the trust gap between grassroots conservationists and global climate capital—turning folders of raw imagery into verifiable institutional proof.

---

### The Three Core Pillars

```
┌────────────────────────────────────────────────────────────────────────┐
│                                EVIDRA                                  │
├──────────────────────┬──────────────────────┬──────────────────────────┤
│       PILLAR 1       │       PILLAR 2       │         PILLAR 3         │
│   Provenance Chain   │  Auto-Pairing Engine │  Impact Story Generator  │
├──────────────────────┼──────────────────────┼──────────────────────────┤
│ • SHA-256 Custody    │ • Spatial & Temporal │ • Gemini Factual Briefs  │
│   Fingerprint        │   Clustering         │ • Cloudinary Collage     │
│ • Cloudinary Vault   │ • Multimodal Gemini  │   Transformations        │
│   Version Immutability│  Pair Proposal       │ • Public Shareable Slug  │
│ • Public /verify/    │ • Inertia-Free Drag  │ • Verified Evidence      │
│   Audit Surface      │   Comparison Slider  │   Audit Strip            │
└──────────────────────┴──────────────────────┴──────────────────────────┘
```

1. **Pillar 1: Provenance Chain (Anti-Greenwashing Guarantee)**
   - Every uploaded image or video is cryptographically fingerprinted at the exact moment of ingestion using a canonical SHA-256 hash of its Cloudinary `public_id`, `version`, and upload timestamp.
   - Public audit routes at `/verify/[assetId]` allow donors, auditors, and grant officers to inspect the unaltered original asset, GPS EXIF coordinates, organizational custody timeline, and live re-verified cryptographic integrity.

2. **Pillar 2: Auto-Pairing Before/After Engine**
   - Automatically clusters field assets by coordinate proximity, timestamp deltas, and shared Cloudinary AI scene tags.
   - Gemini evaluates candidate pairs, outputting match confidence percentages and precise ecological reasoning.
   - Interactive, hardware-accelerated Before/After sliders with Cloudinary aspect-ratio-matched transformations allow instant visual verification across desktop and mobile.

3. **Pillar 3: One-Click Impact Story / Report Generator**
   - Synthesizes factual, donor-ready narratives in an institutional NGO voice strictly constrained to verifiable metadata—preventing hallucinations and unverifiable greenwashing claims.
   - Concurrently builds dynamic composite visual covers using Cloudinary's multi-layer transformation API (`l_<id>`, `c_fill`, `fl_layer_apply,g_east`).
   - Generates responsive, public editorial reports at `/reports/[shareSlug]` featuring deep-links to each source asset's provenance verification page.

---

### Technology Stack

- **Framework**: Next.js 14 App Router (TypeScript, React Server Components)
- **Media Engine**: Cloudinary Media & Transformation API (Signed Ingestion, AI Tagging, Auto-Captioning, Dynamic Multi-Layer Overlays)
- **Intelligence**: Google Gemini Flash (`@google/generative-ai`) for natural-language semantic filtering, spatial-temporal pairing, and narrative drafting
- **Database & Auth**: MongoDB Atlas via Mongoose with connection caching; NextAuth.js credentials provider with bcrypt salted hashing
- **Design System & Motion**: Bespoke Tailwind CSS tokens (`ink`, `ink-soft`, `bone`, `moss`, `moss-bright`, `clay`, `mist`), Fraunces serif and General Sans typography, and Framer Motion with custom brand cubic-bezier curves (`cubic-bezier(0.22, 1, 0.36, 1)`) and native `prefers-reduced-motion` compliance

---

### Setup & Local Development

#### 1. Prerequisites
- Node.js 18.17+ or Node.js 20+
- MongoDB instance (local or MongoDB Atlas connection string)
- Cloudinary account (Cloud Name, API Key, API Secret)
- Google AI Studio API Key (Gemini)

#### 2. Clone and Install
```bash
git clone https://github.com/thisIsSrijan/Evidra.git
cd Evidra
npm install
```

#### 3. Configure Environment Variables
Copy `.env.local.example` to `.env` or `.env.local` and populate the keys:

```env
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/evidra?retryWrites=true&w=majority

# NextAuth Authentication
NEXTAUTH_SECRET=your-random-32-character-secret
NEXTAUTH_URL=http://localhost:3000

# Cloudinary Storage & Transformations
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google Gemini Intelligence
GEMINI_API_KEY=your-gemini-api-key
```

#### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

#### 5. Production Build & Typecheck
```bash
npm run build
```

---

### Key Demonstration Routes

- `/` — Editorial marketing landing page featuring the core problem statement, Three Pillars scroll reveal, and live Before/After interactive slider demo.
- `/dashboard` — Conservation project manager hub with project boundaries and empty states.
- `/projects/[id]` — Main project interface with asset ingestion dropzone, phase filters, Gemini semantic search, AI auto-pairing review, and inline impact story authoring.
- `/verify/[assetId]` — Public cryptographic provenance verification page with live hash verification and organizational chain of custody.
- `/reports/[shareSlug]` — Public institutional donor impact story with Cloudinary cover collage, factual narrative, and source evidence audit strip.