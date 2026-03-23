// ═══════════════════════════════════════════════════════════
// DATABASE LAYER — JSON File Storage (swap to PostgreSQL for production)
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DB_PATH)) fs.mkdirSync(DB_PATH, { recursive: true });

class JsonDB {
  constructor(collection) {
    this.file = path.join(DB_PATH, `${collection}.json`);
    this.collection = collection;
    if (!fs.existsSync(this.file)) {
      fs.writeFileSync(this.file, '[]');
    }
  }

  _read() {
    try {
      return JSON.parse(fs.readFileSync(this.file, 'utf-8'));
    } catch { return []; }
  }

  _write(data) {
    fs.writeFileSync(this.file, JSON.stringify(data, null, 2));
  }

  findAll(filter = {}) {
    let data = this._read();
    if (Object.keys(filter).length > 0) {
      data = data.filter(item => {
        return Object.entries(filter).every(([key, val]) => {
          if (val === undefined || val === null || val === '') return true;
          if (typeof val === 'string' && typeof item[key] === 'string') {
            return item[key].toLowerCase().includes(val.toLowerCase());
          }
          return item[key] === val;
        });
      });
    }
    return data;
  }

  findById(id) {
    return this._read().find(item => item.id === id) || null;
  }

  findOne(filter) {
    return this._read().find(item => {
      return Object.entries(filter).every(([key, val]) => item[key] === val);
    }) || null;
  }

  create(data) {
    const items = this._read();
    const newItem = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.push(newItem);
    this._write(items);
    return newItem;
  }

  update(id, data) {
    const items = this._read();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...data, updatedAt: new Date().toISOString() };
    this._write(items);
    return items[index];
  }

  delete(id) {
    const items = this._read();
    const filtered = items.filter(item => item.id !== id);
    if (filtered.length === items.length) return false;
    this._write(filtered);
    return true;
  }

  count(filter = {}) {
    return this.findAll(filter).length;
  }
}

// Export collections
module.exports = {
  users: new JsonDB('users'),
  providers: new JsonDB('providers'),
  tests: new JsonDB('tests'),
  categories: new JsonDB('categories'),
  bookings: new JsonDB('bookings'),
  reviews: new JsonDB('reviews'),
  corporateLeads: new JsonDB('corporate_leads'),
  chatMessages: new JsonDB('chat_messages'),
  results: new JsonDB('results'),
  JsonDB
};
