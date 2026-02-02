import { createClient, type Client } from '@libsql/client';
import { Trip, Message, Place } from '@/types/trip';
import { getEnv } from './env';

// Whitelist of updatable trip columns to prevent SQL injection
const UPDATABLE_TRIP_COLUMNS = new Set([
  'title', 'destination', 'startDate', 'endDate',
  'travelers', 'theme', 'budget', 'transportation',
  'preferences', 'status', 'updatedAt',
]);

let client: Client | null = null;

function getClient(): Client {
  if (client) return client;

  const env = getEnv();
  client = createClient({
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  });

  return client;
}

let initialized = false;

async function ensureInitialized(): Promise<Client> {
  const c = getClient();
  if (initialized) return c;

  await c.executeMultiple(`
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

  initialized = true;
  return c;
}

// Trip operations
export async function createTrip(id: string): Promise<Trip> {
  const c = await ensureInitialized();
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

  await c.execute({
    sql: `INSERT INTO trips (id, title, destination, status, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [trip.id, trip.title, trip.destination, trip.status, trip.createdAt, trip.updatedAt],
  });

  return trip;
}

export async function getTrip(id: string): Promise<Trip | null> {
  const c = await ensureInitialized();
  const result = await c.execute({
    sql: 'SELECT * FROM trips WHERE id = ?',
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return result.rows[0] as unknown as Trip;
}

export async function updateTrip(id: string, updates: Partial<Trip>): Promise<Trip | null> {
  const existing = await getTrip(id);
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

  const c = await ensureInitialized();
  await c.execute({
    sql: `UPDATE trips SET ${fields.join(', ')} WHERE id = ?`,
    args: values as Array<string | number | null>,
  });

  return getTrip(id);
}

// Message operations
export async function addMessage(msg: Message): Promise<void> {
  const c = await ensureInitialized();
  await c.execute({
    sql: `INSERT INTO messages (id, tripId, role, content, createdAt)
          VALUES (?, ?, ?, ?, ?)`,
    args: [msg.id, msg.tripId, msg.role, msg.content, msg.createdAt],
  });
}

export async function getMessages(tripId: string, limit?: number): Promise<Message[]> {
  const c = await ensureInitialized();
  if (limit) {
    const result = await c.execute({
      sql: 'SELECT * FROM messages WHERE tripId = ? ORDER BY createdAt ASC LIMIT ?',
      args: [tripId, limit],
    });
    return result.rows as unknown as Message[];
  }
  const result = await c.execute({
    sql: 'SELECT * FROM messages WHERE tripId = ? ORDER BY createdAt ASC',
    args: [tripId],
  });
  return result.rows as unknown as Message[];
}

export async function getMessageCount(tripId: string): Promise<number> {
  const c = await ensureInitialized();
  const result = await c.execute({
    sql: 'SELECT COUNT(*) as count FROM messages WHERE tripId = ?',
    args: [tripId],
  });
  const row = result.rows[0] as unknown as { count: number } | undefined;
  return row?.count ?? 0;
}

// Place operations
export async function setPlaces(tripId: string, places: Place[]): Promise<void> {
  const c = await ensureInitialized();

  const statements = [
    {
      sql: 'DELETE FROM places WHERE tripId = ?',
      args: [tripId] as Array<string | number | null>,
    },
    ...places.map((p) => ({
      sql: `INSERT INTO places (id, tripId, dayIndex, timeSlot, orderIndex, name, nameLocal, category, description, address, latitude, longitude, rating, openingHours, duration, cost, imageUrl, memo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        p.id, p.tripId, p.dayIndex, p.timeSlot, p.orderIndex,
        p.name, p.nameLocal, p.category, p.description, p.address,
        p.latitude, p.longitude,
        p.rating != null ? Math.min(5, Math.max(0, p.rating)) : null,
        p.openingHours, p.duration, p.cost, p.imageUrl, p.memo,
      ] as Array<string | number | null>,
    })),
  ];

  await c.batch(statements, 'write');
}

export async function getPlaces(tripId: string): Promise<Place[]> {
  const c = await ensureInitialized();
  const result = await c.execute({
    sql: 'SELECT * FROM places WHERE tripId = ? ORDER BY dayIndex, orderIndex',
    args: [tripId],
  });
  return result.rows as unknown as Place[];
}

// Get full itinerary
export async function getItinerary(tripId: string) {
  const trip = await getTrip(tripId);
  if (!trip) return null;

  const places = await getPlaces(tripId);
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

// Reorder places within a day
export async function reorderPlaces(tripId: string, dayIndex: number, placeIds: string[]): Promise<void> {
  const c = await ensureInitialized();

  const statements = placeIds.map((placeId, i) => ({
    sql: 'UPDATE places SET orderIndex = ? WHERE id = ? AND tripId = ? AND dayIndex = ?',
    args: [i, placeId, tripId, dayIndex] as Array<string | number | null>,
  }));

  await c.batch(statements, 'write');
}

// Update place image URL (for Google Places caching)
export async function updatePlaceImageUrl(placeId: string, imageUrl: string): Promise<void> {
  const c = await ensureInitialized();
  await c.execute({
    sql: 'UPDATE places SET imageUrl = ? WHERE id = ?',
    args: [imageUrl, placeId],
  });
}

// Single place operations for incremental modification

export async function addPlace(place: Place): Promise<void> {
  const c = await ensureInitialized();
  await c.execute({
    sql: `INSERT INTO places (id, tripId, dayIndex, timeSlot, orderIndex, name, nameLocal, category, description, address, latitude, longitude, rating, openingHours, duration, cost, imageUrl, memo)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      place.id, place.tripId, place.dayIndex, place.timeSlot, place.orderIndex,
      place.name, place.nameLocal, place.category, place.description, place.address,
      place.latitude, place.longitude,
      place.rating != null ? Math.min(5, Math.max(0, place.rating)) : null,
      place.openingHours, place.duration, place.cost, place.imageUrl, place.memo,
    ] as Array<string | number | null>,
  });
}

export async function deletePlace(placeId: string, tripId: string): Promise<void> {
  const c = await ensureInitialized();
  await c.execute({
    sql: 'DELETE FROM places WHERE id = ? AND tripId = ?',
    args: [placeId, tripId],
  });
}

export async function updatePlace(placeId: string, updates: Partial<Place>): Promise<void> {
  const allowedColumns = new Set([
    'dayIndex', 'timeSlot', 'orderIndex', 'name', 'nameLocal',
    'category', 'description', 'address', 'latitude', 'longitude',
    'rating', 'openingHours', 'duration', 'cost',
  ]);

  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(updates)) {
    if (!allowedColumns.has(key)) continue;
    fields.push(`${key} = ?`);
    values.push(value ?? null);
  }

  if (fields.length === 0) return;

  values.push(placeId);
  const c = await ensureInitialized();
  await c.execute({
    sql: `UPDATE places SET ${fields.join(', ')} WHERE id = ?`,
    args: values as Array<string | number | null>,
  });
}

export async function deletePlacesByDay(tripId: string, dayIndex: number): Promise<void> {
  const c = await ensureInitialized();
  await c.execute({
    sql: 'DELETE FROM places WHERE tripId = ? AND dayIndex = ?',
    args: [tripId, dayIndex],
  });
}

export async function reindexDay(tripId: string, dayIndex: number): Promise<void> {
  const c = await ensureInitialized();
  const result = await c.execute({
    sql: 'SELECT id FROM places WHERE tripId = ? AND dayIndex = ? ORDER BY orderIndex',
    args: [tripId, dayIndex],
  });

  if (result.rows.length === 0) return;

  const statements = result.rows.map((row, i) => ({
    sql: 'UPDATE places SET orderIndex = ? WHERE id = ?',
    args: [i, (row as unknown as { id: string }).id] as Array<string | number | null>,
  }));

  await c.batch(statements, 'write');
}

// Health check
export async function healthCheck(): Promise<boolean> {
  try {
    const c = await ensureInitialized();
    const result = await c.execute('SELECT 1 as ok');
    const row = result.rows[0] as unknown as { ok: number } | undefined;
    return row?.ok === 1;
  } catch {
    return false;
  }
}
