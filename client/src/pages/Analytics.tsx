import { useState } from "react";
import { SalesChart } from "@/components/SalesChart";
import { ProductBreakdownChart } from "@/components/ProductBreakdownChart";
import { TopCustomersChart } from "@/components/TopCustomersChart";
import { DemandPrediction } from "@/components/DemandPrediction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Download, Calendar, PieChart, Users } from "lucide-react";
import { format, subDays } from "date-fns";

export default function Analytics() {
  // todo: remove mock functionality
  const today = new Date();
  const [dateFrom, setDateFrom] = useState(format(subDays(today, 30), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(today, "yyyy-MM-dd"));

  const salesData = [
    { date: "Mon", sales: 380, orders: 12 },
    { date: "Tue", sales: 420, orders: 14 },
    { date: "Wed", sales: 390, orders: 13 },
    { date: "Thu", sales: 450, orders: 15 },
    { date: "Fri", sales: 520, orders: 18 },
    { date: "Sat", sales: 480, orders: 16 },
    { date: "Sun", sales: 350, orders: 11 },
  ];

  const productData = [
    { name: "Mung Sprouts", value: 2850, color: "hsl(142, 76%, 36%)" },
    { name: "Broccoli", value: 420, color: "hsl(195, 82%, 38%)" },
    { name: "Other Vegetables", value: 180, color: "hsl(31, 88%, 48%)" },
  ];

  const topCustomers = [
    { name: "Green Market", quantity: 580, revenue: 2900 },
    { name: "Fresh Foods Co", quantity: 420, revenue: 2100 },
    { name: "Health Hub", quantity: 350, revenue: 1750 },
    { name: "Super Mart", quantity: 280, revenue: 1400 },
    { name: "Organic Store", quantity: 220, revenue: 1100 },
  ];

  const monthlyData = [
    { month: "Jan", sprouts: 12500, other: 1800 },
    { month: "Feb", sprouts: 11800, other: 1650 },
    { month: "Mar", sprouts: 13200, other: 2100 },
    { month: "Apr", sprouts: 14500, other: 2400 },
    { month: "May", sprouts: 15200, other: 2600 },
    { month: "Jun", sprouts: 14800, other: 2350 },
  ];

  const predictions = [
    { period: "This Week", predictedDemand: 420, suggestedBeds: 14, suggestedBeans: 70, confidence: "high" as const },
    { period: "Next Week", predictedDemand: 450, suggestedBeds: 15, suggestedBeans: 75, confidence: "medium" as const },
    { period: "Week 3", predictedDemand: 480, suggestedBeds: 16, suggestedBeans: 80, confidence: "low" as const },
  ];

  const handleExport = () => {
    console.log("Exporting analytics data...");
  };

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
            <Button variant="secondary" data-testid="button-apply-filter">
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
          <SalesChart data={salesData} />
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-primary" />
                Monthly Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4 font-medium">Month</th>
                      <th className="text-right py-2 px-4 font-medium">Mung Sprouts (kg)</th>
                      <th className="text-right py-2 px-4 font-medium">Other Products (kg)</th>
                      <th className="text-right py-2 px-4 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((row, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2 px-4">{row.month}</td>
                        <td className="text-right py-2 px-4">{row.sprouts.toLocaleString()}</td>
                        <td className="text-right py-2 px-4">{row.other.toLocaleString()}</td>
                        <td className="text-right py-2 px-4 font-semibold">
                          {(row.sprouts + row.other).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProductBreakdownChart data={productData} />
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Product Performance</CardTitle>
              </CardHeader>
              <CardContent>
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
                        <p className="font-semibold">{product.value} kg</p>
                        <p className="text-sm text-muted-foreground">
                          ${(product.value * 5).toLocaleString()} revenue
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopCustomersChart data={topCustomers} />
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Customer Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topCustomers.map((customer, idx) => (
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
                        <p className="font-semibold">{customer.quantity} kg</p>
                        <p className="text-sm text-green-600">
                          ${customer.revenue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="mt-6 space-y-6">
          <DemandPrediction predictions={predictions} beansToSproutsRatio={6} />
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Purchase Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-md">
                  <h4 className="font-medium mb-2">Mung Beans</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Based on the next 4 weeks projected demand of ~1,800 kg sprouts
                  </p>
                  <p className="text-lg font-semibold">
                    Suggested purchase: <span className="text-primary">300 kg</span>
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-md">
                  <h4 className="font-medium mb-2">Broccoli</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Average weekly sales: 105 kg
                  </p>
                  <p className="text-lg font-semibold">
                    Suggested purchase: <span className="text-primary">120 kg/week</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
