import fs from "fs";
import path from "path";
import type { IStorage } from "./storage";
import { MemoryStorage, type StorageSnapshot } from "./memoryStorage";

const MUTATING_METHODS: (keyof IStorage)[] = [
  "upsertUser",
  "updateUserRole",
  "createSupplier",
  "updateSupplier",
  "deleteSupplier",
  "createPurchase",
  "updatePurchase",
  "deletePurchase",
  "createPlantingBatch",
  "updatePlantingBatch",
  "deletePlantingBatch",
  "createCustomer",
  "updateCustomer",
  "deleteCustomer",
  "createOrder",
  "updateOrder",
  "deleteOrder",
  "createVan",
  "updateVan",
  "deleteVan",
  "createStockItem",
  "updateStockItem",
  "deleteStockItem",
  "createStockTransaction",
  "upsertSetting",
  "createMaintenanceLog",
  "deleteMaintenanceLog",
];

export class LocalJsonStorage extends MemoryStorage {
  readonly filePath: string;
  private saveTimer?: ReturnType<typeof setTimeout>;
  private onPersist?: () => void;

  constructor(options?: {
    seed?: boolean;
    filePath?: string;
    onPersist?: () => void;
  }) {
    super({ seed: false });
    this.filePath =
      options?.filePath ??
      path.join(process.cwd(), ".local", "enterprise-db", "sproutdrive.json");
    this.onPersist = options?.onPersist;

    if (this.loadFromDisk()) {
      console.log(`📂 Loaded enterprise data from ${this.filePath}`);
    } else if (options?.seed !== false) {
      this.seedData();
      this.saveToDisk();
      console.log(`📦 Seeded enterprise local database at ${this.filePath}`);
    }

    this.wrapMutators();
  }

  private wrapMutators(): void {
    for (const method of MUTATING_METHODS) {
      const self = this as unknown as Record<string, (...args: unknown[]) => Promise<unknown>>;
      const original = self[method as string];
      if (typeof original !== "function") continue;
      self[method as string] = async (...args: unknown[]) => {
        const result = await original.apply(this, args);
        this.scheduleSave();
        return result;
      };
    }
  }

  scheduleSave(): void {
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      this.saveToDisk();
      this.onPersist?.();
    }, 400);
  }

  loadFromDisk(): boolean {
    try {
      if (!fs.existsSync(this.filePath)) return false;
      const raw = fs.readFileSync(this.filePath, "utf-8");
      const snapshot = JSON.parse(raw) as StorageSnapshot;
      this.importSnapshot(snapshot);
      return true;
    } catch (error) {
      console.warn("Failed to load local enterprise database:", error);
      return false;
    }
  }

  saveToDisk(): void {
    try {
      const dir = path.dirname(this.filePath);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify(this.exportSnapshot(), null, 2), "utf-8");
    } catch (error) {
      console.error("Failed to save local enterprise database:", error);
    }
  }

  getSnapshot(): StorageSnapshot {
    return this.exportSnapshot();
  }

  replaceSnapshot(snapshot: StorageSnapshot): void {
    this.importSnapshot(snapshot);
    this.saveToDisk();
  }
}
