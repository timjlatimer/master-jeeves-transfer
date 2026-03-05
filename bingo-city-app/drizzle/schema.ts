import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Bingo Cards
export const bingoCards = mysqlTable("bingo_cards", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  gridData: json("gridData"),
  swarmMode: mysqlEnum("swarmMode", ["chorus", "ensemble", "squadron"]).default("chorus").notNull(),
  animationLevel: int("animationLevel").default(50),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BingoCard = typeof bingoCards.$inferSelect;
export type InsertBingoCard = typeof bingoCards.$inferInsert;

// Petitions (Swiss governance escalation)
export const petitions = mysqlTable("petitions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  bingoCardId: int("bingoCardId"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  escalationLevel: int("escalationLevel").default(1).notNull(),
  endorsements: int("endorsements").default(0).notNull(),
  status: mysqlEnum("status", ["open", "escalated", "resolved", "overridden"]).default("open").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Petition = typeof petitions.$inferSelect;
export type InsertPetition = typeof petitions.$inferInsert;

// News Channel
export const newsItems = mysqlTable("news_items", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  category: varchar("category", { length: 64 }),
  source: varchar("source", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NewsItem = typeof newsItems.$inferSelect;
export type InsertNewsItem = typeof newsItems.$inferInsert;

// User Preferences
export const userPreferences = mysqlTable("user_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  commPreference: mysqlEnum("commPreference", ["voice", "text", "notices"]).default("text").notNull(),
  animationLevel: int("animationLevel").default(50),
  swarmMode: mysqlEnum("swarmMode", ["chorus", "ensemble", "squadron"]).default("chorus").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

// Avatar Chat Messages
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  avatarId: varchar("avatarId", { length: 64 }).notNull(),
  message: text("message").notNull(),
  isFromAvatar: int("isFromAvatar").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;
