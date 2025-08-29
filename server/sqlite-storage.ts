import Database from "better-sqlite3";
import { type Order, type InsertOrder, type Contact, type InsertContact } from "@shared/schema.js";

export interface IStorage {
  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getAllOrders(): Promise<Order[]>;
  updateOrderStatus(orderId: string, status: string): Promise<Order | undefined>;
  deleteOrder(orderId: string): Promise<boolean>;
  
  // Contacts
  createContact(contact: InsertContact): Promise<Contact>;
  getAllContacts(): Promise<Contact[]>;
}

export class SQLiteStorage implements IStorage {
  private db: Database.Database;

  constructor() {
    this.db = new Database("database.sqlite");
    this.initializeTables();
  }

  private initializeTables() {
    try {
      // Create orders table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id TEXT NOT NULL UNIQUE,
          full_name TEXT NOT NULL,
          address TEXT NOT NULL,
          mobile TEXT NOT NULL,
          class_branch TEXT NOT NULL,
          items TEXT NOT NULL,
          total INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TEXT NOT NULL
        )
      `);

      // Create contacts table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS contacts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          message TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);

      console.log("Database tables initialized successfully");
    } catch (error) {
      console.error("Error initializing tables:", error);
    }
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO orders (order_id, full_name, address, mobile, class_branch, items, total, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const orderData = {
        orderId: insertOrder.orderId,
        fullName: insertOrder.fullName,
        address: insertOrder.address,
        mobile: insertOrder.mobile,
        classBranch: insertOrder.classBranch,
        items: JSON.stringify(insertOrder.items),
        total: insertOrder.total,
        status: insertOrder.status || "pending",
        createdAt: new Date().toISOString(),
      };

      const result = stmt.run(
        orderData.orderId,
        orderData.fullName,
        orderData.address,
        orderData.mobile,
        orderData.classBranch,
        orderData.items,
        orderData.total,
        orderData.status,
        orderData.createdAt
      );

      return {
        id: result.lastInsertRowid as number,
        ...orderData,
        items: JSON.parse(orderData.items),
        total: Number(orderData.total) // Ensure total is a number
      };
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  }

  async getAllOrders(): Promise<Order[]> {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM orders ORDER BY created_at DESC
      `);
      
      const rows = stmt.all() as any[];
      
      return rows.map(row => ({
        id: row.id,
        orderId: row.order_id,
        fullName: row.full_name,
        address: row.address,
        mobile: row.mobile,
        classBranch: row.class_branch,
        items: JSON.parse(row.items),
        total: row.total,
        status: row.status,
        createdAt: row.created_at,
      }));
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order | undefined> {
    try {
      const stmt = this.db.prepare(`
        UPDATE orders SET status = ? WHERE order_id = ?
      `);
      
      const result = stmt.run(status, orderId);
      
      if (result.changes === 0) {
        return undefined;
      }

      // Return the updated order
      const getStmt = this.db.prepare(`
        SELECT * FROM orders WHERE order_id = ?
      `);
      
      const row = getStmt.get(orderId) as any;
      
      if (!row) return undefined;

      return {
        id: row.id,
        orderId: row.order_id,
        fullName: row.full_name,
        address: row.address,
        mobile: row.mobile,
        classBranch: row.class_branch,
        items: JSON.parse(row.items),
        total: row.total,
        status: row.status,
        createdAt: row.created_at,
      };
    } catch (error) {
      console.error("Error updating order status:", error);
      return undefined;
    }
  }

  async deleteOrder(orderId: string): Promise<boolean> {
    try {
      const order = await this.getOrderByOrderId(orderId);
      if (!order || order.status !== "completed") {
        return false;
      }

      const stmt = this.db.prepare(`
        DELETE FROM orders WHERE order_id = ?
      `);
      
      const result = stmt.run(orderId);
      return result.changes > 0;
    } catch (error) {
      console.error("Error deleting order:", error);
      return false;
    }
  }

  private async getOrderByOrderId(orderId: string): Promise<Order | undefined> {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM orders WHERE order_id = ?
      `);
      
      const row = stmt.get(orderId) as any;
      
      if (!row) return undefined;

      return {
        id: row.id,
        orderId: row.order_id,
        fullName: row.full_name,
        address: row.address,
        mobile: row.mobile,
        classBranch: row.class_branch,
        items: JSON.parse(row.items),
        total: row.total,
        status: row.status,
        createdAt: row.created_at,
      };
    } catch (error) {
      console.error("Error getting order by ID:", error);
      return undefined;
    }
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO contacts (name, email, message, created_at)
        VALUES (?, ?, ?, ?)
      `);

      const contactData = {
        name: insertContact.name,
        email: insertContact.email,
        message: insertContact.message,
        createdAt: new Date().toISOString(),
      };

      const result = stmt.run(
        contactData.name,
        contactData.email,
        contactData.message,
        contactData.createdAt
      );

      return {
        id: result.lastInsertRowid as number,
        ...contactData,
      };
    } catch (error) {
      console.error("Error creating contact:", error);
      throw error;
    }
  }

  async getAllContacts(): Promise<Contact[]> {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM contacts ORDER BY created_at DESC
      `);
      
      const rows = stmt.all() as any[];
      
      return rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        message: row.message,
        createdAt: row.created_at,
      }));
    } catch (error) {
      console.error("Error fetching contacts:", error);
      return [];
    }
  }
}

export const storage = new SQLiteStorage(); 