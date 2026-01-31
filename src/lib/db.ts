import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { Trip, Message, Place } from '@/types/trip';

const DB_PATH = path.join(process.cwd(), 'data', 'triptalk.db');

// Whitelist of updatable trip columns to prevent SQL injection
const UPDATABLE_TRIP_COLUMNS = new Set([
  'title', 'destination', 'startDate', 'endDate',
  'travelers', 'theme', 'budget', 'transportation',
  'preferences', 'status', 'updatedAt',
]);

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (db) return db;

  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.pragma('busy_timeout = 5000');
    initializeDb(db);

    return db;
  } catch (err) {
    console.error('Failed to initialize database:', err);
    throw new Error('Database initialization failed');
  }
}

function initializeDb(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      destination TEXT NOT NULL DEFAULT '',
      startDate TEXT,
      endDate TEXT,
      travelers TEXT,
      theme TEXT,
      budget TEXT,
      transportation TEXT,
      preferences TEXT,
      status TEXT NOT NULL DEFAULT 'planning',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      tripId TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
      content TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS places (
      id TEXT PRIMARY KEY,
      tripId TEXT NOT NULL,
      dayIndex INTEGER NOT NULL,
      timeSlot TEXT NOT NULL CHECK(timeSlot IN ('morning', 'lunch', 'afternoon', 'evening')),
      orderIndex INTEGER NOT NULL DEFAULT 0,
      name TEXT NOT NULL,
      nameLocal TEXT,
      category TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      address TEXT,
      latitude REAL,
      longitude REAL,
      rating REAL CHECK(rating IS NULL OR (rating >= 0 AND rating <= 5)),
      openingHours TEXT,
      duration TEXT,
      cost TEXT,
      imageUrl TEXT,
      memo TEXT,
      FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_messages_tripId ON messages(tripId);
    CREATE INDEX IF NOT EXISTS idx_messages_createdAt ON messages(tripId, createdAt);
    CREATE INDEX IF NOT EXISTS idx_places_tripId ON places(tripId);
    CREATE INDEX IF NOT EXISTS idx_places_day ON places(tripId, dayIndex, orderIndex);
  `);
}

// Graceful shutdown
export function closeDb(): void {
  if (db) {
    try {
      db.close();
    } catch (err) {
      console.error('Error closing database:', err);
    }
    db = null;
  }
}

// Register shutdown handlers
if (typeof process !== 'undefined') {
  const shutdown = () => {
    closeDb();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

// Trip operations
export function createTrip(id: string): Trip {
  const now = new Date().toISOString();
  const trip: Trip = {
    id,
    title: '',
    destination: '',
    startDate: null,
    endDate: null,
    travelers: null,
    theme: null,
    budget: null,
    transportation: null,
    preferences: null,
    status: 'planning',
    createdAt: now,
    updatedAt: now,
  };

  getDb()
    .prepare(
      `INSERT INTO trips (id, title, destination, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(trip.id, trip.title, trip.destination, trip.status, trip.createdAt, trip.updatedAt);

  return trip;
}

export function getTrip(id: string): Trip | null {
  const row = getDb().prepare('SELECT * FROM trips WHERE id = ?').get(id);
  return (row as Trip) ?? null;
}

export function updateTrip(id: string, updates: Partial<Trip>): Trip | null {
  const existing = getTrip(id);
  if (!existing) return null;

  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(updates)) {
    if (!UPDATABLE_TRIP_COLUMNS.has(key)) continue;
    fields.push(`${key} = ?`);
    values.push(value);
  }

  if (fields.length === 0) return existing;

  // Always update timestamp
  if (!updates.updatedAt) {
    fields.push('updatedAt = ?');
    values.push(new Date().toISOString());
  }

  values.push(id);

  getDb()
    .prepare(`UPDATE trips SET ${fields.join(', ')} WHERE id = ?`)
    .run(...values);

  return getTrip(id);
}

// Message operations
export function addMessage(msg: Message): void {
  getDb()
    .prepare(
      `INSERT INTO messages (id, tripId, role, content, createdAt)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(msg.id, msg.tripId, msg.role, msg.content, msg.createdAt);
}

export function getMessages(tripId: string, limit?: number): Message[] {
  if (limit) {
    return getDb()
      .prepare('SELECT * FROM messages WHERE tripId = ? ORDER BY createdAt ASC LIMIT ?')
      .all(tripId, limit) as Message[];
  }
  return getDb()
    .prepare('SELECT * FROM messages WHERE tripId = ? ORDER BY createdAt ASC')
    .all(tripId) as Message[];
}

export function getMessageCount(tripId: string): number {
  const row = getDb()
    .prepare('SELECT COUNT(*) as count FROM messages WHERE tripId = ?')
    .get(tripId) as { count: number } | undefined;
  return row?.count ?? 0;
}

// Place operations
export function setPlaces(tripId: string, places: Place[]): void {
  const database = getDb();
  const deleteStmt = database.prepare('DELETE FROM places WHERE tripId = ?');
  const insertStmt = database.prepare(
    `INSERT INTO places (id, tripId, dayIndex, timeSlot, orderIndex, name, nameLocal, category, description, address, latitude, longitude, rating, openingHours, duration, cost, imageUrl, memo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const transaction = database.transaction(() => {
    deleteStmt.run(tripId);
    for (const p of places) {
      insertStmt.run(
        p.id, p.tripId, p.dayIndex, p.timeSlot, p.orderIndex,
        p.name, p.nameLocal, p.category, p.description, p.address,
        p.latitude, p.longitude,
        p.rating != null ? Math.min(5, Math.max(0, p.rating)) : null,
        p.openingHours, p.duration, p.cost, p.imageUrl, p.memo
      );
    }
  });

  transaction();
}

export function getPlaces(tripId: string): Place[] {
  return getDb()
    .prepare('SELECT * FROM places WHERE tripId = ? ORDER BY dayIndex, orderIndex')
    .all(tripId) as Place[];
}

// Get full itinerary
export function getItinerary(tripId: string) {
  const trip = getTrip(tripId);
  if (!trip) return null;

  const places = getPlaces(tripId);
  const dayMap = new Map<number, Place[]>();

  for (const place of places) {
    const existing = dayMap.get(place.dayIndex) || [];
    existing.push(place);
    dayMap.set(place.dayIndex, existing);
  }

  const days = Array.from(dayMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([dayIndex, dayPlaces]) => {
      let date: string | null = null;
      if (trip.startDate) {
        const start = new Date(trip.startDate);
        if (!isNaN(start.getTime())) {
          start.setDate(start.getDate() + dayIndex - 1);
          date = start.toISOString().split('T')[0];
        }
      }
      return {
        dayIndex,
        date,
        title: `Day ${dayIndex}`,
        places: dayPlaces,
      };
    });

  return { trip, days };
}

// Health check
export function healthCheck(): boolean {
  try {
    const row = getDb().prepare('SELECT 1 as ok').get() as { ok: number } | undefined;
    return row?.ok === 1;
  } catch {
    return false;
  }
}
