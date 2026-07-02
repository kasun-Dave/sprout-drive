import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, getStorageInfo, forceFirebaseSync } from "./storageFactory";
import { setupAuth, isAuthenticated } from "./auth";
import {
  insertSupplierSchema,
  insertPurchaseSchema,
  insertPlantingBatchSchema,
  insertCustomerSchema,
  insertOrderSchema,
  insertVanSchema,
  insertStockItemSchema,
  insertStockTransactionSchema,
  insertSettingSchema,
  insertMaintenanceLogSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user role (owner only)
  app.get('/api/users', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const currentUser = await storage.getUser(currentUserId);
      if (!currentUser || currentUser.role !== 'owner') {
        return res.status(403).json({ message: "Only owners can list users" });
      }

      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch('/api/users/:id/role', isAuthenticated, async (req: any, res) => {
    try {
      // Check if current user is an owner
      const currentUserId = req.user.claims.sub;
      const currentUser = await storage.getUser(currentUserId);
      if (!currentUser || currentUser.role !== 'owner') {
        return res.status(403).json({ message: "Only owners can change user roles" });
      }
      
      const { id } = req.params;
      const { role } = req.body;
      
      // Validate role
      if (!['owner', 'staff'].includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be 'owner' or 'staff'" });
      }
      
      const user = await storage.updateUserRole(id, role);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Supplier routes
  app.get('/api/suppliers', isAuthenticated, async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.get('/api/suppliers/:id', isAuthenticated, async (req, res) => {
    try {
      const supplier = await storage.getSupplier(parseInt(req.params.id));
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      console.error("Error fetching supplier:", error);
      res.status(500).json({ message: "Failed to fetch supplier" });
    }
  });

  app.post('/api/suppliers', isAuthenticated, async (req, res) => {
    try {
      const validated = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(validated);
      res.status(201).json(supplier);
    } catch (error) {
      console.error("Error creating supplier:", error);
      res.status(400).json({ message: "Failed to create supplier" });
    }
  });

  app.patch('/api/suppliers/:id', isAuthenticated, async (req, res) => {
    try {
      const supplier = await storage.updateSupplier(parseInt(req.params.id), req.body);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      console.error("Error updating supplier:", error);
      res.status(500).json({ message: "Failed to update supplier" });
    }
  });

  app.delete('/api/suppliers/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteSupplier(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting supplier:", error);
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });

  // Purchase routes
  app.get('/api/purchases', isAuthenticated, async (req, res) => {
    try {
      const purchases = await storage.getPurchases();
      res.json(purchases);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });

  app.post('/api/purchases', isAuthenticated, async (req, res) => {
    try {
      const validated = insertPurchaseSchema.parse(req.body);
      const purchase = await storage.createPurchase(validated);
      res.status(201).json(purchase);
    } catch (error) {
      console.error("Error creating purchase:", error);
      res.status(400).json({ message: "Failed to create purchase" });
    }
  });

  app.patch('/api/purchases/:id', isAuthenticated, async (req, res) => {
    try {
      const purchase = await storage.updatePurchase(parseInt(req.params.id), req.body);
      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }
      res.json(purchase);
    } catch (error) {
      console.error("Error updating purchase:", error);
      res.status(500).json({ message: "Failed to update purchase" });
    }
  });

  app.delete('/api/purchases/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deletePurchase(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting purchase:", error);
      res.status(500).json({ message: "Failed to delete purchase" });
    }
  });

  // Planting batch routes
  app.get('/api/planting-batches', isAuthenticated, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (startDate && endDate) {
        const batches = await storage.getPlantingBatchesByDateRange(
          startDate as string,
          endDate as string
        );
        return res.json(batches);
      }
      const batches = await storage.getPlantingBatches();
      res.json(batches);
    } catch (error) {
      console.error("Error fetching planting batches:", error);
      res.status(500).json({ message: "Failed to fetch planting batches" });
    }
  });

  app.get('/api/planting-batches/:id', isAuthenticated, async (req, res) => {
    try {
      const batch = await storage.getPlantingBatch(parseInt(req.params.id));
      if (!batch) {
        return res.status(404).json({ message: "Planting batch not found" });
      }
      res.json(batch);
    } catch (error) {
      console.error("Error fetching planting batch:", error);
      res.status(500).json({ message: "Failed to fetch planting batch" });
    }
  });

  app.post('/api/planting-batches', isAuthenticated, async (req, res) => {
    try {
      const validated = insertPlantingBatchSchema.parse(req.body);
      const batch = await storage.createPlantingBatch(validated);
      res.status(201).json(batch);
    } catch (error) {
      console.error("Error creating planting batch:", error);
      res.status(400).json({ message: "Failed to create planting batch" });
    }
  });

  app.patch('/api/planting-batches/:id', isAuthenticated, async (req, res) => {
    try {
      const batch = await storage.updatePlantingBatch(parseInt(req.params.id), req.body);
      if (!batch) {
        return res.status(404).json({ message: "Planting batch not found" });
      }
      res.json(batch);
    } catch (error) {
      console.error("Error updating planting batch:", error);
      res.status(500).json({ message: "Failed to update planting batch" });
    }
  });

  app.delete('/api/planting-batches/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deletePlantingBatch(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting planting batch:", error);
      res.status(500).json({ message: "Failed to delete planting batch" });
    }
  });

  // Customer routes
  app.get('/api/customers', isAuthenticated, async (req, res) => {
    try {
      const { route } = req.query;
      if (route) {
        const customers = await storage.getCustomersByRoute(route as string);
        return res.json(customers);
      }
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get('/api/customers/:id', isAuthenticated, async (req, res) => {
    try {
      const customer = await storage.getCustomer(parseInt(req.params.id));
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post('/api/customers', isAuthenticated, async (req, res) => {
    try {
      const validated = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validated);
      res.status(201).json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(400).json({ message: "Failed to create customer" });
    }
  });

  app.patch('/api/customers/:id', isAuthenticated, async (req, res) => {
    try {
      const customer = await storage.updateCustomer(parseInt(req.params.id), req.body);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  app.delete('/api/customers/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteCustomer(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Order routes
  app.get('/api/orders', isAuthenticated, async (req, res) => {
    try {
      const { date, startDate, endDate, customerId } = req.query;
      if (date) {
        const orders = await storage.getOrdersByDate(date as string);
        return res.json(orders);
      }
      if (startDate && endDate) {
        const orders = await storage.getOrdersByDateRange(startDate as string, endDate as string);
        return res.json(orders);
      }
      if (customerId) {
        const orders = await storage.getOrdersByCustomer(parseInt(customerId as string));
        return res.json(orders);
      }
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post('/api/orders', isAuthenticated, async (req, res) => {
    try {
      const validated = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validated);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(400).json({ message: "Failed to create order" });
    }
  });

  app.patch('/api/orders/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      const order = await storage.updateOrder(id, req.body);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  app.delete('/api/orders/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      await storage.deleteOrder(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ message: "Failed to delete order" });
    }
  });

  // Van routes
  app.get('/api/vans', isAuthenticated, async (req, res) => {
    try {
      const vans = await storage.getVans();
      res.json(vans);
    } catch (error) {
      console.error("Error fetching vans:", error);
      res.status(500).json({ message: "Failed to fetch vans" });
    }
  });

  app.get('/api/vans/:id', isAuthenticated, async (req, res) => {
    try {
      const van = await storage.getVan(parseInt(req.params.id));
      if (!van) {
        return res.status(404).json({ message: "Van not found" });
      }
      res.json(van);
    } catch (error) {
      console.error("Error fetching van:", error);
      res.status(500).json({ message: "Failed to fetch van" });
    }
  });

  app.post('/api/vans', isAuthenticated, async (req, res) => {
    try {
      const validated = insertVanSchema.parse(req.body);
      const van = await storage.createVan(validated);
      res.status(201).json(van);
    } catch (error) {
      console.error("Error creating van:", error);
      res.status(400).json({ message: "Failed to create van" });
    }
  });

  app.patch('/api/vans/:id', isAuthenticated, async (req, res) => {
    try {
      const van = await storage.updateVan(parseInt(req.params.id), req.body);
      if (!van) {
        return res.status(404).json({ message: "Van not found" });
      }
      res.json(van);
    } catch (error) {
      console.error("Error updating van:", error);
      res.status(500).json({ message: "Failed to update van" });
    }
  });

  app.delete('/api/vans/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteVan(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting van:", error);
      res.status(500).json({ message: "Failed to delete van" });
    }
  });

  // Stock routes
  app.get('/api/stock', isAuthenticated, async (req, res) => {
    try {
      const items = await storage.getStockItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching stock items:", error);
      res.status(500).json({ message: "Failed to fetch stock items" });
    }
  });

  app.get('/api/stock/:id', isAuthenticated, async (req, res) => {
    try {
      const item = await storage.getStockItem(parseInt(req.params.id));
      if (!item) {
        return res.status(404).json({ message: "Stock item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching stock item:", error);
      res.status(500).json({ message: "Failed to fetch stock item" });
    }
  });

  app.post('/api/stock', isAuthenticated, async (req, res) => {
    try {
      const validated = insertStockItemSchema.parse(req.body);
      const item = await storage.createStockItem(validated);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating stock item:", error);
      res.status(400).json({ message: "Failed to create stock item" });
    }
  });

  app.patch('/api/stock/:id', isAuthenticated, async (req, res) => {
    try {
      const item = await storage.updateStockItem(parseInt(req.params.id), req.body);
      if (!item) {
        return res.status(404).json({ message: "Stock item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating stock item:", error);
      res.status(500).json({ message: "Failed to update stock item" });
    }
  });

  app.delete('/api/stock/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteStockItem(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting stock item:", error);
      res.status(500).json({ message: "Failed to delete stock item" });
    }
  });

  // Stock transactions
  app.get('/api/stock-transactions', isAuthenticated, async (req, res) => {
    try {
      const { stockItemId } = req.query;
      const transactions = await storage.getStockTransactions(
        stockItemId ? parseInt(stockItemId as string) : undefined
      );
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching stock transactions:", error);
      res.status(500).json({ message: "Failed to fetch stock transactions" });
    }
  });

  app.post('/api/stock-transactions', isAuthenticated, async (req, res) => {
    try {
      const validated = insertStockTransactionSchema.parse(req.body);
      const transaction = await storage.createStockTransaction(validated);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating stock transaction:", error);
      res.status(400).json({ message: "Failed to create stock transaction" });
    }
  });

  // Settings routes
  app.get('/api/settings', isAuthenticated, async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.get('/api/settings/:key', isAuthenticated, async (req, res) => {
    try {
      const setting = await storage.getSetting(req.params.key);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      console.error("Error fetching setting:", error);
      res.status(500).json({ message: "Failed to fetch setting" });
    }
  });

  app.post('/api/settings', isAuthenticated, async (req, res) => {
    try {
      const validated = insertSettingSchema.parse(req.body);
      const setting = await storage.upsertSetting(validated);
      res.json(setting);
    } catch (error) {
      console.error("Error saving setting:", error);
      res.status(400).json({ message: "Failed to save setting" });
    }
  });

  app.put('/api/settings/:key', isAuthenticated, async (req, res) => {
    try {
      const { value, description } = req.body;
      if (value === undefined) {
        return res.status(400).json({ message: "Value is required" });
      }
      const setting = await storage.upsertSetting({
        key: req.params.key,
        value: String(value),
        description: description ?? `${req.params.key} setting`,
      });
      res.json(setting);
    } catch (error) {
      console.error("Error updating setting:", error);
      res.status(400).json({ message: "Failed to update setting" });
    }
  });

  app.get('/api/business-config', isAuthenticated, async (_req, res) => {
    try {
      const settings = await storage.getSettings();
      const { parseBusinessConfig } = await import("@shared/businessConfig");
      res.json(parseBusinessConfig(settings));
    } catch (error) {
      console.error("Error fetching business config:", error);
      res.status(500).json({ message: "Failed to fetch business config" });
    }
  });

  // Dashboard/Analytics routes
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get('/api/analytics/sales', isAuthenticated, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      const analytics = await storage.getSalesAnalytics(startDate as string, endDate as string);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching sales analytics:", error);
      res.status(500).json({ message: "Failed to fetch sales analytics" });
    }
  });

  app.get('/api/analytics/customer-rankings', isAuthenticated, async (req, res) => {
    try {
      const rankings = await storage.getCustomerRankings();
      res.json(rankings);
    } catch (error) {
      console.error("Error fetching customer rankings:", error);
      res.status(500).json({ message: "Failed to fetch customer rankings" });
    }
  });

  app.get('/api/analytics/product-breakdown', isAuthenticated, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      const breakdown = await storage.getProductBreakdown(startDate as string, endDate as string);
      res.json(breakdown);
    } catch (error) {
      console.error("Error fetching product breakdown:", error);
      res.status(500).json({ message: "Failed to fetch product breakdown" });
    }
  });

  // Maintenance log routes
  app.get('/api/maintenance-logs', isAuthenticated, async (req, res) => {
    try {
      const { vanId } = req.query;
      const logs = await storage.getMaintenanceLogs(
        vanId ? parseInt(vanId as string) : undefined
      );
      res.json(logs);
    } catch (error) {
      console.error("Error fetching maintenance logs:", error);
      res.status(500).json({ message: "Failed to fetch maintenance logs" });
    }
  });

  app.post('/api/maintenance-logs', isAuthenticated, async (req, res) => {
    try {
      const validated = insertMaintenanceLogSchema.parse(req.body);
      const log = await storage.createMaintenanceLog(validated);
      res.status(201).json(log);
    } catch (error) {
      console.error("Error creating maintenance log:", error);
      res.status(400).json({ message: "Failed to create maintenance log" });
    }
  });

  app.delete('/api/maintenance-logs/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteMaintenanceLog(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting maintenance log:", error);
      res.status(500).json({ message: "Failed to delete maintenance log" });
    }
  });

  app.get("/api/system/storage", isAuthenticated, async (_req, res) => {
    res.json(getStorageInfo());
  });

  // Public health check for Render / load balancers (no auth)
  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      service: "sproutdrive",
      env: process.env.NODE_ENV ?? "development",
    });
  });

  app.post("/api/system/storage/sync", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user || user.role !== "owner") {
        return res.status(403).json({ message: "Only owners can trigger cloud sync" });
      }
      const result = await forceFirebaseSync();
      if (!result.ok) {
        return res.status(500).json({ message: result.error ?? "Sync failed" });
      }
      res.json({ success: true, ...getStorageInfo() });
    } catch (error) {
      console.error("Error syncing to Firebase:", error);
      res.status(500).json({ message: "Failed to sync to Firebase" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
