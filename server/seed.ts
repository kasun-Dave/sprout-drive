import { getDb } from "./db";
import {
  suppliers,
  purchases,
  plantingBatches,
  customers,
  orders,
  vans,
  stockItems,
  settings,
} from "@shared/schema";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // Clear existing data (optional - comment out if you want to keep existing data)
  await getDb().delete(orders);
  await getDb().delete(purchases);
  await getDb().delete(plantingBatches);
  await getDb().delete(customers);
  await getDb().delete(suppliers);
  await getDb().delete(vans);
  await getDb().delete(stockItems);
  await getDb().delete(settings);

  // Seed suppliers
  const [supplier1, supplier2, supplier3] = await getDb()
    .insert(suppliers)
    .values([
      {
        name: "Bean Farms Inc",
        contactPerson: "John Miller",
        phone: "+1 234 567 8901",
        email: "john@beanfarms.com",
        address: "100 Farm Road, Green Valley, CA 94000",
        isActive: true,
      },
      {
        name: "Green Valley Suppliers",
        contactPerson: "Sarah Green",
        phone: "+1 234 567 8902",
        email: "sarah@greenvalley.com",
        address: "200 Green Lane, Hills, CA 94001",
        isActive: true,
      },
      {
        name: "Fresh Produce Co",
        contactPerson: "Mike Fresh",
        phone: "+1 234 567 8903",
        email: "mike@freshproduce.com",
        address: "300 Fresh St, Town, CA 94002",
        isActive: true,
      },
    ])
    .returning();

  console.log("Suppliers seeded:", [supplier1, supplier2, supplier3].map(s => s.name).join(", "));

  // Seed purchases
  const today = new Date();
  await getDb().insert(purchases).values([
    {
      supplierId: supplier1.id,
      purchaseDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      quantityKg: "200",
      pricePerKg: "2.50",
      totalCost: "500.00",
      notes: "Regular weekly order",
    },
    {
      supplierId: supplier2.id,
      purchaseDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      quantityKg: "150",
      pricePerKg: "2.60",
      totalCost: "390.00",
      notes: "Extra stock for holiday",
    },
    {
      supplierId: supplier1.id,
      purchaseDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      quantityKg: "180",
      pricePerKg: "2.50",
      totalCost: "450.00",
    },
  ]);

  console.log("Purchases seeded");

  // Seed planting batches
  await getDb().insert(plantingBatches).values([
    {
      batchCode: `BATCH-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}-001`,
      plantedDate: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      expectedHarvestDate: today.toISOString().split("T")[0],
      beansUsedKg: "50",
      expectedYieldKg: "450",
      actualYieldKg: "445",
      status: "ready",
      notes: "Ready for harvest",
    },
    {
      batchCode: `BATCH-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}-002`,
      plantedDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      expectedHarvestDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      beansUsedKg: "40",
      expectedYieldKg: "360",
      status: "growing",
    },
    {
      batchCode: `BATCH-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}-003`,
      plantedDate: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      expectedHarvestDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      beansUsedKg: "55",
      expectedYieldKg: "495",
      status: "growing",
    },
    {
      batchCode: `BATCH-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}-004`,
      plantedDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      expectedHarvestDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      beansUsedKg: "45",
      expectedYieldKg: "405",
      status: "growing",
    },
    {
      batchCode: `BATCH-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}-005`,
      plantedDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      expectedHarvestDate: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      beansUsedKg: "50",
      expectedYieldKg: "450",
      status: "growing",
    },
  ]);

  console.log("Planting batches seeded");

  // Seed customers
  const [customer1, customer2, customer3, customer4, customer5] = await getDb()
    .insert(customers)
    .values([
      {
        name: "Green Market",
        businessName: "Green Market - Main Branch",
        phone: "+1 555 001 0001",
        email: "orders@greenmarket.com",
        address: "123 Market Street, Downtown",
        deliveryRoute: "Route A",
        deliveryNotes: "Delivery before 8 AM",
        defaultQuantityKg: "50",
        pricePerKg: "5.00",
        isActive: true,
      },
      {
        name: "Fresh Foods Co",
        businessName: "Fresh Foods Supermarket",
        phone: "+1 555 001 0002",
        email: "purchasing@freshfoods.com",
        address: "456 Fresh Ave, Midtown",
        deliveryRoute: "Route A",
        defaultQuantityKg: "30",
        pricePerKg: "4.80",
        isActive: true,
      },
      {
        name: "Health Hub",
        businessName: "Health Hub - City Center",
        phone: "+1 555 001 0003",
        email: "store@healthhub.com",
        address: "789 Health Blvd, City Center",
        deliveryRoute: "Route B",
        defaultQuantityKg: "25",
        pricePerKg: "5.20",
        isActive: true,
      },
      {
        name: "Organic Oasis",
        businessName: "Organic Oasis Restaurant",
        phone: "+1 555 001 0004",
        email: "kitchen@organicoasis.com",
        address: "321 Organic Lane, East Side",
        deliveryRoute: "Route B",
        deliveryNotes: "Use back entrance",
        defaultQuantityKg: "20",
        pricePerKg: "5.50",
        isActive: true,
      },
      {
        name: "Valley Grocers",
        businessName: "Valley Grocers Chain",
        phone: "+1 555 001 0005",
        email: "orders@valleygrocers.com",
        address: "555 Valley Road, North",
        deliveryRoute: "Route C",
        defaultQuantityKg: "40",
        pricePerKg: "4.60",
        isActive: true,
      },
    ])
    .returning();

  console.log("Customers seeded");

  // Seed orders for today
  const todayStr = today.toISOString().split("T")[0];
  await getDb().insert(orders).values([
    {
      customerId: customer1.id,
      orderDate: todayStr,
      deliveryDate: todayStr,
      quantityKg: "50",
      pricePerKg: "5.00",
      totalAmount: "250.00",
      status: "delivered",
      bagsDelivered: 10,
      bagsReturned: 2,
      cashCollected: "250.00",
      paymentStatus: "paid",
      deliveredBy: "Mike Driver",
    },
    {
      customerId: customer2.id,
      orderDate: todayStr,
      deliveryDate: todayStr,
      quantityKg: "30",
      pricePerKg: "4.80",
      totalAmount: "144.00",
      status: "bagged",
      bagsDelivered: 6,
      paymentStatus: "pending",
    },
    {
      customerId: customer3.id,
      orderDate: todayStr,
      deliveryDate: todayStr,
      quantityKg: "25",
      pricePerKg: "5.20",
      totalAmount: "130.00",
      status: "pending",
      paymentStatus: "pending",
    },
    {
      customerId: customer4.id,
      orderDate: todayStr,
      deliveryDate: todayStr,
      quantityKg: "20",
      pricePerKg: "5.50",
      totalAmount: "110.00",
      status: "pending",
      paymentStatus: "pending",
    },
    {
      customerId: customer5.id,
      orderDate: todayStr,
      deliveryDate: todayStr,
      quantityKg: "40",
      pricePerKg: "4.60",
      totalAmount: "184.00",
      status: "delivered",
      bagsDelivered: 8,
      bagsReturned: 1,
      cashCollected: "184.00",
      paymentStatus: "paid",
      deliveredBy: "Tom Driver",
    },
  ]);

  console.log("Orders seeded");

  // Seed vans
  await getDb().insert(vans).values([
    {
      registrationNumber: "ABC-1234",
      make: "Toyota",
      model: "HiAce",
      year: 2021,
      insuranceExpiry: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      licenseExpiry: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      lastServiceDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      nextServiceDate: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      currentMileage: 45000,
      status: "active",
      assignedDriver: "Mike Driver",
    },
    {
      registrationNumber: "XYZ-5678",
      make: "Ford",
      model: "Transit",
      year: 2020,
      insuranceExpiry: new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      licenseExpiry: new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      lastServiceDate: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      nextServiceDate: new Date(today.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      currentMileage: 62000,
      status: "active",
      assignedDriver: "Tom Driver",
    },
    {
      registrationNumber: "DEF-9012",
      make: "Mercedes",
      model: "Sprinter",
      year: 2022,
      insuranceExpiry: new Date(today.getTime() + 120 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      licenseExpiry: new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      lastServiceDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      nextServiceDate: new Date(today.getTime() + 83 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      currentMileage: 28000,
      status: "active",
      assignedDriver: "Jake Driver",
      notes: "Backup van",
    },
  ]);

  console.log("Vans seeded");

  // Seed stock items
  await getDb().insert(stockItems).values([
    {
      itemType: "raw",
      name: "Mung Beans (Raw)",
      currentQuantity: "150",
      unit: "kg",
      minimumLevel: "50",
    },
    {
      itemType: "ready",
      name: "Ready Sprouts",
      currentQuantity: "445",
      unit: "kg",
      minimumLevel: "100",
    },
    {
      itemType: "packaging",
      name: "5kg Bags",
      currentQuantity: "200",
      unit: "pcs",
      minimumLevel: "50",
    },
    {
      itemType: "packaging",
      name: "10kg Bags",
      currentQuantity: "100",
      unit: "pcs",
      minimumLevel: "30",
    },
  ]);

  console.log("Stock items seeded");

  // Seed settings (canonical keys — see shared/businessConfig.ts)
  await getDb().insert(settings).values([
    { key: "beansToSproutsRatio", value: "7", description: "Kg sprouts per 1 kg beans" },
    { key: "sproutGrowthDays", value: "6", description: "Days from planting to harvest" },
    { key: "defaultPricePerKg", value: "3.50", description: "Default selling price per kg" },
    { key: "currency", value: "USD", description: "ISO currency code" },
    { key: "currencySymbol", value: "$", description: "Currency display symbol" },
    { key: "taxRate", value: "0", description: "Tax rate percentage" },
    { key: "companyName", value: "SproutDrive Farm", description: "Company name for invoices" },
    { key: "companyPhone", value: "+1 800 SPROUTS", description: "Company phone number" },
    { key: "companyAddress", value: "123 Sprout Lane, Green Valley, CA 94000", description: "Company address" },
    { key: "serviceIntervalMonths", value: "6", description: "Vehicle service interval in months" },
    { key: "expiryWarningDays", value: "30", description: "Days before expiry alerts" },
    { key: "enableNotifications", value: "true", description: "Enable notifications" },
  ]);

  console.log("Settings seeded");

  console.log("Database seeding completed successfully!");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
