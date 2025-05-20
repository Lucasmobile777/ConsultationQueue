import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Game related schemas
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  status: text("status").notNull().default("waiting"), // waiting, active, completed
  currentTurn: integer("current_turn").notNull().default(0),
  currentPlayer: integer("current_player").notNull().default(0),
  pilhaCartas: jsonb("pilha_cartas").notNull(),
  casasEspeciais: jsonb("casas_especiais").notNull(),
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
});

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  name: text("name").notNull(),
  position: integer("position").notNull().default(0),
  perdeuTurno: boolean("perdeu_turno").notNull().default(false),
  color: text("color").notNull(),
  order: integer("order").notNull(),
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
});

export type InsertPlayer = z.infer<typeof insertPlayerSchema> & {
  position?: number;
  perdeuTurno?: boolean;
};
export type Player = typeof players.$inferSelect;

export const gameEvents = pgTable("game_events", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // dice, move, card, special
  timestamp: integer("timestamp").notNull(),
});

export const insertGameEventSchema = createInsertSchema(gameEvents).omit({
  id: true,
});

export type InsertGameEvent = z.infer<typeof insertGameEventSchema>;
export type GameEvent = typeof gameEvents.$inferSelect;

// Game Types for frontend
export type GameState = {
  id: number;
  status: 'waiting' | 'active' | 'completed';
  currentTurn: number;
  currentPlayer: number;
  players: PlayerState[];
  events: GameEventState[];
  tabuleiro: string[];
  pilhaCartas: string[];
  casasEspeciais: Record<number, string>;
  currentCard: string | null;
};

export type PlayerState = {
  id: number;
  name: string;
  position: number;
  perdeuTurno: boolean;
  color: string;
  order: number;
};

export type GameEventState = {
  id: number;
  message: string;
  type: 'dice' | 'move' | 'card' | 'special';
  timestamp: number;
};

// Common constants
export const PLAYER_COLORS = ['#2196F3', '#E91E63', '#9C27B0', '#00BCD4'];
export const CASAS_ESPECIAIS = {
  5: "avance_2",
  10: "volte_3",
  15: "perde_turno",
  20: "troque",
  25: "puxe_carta"
};
export const SPECIAL_CARDS = [
  "Avance 3 casas", 
  "Jogue novamente", 
  "Volte 2 casas", 
  "Troque de lugar com o líder"
];
