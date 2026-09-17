import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const vehicles = sqliteTable("vehicles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  lengthMm: integer("length_mm").notNull(),
  widthMm: integer("width_mm").notNull(),
  heightMm: integer("height_mm").notNull(),
  maxLoadKg: real("max_load_kg").notNull(),
  axleLimitKg: real("axle_limit_kg").notNull().default(0),
  doorSide: text("door_side").notNull().default("REAR"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const pallets = sqliteTable("pallets", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  lengthMm: integer("length_mm").notNull(),
  widthMm: integer("width_mm").notNull(),
  heightMm: integer("height_mm").notNull(),
  tareWeightKg: real("tare_weight_kg").notNull(),
  maxGrossWeightKg: real("max_gross_weight_kg").notNull(),
  stackable: integer("stackable", { mode: "boolean" }).notNull().default(false),
  maxStack: integer("max_stack").notNull().default(1),
  rotatable: integer("rotatable", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  palletId: text("pallet_id").notNull().references(() => pallets.id),
  unitsPerPallet: integer("units_per_pallet").notNull(),
  unitWeightKg: real("unit_weight_kg").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
