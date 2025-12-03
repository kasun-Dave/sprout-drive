import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppSidebar } from "@/components/AppSidebar";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";

import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Suppliers from "@/pages/Suppliers";
import Planting from "@/pages/Planting";
import Stock from "@/pages/Stock";
import Customers from "@/pages/Customers";
import Orders from "@/pages/Orders";
import Deliveries from "@/pages/Deliveries";
import Vans from "@/pages/Vans";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function OwnerRouter() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/suppliers" component={Suppliers} />
      <Route path="/planting" component={Planting} />
      <Route path="/stock" component={Stock} />
      <Route path="/customers" component={Customers} />
      <Route path="/orders" component={Orders} />
      <Route path="/deliveries" component={Deliveries} />
      <Route path="/vans" component={Vans} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function StaffRouter() {
  return (
    <Switch>
      <Route path="/" component={Deliveries} />
      <Route path="/deliveries" component={Deliveries} />
      <Route path="/orders" component={Orders} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedApp({
  userRole,
  userName,
  onLogout,
}: {
  userRole: "owner" | "staff";
  userName: string;
  onLogout: () => void;
}) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar userRole={userRole} userName={userName} onLogout={onLogout} />
        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-4 px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
            </div>
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {userRole === "owner" ? <OwnerRouter /> : <StaffRouter />}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function App() {
  // todo: remove mock functionality - replace with real auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<"owner" | "staff">("owner");
  const [userName, setUserName] = useState("John Owner");

  const handleLogin = (role: "owner" | "staff") => {
    setIsAuthenticated(true);
    setUserRole(role);
    setUserName(role === "owner" ? "John Owner" : "Mike Staff");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="sproutdrive-theme">
        <TooltipProvider>
          {isAuthenticated ? (
            <AuthenticatedApp
              userRole={userRole}
              userName={userName}
              onLogout={handleLogout}
            />
          ) : (
            <Login onLogin={handleLogin} />
          )}
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
