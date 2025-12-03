import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sprout, TruckIcon, BarChart3, Users, Package, Calendar } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between mx-auto px-4">
          <div className="flex items-center gap-2">
            <Sprout className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">SproutDrive</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button onClick={handleLogin} data-testid="button-login">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium">
              <Sprout className="h-4 w-4" />
              Cloud-Based Business Management
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Manage Your Sprout Business with Ease
            </h1>
            <p className="text-xl text-muted-foreground">
              Complete business management system for mung bean sprout operations. 
              Track planting cycles, manage deliveries, and grow your business.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Button size="lg" onClick={handleLogin} data-testid="button-get-started">
                Get Started
              </Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools to manage every aspect of your sprout production business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover-elevate">
              <CardHeader>
                <Calendar className="h-10 w-10 text-primary mb-2" />
                <CardTitle>6-Day Planting Cycle</CardTitle>
                <CardDescription>
                  Track bean-to-sprout conversion with automatic yield predictions and harvest scheduling
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-elevate">
              <CardHeader>
                <TruckIcon className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Delivery Management</CardTitle>
                <CardDescription>
                  Organize routes, track deliveries, and manage cash collection with mobile-friendly interface
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-elevate">
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Customer Database</CardTitle>
                <CardDescription>
                  Manage customers, delivery routes, and order history all in one place
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-elevate">
              <CardHeader>
                <Package className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Order Management</CardTitle>
                <CardDescription>
                  Create daily orders, track quantities, manage bags, and generate invoices
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-elevate">
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Analytics & Reports</CardTitle>
                <CardDescription>
                  Sales insights, demand predictions, and comprehensive business reports
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-elevate">
              <CardHeader>
                <Sprout className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Stock Tracking</CardTitle>
                <CardDescription>
                  Monitor raw materials, ready sprouts, and get low-stock alerts automatically
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="text-center py-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                Sign in to access your dashboard and start managing your sprout business efficiently
              </p>
              <Button 
                size="lg" 
                variant="secondary" 
                onClick={handleLogin}
                data-testid="button-signin-cta"
              >
                Sign In Now
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>SproutDrive - Cloud Business Management for Sprout Operations</p>
        </div>
      </footer>
    </div>
  );
}
