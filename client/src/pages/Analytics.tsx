import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SalesChart } from "@/components/SalesChart";
import { ProductBreakdownChart } from "@/components/ProductBreakdownChart";
import { TopCustomersChart } from "@/components/TopCustomersChart";
import { DemandPrediction } from "@/components/DemandPrediction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, TrendingUp, Download, Calendar, PieChart, Users } from "lucide-react";
import { format, subDays, parseISO } from "date-fns";
import { getQueryFn } from "@/lib/queryClient";

interface SalesData {
  date: string;
  revenue: string;
  orders: number;
}

interface CustomerRanking {
  id: number;
  name: string;
  quantity: string;
  revenue: string;
}

interface ProductData {
  name: string;
  value: string;
}

export default function Analytics() {
  const today = new Date();
  const [dateFrom, setDateFrom] = useState(format(subDays(today, 30), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(today, "yyyy-MM-dd"));
  const [appliedDateFrom, setAppliedDateFrom] = useState(dateFrom);
  const [appliedDateTo, setAppliedDateTo] = useState(dateTo);

  const { data: salesData = [], isLoading: salesLoading } = useQuery<SalesData[]>({
    queryKey: ['/api/analytics/sales', { startDate: appliedDateFrom, endDate: appliedDateTo }],
    queryFn: getQueryFn({ on401: 'throw' }),
  });

  const { data: customerRankings = [], isLoading: customersLoading } = useQuery<CustomerRanking[]>({
    queryKey: ['/api/analytics/customer-rankings'],
  });

  const { data: productBreakdown = [], isLoading: productsLoading } = useQuery<ProductData[]>({
    queryKey: ['/api/analytics/product-breakdown', { startDate: appliedDateFrom, endDate: appliedDateTo }],
    queryFn: getQueryFn({ on401: 'throw' }),
  });

  const transformedSalesData = salesData.map(item => {
    const date = parseISO(item.date);
    return {
      date: format(date, 'EEE'),
      sales: parseFloat(item.revenue),
      orders: item.orders,
    };
  }).slice(-7);

  const productData = productBreakdown.length > 0 
    ? productBreakdown.map((item, idx) => ({
        name: item.name,
        value: parseFloat(item.value),
        color: idx === 0 ? "hsl(142, 76%, 36%)" : idx === 1 ? "hsl(195, 82%, 38%)" : "hsl(31, 88%, 48%)",
      }))
    : [{ name: "Mung Sprouts", value: 0, color: "hsl(142, 76%, 36%)" }];

  const topCustomers = customerRankings.map(customer => ({
    name: customer.name,
    quantity: parseFloat(customer.quantity),
    revenue: parseFloat(customer.revenue),
  }));

  const totalRevenue = salesData.reduce((sum, item) => sum + parseFloat(item.revenue), 0);
  const totalOrders = salesData.reduce((sum, item) => sum + item.orders, 0);
  const avgDailyRevenue = salesData.length > 0 ? totalRevenue / salesData.length : 0;
  const avgDailyOrders = salesData.length > 0 ? totalOrders / salesData.length : 0;

  const predictions = [
    { 
      period: "This Week", 
      predictedDemand: Math.round(avgDailyOrders * 7 * 30), 
      suggestedBeds: Math.round(avgDailyOrders * 7 * 30 / 30), 
      suggestedBeans: Math.round(avgDailyOrders * 7 * 30 / 6), 
      confidence: "high" as const 
    },
    { 
      period: "Next Week", 
      predictedDemand: Math.round(avgDailyOrders * 7 * 30 * 1.05), 
      suggestedBeds: Math.round(avgDailyOrders * 7 * 30 * 1.05 / 30), 
      suggestedBeans: Math.round(avgDailyOrders * 7 * 30 * 1.05 / 6), 
      confidence: "medium" as const 
    },
    { 
      period: "Week 3", 
      predictedDemand: Math.round(avgDailyOrders * 7 * 30 * 1.1), 
      suggestedBeds: Math.round(avgDailyOrders * 7 * 30 * 1.1 / 30), 
      suggestedBeans: Math.round(avgDailyOrders * 7 * 30 * 1.1 / 6), 
      confidence: "low" as const 
    },
  ];

  const monthlyData = salesData.reduce((acc, item) => {
    const date = parseISO(item.date);
    const month = format(date, 'MMM');
    const existing = acc.find(m => m.month === month);
    if (existing) {
      existing.sprouts += parseFloat(item.revenue);
      existing.other += parseFloat(item.revenue) * 0.1;
    } else {
      acc.push({
        month,
        sprouts: parseFloat(item.revenue),
        other: parseFloat(item.revenue) * 0.1,
      });
    }
    return acc;
  }, [] as { month: string; sprouts: number; other: number }[]);

  const handleApplyFilter = () => {
    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);
  };

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Revenue', 'Orders'],
      ...salesData.map(item => [item.date, item.revenue, item.orders.toString()]),
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${appliedDateFrom}-${appliedDateTo}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const isLoading = salesLoading || customersLoading || productsLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground">Sales insights and demand predictions</p>
        </div>
        <Button variant="outline" onClick={handleExport} data-testid="button-export">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label htmlFor="dateFrom">From</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-[160px]"
                data-testid="input-date-from"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="dateTo">To</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-[160px]"
                data-testid="input-date-to"
              />
            </div>
            <Button variant="secondary" onClick={handleApplyFilter} data-testid="button-apply-filter">
              <Calendar className="h-4 w-4 mr-2" />
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="products" data-testid="tab-products">
            <PieChart className="h-4 w-4 mr-2" />
            Products
          </TabsTrigger>
          <TabsTrigger value="customers" data-testid="tab-customers">
            <Users className="h-4 w-4 mr-2" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="predictions" data-testid="tab-predictions">
            <TrendingUp className="h-4 w-4 mr-2" />
            Predictions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {salesLoading ? (
            <Skeleton className="h-80" />
          ) : (
            <SalesChart data={transformedSalesData.length > 0 ? transformedSalesData : [{ date: 'No Data', sales: 0, orders: 0 }]} />
          )}
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-primary" />
                Monthly Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {salesLoading ? (
                <Skeleton className="h-40" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4 font-medium">Month</th>
                        <th className="text-right py-2 px-4 font-medium">Mung Sprouts ($)</th>
                        <th className="text-right py-2 px-4 font-medium">Other Products ($)</th>
                        <th className="text-right py-2 px-4 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyData.length > 0 ? monthlyData.map((row, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="py-2 px-4">{row.month}</td>
                          <td className="text-right py-2 px-4">${row.sprouts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="text-right py-2 px-4">${row.other.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="text-right py-2 px-4 font-semibold">
                            ${(row.sprouts + row.other).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      )) : (
                        <tr className="border-b">
                          <td colSpan={4} className="py-4 text-center text-muted-foreground">No data available for this period</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {productsLoading ? (
              <Skeleton className="h-80" />
            ) : (
              <ProductBreakdownChart data={productData} />
            )}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Product Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-12" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {productData.map((product, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: product.color }}
                          />
                          <span className="font-medium">{product.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{product.value.toLocaleString()} kg</p>
                          <p className="text-sm text-muted-foreground">
                            ${(product.value * 5).toLocaleString()} revenue
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {customersLoading ? (
              <Skeleton className="h-80" />
            ) : (
              <TopCustomersChart data={topCustomers} />
            )}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Customer Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                {customersLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topCustomers.length > 0 ? topCustomers.map((customer, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-muted-foreground">
                            #{idx + 1}
                          </span>
                          <span className="font-medium">{customer.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{customer.quantity.toLocaleString()} kg</p>
                          <p className="text-sm text-green-600">
                            ${customer.revenue.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-center text-muted-foreground py-4">No customer data available</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="mt-6 space-y-6">
          {salesLoading ? (
            <Skeleton className="h-60" />
          ) : (
            <DemandPrediction predictions={predictions} beansToSproutsRatio={6} />
          )}
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Purchase Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              {salesLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-md">
                    <h4 className="font-medium mb-2">Mung Beans</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Based on the next 4 weeks projected demand of ~{Math.round(avgDailyOrders * 28 * 30)} kg sprouts
                    </p>
                    <p className="text-lg font-semibold">
                      Suggested purchase: <span className="text-primary">{Math.round(avgDailyOrders * 28 * 30 / 6)} kg</span>
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-md">
                    <h4 className="font-medium mb-2">Broccoli</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Average weekly sales: {Math.round(avgDailyRevenue * 7 * 0.1)} kg
                    </p>
                    <p className="text-lg font-semibold">
                      Suggested purchase: <span className="text-primary">{Math.round(avgDailyRevenue * 7 * 0.12)} kg/week</span>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
