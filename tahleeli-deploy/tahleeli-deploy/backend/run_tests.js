const http = require('http');
const BASE = 'http://localhost:3001/api';
let passed = 0, failed = 0, token = '', adminToken = '', providerToken = '', testBookingId = '';

function req(method, path, body, authToken) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE + path);
    const opts = { hostname: url.hostname, port: url.port, path: url.pathname + url.search, method, headers: { 'Content-Type': 'application/json' } };
    if (authToken) opts.headers['Authorization'] = `Bearer ${authToken}`;
    const r = http.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve({ s: res.statusCode, d: JSON.parse(d) }); } catch { resolve({ s: res.statusCode, d }); } });
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

function ok(name, cond) { if (cond) { passed++; console.log(`  ✅ ${name}`); } else { failed++; console.log(`  ❌ ${name}`); } }

async function run() {
  console.log('\n🧪 FULL API TEST SUITE\n' + '═'.repeat(50));

  // Health
  console.log('\n📡 Health');
  let r = await req('GET', '/health');
  ok('Server running', r.s === 200);
  ok('DB has data', r.d.stats?.providers === 8 && r.d.stats?.tests === 20);

  // Auth
  console.log('\n🔐 Auth');
  r = await req('POST', '/auth/register', { name: 'Test User', email: `test${Date.now()}@test.com`, password: 'test123', phone: '+20-100-999' });
  ok('Register', r.s === 201 && !!r.d.token);
  token = r.d.token;

  r = await req('POST', '/auth/login', { email: 'admin@tahleelionline.com', password: 'admin123' });
  ok('Admin login', r.s === 200); adminToken = r.d.token;

  r = await req('POST', '/auth/login', { email: 'provider@cairodiag.com', password: 'provider123' });
  ok('Provider login', r.s === 200); providerToken = r.d.token;

  r = await req('POST', '/auth/login', { email: 'bad@x.com', password: 'wrong' });
  ok('Bad login rejected', r.s === 401);

  r = await req('GET', '/auth/me', null, token);
  ok('Get profile', r.s === 200 && r.d.name === 'Test User');

  // Categories
  console.log('\n📂 Categories');
  r = await req('GET', '/categories');
  ok('List 8 categories', r.s === 200 && r.d.length === 8);

  // Tests
  console.log('\n🧪 Tests');
  r = await req('GET', '/tests');
  ok('List tests', r.s === 200 && r.d.tests.length > 0);
  ok('Pagination', r.d.total === 20);
  ok('Provider enrichment', r.d.tests[0].providers?.length > 0);

  const testId = r.d.tests[0].id;

  r = await req('GET', '/tests?category=blood');
  ok('Filter category', r.d.tests.every(t => t.category === 'blood'));

  r = await req('GET', '/tests?search=MRI');
  ok('Search EN', r.d.tests.length > 0);

  r = await req('GET', '/tests?search=دم');
  ok('Search AR', r.d.tests.length > 0);

  r = await req('GET', '/tests?sort=price_asc');
  ok('Sort price', r.d.tests[0].basePrice <= r.d.tests[1].basePrice);

  r = await req('GET', `/tests/${testId}`);
  ok('Single test', r.s === 200 && r.d.providers?.length > 0);

  // Providers
  console.log('\n🏥 Providers');
  r = await req('GET', '/providers');
  ok('List 8 providers', r.s === 200 && r.d.length === 8);
  const providerId = r.d[0].id;

  r = await req('GET', '/providers?type=lab');
  ok('Filter labs', r.d.every(p => p.type === 'lab'));

  r = await req('GET', '/providers?type=imaging');
  ok('Filter imaging', r.d.every(p => p.type === 'imaging'));

  r = await req('GET', '/providers?homeCollection=true');
  ok('Filter home collection', r.d.every(p => p.homeCollection));

  r = await req('GET', `/providers/${providerId}`);
  ok('Provider detail + tests', r.s === 200 && r.d.tests?.length > 0);

  r = await req('GET', `/providers/${providerId}/slots?date=2026-04-01`);
  ok('Available slots', r.s === 200 && r.d.length > 0);

  // Bookings
  console.log('\n📅 Bookings');
  r = await req('POST', '/bookings', { testId, providerId, date: '2026-04-01', timeSlot: '09:00', paymentMethod: 'fawry' }, token);
  ok('Create booking', r.s === 201 && r.d.bookingCode?.startsWith('THL-'));
  ok('Status confirmed', r.d.status === 'confirmed');
  testBookingId = r.d.id;

  r = await req('POST', '/bookings', { testId, providerId, date: '2026-04-01', timeSlot: '09:00' }, token);
  ok('Prevent double booking', r.s === 409);

  r = await req('POST', '/bookings', { testId, providerId, date: '2026-04-01', timeSlot: '10:00' });
  ok('Auth required', r.s === 401);

  r = await req('GET', '/bookings', null, token);
  ok('List my bookings', r.s === 200 && r.d.length > 0);

  r = await req('GET', `/bookings/${testBookingId}`, null, token);
  ok('Booking detail', r.s === 200 && r.d.bookingCode);

  r = await req('PATCH', `/bookings/${testBookingId}/status`, { status: 'in-progress' }, token);
  ok('Update status', r.s === 200 && r.d.status === 'in-progress');

  // Reviews
  console.log('\n⭐ Reviews');
  r = await req('POST', '/reviews', { providerId, rating: 5, text: 'Excellent!' }, token);
  ok('Create review', r.s === 201);

  r = await req('GET', `/reviews?providerId=${providerId}`);
  ok('List reviews', r.s === 200 && r.d.length > 0);

  // Results
  console.log('\n📄 Results');
  r = await req('POST', '/results', { bookingId: testBookingId, summary: 'Normal', data: { wbc: 7.5 } }, providerToken);
  ok('Upload result', r.s === 201);

  r = await req('GET', '/results', null, token);
  ok('View results', r.s === 200);

  // Corporate
  console.log('\n🏢 Corporate');
  r = await req('POST', '/corporate/lead', { company: 'TestCorp', email: 'hr@test.com', employees: '51-200' });
  ok('Submit lead', r.s === 201);

  r = await req('GET', '/corporate/leads', null, adminToken);
  ok('Admin view leads', r.s === 200 && r.d.length > 0);

  r = await req('GET', '/corporate/leads', null, token);
  ok('Non-admin rejected', r.s === 403);

  // Chat
  console.log('\n🤖 Chatbot');
  r = await req('POST', '/chat', { message: 'Book a blood test' });
  ok('Chat EN', r.s === 200 && r.d.text.length > 0 && r.d.suggestions?.length > 0);

  r = await req('POST', '/chat', { message: 'أريد حجز تحليل' });
  ok('Chat AR', r.s === 200 && r.d.text.length > 0);

  // Search
  console.log('\n🔍 Search');
  r = await req('GET', '/search?q=blood');
  ok('Unified search', r.s === 200 && r.d.tests.length > 0);

  // Admin
  console.log('\n👑 Admin');
  r = await req('GET', '/admin/stats', null, adminToken);
  ok('Admin stats', r.s === 200 && r.d.totalProviders === 8);

  r = await req('GET', '/admin/stats', null, token);
  ok('Patient blocked', r.s === 403);

  // Provider Stats
  console.log('\n📊 Provider Dashboard');
  r = await req('GET', `/providers/${providerId}/stats`, null, providerToken);
  ok('Provider stats', r.s === 200 && r.d.totalBookings !== undefined);

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log(`\n📊 ${passed} passed, ${failed} failed, ${passed + failed} total`);
  if (failed === 0) console.log('🎉 ALL TESTS PASSED!\n');
  else console.log(`⚠️  ${failed} test(s) need attention\n`);
}

// Start server then run tests
const app = require('./server');
setTimeout(() => run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); }), 1500);
