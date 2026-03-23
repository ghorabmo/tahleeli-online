// ═══════════════════════════════════════════════════════════
// API CLIENT — Auto-detects backend URL
// ═══════════════════════════════════════════════════════════

const API_BASE = (() => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  if (window.location.hostname !== 'localhost') return window.location.origin + '/api';
  return 'http://localhost:3001/api';
})();

class ApiClient {
  constructor() {
    this.token = null;
    try { this.token = localStorage.getItem('tahleeli_token'); } catch {}
  }

  setToken(t) {
    this.token = t;
    try { if (t) localStorage.setItem('tahleeli_token', t); else localStorage.removeItem('tahleeli_token'); } catch {}
  }

  async request(method, path, body) {
    const h = { 'Content-Type': 'application/json' };
    if (this.token) h['Authorization'] = `Bearer ${this.token}`;
    const opts = { method, headers: h };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API_BASE}${path}`, opts);
    const data = await res.json();
    if (!res.ok) throw { status: res.status, ...data };
    return data;
  }

  register(name, email, phone, password) { return this.request('POST', '/auth/register', { name, email, phone, password }); }
  login(email, password) { return this.request('POST', '/auth/login', { email, password }); }
  getProfile() { return this.request('GET', '/auth/me'); }
  getCategories() { return this.request('GET', '/categories'); }
  getTests(p = {}) { return this.request('GET', '/tests?' + new URLSearchParams(p)); }
  getTest(id) { return this.request('GET', '/tests/' + id); }
  getProviders(p = {}) { return this.request('GET', '/providers?' + new URLSearchParams(p)); }
  getProvider(id) { return this.request('GET', '/providers/' + id); }
  getSlots(pid, date) { return this.request('GET', '/providers/' + pid + '/slots?date=' + date); }
  getProviderStats(pid) { return this.request('GET', '/providers/' + pid + '/stats'); }
  createBooking(d) { return this.request('POST', '/bookings', d); }
  getBookings(p = {}) { return this.request('GET', '/bookings?' + new URLSearchParams(p)); }
  cancelBooking(id) { return this.request('PATCH', '/bookings/' + id + '/cancel'); }
  createReview(d) { return this.request('POST', '/reviews', d); }
  getReviews(pid) { return this.request('GET', '/reviews?providerId=' + pid); }
  getResults() { return this.request('GET', '/results'); }
  submitCorporateLead(d) { return this.request('POST', '/corporate/lead', d); }
  sendChat(msg) { return this.request('POST', '/chat', { message: msg }); }
  search(q) { return this.request('GET', '/search?q=' + encodeURIComponent(q)); }
  getAdminStats() { return this.request('GET', '/admin/stats'); }
}

const api = new ApiClient();
export default api;
