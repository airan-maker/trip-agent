import Database from 'better-sqlite3';
import path from 'path';
import { Trip, Message, Place } from '@/types/trip';

const DB_PATH = path.join(process.cwd(), 'data', 'triptalk.db');

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    const fs = require('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initializeDb(db);
  }
  return db;
}

function initializeDb(db: Database.Database) {
  db.exec(`
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
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (tripId) REFERENCES trips(id)
    );

    CREATE TABLE IF NOT EXISTS places (
      id TEXT PRIMARY KEY,
      tripId TEXT NOT NULL,
      dayIndex INTEGER NOT NULL,
      timeSlot TEXT NOT NULL,
      orderIndex INTEGER NOT NULL DEFAULT 0,
      name TEXT NOT NULL,
      nameLocal TEXT,
      category TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      address TEXT,
      latitude REAL,
      longitude REAL,
      rating REAL,
      openingHours TEXT,
      duration TEXT,
      cost TEXT,
      imageUrl TEXT,
      memo TEXT,
      FOREIGN KEY (tripId) REFERENCES trips(id)
    );

    CREATE INDEX IF NOT EXISTS idx_messages_tripId ON messages(tripId);
    CREATE INDEX IF NOT EXISTS idx_places_tripId ON places(tripId);
  `);
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

  const db = getDb();
  db.prepare(`
    INSERT INTO trips (id, title, destination, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(trip.id, trip.title, trip.destination, trip.status, trip.createdAt, trip.updatedAt);

  return trip;
}

export function getTrip(id: string): Trip | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM trips WHERE id = ?').get(id) as Trip | undefined;
  return row ?? null;
}

export function updateTrip(id: string, updates: Partial<Trip>): Trip | null {
  const db = getDb();
  const existing = getTrip(id);
  if (!existing) return null;

  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(updates)) {
    if (key !== 'id' && key !== 'createdAt') {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  fields.push('updatedAt = ?');
  values.push(new Date().toISOString());
  values.push(id);

  db.prepare(`UPDATE trips SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return getTrip(id);
}

// Message operations
export function addMessage(msg: Message): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO messages (id, tripId, role, content, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `).run(msg.id, msg.tripId, msg.role, msg.content, msg.createdAt);
}

export function getMessages(tripId: string): Message[] {
  const db = getDb();
  return db.prepare('SELECT * FROM messages WHERE tripId = ? ORDER BY createdAt ASC').all(tripId) as Message[];
}

// Place operations
export function setPlaces(tripId: string, places: Place[]): void {
  const db = getDb();
  const deleteStmt = db.prepare('DELETE FROM places WHERE tripId = ?');
  const insertStmt = db.prepare(`
    INSERT INTO places (id, tripId, dayIndex, timeSlot, orderIndex, name, nameLocal, category, description, address, latitude, longitude, rating, openingHours, duration, cost, imageUrl, memo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    deleteStmt.run(tripId);
    for (const p of places) {
      insertStmt.run(
        p.id, p.tripId, p.dayIndex, p.timeSlot, p.orderIndex,
        p.name, p.nameLocal, p.category, p.description, p.address,
        p.latitude, p.longitude, p.rating, p.openingHours,
        p.duration, p.cost, p.imageUrl, p.memo
      );
    }
  });

  transaction();
}

export function getPlaces(tripId: string): Place[] {
  const db = getDb();
  return db.prepare('SELECT * FROM places WHERE tripId = ? ORDER BY dayIndex, orderIndex').all(tripId) as Place[];
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
        start.setDate(start.getDate() + dayIndex - 1);
        date = start.toISOString().split('T')[0];
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
