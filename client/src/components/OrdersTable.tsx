import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Package, MoreHorizontal, Check, X, Printer, Edit } from "lucide-react";

export interface Order {
  id: string;
  customerName: string;
  shopName?: string;
  product: string;
  orderedQty: number;
  baggedQty: number;
  deliveredQty: number;
  status: "pending" | "bagged" | "delivered" | "cancelled";
  cashCollected?: number;
  paymentType?: "cash" | "credit" | "other";
}

interface OrdersTableProps {
  orders: Order[];
  editable?: boolean;
  onUpdateOrder?: (id: string, updates: Partial<Order>) => void;
  onPrintInvoice?: (id: string) => void;
}

export function OrdersTable({
  orders,
  editable = false,
  onUpdateOrder,
  onPrintInvoice,
}: OrdersTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const statusColors = {
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    bagged: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <Card data-testid="card-orders-table">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5 text-primary" />
          Today's Orders
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Ordered</TableHead>
                <TableHead className="text-right">Bagged</TableHead>
                <TableHead className="text-right">Delivered</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Cash</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} data-testid={`order-row-${order.id}`}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customerName}</div>
                      {order.shopName && (
                        <div className="text-sm text-muted-foreground">
                          {order.shopName}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{order.product}</TableCell>
                  <TableCell className="text-right">{order.orderedQty} kg</TableCell>
                  <TableCell className="text-right">
                    {editable && editingId === order.id ? (
                      <Input
                        type="number"
                        defaultValue={order.baggedQty}
                        className="w-20 h-8 text-right"
                        onBlur={(e) => {
                          onUpdateOrder?.(order.id, {
                            baggedQty: Number(e.target.value),
                          });
                        }}
                        data-testid={`input-bagged-${order.id}`}
                      />
                    ) : (
                      `${order.baggedQty} kg`
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editable && editingId === order.id ? (
                      <Input
                        type="number"
                        defaultValue={order.deliveredQty}
                        className="w-20 h-8 text-right"
                        onBlur={(e) => {
                          onUpdateOrder?.(order.id, {
                            deliveredQty: Number(e.target.value),
                          });
                        }}
                        data-testid={`input-delivered-${order.id}`}
                      />
                    ) : (
                      `${order.deliveredQty} kg`
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[order.status]}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {order.cashCollected !== undefined
                      ? `$${order.cashCollected.toFixed(2)}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          data-testid={`button-order-menu-${order.id}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {editable && (
                          <DropdownMenuItem
                            onClick={() =>
                              setEditingId(editingId === order.id ? null : order.id)
                            }
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Quantities
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() =>
                            onUpdateOrder?.(order.id, { status: "delivered" })
                          }
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Mark Delivered
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            onUpdateOrder?.(order.id, { status: "cancelled" })
                          }
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel Order
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onPrintInvoice?.(order.id)}>
                          <Printer className="h-4 w-4 mr-2" />
                          Print Invoice
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
