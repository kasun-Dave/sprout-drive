import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  timestamp,
  date,
  boolean,
  decimal,
  jsonb,
  index,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// Users table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { length: 20 }).default("staff").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Suppliers table
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  contactPerson: varchar("contact_person", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

// Purchases from suppliers
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id),
  purchaseDate: date("purchase_date").notNull(),
  quantityKg: decimal("quantity_kg", { precision: 10, scale: 2 }).notNull(),
  pricePerKg: decimal("price_per_kg", { precision: 10, scale: 2 }).notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  createdAt: true,
});
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type Purchase = typeof purchases.$inferSelect;

// Planting batches - 6 day growth cycle
export const plantingBatches = pgTable("planting_batches", {
  id: serial("id").primaryKey(),
  batchCode: varchar("batch_code", { length: 50 }).notNull().unique(),
  plantedDate: date("planted_date").notNull(),
  expectedHarvestDate: date("expected_harvest_date").notNull(),
  beansUsedKg: decimal("beans_used_kg", { precision: 10, scale: 2 }).notNull(),
  expectedYieldKg: decimal("expected_yield_kg", { precision: 10, scale: 2 }).notNull(),
  actualYieldKg: decimal("actual_yield_kg", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 20 }).default("growing").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPlantingBatchSchema = createInsertSchema(plantingBatches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPlantingBatch = z.infer<typeof insertPlantingBatchSchema>;
export type PlantingBatch = typeof plantingBatches.$inferSelect;

// Customers
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  businessName: varchar("business_name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  deliveryRoute: varchar("delivery_route", { length: 100 }),
  deliveryNotes: text("delivery_notes"),
  defaultQuantityKg: decimal("default_quantity_kg", { precision: 10, scale: 2 }),
  pricePerKg: decimal("price_per_kg", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  orderDate: date("order_date").notNull(),
  deliveryDate: date("delivery_date").notNull(),
  quantityKg: decimal("quantity_kg", { precision: 10, scale: 2 }).notNull(),
  pricePerKg: decimal("price_per_kg", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  bagsDelivered: integer("bags_delivered"),
  bagsReturned: integer("bags_returned"),
  cashCollected: decimal("cash_collected", { precision: 10, scale: 2 }),
  paymentStatus: varchar("payment_status", { length: 20 }).default("pending").notNull(),
  deliveredBy: varchar("delivered_by", { length: 255 }),
  deliveryNotes: text("delivery_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Delivery Vans
export const vans = pgTable("vans", {
  id: serial("id").primaryKey(),
  registrationNumber: varchar("registration_number", { length: 20 }).notNull().unique(),
  make: varchar("make", { length: 100 }),
  model: varchar("model", { length: 100 }),
  year: integer("year"),
  insuranceExpiry: date("insurance_expiry"),
  licenseExpiry: date("license_expiry"),
  lastServiceDate: date("last_service_date"),
  nextServiceDate: date("next_service_date"),
  currentMileage: integer("current_mileage"),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  assignedDriver: varchar("assigned_driver", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertVanSchema = createInsertSchema(vans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertVan = z.infer<typeof insertVanSchema>;
export type Van = typeof vans.$inferSelect;

// Stock/Inventory
export const stockItems = pgTable("stock_items", {
  id: serial("id").primaryKey(),
  itemType: varchar("item_type", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  currentQuantity: decimal("current_quantity", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 20 }).notNull(),
  minimumLevel: decimal("minimum_level", { precision: 10, scale: 2 }),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertStockItemSchema = createInsertSchema(stockItems).omit({
  id: true,
  lastUpdated: true,
});
export type InsertStockItem = z.infer<typeof insertStockItemSchema>;
export type StockItem = typeof stockItems.$inferSelect;

// Stock transactions for history
export const stockTransactions = pgTable("stock_transactions", {
  id: serial("id").primaryKey(),
  stockItemId: integer("stock_item_id").notNull().references(() => stockItems.id),
  transactionType: varchar("transaction_type", { length: 20 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStockTransactionSchema = createInsertSchema(stockTransactions).omit({
  id: true,
  createdAt: true,
});
export type InsertStockTransaction = z.infer<typeof insertStockTransactionSchema>;
export type StockTransaction = typeof stockTransactions.$inferSelect;

// Settings table for configuration
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;

// Maintenance logs for vans
export const maintenanceLogs = pgTable("maintenance_logs", {
  id: serial("id").primaryKey(),
  vanId: integer("van_id").notNull().references(() => vans.id),
  maintenanceType: varchar("maintenance_type", { length: 50 }).notNull(),
  description: text("description"),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  serviceDate: date("service_date").notNull(),
  mileageAtService: integer("mileage_at_service"),
  nextServiceDate: date("next_service_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMaintenanceLogSchema = createInsertSchema(maintenanceLogs).omit({
  id: true,
  createdAt: true,
});
export type InsertMaintenanceLog = z.infer<typeof insertMaintenanceLogSchema>;
export type MaintenanceLog = typeof maintenanceLogs.$inferSelect;

// Relations
export const suppliersRelations = relations(suppliers, ({ many }) => ({
  purchases: many(purchases),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [purchases.supplierId],
    references: [suppliers.id],
  }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
}));

export const stockItemsRelations = relations(stockItems, ({ many }) => ({
  transactions: many(stockTransactions),
}));

export const stockTransactionsRelations = relations(stockTransactions, ({ one }) => ({
  stockItem: one(stockItems, {
    fields: [stockTransactions.stockItemId],
    references: [stockItems.id],
  }),
}));

export const vansRelations = relations(vans, ({ many }) => ({
  maintenanceLogs: many(maintenanceLogs),
}));

export const maintenanceLogsRelations = relations(maintenanceLogs, ({ one }) => ({
  van: one(vans, {
    fields: [maintenanceLogs.vanId],
    references: [vans.id],
  }),
}));
