import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Save } from "lucide-react";
import { format } from "date-fns";

interface Supplier {
  id: string;
  name: string;
}

interface PurchaseFormProps {
  suppliers: Supplier[];
  products: string[];
  onSubmit: (data: {
    date: Date;
    supplierId: string;
    product: string;
    quantity: number;
    pricePerKg: number;
    totalPrice: number;
  }) => void;
}

export function PurchaseForm({ suppliers, products, onSubmit }: PurchaseFormProps) {
  const [purchaseDate, setPurchaseDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [supplierId, setSupplierId] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState(100);
  const [pricePerKg, setPricePerKg] = useState(2.5);

  const totalPrice = quantity * pricePerKg;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || !product) return;
    onSubmit({
      date: new Date(purchaseDate),
      supplierId,
      product,
      quantity,
      pricePerKg,
      totalPrice,
    });
  };

  return (
    <Card data-testid="card-purchase-form">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5 text-primary" />
          Record Purchase
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                data-testid="input-purchase-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger id="supplier" data-testid="select-supplier">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="product">Product</Label>
            <Select value={product} onValueChange={setProduct}>
              <SelectTrigger id="product" data-testid="select-product">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity (kg)</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                data-testid="input-quantity"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricePerKg">Price per kg ($)</Label>
              <Input
                id="pricePerKg"
                type="number"
                min="0"
                step="0.01"
                value={pricePerKg}
                onChange={(e) => setPricePerKg(Number(e.target.value))}
                data-testid="input-price"
              />
            </div>
          </div>
          <div className="p-4 bg-muted/50 rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Price</span>
              <span className="text-2xl font-bold">${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <Button type="submit" className="w-full sm:w-auto" data-testid="button-record-purchase">
            <Save className="h-4 w-4 mr-2" />
            Record Purchase
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
