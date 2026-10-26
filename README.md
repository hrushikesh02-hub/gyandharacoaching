# Gyandhara Coaching Classes

A complete, frontend-only institute management demo built with React 19, Vite, JavaScript, React Router, Lucide React, Recharts and custom responsive CSS. Manrope and Lora are loaded from Google Fonts with system fallbacks.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the Local URL printed by Vite (normally http://127.0.0.1:5173).

```sh
npm run build       # Production output in dist/
npm run preview     # Preview the production build
npm test            # Domain and data-integrity tests
npx playwright test # End-to-end tests; start Vite on port 5173 first
```

Browser tests use installed Google Chrome. Change `channel` in `playwright.config.js` to `msedge` to use Microsoft Edge instead.

## Demo accounts

- Admin: `admin@gyandhara.demo` / `Admin@123`
- Student: `aarav@gyandhara.demo` / `Student@123` (Class 8, Foundation)
- Student with an outstanding balance: `ananya@gyandhara.demo` / `Student@123` (Class 9, Achievers)
- All seeded student passwords: `Student@123`
- Pending example: `rohan@gyandhara.demo`. Approve from Admin → Students before signing in.

The forms are prefilled with demo credentials. There is no public admin registration.

## Explore the connected flows

1. Register a student from the public website. Sign-in is blocked while pending.
2. Sign in as admin, open Students, and approve the registration.
3. Start an attendance session for Foundation. Copy the six-character code.
4. Sign in as Aarav within two minutes and enter the code in My attendance. Aarav starts absent today; the register and metrics update after check-in. Duplicate or expired check-ins are rejected.
5. Sign in as Ananya, open My fees, and select Pay now. Simulate failure to leave the ledger unchanged, then simulate success to create a payment and downloadable/printable receipt.
6. Upload a small PDF or image in Study materials. Publish it to a class, then sign in as a student in that class to view or download it.
7. Create a targeted announcement or add an assessment result from Reports. The matching student portal updates automatically.
8. Export reports as CSV or print them. Reset the demo through Settings, with a confirmation step.

## Demo limitations

- All accounts, students, institute contact details, attendance, results, transactions and receipts are illustrative.
- Authentication and route guards are simulated. Data is stored in browser storage, including **plain-text demo passwords**. Do not use real personal data, credentials or financial information.
- Student pages display only that student's records and class-targeted resources. Browser-local filtering is **not production security**; the underlying demo dataset is inspectable in browser developer tools.
- Payment simulation collects no UPI IDs, card data or banking credentials and never transfers money.
- QR images contain a demo session code. There is no camera verification, location verification or anti-proxy protection.
- Uploaded PDF/image attachments are limited to 800 KB each, with a 2.5 MB encoded attachment budget. They are stored in localStorage alongside metadata, subject to browser quotas, and are never uploaded or synchronized. Clearing browser data removes them.
- Separate browsers/devices have independent data. Tabs in the same browser origin receive localStorage changes, but simultaneous edits are not a transactional multiuser system. Session identity is tab-local after sign-in, with a localStorage fallback for a new tab.
- The demo seeds 20 students and 4 batches once per browser origin. Dates are relative to the first visit. Settings → Reset demo data replaces all records and signs out.

## Project map

```text
src/
  components/   Shared controls, dialogs, receipts and identity elements
  data/         Seed data and persistent application context
  layouts/      Admin/student navigation and route guards
  pages/        Public site, authentication and all portal sections
  styles/       Responsive design, reduced-motion and print styling
  utils/        Financial arithmetic, attendance rules, dates and exports
tests/
  domain.test.js       Data integrity and domain invariants
  e2e/flows.spec.js    Connected workflows and all requested breakpoints
```

Deploy the `dist` folder on static hosting with SPA fallback to `index.html` for React Router paths. The `.openai/hosting.json` manifest binds this project to its private Sites demo.
