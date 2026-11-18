# Code Loom — Master Admin Guide

> **Rule:** Every piece of visible content, bilingual translation (English & සිංහල), product video, live link, and contact setting can be updated from `/admin` without touching code.

---

## 1. First-Time Login & Security Setup

1. Set your initial password in `.env.local` (never committed to Git):
   ```env
   SEED_ADMIN_PASSWORD="Your-Initial-Strong-Passphrase-2026!"
   ```
2. Run `npm run db:seed` to create/update the Master Admin (`codeloom.lk@gmail.com`).
3. Visit `http://localhost:3000/admin/login` and sign in.
4. You will be automatically directed to **Security (`/admin/security`)** to set a new permanent password (`must_change_password = true`).
5. Under **Two-Factor Authentication (TOTP)**, click **Generate 2FA QR Code**, scan it with Google Authenticator / Authy, enter the 6-digit code, and save your **10 one-time recovery codes**.

---

## 2. How to Add or Edit a Product (with ~2-Min Video & Live Links)

1. Open **Products (`/admin/products`)** in the sidebar.
2. Click an existing product (**EventLoom**, **CaptureLoom**, **PromoLoom**) or click **+ Add New Product**.
3. Use the **English (EN)** and **සිංහල (SI)** tabs to edit the product name, tagline, short summary, rich description, and target audience.
4. **Adding a ~2-Minute Video:**
   - Under **~2-Minute Product Video**, choose `YouTube`, `Vimeo`, or `Uploaded MP4`.
   - Paste the HTTPS video URL (or upload an MP4 in **Media Library** and paste its `/api/media/...` URL).
   - On the public product page, this renders inside a fast, privacy-friendly click-to-load facade.
5. **Adding Multiple Live Links:**
   - Under **Live Application & Demo Links**, click **+ Add Live Link**.
   - Enter the button label (e.g., `"Open Live App"`, `"Try Demo"`), the `https://` URL, and link type.
   - Click **Test Link Health** to run an SSRF-protected server check (`✅ OK`).
6. Click **Save & Publish Product**. The public `/en/products`, `/si/products`, and Home page update immediately.

---

## 3. How to Publish a Live Project / Case Study (with Social Media Growth Block)

1. Open **Live Work / Projects (`/admin/projects`)**.
2. Select the seeded draft (`[DEMO TEMPLATE] Sri Lanka Tourism Guide Start-Up`) or click **+ Add New Project**.
3. Fill in the **Challenge**, **Solution**, and **Outcome** in English and Sinhala.
4. Under **Social Media Growth Delivered**, add each social channel Code Loom set up or managed (`facebook`, `tiktok`, `instagram`, `tripadvisor`), its profile URL, and what was delivered.
5. Add any **Live Project URLs** (`https://...`).
6. Check **Published on Public Site** and click **Save Project**.

---

## 4. How to Moderate Customer Feedback

1. Visitors submit reviews at `/en/feedback` or `/si/feedback`.
2. Submissions are saved as **`PENDING`** and never appear publicly until approved.
3. Open **Customer Feedback (`/admin/feedback`)**.
4. Review the message and click **Approve & Publish** (or **Hide** / **Reject**).
5. You can also click **Add Verified Client Feedback** to enter a testimonial directly.

---

## 5. How to Change Contact Details, WhatsApp Number & UI Text

- **WhatsApp, Email, Phone, Colours & Social Links:** Go to **Site Settings (`/admin/settings`)**. Updating the WhatsApp number or default prefilled message updates the header, footer, contact page, and floating WhatsApp button across the entire site immediately.
- **Buttons, Form Labels & Interface Text (EN | සිංහල):** Go to **UI Text & Labels (`/admin/ui-text`)** to search and inline-edit any interface string in English and Sinhala.
- **Translation Completeness:** Go to **Translation Center (`/admin/translations`)** to view Sinhala % completeness across all modules.
