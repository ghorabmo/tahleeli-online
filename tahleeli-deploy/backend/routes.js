const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');
const { generateToken, authMiddleware, optionalAuth, providerOnly, adminOnly } = require('./auth');

const router = express.Router();

// ═══════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'TahleeliOnline API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    stats: {
      providers: db.providers.count(),
      tests: db.tests.count(),
      bookings: db.bookings.count(),
      users: db.users.count()
    }
  });
});

// ═══════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════
router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password, role = 'patient' } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    const existing = db.users.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = db.users.create({
      name, email, phone: phone || '',
      password: hashedPassword,
      role,
      avatar: null,
      insurance: [],
      savedTests: [],
      preferences: { language: 'en', notifications: true }
    });
    const { password: _, ...safeUser } = user;
    const token = generateToken(user);
    res.status(201).json({ user: safeUser, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = db.users.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const { password: _, ...safeUser } = user;
    const token = generateToken(user);
    res.json({ user: safeUser, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/auth/me', authMiddleware, (req, res) => {
  const user = db.users.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password: _, ...safeUser } = user;
  res.json(safeUser);
});

router.put('/auth/me', authMiddleware, (req, res) => {
  const { name, phone, insurance, preferences } = req.body;
  const updated = db.users.update(req.user.id, { name, phone, insurance, preferences });
  if (!updated) return res.status(404).json({ error: 'User not found' });
  const { password: _, ...safeUser } = updated;
  res.json(safeUser);
});

// ═══════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════
router.get('/categories', (req, res) => {
  const categories = db.categories.findAll();
  // Add test count
  const enriched = categories.map(cat => ({
    ...cat,
    testCount: db.tests.findAll({ category: cat.slug }).length
  }));
  res.json(enriched);
});

// ═══════════════════════════════════════════
// TESTS / CATALOG
// ═══════════════════════════════════════════
router.get('/tests', (req, res) => {
  const { category, search, minPrice, maxPrice, sort, page = 1, limit = 20 } = req.query;
  let tests = db.tests.findAll();

  // Filter by category
  if (category && category !== 'all') {
    tests = tests.filter(t => t.category === category);
  }
  // Search
  if (search) {
    const q = search.toLowerCase();
    tests = tests.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.nameAr.includes(q) ||
      t.keywords?.some(k => k.toLowerCase().includes(q))
    );
  }
  // Price range
  if (minPrice) tests = tests.filter(t => t.basePrice >= Number(minPrice));
  if (maxPrice) tests = tests.filter(t => t.basePrice <= Number(maxPrice));

  // Sort
  if (sort === 'price_asc') tests.sort((a, b) => a.basePrice - b.basePrice);
  else if (sort === 'price_desc') tests.sort((a, b) => b.basePrice - a.basePrice);
  else if (sort === 'name') tests.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === 'popular') tests.sort((a, b) => (b.bookingCount || 0) - (a.bookingCount || 0));

  // Paginate
  const total = tests.length;
  const offset = (Number(page) - 1) * Number(limit);
  const paginated = tests.slice(offset, offset + Number(limit));

  // Enrich with provider data
  const enriched = paginated.map(test => {
    const providers = (test.providerIds || []).map(pid => {
      const p = db.providers.findById(pid);
      return p ? { id: p.id, name: p.name, nameAr: p.nameAr, location: p.location, rating: p.rating, price: test.basePrice + (p.priceModifier || 0), homeCollection: p.homeCollection } : null;
    }).filter(Boolean);
    return { ...test, providers, providerCount: providers.length };
  });

  res.json({ tests: enriched, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) });
});

router.get('/tests/:id', (req, res) => {
  const test = db.tests.findById(req.params.id);
  if (!test) return res.status(404).json({ error: 'Test not found' });

  const providers = (test.providerIds || []).map(pid => {
    const p = db.providers.findById(pid);
    return p ? { ...p, price: test.basePrice + (p.priceModifier || 0) } : null;
  }).filter(Boolean);

  res.json({ ...test, providers });
});

// ═══════════════════════════════════════════
// PROVIDERS
// ═══════════════════════════════════════════
router.get('/providers', (req, res) => {
  const { type, search, insurance, homeCollection, sort } = req.query;
  let providers = db.providers.findAll();

  if (type && type !== 'all') providers = providers.filter(p => p.type === type);
  if (search) {
    const q = search.toLowerCase();
    providers = providers.filter(p => p.name.toLowerCase().includes(q) || p.nameAr.includes(q) || p.location.toLowerCase().includes(q));
  }
  if (insurance) providers = providers.filter(p => p.insurance?.includes(insurance));
  if (homeCollection === 'true') providers = providers.filter(p => p.homeCollection);
  if (sort === 'rating') providers.sort((a, b) => b.rating - a.rating);
  else if (sort === 'reviews') providers.sort((a, b) => b.reviewCount - a.reviewCount);

  res.json(providers);
});

router.get('/providers/:id', (req, res) => {
  const provider = db.providers.findById(req.params.id);
  if (!provider) return res.status(404).json({ error: 'Provider not found' });

  // Get tests offered by this provider
  const allTests = db.tests.findAll();
  const providerTests = allTests.filter(t => t.providerIds?.includes(provider.id));
  const reviews = db.reviews.findAll({ providerId: provider.id });

  res.json({ ...provider, tests: providerTests, reviews });
});

router.get('/providers/:id/slots', (req, res) => {
  const { date } = req.query;
  // Generate available slots (in production, this would check against real calendar)
  const slots = [];
  const baseDate = date || new Date().toISOString().split('T')[0];
  const existingBookings = db.bookings.findAll({ providerId: req.params.id, date: baseDate });
  const bookedSlots = existingBookings.map(b => b.timeSlot);

  const times = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '13:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];
  times.forEach(time => {
    slots.push({
      time,
      available: !bookedSlots.includes(time),
      date: baseDate
    });
  });
  res.json(slots);
});

// Provider dashboard stats
router.get('/providers/:id/stats', authMiddleware, providerOnly, (req, res) => {
  const providerId = req.params.id;
  const allBookings = db.bookings.findAll({ providerId });
  const today = new Date().toISOString().split('T')[0];
  const todayBookings = allBookings.filter(b => b.date === today);

  const totalRevenue = allBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
  const todayRevenue = todayBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
  const reviews = db.reviews.findAll({ providerId });
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0;

  // Monthly breakdown
  const monthlyRevenue = {};
  allBookings.forEach(b => {
    const month = b.createdAt?.substring(0, 7) || 'unknown';
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (b.amount || 0);
  });

  // Top tests
  const testCounts = {};
  allBookings.forEach(b => {
    testCounts[b.testName || 'Unknown'] = (testCounts[b.testName || 'Unknown'] || 0) + 1;
  });
  const topTests = Object.entries(testCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  res.json({
    totalBookings: allBookings.length,
    todayBookings: todayBookings.length,
    totalRevenue,
    todayRevenue,
    avgRating: Number(avgRating),
    reviewCount: reviews.length,
    completionRate: allBookings.length > 0
      ? ((allBookings.filter(b => b.status === 'completed').length / allBookings.length) * 100).toFixed(1)
      : 0,
    monthlyRevenue,
    topTests
  });
});

// ═══════════════════════════════════════════
// BOOKINGS
// ═══════════════════════════════════════════
router.post('/bookings', authMiddleware, (req, res) => {
  const { testId, providerId, date, timeSlot, paymentMethod, homeCollection, notes } = req.body;

  if (!testId || !providerId || !date || !timeSlot) {
    return res.status(400).json({ error: 'testId, providerId, date, and timeSlot are required' });
  }

  const test = db.tests.findById(testId);
  if (!test) return res.status(404).json({ error: 'Test not found' });

  const provider = db.providers.findById(providerId);
  if (!provider) return res.status(404).json({ error: 'Provider not found' });

  // Check slot availability
  const existing = db.bookings.findOne({ providerId, date, timeSlot, status: 'confirmed' });
  if (existing) {
    return res.status(409).json({ error: 'This time slot is already booked' });
  }

  const amount = test.basePrice + (provider.priceModifier || 0);
  const bookingCode = 'THL-' + Math.floor(10000 + Math.random() * 90000);

  const booking = db.bookings.create({
    bookingCode,
    userId: req.user.id,
    userName: req.user.name || 'Patient',
    testId,
    testName: test.name,
    testNameAr: test.nameAr,
    providerId,
    providerName: provider.name,
    providerLocation: provider.location,
    date,
    timeSlot,
    amount,
    paymentMethod: paymentMethod || 'pay_at_lab',
    homeCollection: homeCollection || false,
    notes: notes || '',
    status: 'confirmed',
    resultStatus: 'pending'
  });

  // Update test booking count
  db.tests.update(testId, { bookingCount: (test.bookingCount || 0) + 1 });

  res.status(201).json(booking);
});

router.get('/bookings', authMiddleware, (req, res) => {
  const { status, providerId } = req.query;
  let bookings;

  if (req.user.role === 'provider' || req.user.role === 'admin') {
    bookings = providerId ? db.bookings.findAll({ providerId }) : db.bookings.findAll();
  } else {
    bookings = db.bookings.findAll({ userId: req.user.id });
  }

  if (status) bookings = bookings.filter(b => b.status === status);
  bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(bookings);
});

router.get('/bookings/:id', authMiddleware, (req, res) => {
  const booking = db.bookings.findById(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (req.user.role === 'patient' && booking.userId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  res.json(booking);
});

router.patch('/bookings/:id/status', authMiddleware, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['confirmed', 'in-progress', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
  }
  const updated = db.bookings.update(req.params.id, { status });
  if (!updated) return res.status(404).json({ error: 'Booking not found' });
  res.json(updated);
});

router.patch('/bookings/:id/cancel', authMiddleware, (req, res) => {
  const booking = db.bookings.findById(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (booking.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  const updated = db.bookings.update(req.params.id, { status: 'cancelled' });
  res.json(updated);
});

// ═══════════════════════════════════════════
// REVIEWS
// ═══════════════════════════════════════════
router.post('/reviews', authMiddleware, (req, res) => {
  const { providerId, bookingId, rating, text } = req.body;
  if (!providerId || !rating) {
    return res.status(400).json({ error: 'providerId and rating are required' });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }
  const review = db.reviews.create({
    userId: req.user.id,
    userName: req.user.name || 'Patient',
    providerId,
    bookingId: bookingId || null,
    rating,
    text: text || ''
  });

  // Update provider average rating
  const allReviews = db.reviews.findAll({ providerId });
  const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
  db.providers.update(providerId, { rating: Math.round(avg * 10) / 10, reviewCount: allReviews.length });

  res.status(201).json(review);
});

router.get('/reviews', (req, res) => {
  const { providerId } = req.query;
  let reviews = providerId ? db.reviews.findAll({ providerId }) : db.reviews.findAll();
  reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(reviews);
});

// ═══════════════════════════════════════════
// RESULTS
// ═══════════════════════════════════════════
router.post('/results', authMiddleware, providerOnly, (req, res) => {
  const { bookingId, summary, fileUrl, data } = req.body;
  if (!bookingId) return res.status(400).json({ error: 'bookingId is required' });

  const booking = db.bookings.findById(bookingId);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const result = db.results.create({
    bookingId,
    userId: booking.userId,
    testName: booking.testName,
    providerName: booking.providerName,
    summary: summary || '',
    fileUrl: fileUrl || null,
    data: data || null,
    status: 'ready'
  });

  db.bookings.update(bookingId, { resultStatus: 'ready', status: 'completed' });
  res.status(201).json(result);
});

router.get('/results', authMiddleware, (req, res) => {
  const results = db.results.findAll({ userId: req.user.id });
  results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(results);
});

// ═══════════════════════════════════════════
// CORPORATE LEADS (B2B)
// ═══════════════════════════════════════════
router.post('/corporate/lead', (req, res) => {
  const { company, contact, email, phone, employees, needs } = req.body;
  if (!company || !email) {
    return res.status(400).json({ error: 'Company name and email are required' });
  }
  const lead = db.corporateLeads.create({
    company, contact: contact || '', email,
    phone: phone || '', employees: employees || '',
    needs: needs || '', status: 'new'
  });
  res.status(201).json({ message: 'Corporate inquiry received. Our B2B team will contact you within 24 hours.', lead });
});

router.get('/corporate/leads', authMiddleware, adminOnly, (req, res) => {
  res.json(db.corporateLeads.findAll());
});

// ═══════════════════════════════════════════
// AI CHATBOT
// ═══════════════════════════════════════════
router.post('/chat', optionalAuth, (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const msg = message.toLowerCase();
  let response = { text: '', suggestions: [], action: null };

  if (msg.includes('book') || msg.includes('حجز') || msg.includes('appointment')) {
    response.text = "I'd love to help you book! What type of test or scan are you looking for? You can tell me the test name, describe your symptoms, or upload a prescription photo.";
    response.suggestions = ['Blood test', 'MRI scan', 'Full checkup', 'Upload prescription'];
    response.action = { type: 'navigate', target: '/search' };
  } else if (msg.includes('price') || msg.includes('cost') || msg.includes('سعر') || msg.includes('كام')) {
    const tests = db.tests.findAll();
    const matchedTest = tests.find(t => msg.includes(t.name.toLowerCase().split(' ')[0]));
    if (matchedTest) {
      response.text = `The ${matchedTest.name} starts from EGP ${matchedTest.basePrice}. Prices vary by provider and location. Would you like to compare prices across all available providers?`;
    } else {
      response.text = "Our platform shows real-time prices from all partner providers. Prices vary by provider and location. What specific test are you looking for?";
    }
    response.suggestions = ['CBC price', 'MRI price', 'Compare all', 'Cheapest option'];
  } else if (msg.includes('result') || msg.includes('نتيجة') || msg.includes('report')) {
    response.text = "You can view all your test results in the 'My Results' section. Results are uploaded by the lab once ready, and you'll receive a push notification and WhatsApp message. Would you like to check your pending results?";
    response.suggestions = ['My results', 'How long?', 'Share with doctor'];
  } else if (msg.includes('home') || msg.includes('منزل') || msg.includes('house') || msg.includes('visit')) {
    response.text = "Many of our partner labs offer home sample collection! A certified phlebotomist comes to your location at your chosen time. The service typically costs an additional EGP 50-100. Which area are you located in?";
    response.suggestions = ['Cairo', 'Giza', 'Alexandria', 'Show providers'];
  } else if (msg.includes('insurance') || msg.includes('تأمين')) {
    response.text = "We partner with major insurance providers including MetLife, AXA, Allianz, Bupa, and GIG. You can filter labs and imaging centers by your insurance on the search page. Would you like me to show providers that accept your insurance?";
    response.suggestions = ['MetLife', 'AXA', 'Allianz', 'All insurers'];
  } else if (msg.includes('cancel') || msg.includes('إلغاء')) {
    response.text = "You can cancel a booking up to 2 hours before the appointment time for a full refund. Go to 'My Bookings', select the booking, and tap 'Cancel'. Need help cancelling a specific booking?";
    response.suggestions = ['My bookings', 'Refund policy', 'Reschedule'];
  } else if (msg.includes('hi') || msg.includes('hello') || msg.includes('مرحبا') || msg.includes('أهلا')) {
    response.text = "مرحباً! 👋 Welcome to TahleeliOnline! I'm your AI health assistant. I can help you find tests, compare prices, book appointments, or understand your results. How can I help you today?";
    response.suggestions = ['Book a test', 'Check prices', 'Home collection', 'My results'];
  } else {
    response.text = "I can help you with booking tests, comparing prices, finding providers, home collection services, insurance, and viewing results. What would you like to know?";
    response.suggestions = ['Book a test', 'Compare prices', 'Find a lab', 'Contact support'];
  }

  // Save chat message
  if (req.user) {
    db.chatMessages.create({
      userId: req.user.id,
      userMessage: message,
      botResponse: response.text,
      suggestions: response.suggestions
    });
  }

  res.json(response);
});

// ═══════════════════════════════════════════
// SEARCH (unified)
// ═══════════════════════════════════════════
router.get('/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ tests: [], providers: [] });

  const query = q.toLowerCase();
  const tests = db.tests.findAll().filter(t =>
    t.name.toLowerCase().includes(query) || t.nameAr.includes(q) || t.keywords?.some(k => k.includes(query))
  ).slice(0, 10);

  const providers = db.providers.findAll().filter(p =>
    p.name.toLowerCase().includes(query) || p.nameAr.includes(q) || p.location.toLowerCase().includes(query)
  ).slice(0, 5);

  res.json({ tests, providers });
});

// ═══════════════════════════════════════════
// DASHBOARD STATS (admin)
// ═══════════════════════════════════════════
router.get('/admin/stats', authMiddleware, adminOnly, (req, res) => {
  const bookings = db.bookings.findAll();
  const revenue = bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.amount || 0), 0);
  res.json({
    totalUsers: db.users.count(),
    totalProviders: db.providers.count(),
    totalTests: db.tests.count(),
    totalBookings: bookings.length,
    totalRevenue: revenue,
    totalReviews: db.reviews.count(),
    corporateLeads: db.corporateLeads.count(),
    bookingsByStatus: {
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      'in-progress': bookings.filter(b => b.status === 'in-progress').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
    }
  });
});

module.exports = router;
