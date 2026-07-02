import {
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
import type { IStorage } from "./storage";
import { computeGrowthPercent, type DashboardStats, DEFAULT_BUSINESS_CONFIG } from "@shared/businessConfig";

// In-memory storage for local development without a database
export class MemoryStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private suppliers: Map<number, Supplier> = new Map();
  private purchases: Map<number, Purchase> = new Map();
  private plantingBatches: Map<number, PlantingBatch> = new Map();
  private customers: Map<number, Customer> = new Map();
  private orders: Map<number, Order> = new Map();
  private vans: Map<number, Van> = new Map();
  private stockItems: Map<number, StockItem> = new Map();
  private stockTransactions: Map<number, StockTransaction> = new Map();
  private settings: Map<string, Setting> = new Map();
  private maintenanceLogs: Map<number, MaintenanceLog> = new Map();
  
  private nextIds = {
    supplier: 1,
    purchase: 1,
    plantingBatch: 1,
    customer: 1,
    order: 1,
    van: 1,
    stockItem: 1,
    stockTransaction: 1,
    setting: 1,
    maintenanceLog: 1,
  };

  constructor(options?: { seed?: boolean }) {
    if (options?.seed !== false) {
      this.seedData();
    }
  }

  protected seedData() {
    const today = new Date();
    
    // ========== SUPPLIERS (20) ==========
    const supplierData = [
      { name: "Green Farms Co.", contact: "John Smith", city: "Springfield" },
      { name: "Organic Seeds Ltd.", contact: "Sarah Johnson", city: "Riverside" },
      { name: "Bean Masters Inc.", contact: "Mike Chen", city: "Oakville" },
      { name: "Fresh Harvest Supplies", contact: "Emily Brown", city: "Greenfield" },
      { name: "Nature's Best Seeds", contact: "David Wilson", city: "Farmington" },
      { name: "Premium Sprout Co.", contact: "Lisa Anderson", city: "Harvest Hills" },
      { name: "Golden Grain Trading", contact: "Robert Taylor", city: "Sunnyvale" },
      { name: "Valley Bean Suppliers", contact: "Jennifer Martinez", city: "Pleasant Valley" },
      { name: "EcoGrow Enterprises", contact: "William Lee", city: "Greenwood" },
      { name: "Sunrise Agricultural", contact: "Amanda White", city: "Eastdale" },
      { name: "Pure Organic Farms", contact: "Christopher Davis", city: "Westbrook" },
      { name: "AgriPro Solutions", contact: "Michelle Garcia", city: "Northfield" },
      { name: "Harvest Moon Seeds", contact: "Daniel Robinson", city: "Southgate" },
      { name: "Terra Verde Trading", contact: "Jessica Thompson", city: "Clearwater" },
      { name: "Farmers First Co.", contact: "Matthew Clark", city: "Hillside" },
      { name: "GreenLeaf Distributors", contact: "Ashley Lewis", city: "Meadowbrook" },
      { name: "Natural Choice Seeds", contact: "Joshua Walker", city: "Lakewood" },
      { name: "Quality Bean Imports", contact: "Stephanie Hall", city: "Pinecrest" },
      { name: "Sprout Source Inc.", contact: "Andrew Young", city: "Maplewood" },
      { name: "Organic Origins Ltd.", contact: "Nicole King", city: "Cedarville" },
    ];
    
    supplierData.forEach((s, idx) => {
      const supplier: Supplier = {
        id: this.nextIds.supplier++,
        name: s.name,
        contactPerson: s.contact,
        phone: `+1-555-${String(1000 + idx).padStart(4, '0')}`,
        email: `${s.contact.toLowerCase().replace(' ', '.')}@${s.name.toLowerCase().replace(/[^a-z]/g, '')}.com`,
        address: `${100 + idx * 10} Industrial Way, ${s.city}`,
        isActive: idx < 18, // 2 inactive suppliers
        createdAt: new Date(today.getTime() - (365 - idx) * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      };
      this.suppliers.set(supplier.id, supplier);
    });

    // ========== PURCHASES (50) ==========
    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 180);
      const purchaseDate = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const quantity = (Math.floor(Math.random() * 20) + 5) * 50; // 250-1000 kg
      const pricePerKg = (Math.random() * 0.5 + 1.2).toFixed(2); // $1.20-1.70
      
      const purchase: Purchase = {
        id: this.nextIds.purchase++,
        supplierId: Math.floor(Math.random() * 18) + 1, // Active suppliers only
        purchaseDate: purchaseDate.toISOString().split('T')[0],
        quantityKg: quantity.toFixed(2),
        pricePerKg: pricePerKg,
        totalCost: (quantity * parseFloat(pricePerKg)).toFixed(2),
        notes: i % 5 === 0 ? "Premium quality beans" : null,
        createdAt: purchaseDate,
      };
      this.purchases.set(purchase.id, purchase);
    }

    // ========== CUSTOMERS (100) ==========
    const businessTypes = ["Restaurant", "Grocery", "Market", "Cafe", "Hotel", "Catering", "Deli", "Supermarket", "Food Court", "Canteen"];
    const firstNames = ["Golden", "Fresh", "Green", "Sunrise", "Happy", "Lucky", "Royal", "Premium", "Star", "Best", "Top", "Prime", "Elite", "Grand", "Super", "Mega", "Ultra", "Express", "Quick", "Fast"];
    const lastNames = ["Kitchen", "Foods", "Mart", "Store", "Place", "Corner", "Hub", "Point", "Center", "Depot", "World", "Palace", "House", "Garden", "Valley", "Hill", "Bay", "Park", "View", "Town"];
    const routes = ["Route A", "Route B", "Route C", "Route D", "Route E", "Route F"];
    const streets = ["Main St", "Oak Ave", "Market Blvd", "Commerce Dr", "Business Park", "Industrial Rd", "Central Ave", "First St", "Second Ave", "Third Blvd"];
    const cities = ["Downtown", "Midtown", "Uptown", "Eastside", "Westside", "Northgate", "Southport", "Central", "Old Town", "New District"];
    
    for (let i = 0; i < 100; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const businessType = businessTypes[Math.floor(Math.random() * businessTypes.length)];
      const name = `${firstName} ${lastName}`;
      const street = streets[Math.floor(Math.random() * streets.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const defaultQty = (Math.floor(Math.random() * 10) + 1) * 10; // 10-100 kg
      const price = (Math.random() * 1.5 + 3.0).toFixed(2); // $3.00-4.50
      
      const customer: Customer = {
        id: this.nextIds.customer++,
        name: name,
        businessName: `${name} ${businessType}`,
        phone: `+1-555-${String(2000 + i).padStart(4, '0')}`,
        email: `orders@${name.toLowerCase().replace(' ', '')}.com`,
        address: `${100 + i * 5} ${street}, ${city}`,
        deliveryRoute: routes[i % routes.length],
        deliveryNotes: i % 4 === 0 ? "Call before delivery" : i % 7 === 0 ? "Back entrance only" : i % 11 === 0 ? "Morning delivery preferred" : null,
        defaultQuantityKg: defaultQty.toFixed(2),
        pricePerKg: price,
        isActive: i < 95, // 5 inactive customers
        createdAt: new Date(today.getTime() - (365 - i * 3) * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      };
      this.customers.set(customer.id, customer);
    }

    // ========== VANS (8) ==========
    const vanData = [
      { reg: "ABC-1234", make: "Ford", model: "Transit", year: 2022, driver: "Mike Johnson", mileage: 45000 },
      { reg: "DEF-5678", make: "Mercedes", model: "Sprinter", year: 2021, driver: "Tom Williams", mileage: 62000 },
      { reg: "GHI-9012", make: "Volkswagen", model: "Crafter", year: 2023, driver: "James Brown", mileage: 28000 },
      { reg: "JKL-3456", make: "Ford", model: "Transit Custom", year: 2020, driver: "Chris Davis", mileage: 78000 },
      { reg: "MNO-7890", make: "Renault", model: "Master", year: 2022, driver: "Alex Miller", mileage: 41000 },
      { reg: "PQR-1234", make: "Fiat", model: "Ducato", year: 2021, driver: "Sam Wilson", mileage: 55000 },
      { reg: "STU-5678", make: "Peugeot", model: "Boxer", year: 2023, driver: "Dan Taylor", mileage: 19000 },
      { reg: "VWX-9012", make: "Citroen", model: "Relay", year: 2020, driver: null, mileage: 89000 },
    ];
    
    vanData.forEach((v, idx) => {
      const van: Van = {
        id: this.nextIds.van++,
        registrationNumber: v.reg,
        make: v.make,
        model: v.model,
        year: v.year,
        insuranceExpiry: new Date(today.getTime() + (180 + idx * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        licenseExpiry: new Date(today.getTime() + (365 + idx * 45) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        lastServiceDate: new Date(today.getTime() - (30 + idx * 15) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        nextServiceDate: new Date(today.getTime() + (60 + idx * 15) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currentMileage: v.mileage,
        status: idx < 7 ? "active" : "maintenance",
        assignedDriver: v.driver,
        notes: idx === 7 ? "Engine service required" : null,
        createdAt: new Date(today.getTime() - 500 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      };
      this.vans.set(van.id, van);
    });

    // ========== STOCK ITEMS (15) ==========
    const stockData = [
      { type: "raw_material", name: "Mung Beans (Grade A)", qty: 2500, unit: "kg", min: 500 },
      { type: "raw_material", name: "Mung Beans (Grade B)", qty: 1200, unit: "kg", min: 300 },
      { type: "raw_material", name: "Soybean Seeds", qty: 800, unit: "kg", min: 200 },
      { type: "raw_material", name: "Alfalfa Seeds", qty: 400, unit: "kg", min: 100 },
      { type: "packaging", name: "5kg Bags", qty: 1500, unit: "pcs", min: 300 },
      { type: "packaging", name: "10kg Bags", qty: 800, unit: "pcs", min: 200 },
      { type: "packaging", name: "20kg Sacks", qty: 400, unit: "pcs", min: 100 },
      { type: "packaging", name: "Plastic Crates", qty: 250, unit: "pcs", min: 50 },
      { type: "equipment", name: "Growing Trays (Large)", qty: 500, unit: "pcs", min: 100 },
      { type: "equipment", name: "Growing Trays (Medium)", qty: 300, unit: "pcs", min: 80 },
      { type: "equipment", name: "Watering Cans", qty: 25, unit: "pcs", min: 10 },
      { type: "consumable", name: "Nutrient Solution A", qty: 150, unit: "liters", min: 30 },
      { type: "consumable", name: "Nutrient Solution B", qty: 120, unit: "liters", min: 25 },
      { type: "consumable", name: "pH Adjuster", qty: 50, unit: "liters", min: 10 },
      { type: "consumable", name: "Cleaning Solution", qty: 80, unit: "liters", min: 20 },
    ];
    
    stockData.forEach((s) => {
      const stockItem: StockItem = {
        id: this.nextIds.stockItem++,
        itemType: s.type,
        name: s.name,
        currentQuantity: s.qty.toFixed(2),
        unit: s.unit,
        minimumLevel: s.min.toFixed(2),
        lastUpdated: new Date(),
      };
      this.stockItems.set(stockItem.id, stockItem);
    });

    // ========== PLANTING BATCHES (30) ==========
    const statuses = ["growing", "ready", "harvested", "harvested", "harvested"];
    for (let i = 0; i < 30; i++) {
      const daysAgo = i * 2;
      const plantedDate = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const harvestDate = new Date(plantedDate.getTime() + 6 * 24 * 60 * 60 * 1000);
      const beansUsed = (Math.floor(Math.random() * 10) + 5) * 20; // 100-280 kg
      const expectedYield = beansUsed * DEFAULT_BUSINESS_CONFIG.beansToSproutsRatio;
      const status = daysAgo < 6 ? "growing" : daysAgo < 8 ? "ready" : "harvested";
      const actualYield = status === "harvested" ? (expectedYield * (0.9 + Math.random() * 0.15)).toFixed(2) : null;
      
      const batch: PlantingBatch = {
        id: this.nextIds.plantingBatch++,
        batchCode: `BATCH-${plantedDate.toISOString().split('T')[0].replace(/-/g, '')}-${String(i + 1).padStart(3, '0')}`,
        plantedDate: plantedDate.toISOString().split('T')[0],
        expectedHarvestDate: harvestDate.toISOString().split('T')[0],
        beansUsedKg: beansUsed.toFixed(2),
        expectedYieldKg: expectedYield.toFixed(2),
        actualYieldKg: actualYield,
        status: status,
        notes: i % 5 === 0 ? "Premium batch for special orders" : null,
        createdAt: plantedDate,
        updatedAt: new Date(),
      };
      this.plantingBatches.set(batch.id, batch);
    }

    // ========== ORDERS (200 - last 60 days) ==========
    const orderStatuses = ["pending", "confirmed", "delivered", "delivered", "delivered"];
    const paymentStatuses = ["pending", "paid", "paid", "paid"];
    const drivers = ["Mike Johnson", "Tom Williams", "James Brown", "Chris Davis", "Alex Miller", "Sam Wilson"];
    
    for (let i = 0; i < 200; i++) {
      const daysAgo = Math.floor(Math.random() * 60);
      const orderDate = new Date(today.getTime() - (daysAgo + 1) * 24 * 60 * 60 * 1000);
      const deliveryDate = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const customerId = Math.floor(Math.random() * 95) + 1; // Active customers only
      const customer = this.customers.get(customerId);
      const quantity = customer ? parseFloat(customer.defaultQuantityKg || "20") + (Math.random() * 20 - 10) : 20 + Math.random() * 30;
      const pricePerKg = customer ? parseFloat(customer.pricePerKg || "3.50") : 3.50;
      const total = quantity * pricePerKg;
      const status = daysAgo === 0 ? (Math.random() > 0.5 ? "pending" : "confirmed") : "delivered";
      const paymentStatus = status === "delivered" ? (Math.random() > 0.2 ? "paid" : "pending") : "pending";
      
      const order: Order = {
        id: this.nextIds.order++,
        customerId: customerId,
        orderDate: orderDate.toISOString().split('T')[0],
        deliveryDate: deliveryDate.toISOString().split('T')[0],
        quantityKg: quantity.toFixed(2),
        pricePerKg: pricePerKg.toFixed(2),
        totalAmount: total.toFixed(2),
        status: status,
        bagsDelivered: status === "delivered" ? Math.ceil(quantity / 5) : null,
        bagsReturned: status === "delivered" && Math.random() > 0.7 ? Math.floor(Math.random() * 3) : null,
        cashCollected: paymentStatus === "paid" ? total.toFixed(2) : null,
        paymentStatus: paymentStatus,
        deliveredBy: status === "delivered" ? drivers[Math.floor(Math.random() * drivers.length)] : null,
        deliveryNotes: i % 10 === 0 ? "Customer requested early delivery" : null,
        createdAt: orderDate,
        updatedAt: deliveryDate,
      };
      this.orders.set(order.id, order);
    }

    // ========== MAINTENANCE LOGS (25) ==========
    const maintenanceTypes = ["Oil Change", "Tire Rotation", "Brake Inspection", "Engine Service", "AC Repair", "Battery Replacement", "General Inspection"];
    
    for (let i = 0; i < 25; i++) {
      const daysAgo = Math.floor(Math.random() * 180);
      const serviceDate = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const vanId = Math.floor(Math.random() * 8) + 1;
      const van = this.vans.get(vanId);
      const maintenanceType = maintenanceTypes[Math.floor(Math.random() * maintenanceTypes.length)];
      const cost = (Math.floor(Math.random() * 50) + 5) * 10; // $50-$550
      const vanMileage = van?.currentMileage ?? 40000;
      
      const log: MaintenanceLog = {
        id: this.nextIds.maintenanceLog++,
        vanId: vanId,
        maintenanceType: maintenanceType,
        description: `${maintenanceType} performed on ${van?.make ?? 'Unknown'} ${van?.model ?? ''}`,
        cost: cost.toFixed(2),
        serviceDate: serviceDate.toISOString().split('T')[0],
        mileageAtService: vanMileage - Math.floor(Math.random() * 5000),
        nextServiceDate: new Date(serviceDate.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: serviceDate,
      };
      this.maintenanceLogs.set(log.id, log);
    }

    // ========== SETTINGS ==========
    const settingsData = [
      { key: "beansToSproutsRatio", value: "7", desc: "Kg sprouts produced per 1 kg beans" },
      { key: "sproutGrowthDays", value: "6", desc: "Standard sprout growth cycle in days" },
      { key: "defaultPricePerKg", value: "3.50", desc: "Default price per kg for new customers" },
      { key: "currency", value: "USD", desc: "ISO currency code" },
      { key: "currencySymbol", value: "$", desc: "Currency symbol for display" },
      { key: "taxRate", value: "0", desc: "Tax rate percentage applied to orders" },
      { key: "companyName", value: "SproutDrive Cloud", desc: "Business name" },
      { key: "companyPhone", value: "(555) 123-4567", desc: "Company phone" },
      { key: "companyAddress", value: "123 Farm Road, Green Valley, CA 94000", desc: "Company address" },
      { key: "serviceIntervalMonths", value: "6", desc: "Vehicle service interval" },
      { key: "expiryWarningDays", value: "30", desc: "Days before expiry alerts" },
      { key: "enableNotifications", value: "true", desc: "Enable notifications" },
    ];
    
    settingsData.forEach((s) => {
      const setting: Setting = {
        id: this.nextIds.setting++,
        key: s.key,
        value: s.value,
        description: s.desc,
        updatedAt: new Date(),
      };
      this.settings.set(s.key, setting);
    });

    console.log(`📦 Seeded test data: ${this.suppliers.size} suppliers, ${this.customers.size} customers, ${this.orders.size} orders, ${this.vans.size} vans, ${this.plantingBatches.size} batches`);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values()).sort(
      (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
    );
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    if (existingUser) {
      const updatedUser: User = {
        ...existingUser,
        email: userData.email ?? existingUser.email,
        firstName: userData.firstName ?? existingUser.firstName,
        lastName: userData.lastName ?? existingUser.lastName,
        profileImageUrl: userData.profileImageUrl ?? existingUser.profileImageUrl,
        updatedAt: new Date(),
      };
      this.users.set(userData.id!, updatedUser);
      return updatedUser;
    }
    
    const isFirstUser = this.users.size === 0;
    const newUser: User = {
      id: userData.id!,
      email: userData.email ?? null,
      firstName: userData.firstName ?? null,
      lastName: userData.lastName ?? null,
      profileImageUrl: userData.profileImageUrl ?? null,
      role: isFirstUser ? 'owner' : 'staff',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userData.id!, newUser);
    return newUser;
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, role, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Supplier operations
  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values()).sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getSupplier(id: number): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const newSupplier: Supplier = {
      id: this.nextIds.supplier++,
      name: supplier.name,
      contactPerson: supplier.contactPerson ?? null,
      phone: supplier.phone ?? null,
      email: supplier.email ?? null,
      address: supplier.address ?? null,
      isActive: supplier.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.suppliers.set(newSupplier.id, newSupplier);
    return newSupplier;
  }

  async updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const existing = this.suppliers.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...supplier, updatedAt: new Date() };
    this.suppliers.set(id, updated);
    return updated;
  }

  async deleteSupplier(id: number): Promise<boolean> {
    return this.suppliers.delete(id);
  }

  // Purchase operations
  async getPurchases(): Promise<(Purchase & { supplier?: Supplier })[]> {
    return Array.from(this.purchases.values())
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
      .map(p => ({
        ...p,
        supplier: this.suppliers.get(p.supplierId),
      }));
  }

  async getPurchase(id: number): Promise<Purchase | undefined> {
    return this.purchases.get(id);
  }

  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const newPurchase: Purchase = {
      id: this.nextIds.purchase++,
      supplierId: purchase.supplierId,
      purchaseDate: purchase.purchaseDate,
      quantityKg: purchase.quantityKg,
      pricePerKg: purchase.pricePerKg,
      totalCost: purchase.totalCost,
      notes: purchase.notes ?? null,
      createdAt: new Date(),
    };
    this.purchases.set(newPurchase.id, newPurchase);
    return newPurchase;
  }

  async updatePurchase(id: number, purchase: Partial<InsertPurchase>): Promise<Purchase | undefined> {
    const existing = this.purchases.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...purchase };
    this.purchases.set(id, updated);
    return updated;
  }

  async deletePurchase(id: number): Promise<boolean> {
    return this.purchases.delete(id);
  }

  // Planting batch operations
  async getPlantingBatches(): Promise<PlantingBatch[]> {
    return Array.from(this.plantingBatches.values())
      .sort((a, b) => new Date(b.plantedDate).getTime() - new Date(a.plantedDate).getTime());
  }

  async getPlantingBatch(id: number): Promise<PlantingBatch | undefined> {
    return this.plantingBatches.get(id);
  }

  async createPlantingBatch(batch: InsertPlantingBatch): Promise<PlantingBatch> {
    const newBatch: PlantingBatch = {
      id: this.nextIds.plantingBatch++,
      batchCode: batch.batchCode,
      plantedDate: batch.plantedDate,
      expectedHarvestDate: batch.expectedHarvestDate,
      beansUsedKg: batch.beansUsedKg,
      expectedYieldKg: batch.expectedYieldKg,
      actualYieldKg: batch.actualYieldKg ?? null,
      status: batch.status ?? "growing",
      notes: batch.notes ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.plantingBatches.set(newBatch.id, newBatch);
    return newBatch;
  }

  async updatePlantingBatch(id: number, batch: Partial<InsertPlantingBatch>): Promise<PlantingBatch | undefined> {
    const existing = this.plantingBatches.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...batch, updatedAt: new Date() };
    this.plantingBatches.set(id, updated);
    return updated;
  }

  async deletePlantingBatch(id: number): Promise<boolean> {
    return this.plantingBatches.delete(id);
  }

  async getPlantingBatchesByDateRange(startDate: string, endDate: string): Promise<PlantingBatch[]> {
    return Array.from(this.plantingBatches.values())
      .filter(b => b.expectedHarvestDate >= startDate && b.expectedHarvestDate <= endDate)
      .sort((a, b) => new Date(a.expectedHarvestDate).getTime() - new Date(b.expectedHarvestDate).getTime());
  }

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const newCustomer: Customer = {
      id: this.nextIds.customer++,
      name: customer.name,
      businessName: customer.businessName ?? null,
      phone: customer.phone ?? null,
      email: customer.email ?? null,
      address: customer.address ?? null,
      deliveryRoute: customer.deliveryRoute ?? null,
      deliveryNotes: customer.deliveryNotes ?? null,
      defaultQuantityKg: customer.defaultQuantityKg ?? null,
      pricePerKg: customer.pricePerKg ?? null,
      isActive: customer.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.customers.set(newCustomer.id, newCustomer);
    return newCustomer;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const existing = this.customers.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...customer, updatedAt: new Date() };
    this.customers.set(id, updated);
    return updated;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    return this.customers.delete(id);
  }

  async getCustomersByRoute(route: string): Promise<Customer[]> {
    return Array.from(this.customers.values())
      .filter(c => c.deliveryRoute === route)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  // Order operations
  async getOrders(): Promise<(Order & { customer?: Customer })[]> {
    return Array.from(this.orders.values())
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .map(o => ({
        ...o,
        customer: this.customers.get(o.customerId),
      }));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const newOrder: Order = {
      id: this.nextIds.order++,
      customerId: order.customerId,
      orderDate: order.orderDate,
      deliveryDate: order.deliveryDate,
      quantityKg: order.quantityKg,
      pricePerKg: order.pricePerKg,
      totalAmount: order.totalAmount,
      status: order.status ?? "pending",
      bagsDelivered: order.bagsDelivered ?? null,
      bagsReturned: order.bagsReturned ?? null,
      cashCollected: order.cashCollected ?? null,
      paymentStatus: order.paymentStatus ?? "pending",
      deliveredBy: order.deliveredBy ?? null,
      deliveryNotes: order.deliveryNotes ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.set(newOrder.id, newOrder);
    return newOrder;
  }

  async updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined> {
    const existing = this.orders.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...order, updatedAt: new Date() };
    this.orders.set(id, updated);
    return updated;
  }

  async deleteOrder(id: number): Promise<boolean> {
    return this.orders.delete(id);
  }

  async getOrdersByDate(date: string): Promise<(Order & { customer?: Customer })[]> {
    return Array.from(this.orders.values())
      .filter(o => o.deliveryDate === date)
      .map(o => ({
        ...o,
        customer: this.customers.get(o.customerId),
      }))
      .sort((a, b) => {
        const routeA = a.customer?.deliveryRoute || '';
        const routeB = b.customer?.deliveryRoute || '';
        return routeA.localeCompare(routeB) || (a.customer?.name || '').localeCompare(b.customer?.name || '');
      });
  }

  async getOrdersByCustomer(customerId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(o => o.customerId === customerId)
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }

  async getOrdersByDateRange(startDate: string, endDate: string): Promise<(Order & { customer?: Customer })[]> {
    return Array.from(this.orders.values())
      .filter(o => o.deliveryDate >= startDate && o.deliveryDate <= endDate)
      .sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime())
      .map(o => ({
        ...o,
        customer: this.customers.get(o.customerId),
      }));
  }

  // Van operations
  async getVans(): Promise<Van[]> {
    return Array.from(this.vans.values()).sort((a, b) => a.registrationNumber.localeCompare(b.registrationNumber));
  }

  async getVan(id: number): Promise<Van | undefined> {
    return this.vans.get(id);
  }

  async createVan(van: InsertVan): Promise<Van> {
    const newVan: Van = {
      id: this.nextIds.van++,
      registrationNumber: van.registrationNumber,
      make: van.make ?? null,
      model: van.model ?? null,
      year: van.year ?? null,
      insuranceExpiry: van.insuranceExpiry ?? null,
      licenseExpiry: van.licenseExpiry ?? null,
      lastServiceDate: van.lastServiceDate ?? null,
      nextServiceDate: van.nextServiceDate ?? null,
      currentMileage: van.currentMileage ?? null,
      status: van.status ?? "active",
      assignedDriver: van.assignedDriver ?? null,
      notes: van.notes ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.vans.set(newVan.id, newVan);
    return newVan;
  }

  async updateVan(id: number, van: Partial<InsertVan>): Promise<Van | undefined> {
    const existing = this.vans.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...van, updatedAt: new Date() };
    this.vans.set(id, updated);
    return updated;
  }

  async deleteVan(id: number): Promise<boolean> {
    return this.vans.delete(id);
  }

  // Stock operations
  async getStockItems(): Promise<StockItem[]> {
    return Array.from(this.stockItems.values())
      .sort((a, b) => a.itemType.localeCompare(b.itemType) || a.name.localeCompare(b.name));
  }

  async getStockItem(id: number): Promise<StockItem | undefined> {
    return this.stockItems.get(id);
  }

  async createStockItem(item: InsertStockItem): Promise<StockItem> {
    const newItem: StockItem = {
      id: this.nextIds.stockItem++,
      itemType: item.itemType,
      name: item.name,
      currentQuantity: item.currentQuantity,
      unit: item.unit,
      minimumLevel: item.minimumLevel ?? null,
      lastUpdated: new Date(),
    };
    this.stockItems.set(newItem.id, newItem);
    return newItem;
  }

  async updateStockItem(id: number, item: Partial<InsertStockItem>): Promise<StockItem | undefined> {
    const existing = this.stockItems.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...item, lastUpdated: new Date() };
    this.stockItems.set(id, updated);
    return updated;
  }

  async deleteStockItem(id: number): Promise<boolean> {
    return this.stockItems.delete(id);
  }

  // Stock transaction operations
  async getStockTransactions(stockItemId?: number): Promise<StockTransaction[]> {
    let transactions = Array.from(this.stockTransactions.values());
    if (stockItemId) {
      transactions = transactions.filter(t => t.stockItemId === stockItemId);
    }
    return transactions.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createStockTransaction(transaction: InsertStockTransaction): Promise<StockTransaction> {
    const newTransaction: StockTransaction = {
      id: this.nextIds.stockTransaction++,
      stockItemId: transaction.stockItemId,
      transactionType: transaction.transactionType,
      quantity: transaction.quantity,
      notes: transaction.notes ?? null,
      createdBy: transaction.createdBy ?? null,
      createdAt: new Date(),
    };
    this.stockTransactions.set(newTransaction.id, newTransaction);
    
    // Update stock item quantity
    const stockItem = await this.getStockItem(Number(transaction.stockItemId));
    if (stockItem) {
      const currentQty = parseFloat(stockItem.currentQuantity);
      const transactionQty = parseFloat(transaction.quantity);
      const newQty = transaction.transactionType === "add" || transaction.transactionType === "in"
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
    return Array.from(this.settings.values());
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    return this.settings.get(key);
  }

  async upsertSetting(setting: InsertSetting): Promise<Setting> {
    const existing = this.settings.get(setting.key);
    if (existing) {
      const updated: Setting = { 
        ...existing, 
        value: setting.value, 
        description: setting.description ?? null, 
        updatedAt: new Date() 
      };
      this.settings.set(setting.key, updated);
      return updated;
    }
    const newSetting: Setting = {
      id: this.nextIds.setting++,
      key: setting.key,
      value: setting.value,
      description: setting.description ?? null,
      updatedAt: new Date(),
    };
    this.settings.set(setting.key, newSetting);
    return newSetting;
  }

  // Maintenance log operations
  async getMaintenanceLogs(vanId?: number): Promise<MaintenanceLog[]> {
    let logs = Array.from(this.maintenanceLogs.values());
    if (vanId) {
      logs = logs.filter(l => l.vanId === vanId);
    }
    return logs.sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime());
  }

  async createMaintenanceLog(log: InsertMaintenanceLog): Promise<MaintenanceLog> {
    const newLog: MaintenanceLog = {
      id: this.nextIds.maintenanceLog++,
      vanId: log.vanId,
      maintenanceType: log.maintenanceType,
      description: log.description ?? null,
      cost: log.cost ?? null,
      serviceDate: log.serviceDate,
      mileageAtService: log.mileageAtService ?? null,
      nextServiceDate: log.nextServiceDate ?? null,
      createdAt: new Date(),
    };
    this.maintenanceLogs.set(newLog.id, newLog);
    return newLog;
  }

  async deleteMaintenanceLog(id: number): Promise<boolean> {
    return this.maintenanceLogs.delete(id);
  }

  // Analytics operations
  async getDashboardStats(): Promise<DashboardStats> {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    const todayOrdersList = Array.from(this.orders.values()).filter((o) => o.deliveryDate === today);
    const yesterdayOrdersList = Array.from(this.orders.values()).filter((o) => o.deliveryDate === yesterday);

    const todayKg = todayOrdersList.reduce((sum, o) => sum + parseFloat(o.quantityKg), 0);
    const yesterdayKg = yesterdayOrdersList.reduce((sum, o) => sum + parseFloat(o.quantityKg), 0);
    const todayRevenue = todayOrdersList.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);

    const pendingDeliveries = todayOrdersList.filter((o) => o.status === "pending").length;
    const deliveriesInProgress = todayOrdersList.filter((o) =>
      ["pending", "confirmed", "bagged"].includes(o.status),
    ).length;

    const readySproutsKg = Array.from(this.plantingBatches.values())
      .filter((b) => b.status === "ready")
      .reduce((sum, b) => sum + parseFloat(b.expectedYieldKg || "0"), 0);

    const activeCustomers = Array.from(this.customers.values()).filter((c) => c.isActive).length;

    return {
      readySproutsKg,
      todaysOrdersKg: todayKg,
      todaysOrdersCount: todayOrdersList.length,
      todayRevenue,
      deliveriesInProgress,
      pendingDeliveries,
      activeCustomers,
      ordersGrowth: computeGrowthPercent(todayKg, yesterdayKg),
      customersGrowth: 0,
    };
  }

  async getSalesAnalytics(startDate: string, endDate: string): Promise<{
    date: string;
    revenue: string;
    orders: number;
  }[]> {
    const ordersByDate = new Map<string, { revenue: number; orders: number }>();
    
    Array.from(this.orders.values())
      .filter(o => o.deliveryDate >= startDate && o.deliveryDate <= endDate)
      .forEach(o => {
        const existing = ordersByDate.get(o.deliveryDate) || { revenue: 0, orders: 0 };
        ordersByDate.set(o.deliveryDate, {
          revenue: existing.revenue + parseFloat(o.totalAmount),
          orders: existing.orders + 1,
        });
      });
    
    return Array.from(ordersByDate.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue.toFixed(2),
        orders: data.orders,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getCustomerRankings(): Promise<{
    id: number;
    name: string;
    quantity: string;
    revenue: string;
  }[]> {
    const customerStats = new Map<number, { quantity: number; revenue: number }>();
    
    Array.from(this.orders.values()).forEach(o => {
      const existing = customerStats.get(o.customerId) || { quantity: 0, revenue: 0 };
      customerStats.set(o.customerId, {
        quantity: existing.quantity + parseFloat(o.quantityKg),
        revenue: existing.revenue + parseFloat(o.totalAmount),
      });
    });
    
    return Array.from(this.customers.values())
      .map(c => {
        const stats = customerStats.get(c.id) || { quantity: 0, revenue: 0 };
        return {
          id: c.id,
          name: c.name,
          quantity: stats.quantity.toFixed(2),
          revenue: stats.revenue.toFixed(2),
        };
      })
      .sort((a, b) => parseFloat(b.revenue) - parseFloat(a.revenue))
      .slice(0, 10);
  }

  async getProductBreakdown(startDate: string, endDate: string): Promise<{
    name: string;
    value: string;
  }[]> {
    const totalQuantity = Array.from(this.orders.values())
      .filter(o => o.deliveryDate >= startDate && o.deliveryDate <= endDate)
      .reduce((sum, o) => sum + parseFloat(o.quantityKg), 0);
    
    return [
      { name: "Mung Sprouts", value: totalQuantity.toFixed(2) },
    ];
  }

  /** Serialize all data for local JSON / Firebase sync */
  exportSnapshot(): StorageSnapshot {
    return {
      users: Array.from(this.users.values()),
      suppliers: Array.from(this.suppliers.values()),
      purchases: Array.from(this.purchases.values()),
      plantingBatches: Array.from(this.plantingBatches.values()),
      customers: Array.from(this.customers.values()),
      orders: Array.from(this.orders.values()),
      vans: Array.from(this.vans.values()),
      stockItems: Array.from(this.stockItems.values()),
      stockTransactions: Array.from(this.stockTransactions.values()),
      settings: Array.from(this.settings.values()),
      maintenanceLogs: Array.from(this.maintenanceLogs.values()),
      nextIds: { ...this.nextIds },
    };
  }

  /** Restore data from a snapshot (local JSON / Firebase sync) */
  importSnapshot(snapshot: StorageSnapshot): void {
    this.users = new Map(snapshot.users.map((u) => [u.id, reviveUser(u)]));
    this.suppliers = new Map(snapshot.suppliers.map((s) => [s.id, reviveSupplier(s)]));
    this.purchases = new Map(snapshot.purchases.map((p) => [p.id, revivePurchase(p)]));
    this.plantingBatches = new Map(snapshot.plantingBatches.map((b) => [b.id, revivePlantingBatch(b)]));
    this.customers = new Map(snapshot.customers.map((c) => [c.id, reviveCustomer(c)]));
    this.orders = new Map(snapshot.orders.map((o) => [o.id, reviveOrder(o)]));
    this.vans = new Map(snapshot.vans.map((v) => [v.id, reviveVan(v)]));
    this.stockItems = new Map(snapshot.stockItems.map((i) => [i.id, reviveStockItem(i)]));
    this.stockTransactions = new Map(snapshot.stockTransactions.map((t) => [t.id, reviveStockTransaction(t)]));
    this.settings = new Map(snapshot.settings.map((s) => [s.key, reviveSetting(s)]));
    this.maintenanceLogs = new Map(snapshot.maintenanceLogs.map((l) => [l.id, reviveMaintenanceLog(l)]));
    this.nextIds = { ...snapshot.nextIds };
  }
}

export type StorageSnapshot = {
  users: User[];
  suppliers: Supplier[];
  purchases: Purchase[];
  plantingBatches: PlantingBatch[];
  customers: Customer[];
  orders: Order[];
  vans: Van[];
  stockItems: StockItem[];
  stockTransactions: StockTransaction[];
  settings: Setting[];
  maintenanceLogs: MaintenanceLog[];
  nextIds: {
    supplier: number;
    purchase: number;
    plantingBatch: number;
    customer: number;
    order: number;
    van: number;
    stockItem: number;
    stockTransaction: number;
    setting: number;
    maintenanceLog: number;
  };
};

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  return new Date(String(value));
}

function reviveUser(u: User): User {
  return { ...u, createdAt: toDate(u.createdAt), updatedAt: toDate(u.updatedAt) };
}
function reviveSupplier(s: Supplier): Supplier {
  return { ...s, createdAt: toDate(s.createdAt), updatedAt: toDate(s.updatedAt) };
}
function revivePurchase(p: Purchase): Purchase {
  return { ...p, createdAt: toDate(p.createdAt) };
}
function revivePlantingBatch(b: PlantingBatch): PlantingBatch {
  return { ...b, createdAt: toDate(b.createdAt), updatedAt: toDate(b.updatedAt) };
}
function reviveCustomer(c: Customer): Customer {
  return { ...c, createdAt: toDate(c.createdAt), updatedAt: toDate(c.updatedAt) };
}
function reviveOrder(o: Order): Order {
  return { ...o, createdAt: toDate(o.createdAt), updatedAt: toDate(o.updatedAt) };
}
function reviveVan(v: Van): Van {
  return { ...v, createdAt: toDate(v.createdAt), updatedAt: toDate(v.updatedAt) };
}
function reviveStockItem(i: StockItem): StockItem {
  return { ...i, lastUpdated: toDate(i.lastUpdated) };
}
function reviveStockTransaction(t: StockTransaction): StockTransaction {
  return { ...t, createdAt: toDate(t.createdAt) };
}
function reviveSetting(s: Setting): Setting {
  return { ...s, updatedAt: toDate(s.updatedAt) };
}
function reviveMaintenanceLog(l: MaintenanceLog): MaintenanceLog {
  return { ...l, createdAt: toDate(l.createdAt) };
}

