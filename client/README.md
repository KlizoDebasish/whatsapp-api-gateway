# 🚀 MessageAPI — Free WhatsApp Business Gateway & AI ERP Engine

An enterprise-grade, zero-cost WhatsApp Business Gateway and AI-powered ERP Query Engine built with Next.js 16 (React 19), Tailwind CSS, and TypeScript.

---

## 🌟 What is MessageAPI?

**MessageAPI** enables any business owner (such as a **Medicine Shop**, **Gym**, **Grocery Supermarket**, **Electronics Store**, **Restaurant**, or **Salon**) to turn their existing WhatsApp number into an automated 24/7 AI-powered customer service and ordering machine.

### 💡 The Reality vs Official Meta Cloud API:
- **Zero Fees**: No \$0.05 per-conversation fees (saves businesses \$3,000–\$15,000 every year).
- **Anti-Ban Safe Pacing**: Simulates human typing presence and randomized 1s–30s delays to protect WhatsApp accounts from bans.
- **Multimodal AI & Voice ERP**: Customers can send voice notes, prescription photos, or text messages to check real-time stock and prices.
- **No Meta Audit Bureaucracy**: Instant 1-click QR code pairing like WhatsApp Web.

---

## 🏪 Industry-Specific Solutions Built-In

1. **💊 Medicine & Pharmacy Shop**
   - Instant prescription photo ordering
   - Live medicine stock & price lookups
   - Dosage guidelines & refill reminders

2. **🏋️ Gym & Fitness Club**
   - Membership plan inquiries (Monthly, Quarterly, Annual VIP)
   - Trainer trial slot bookings
   - Whey protein & supplement inventory queries

3. **🛒 Grocery & Supermarket**
   - Daily grocery list ordering
   - Fresh vegetable & dairy stock checks
   - Instant cart billing and home delivery confirmations

4. **⚡ Electronics & Gadgets Shop**
   - Device specifications & warranty checks
   - Live gadget availability & discounts
   - Digital invoice generation

5. **🍽️ Restaurant & Cafe**
   - Digital menu card sharing
   - Table reservations & takeaway food orders

6. **✂️ Salon & Spa Care**
   - Service rate cards & bridal package inquiries
   - Stylist appointment bookings

7. **🏢 Custom Business / Agency**
   - Universal bot for consulting, coaching centers, real estate, clinics, and service agencies.

---

## 🚀 Getting Started

### 1. Install Dependencies & Start Dev Server
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Production Build
```bash
npm run build
npm start
```

---

## 📂 Project Architecture

```text
messageapi/
├── app/
│   ├── globals.css              (Tailwind CSS v4 config)
│   ├── layout.tsx               (Root layout & metadata)
│   └── page.tsx                 (Master landing page & workspace router)
├── components/
│   ├── Navbar.tsx               (Header navigation & business account switcher)
│   ├── HeroSection.tsx          (Hero with dynamic business niche selector)
│   ├── ValueProposition.tsx     (Meta API comparison & reality check)
│   ├── BusinessNicheShowcase.tsx(Deep dive tabs for Pharmacy, Gym, Grocery, etc.)
│   ├── InteractiveLiveDemo.tsx  (Interactive WhatsApp chat simulator)
│   ├── RoiCalculator.tsx        (Zero-cost savings calculator slider)
│   ├── BusinessSetupWizard.tsx  (5-Step onboarding wizard for business accounts)
│   ├── BusinessWorkspace.tsx    (Full business management workspace & live bot)
│   └── Footer.tsx               (Footer with API endpoints & documentation)
├── lib/
│   ├── types.ts                 (TypeScript definitions, catalog schemas & templates)
│   └── storage.ts               (Account persistence, pre-seeded demos & AI simulator)
└── package.json
```

---

## 🔒 Master API Authentication
Every created business account gets a dedicated Master API Key:
```bash
curl -X POST https://your-domain.com/api/v1/messages/send \
  -H "x-api-key: msgapi_live_med_88921a99" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "biz_apollo_pharma",
    "chatId": "919876543210",
    "messageType": "text",
    "content": "Your prescription is ready for pickup! 💊"
  }'
```
