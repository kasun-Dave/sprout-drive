import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Printer, Download, Sprout } from "lucide-react";
import { format } from "date-fns";

interface InvoiceItem {
  product: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
}

interface InvoiceViewProps {
  invoiceNumber: string;
  date: Date;
  customerName: string;
  customerAddress?: string;
  companyName?: string;
  companyPhone?: string;
  companyAddress?: string;
  items: InvoiceItem[];
  onPrint?: () => void;
  onDownload?: () => void;
}

export function InvoiceView({
  invoiceNumber,
  date,
  customerName,
  customerAddress,
  companyName = "SproutDrive",
  companyPhone = "(555) 123-4567",
  companyAddress = "123 Farm Road, Green Valley, CA 94000",
  items,
  onPrint,
  onDownload,
}: InvoiceViewProps) {
  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <Card className="max-w-2xl mx-auto print:shadow-none print:border-none" data-testid="card-invoice">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="p-2 bg-primary rounded-md">
            <Sprout className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">{companyName}</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Fresh Mung Bean Sprouts & Vegetables
        </p>
        <p className="text-sm text-muted-foreground">{companyAddress}</p>
        <p className="text-sm text-muted-foreground">Phone: {companyPhone}</p>
      </CardHeader>
      <Separator />
      <CardContent className="py-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div>
            <h3 className="font-semibold text-lg">Invoice</h3>
            <p className="text-sm text-muted-foreground">#{invoiceNumber}</p>
            <p className="text-sm text-muted-foreground">
              Date: {format(date, "MMM d, yyyy")}
            </p>
          </div>
          <div className="text-right">
            <h3 className="font-semibold">Bill To:</h3>
            <p className="font-medium">{customerName}</p>
            {customerAddress && (
              <p className="text-sm text-muted-foreground">{customerAddress}</p>
            )}
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 font-medium">Product</th>
              <th className="text-right py-2 font-medium">Qty</th>
              <th className="text-right py-2 font-medium">Price</th>
              <th className="text-right py-2 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b">
                <td className="py-3">{item.product}</td>
                <td className="text-right py-3">{item.quantity} kg</td>
                <td className="text-right py-3">${item.pricePerUnit.toFixed(2)}</td>
                <td className="text-right py-3 font-medium">
                  ${item.total.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="text-right py-4 font-semibold text-lg">
                Grand Total:
              </td>
              <td className="text-right py-4 font-bold text-lg">
                ${grandTotal.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-6 p-4 bg-muted/50 rounded-md">
          <p className="text-sm text-muted-foreground">
            Thank you for your business! Payment is due within 30 days.
          </p>
        </div>
      </CardContent>
      <CardFooter className="print:hidden flex justify-end gap-3 border-t pt-4">
        <Button variant="outline" onClick={onDownload} data-testid="button-download-invoice">
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        <Button onClick={onPrint} data-testid="button-print-invoice">
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      </CardFooter>
    </Card>
  );
}
