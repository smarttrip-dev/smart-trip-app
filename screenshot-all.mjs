import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL  = 'http://localhost:5173';
const API_URL   = 'http://localhost:5001/api/auth/login';
const OUTPUT_DIR = path.join(__dirname, 'screenshots');

// ─── Credentials ─────────────────────────────────────────────────────────────
const ACCOUNTS = {
  admin:  { email: 'admin@smarttrip.lk',        password: 'Admin@123' },
  user:   { email: 'thisara@example.com',        password: 'User@123'  },
  vendor: { email: 'roshan.vendor@example.com',  password: 'Vendor@123' },
};

// ─── Pages per role ──────────────────────────────────────────────────────────
const ADMIN_PAGES = [
  { name: 'admin_01_Dashboard', path: '/admin/dashboard' },
];

const USER_PAGES = [
  { name: 'user_01_UserDashboard',          path: '/dashboard'      },
  { name: 'user_02_MyTrips',                path: '/my-trips'       },
  { name: 'user_03_SavedTrips',             path: '/saved-trips'    },
  { name: 'user_04_TripPlanner',            path: '/plan-trip'      },
  { name: 'user_05_ItineraryCustomization', path: '/itinerary'      },
  { name: 'user_06_BookingReview',          path: '/booking-review' },
  { name: 'user_07_UserProfile',            path: '/profile'        },
  { name: 'user_08_Notifications',          path: '/notifications'  },
  { name: 'user_09_HelpSupport',            path: '/help'           },
];

const VENDOR_PAGES = [
  { name: 'vendor_01_Dashboard',    path: '/vendor/dashboard'    },
  { name: 'vendor_02_Inventory',    path: '/vendor/inventory'    },
  { name: 'vendor_03_Availability', path: '/vendor/availability' },
  { name: 'vendor_04_BulkUpload',   path: '/vendor/bulk-upload'  },
  { name: 'vendor_05_Reservations', path: '/vendor/reservations' },
  { name: 'vendor_06_Pricing',      path: '/vendor/pricing'      },
  { name: 'vendor_07_Revenue',      path: '/vendor/revenue'      },
  { name: 'vendor_08_Expenses',     path: '/vendor/expenses'     },
  { name: 'vendor_09_Reviews',      path: '/vendor/reviews'      },
  { name: 'vendor_10_Profile',      path: '/vendor/profile'      },
];

const PUBLIC_PAGES = [
  { name: 'public_01_LandingPage',    path: '/'                },
  { name: 'public_02_LandingAlt',     path: '/home-alt'        },
  { name: 'public_03_Login',          path: '/login'           },
  { name: 'public_04_Register',       path: '/register'        },
  { name: 'public_05_ForgotPassword', path: '/forgot-password' },
  { name: 'public_06_VendorLogin',    path: '/vendor-login'    },
  { name: 'public_07_VendorRegister', path: '/vendor-register' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function fetchToken(role) {
  const creds = ACCOUNTS[role];
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(creds),
  });
  if (!res.ok) throw new Error(`Login failed for ${role}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function setAuth(page, userInfo) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.evaluate((info) => {
    localStorage.setItem('userInfo', JSON.stringify(info));
  }, userInfo);
}

async function clearAuth(page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.evaluate(() => localStorage.removeItem('userInfo'));
}

async function capture(page, outDir, name, route) {
  const url = BASE_URL + route;
  console.log(`  📸 ${name}  →  ${url}`);
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: true });
    console.log(`     ✓ saved`);
  } catch (err) {
    console.warn(`     ✗ failed: ${err.message}`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  for (const sub of ['public', 'admin', 'user', 'vendor']) {
    fs.mkdirSync(path.join(OUTPUT_DIR, sub), { recursive: true });
  }

  console.log('🚀 Launching browser…');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // ── 1. Public pages (no login) ────────────────────────────────────────────
  console.log('\n═══ PUBLIC PAGES (no login) ═══');
  for (const p of PUBLIC_PAGES) {
    await capture(page, path.join(OUTPUT_DIR, 'public'), p.name, p.path);
  }

  // ── 2. Admin ──────────────────────────────────────────────────────────────
  console.log('\n═══ ADMIN LOGIN → admin@smarttrip.lk ═══');
  try {
    const adminInfo = await fetchToken('admin');
    console.log(`  ✅ Logged in as Admin (${adminInfo.name})`);
    await setAuth(page, adminInfo);
    for (const p of ADMIN_PAGES) {
      await capture(page, path.join(OUTPUT_DIR, 'admin'), p.name, p.path);
    }
  } catch (e) { console.error('  ❌ Admin login error:', e.message); }

  // ── 3. User ───────────────────────────────────────────────────────────────
  console.log('\n═══ USER LOGIN → thisara@example.com ═══');
  try {
    const userInfo = await fetchToken('user');
    console.log(`  ✅ Logged in as User (${userInfo.name})`);
    await setAuth(page, userInfo);
    for (const p of USER_PAGES) {
      await capture(page, path.join(OUTPUT_DIR, 'user'), p.name, p.path);
    }
  } catch (e) { console.error('  ❌ User login error:', e.message); }

  // ── 4. Vendor ─────────────────────────────────────────────────────────────
  console.log('\n═══ VENDOR LOGIN → roshan.vendor@example.com ═══');
  try {
    const vendorInfo = await fetchToken('vendor');
    console.log(`  ✅ Logged in as Vendor (${vendorInfo.name})`);
    await setAuth(page, vendorInfo);
    for (const p of VENDOR_PAGES) {
      await capture(page, path.join(OUTPUT_DIR, 'vendor'), p.name, p.path);
    }
  } catch (e) { console.error('  ❌ Vendor login error:', e.message); }

  await clearAuth(page);
  await browser.close();

  console.log(`\n✅ All done! Screenshots in: ${OUTPUT_DIR}`);
  console.log('   ├── public/   (7 pages — no login)');
  console.log('   ├── admin/    (1 page  — admin logged in)');
  console.log('   ├── user/     (9 pages — user logged in)');
  console.log('   └── vendor/   (10 pages — vendor logged in)');
})();
