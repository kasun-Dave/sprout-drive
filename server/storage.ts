import {
  users,
  suppliers,
  purchases,
  plantingBatches,
  customers,
  orders,
  vans,
  stockItems,
  stockTransactions,
  settings,
  maintenanceLogs,
  type User,
  type UpsertUser,
  type Supplier,
  type InsertSupplier,
  type Purchase,
  type InsertPurchase,
  type PlantingBatch,
  type InsertPlantingBatch,
  type Customer,
  type InsertCustomer,
  type Order,
  type InsertOrder,
  type Van,
  type InsertVan,
  type StockItem,
  type InsertStockItem,
  type StockTransaction,
  type InsertStockTransaction,
  type Setting,
  type InsertSetting,
  type MaintenanceLog,
  type InsertMaintenanceLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  
  // Supplier operations
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: number): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: number): Promise<boolean>;
  
  // Purchase operations
  getPurchases(): Promise<(Purchase & { supplier?: Supplier })[]>;
  getPurchase(id: number): Promise<Purchase | undefined>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  updatePurchase(id: number, purchase: Partial<InsertPurchase>): Promise<Purchase | undefined>;
  deletePurchase(id: number): Promise<boolean>;
  
  // Planting batch operations
  getPlantingBatches(): Promise<PlantingBatch[]>;
  getPlantingBatch(id: number): Promise<PlantingBatch | undefined>;
  createPlantingBatch(batch: InsertPlantingBatch): Promise<PlantingBatch>;
  updatePlantingBatch(id: number, batch: Partial<InsertPlantingBatch>): Promise<PlantingBatch | undefined>;
  deletePlantingBatch(id: number): Promise<boolean>;
  getPlantingBatchesByDateRange(startDate: string, endDate: string): Promise<PlantingBatch[]>;
  
  // Customer operations
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;
  getCustomersByRoute(route: string): Promise<Customer[]>;
  
  // Order operations
  getOrders(): Promise<(Order & { customer?: Customer })[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined>;
  deleteOrder(id: number): Promise<boolean>;
  getOrdersByDate(date: string): Promise<(Order & { customer?: Customer })[]>;
  getOrdersByCustomer(customerId: number): Promise<Order[]>;
  getOrdersByDateRange(startDate: string, endDate: string): Promise<(Order & { customer?: Customer })[]>;
  
  // Van operations
  getVans(): Promise<Van[]>;
  getVan(id: number): Promise<Van | undefined>;
  createVan(van: InsertVan): Promise<Van>;
  updateVan(id: number, van: Partial<InsertVan>): Promise<Van | undefined>;
  deleteVan(id: number): Promise<boolean>;
  
  // Stock operations
  getStockItems(): Promise<StockItem[]>;
  getStockItem(id: number): Promise<StockItem | undefined>;
  createStockItem(item: InsertStockItem): Promise<StockItem>;
  updateStockItem(id: number, item: Partial<InsertStockItem>): Promise<StockItem | undefined>;
  deleteStockItem(id: number): Promise<boolean>;
  
  // Stock transaction operations
  getStockTransactions(stockItemId?: number): Promise<StockTransaction[]>;
  createStockTransaction(transaction: InsertStockTransaction): Promise<StockTransaction>;
  
  // Settings operations
  getSettings(): Promise<Setting[]>;
  getSetting(key: string): Promise<Setting | undefined>;
  upsertSetting(setting: InsertSetting): Promise<Setting>;
  
  // Maintenance log operations
  getMaintenanceLogs(vanId?: number): Promise<MaintenanceLog[]>;
  createMaintenanceLog(log: InsertMaintenanceLog): Promise<MaintenanceLog>;
  deleteMaintenanceLog(id: number): Promise<boolean>;
  
  // Analytics operations
  getDashboardStats(): Promise<{
    todayOrders: number;
    todayRevenue: string;
    pendingDeliveries: number;
    readySprouts: string;
  }>;
  getSalesAnalytics(startDate: string, endDate: string): Promise<{
    date: string;
    revenue: string;
    orders: number;
  }[]>;
  getCustomerRankings(): Promise<{
    id: number;
    name: string;
    quantity: string;
    revenue: string;
  }[]>;
  getProductBreakdown(startDate: string, endDate: string): Promise<{
    name: string;
    value: string;
  }[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Check if this user already exists
    const existingUser = await this.getUser(userData.id!);
    if (existingUser) {
      // Update existing user, keep their role
      const [user] = await db
        .update(users)
        .set({
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userData.id!))
        .returning();
      return user;
    }
    
    // New user - check if this is the first user (make them owner)
    const userCount = await db.select({ count: sql<number>`count(*)` }).from(users);
    const isFirstUser = Number(userCount[0]?.count || 0) === 0;
    
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        role: isFirstUser ? 'owner' : 'staff',
      })
      .returning();
    return user;
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Supplier operations
  async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers).orderBy(desc(suppliers.createdAt));
  }

  async getSupplier(id: number): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier;
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [newSupplier] = await db.insert(suppliers).values(supplier).returning();
    return newSupplier;
  }

  async updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const [updated] = await db
      .update(suppliers)
      .set({ ...supplier, updatedAt: new Date() })
      .where(eq(suppliers.id, id))
      .returning();
    return updated;
  }

  async deleteSupplier(id: number): Promise<boolean> {
    const result = await db.delete(suppliers).where(eq(suppliers.id, id));
    return true;
  }

  // Purchase operations
  async getPurchases(): Promise<(Purchase & { supplier?: Supplier })[]> {
    const results = await db
      .select()
      .from(purchases)
      .leftJoin(suppliers, eq(purchases.supplierId, suppliers.id))
      .orderBy(desc(purchases.purchaseDate));
    
    return results.map(r => ({
      ...r.purchases,
      supplier: r.suppliers || undefined,
    }));
  }

  async getPurchase(id: number): Promise<Purchase | undefined> {
    const [purchase] = await db.select().from(purchases).where(eq(purchases.id, id));
    return purchase;
  }

  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const [newPurchase] = await db.insert(purchases).values(purchase).returning();
    return newPurchase;
  }

  async updatePurchase(id: number, purchase: Partial<InsertPurchase>): Promise<Purchase | undefined> {
    const [updated] = await db
      .update(purchases)
      .set(purchase)
      .where(eq(purchases.id, id))
      .returning();
    return updated;
  }

  async deletePurchase(id: number): Promise<boolean> {
    await db.delete(purchases).where(eq(purchases.id, id));
    return true;
  }

  // Planting batch operations
  async getPlantingBatches(): Promise<PlantingBatch[]> {
    return await db.select().from(plantingBatches).orderBy(desc(plantingBatches.plantedDate));
  }

  async getPlantingBatch(id: number): Promise<PlantingBatch | undefined> {
    const [batch] = await db.select().from(plantingBatches).where(eq(plantingBatches.id, id));
    return batch;
  }

  async createPlantingBatch(batch: InsertPlantingBatch): Promise<PlantingBatch> {
    const [newBatch] = await db.insert(plantingBatches).values(batch).returning();
    return newBatch;
  }

  async updatePlantingBatch(id: number, batch: Partial<InsertPlantingBatch>): Promise<PlantingBatch | undefined> {
    const [updated] = await db
      .update(plantingBatches)
      .set({ ...batch, updatedAt: new Date() })
      .where(eq(plantingBatches.id, id))
      .returning();
    return updated;
  }

  async deletePlantingBatch(id: number): Promise<boolean> {
    await db.delete(plantingBatches).where(eq(plantingBatches.id, id));
    return true;
  }

  async getPlantingBatchesByDateRange(startDate: string, endDate: string): Promise<PlantingBatch[]> {
    return await db
      .select()
      .from(plantingBatches)
      .where(
        and(
          gte(plantingBatches.expectedHarvestDate, startDate),
          lte(plantingBatches.expectedHarvestDate, endDate)
        )
      )
      .orderBy(plantingBatches.expectedHarvestDate);
  }

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(customers.name);
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [updated] = await db
      .update(customers)
      .set({ ...customer, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return updated;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    await db.delete(customers).where(eq(customers.id, id));
    return true;
  }

  async getCustomersByRoute(route: string): Promise<Customer[]> {
    return await db
      .select()
      .from(customers)
      .where(eq(customers.deliveryRoute, route))
      .orderBy(customers.name);
  }

  // Order operations
  async getOrders(): Promise<(Order & { customer?: Customer })[]> {
    const results = await db
      .select()
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .orderBy(desc(orders.orderDate));
    
    return results.map(r => ({
      ...r.orders,
      customer: r.customers || undefined,
    }));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined> {
    const [updated] = await db
      .update(orders)
      .set({ ...order, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  async deleteOrder(id: number): Promise<boolean> {
    await db.delete(orders).where(eq(orders.id, id));
    return true;
  }

  async getOrdersByDate(date: string): Promise<(Order & { customer?: Customer })[]> {
    const results = await db
      .select()
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .where(eq(orders.deliveryDate, date))
      .orderBy(customers.deliveryRoute, customers.name);
    
    return results.map(r => ({
      ...r.orders,
      customer: r.customers || undefined,
    }));
  }

  async getOrdersByCustomer(customerId: number): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, customerId))
      .orderBy(desc(orders.orderDate));
  }

  async getOrdersByDateRange(startDate: string, endDate: string): Promise<(Order & { customer?: Customer })[]> {
    const results = await db
      .select()
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .where(
        and(
          gte(orders.deliveryDate, startDate),
          lte(orders.deliveryDate, endDate)
        )
      )
      .orderBy(orders.deliveryDate);
    
    return results.map(r => ({
      ...r.orders,
      customer: r.customers || undefined,
    }));
  }

  // Van operations
  async getVans(): Promise<Van[]> {
    return await db.select().from(vans).orderBy(vans.registrationNumber);
  }

  async getVan(id: number): Promise<Van | undefined> {
    const [van] = await db.select().from(vans).where(eq(vans.id, id));
    return van;
  }

  async createVan(van: InsertVan): Promise<Van> {
    const [newVan] = await db.insert(vans).values(van).returning();
    return newVan;
  }

  async updateVan(id: number, van: Partial<InsertVan>): Promise<Van | undefined> {
    const [updated] = await db
      .update(vans)
      .set({ ...van, updatedAt: new Date() })
      .where(eq(vans.id, id))
      .returning();
    return updated;
  }

  async deleteVan(id: number): Promise<boolean> {
    await db.delete(vans).where(eq(vans.id, id));
    return true;
  }

  // Stock operations
  async getStockItems(): Promise<StockItem[]> {
    return await db.select().from(stockItems).orderBy(stockItems.itemType, stockItems.name);
  }

  async getStockItem(id: number): Promise<StockItem | undefined> {
    const [item] = await db.select().from(stockItems).where(eq(stockItems.id, id));
    return item;
  }

  async createStockItem(item: InsertStockItem): Promise<StockItem> {
    const [newItem] = await db.insert(stockItems).values(item).returning();
    return newItem;
  }

  async updateStockItem(id: number, item: Partial<InsertStockItem>): Promise<StockItem | undefined> {
    const [updated] = await db
      .update(stockItems)
      .set({ ...item, lastUpdated: new Date() })
      .where(eq(stockItems.id, id))
      .returning();
    return updated;
  }

  async deleteStockItem(id: number): Promise<boolean> {
    await db.delete(stockItems).where(eq(stockItems.id, id));
    return true;
  }

  // Stock transaction operations
  async getStockTransactions(stockItemId?: number): Promise<StockTransaction[]> {
    if (stockItemId) {
      return await db
        .select()
        .from(stockTransactions)
        .where(eq(stockTransactions.stockItemId, stockItemId))
        .orderBy(desc(stockTransactions.createdAt));
    }
    return await db.select().from(stockTransactions).orderBy(desc(stockTransactions.createdAt));
  }

  async createStockTransaction(transaction: InsertStockTransaction): Promise<StockTransaction> {
    const [newTransaction] = await db.insert(stockTransactions).values(transaction).returning();
    
    // Update stock item quantity
    const stockItem = await this.getStockItem(Number(transaction.stockItemId));
    if (stockItem) {
      const currentQty = parseFloat(stockItem.currentQuantity);
      const transactionQty = parseFloat(transaction.quantity);
      const newQty = transaction.transactionType === 'add' 
        ? currentQty + transactionQty 
        : currentQty - transactionQty;
      
      await this.updateStockItem(Number(transaction.stockItemId), {
        currentQuantity: newQty.toString(),
      });
    }
    
    return newTransaction;
  }

  // Settings operations
  async getSettings(): Promise<Setting[]> {
    return await db.select().from(settings);
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting;
  }

  async upsertSetting(setting: InsertSetting): Promise<Setting> {
    const [result] = await db
      .insert(settings)
      .values(setting)
      .onConflictDoUpdate({
        target: settings.key,
        set: {
          value: setting.value,
          description: setting.description,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  // Analytics operations
  async getDashboardStats(): Promise<{
    todayOrders: number;
    todayRevenue: string;
    pendingDeliveries: number;
    readySprouts: string;
  }> {
    const today = new Date().toISOString().split('T')[0];
    
    const todayOrdersResult = await db
      .select({ count: sql<number>`count(*)`, revenue: sql<string>`coalesce(sum(total_amount), 0)` })
      .from(orders)
      .where(eq(orders.deliveryDate, today));
    
    const pendingDeliveriesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(and(eq(orders.deliveryDate, today), eq(orders.status, 'pending')));
    
    const readySproutsResult = await db
      .select({ total: sql<string>`coalesce(sum(actual_yield_kg), 0)` })
      .from(plantingBatches)
      .where(eq(plantingBatches.status, 'ready'));
    
    return {
      todayOrders: Number(todayOrdersResult[0]?.count || 0),
      todayRevenue: todayOrdersResult[0]?.revenue || '0',
      pendingDeliveries: Number(pendingDeliveriesResult[0]?.count || 0),
      readySprouts: readySproutsResult[0]?.total || '0',
    };
  }

  async getSalesAnalytics(startDate: string, endDate: string): Promise<{
    date: string;
    revenue: string;
    orders: number;
  }[]> {
    const results = await db
      .select({
        date: orders.deliveryDate,
        revenue: sql<string>`sum(total_amount)`,
        orders: sql<number>`count(*)`,
      })
      .from(orders)
      .where(
        and(
          gte(orders.deliveryDate, startDate),
          lte(orders.deliveryDate, endDate)
        )
      )
      .groupBy(orders.deliveryDate)
      .orderBy(orders.deliveryDate);
    
    return results.map(r => ({
      date: r.date,
      revenue: r.revenue || '0',
      orders: Number(r.orders),
    }));
  }

  // Maintenance log operations
  async getMaintenanceLogs(vanId?: number): Promise<MaintenanceLog[]> {
    if (vanId) {
      return await db
        .select()
        .from(maintenanceLogs)
        .where(eq(maintenanceLogs.vanId, vanId))
        .orderBy(desc(maintenanceLogs.serviceDate));
    }
    return await db.select().from(maintenanceLogs).orderBy(desc(maintenanceLogs.serviceDate));
  }

  async createMaintenanceLog(log: InsertMaintenanceLog): Promise<MaintenanceLog> {
    const [newLog] = await db.insert(maintenanceLogs).values(log).returning();
    return newLog;
  }

  async deleteMaintenanceLog(id: number): Promise<boolean> {
    await db.delete(maintenanceLogs).where(eq(maintenanceLogs.id, id));
    return true;
  }

  async getCustomerRankings(): Promise<{
    id: number;
    name: string;
    quantity: string;
    revenue: string;
  }[]> {
    const results = await db
      .select({
        id: customers.id,
        name: customers.name,
        quantity: sql<string>`coalesce(sum(${orders.quantityKg}), 0)`,
        revenue: sql<string>`coalesce(sum(${orders.totalAmount}), 0)`,
      })
      .from(customers)
      .leftJoin(orders, eq(customers.id, orders.customerId))
      .groupBy(customers.id, customers.name)
      .orderBy(sql`sum(${orders.totalAmount}) desc nulls last`)
      .limit(10);
    
    return results.map(r => ({
      id: r.id,
      name: r.name,
      quantity: r.quantity || '0',
      revenue: r.revenue || '0',
    }));
  }

  async getProductBreakdown(startDate: string, endDate: string): Promise<{
    name: string;
    value: string;
  }[]> {
    const results = await db
      .select({
        value: sql<string>`coalesce(sum(${orders.quantityKg}), 0)`,
      })
      .from(orders)
      .where(
        and(
          gte(orders.deliveryDate, startDate),
          lte(orders.deliveryDate, endDate)
        )
      );
    
    return [
      { name: "Mung Sprouts", value: results[0]?.value || '0' },
    ];
  }
}

export const storage = new DatabaseStorage();
