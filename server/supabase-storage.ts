import { createClient } from '@supabase/supabase-js';
import { type Order, type InsertOrder, type Contact, type InsertContact } from "@shared/schema";

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

export class SupabaseStorage implements IStorage {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are required. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .insert({
          order_id: insertOrder.orderId,
          full_name: insertOrder.fullName,
          address: insertOrder.address,
          mobile: insertOrder.mobile,
          class_branch: insertOrder.classBranch,
          items: insertOrder.items,
          total: insertOrder.total,
          status: insertOrder.status || 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating order:', error);
        throw error;
      }

      return {
        id: data.id,
        orderId: data.order_id,
        fullName: data.full_name,
        address: data.address,
        mobile: data.mobile,
        classBranch: data.class_branch,
        items: data.items,
        total: data.total,
        status: data.status,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getAllOrders(): Promise<Order[]> {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return [];
      }

      return data.map(order => ({
        id: order.id,
        orderId: order.order_id,
        fullName: order.full_name,
        address: order.address,
        mobile: order.mobile,
        classBranch: order.class_branch,
        items: order.items,
        total: order.total,
        status: order.status,
        createdAt: order.created_at
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order | undefined> {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .update({ status })
        .eq('order_id', orderId)
        .select()
        .single();

      if (error) {
        console.error('Error updating order status:', error);
        return undefined;
      }

      return {
        id: data.id,
        orderId: data.order_id,
        fullName: data.full_name,
        address: data.address,
        mobile: data.mobile,
        classBranch: data.class_branch,
        items: data.items,
        total: data.total,
        status: data.status,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Error updating order status:', error);
      return undefined;
    }
  }

  async deleteOrder(orderId: string): Promise<boolean> {
    try {
      // First check if order exists and is completed
      const { data: order } = await this.supabase
        .from('orders')
        .select('status')
        .eq('order_id', orderId)
        .single();

      if (!order || order.status !== 'completed') {
        return false;
      }

      const { error } = await this.supabase
        .from('orders')
        .delete()
        .eq('order_id', orderId);

      if (error) {
        console.error('Error deleting order:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      return false;
    }
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    try {
      const { data, error } = await this.supabase
        .from('contacts')
        .insert({
          name: insertContact.name,
          email: insertContact.email,
          message: insertContact.message
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating contact:', error);
        throw error;
      }

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        message: data.message,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }

  async getAllContacts(): Promise<Contact[]> {
    try {
      const { data, error } = await this.supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contacts:', error);
        return [];
      }

      return data.map(contact => ({
        id: contact.id,
        name: contact.name,
        email: contact.email,
        message: contact.message,
        createdAt: contact.created_at
      }));
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return [];
    }
  }
}

// Storage is exported from server/storage.ts with auto-selection 