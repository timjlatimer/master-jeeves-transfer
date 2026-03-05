import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  bingoCards, InsertBingoCard,
  petitions, InsertPetition,
  newsItems, InsertNewsItem,
  userPreferences, InsertUserPreference,
  chatMessages, InsertChatMessage,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ---- Bingo Cards ----
export async function createBingoCard(card: InsertBingoCard) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(bingoCards).values(card);
  return result[0].insertId;
}

export async function getBingoCardsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bingoCards).where(eq(bingoCards.userId, userId)).orderBy(desc(bingoCards.updatedAt));
}

export async function updateBingoCard(id: number, data: Partial<InsertBingoCard>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(bingoCards).set(data).where(eq(bingoCards.id, id));
}

export async function getBingoCardById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(bingoCards).where(eq(bingoCards.id, id)).limit(1);
  return result[0];
}

// ---- Petitions ----
export async function createPetition(petition: InsertPetition) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(petitions).values(petition);
  return result[0].insertId;
}

export async function getAllPetitions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(petitions).orderBy(desc(petitions.createdAt));
}

export async function endorsePetition(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(petitions).where(eq(petitions.id, id)).limit(1);
  if (!existing[0]) throw new Error("Petition not found");
  const newCount = (existing[0].endorsements || 0) + 1;
  let newLevel = existing[0].escalationLevel;
  if (newCount >= 50) newLevel = 5;
  else if (newCount >= 30) newLevel = 4;
  else if (newCount >= 15) newLevel = 3;
  else if (newCount >= 10) newLevel = 2;
  await db.update(petitions).set({
    endorsements: newCount,
    escalationLevel: newLevel,
    status: newLevel > existing[0].escalationLevel ? "escalated" : existing[0].status,
  }).where(eq(petitions.id, id));
}

// ---- News ----
export async function createNewsItem(item: InsertNewsItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(newsItems).values(item);
  return result[0].insertId;
}

export async function getRecentNews(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(newsItems).orderBy(desc(newsItems.createdAt)).limit(limit);
}

// ---- User Preferences ----
export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
  return result[0];
}

export async function upsertUserPreferences(prefs: InsertUserPreference) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(userPreferences).where(eq(userPreferences.userId, prefs.userId)).limit(1);
  if (existing[0]) {
    await db.update(userPreferences).set(prefs).where(eq(userPreferences.id, existing[0].id));
  } else {
    await db.insert(userPreferences).values(prefs);
  }
}

// ---- Chat Messages ----
export async function addChatMessage(msg: InsertChatMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(chatMessages).values(msg);
}

export async function getChatHistory(userId: number, avatarId: string, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatMessages)
    .where(eq(chatMessages.userId, userId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit);
}
