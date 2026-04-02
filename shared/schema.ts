import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: text("order_id").notNull().unique(),
  fullName: text("full_name").notNull(),
  address: text("address").notNull(),
  mobile: text("mobile").notNull(),
  classBranch: text("class_branch").notNull(),
  items: text("items").notNull(), // JSON string of cart items
  total: integer("total").notNull(), // Price in rupees
  status: text("status").notNull().default("pending"), // pending or completed
  createdAt: text("created_at").notNull(),
});

export const contacts = sqliteTable("contacts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

// Cart item type
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}
