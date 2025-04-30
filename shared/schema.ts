import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
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

// Define packages table for the nekoScript package registry
export const packages = pgTable("packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  version: text("version").notNull(),
  description: text("description").notNull(),
  author: text("author").notNull(),
  category: text("category").notNull(),
  downloadCount: integer("download_count").notNull().default(0),
  stars: integer("stars").notNull().default(0),
  code: text("code").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
  metadata: jsonb("metadata").notNull().default({}),
});

export const insertPackageSchema = createInsertSchema(packages).omit({
  id: true,
  downloadCount: true,
  stars: true,
  createdAt: true,
  publishedAt: true,
});

export const packageCategories = [
  "Web",
  "Jeux",
  "Discord",
  "Utilitaires",
  "UI",
  "Base de données",
  "API",
  "Autre"
] as const;

export const packageCategorySchema = z.enum(packageCategories);

export const packageVersionSchema = z.string().regex(/^\d+\.\d+\.\d+$/, {
  message: "Version doit être au format x.y.z (ex: 1.0.0)"
});

export const extendedInsertPackageSchema = insertPackageSchema.extend({
  category: packageCategorySchema,
  version: packageVersionSchema,
});

export type InsertPackage = z.infer<typeof insertPackageSchema>;
export type Package = typeof packages.$inferSelect;
