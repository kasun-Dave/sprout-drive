import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Sprout,
  Package,
  Users,
  ShoppingCart,
  Truck,
  BarChart3,
  Settings,
  LogOut,
  Building2,
  Calendar,
} from "lucide-react";

interface AppSidebarProps {
  userRole: "owner" | "staff";
  userName: string;
  onLogout: () => void;
}

export function AppSidebar({ userRole, userName, onLogout }: AppSidebarProps) {
  const [location] = useLocation();

  const ownerMenuItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Suppliers", url: "/suppliers", icon: Building2 },
    { title: "Planting", url: "/planting", icon: Sprout },
    { title: "Stock", url: "/stock", icon: Package },
    { title: "Customers", url: "/customers", icon: Users },
    { title: "Orders", url: "/orders", icon: ShoppingCart },
    { title: "Vans", url: "/vans", icon: Truck },
    { title: "Analytics", url: "/analytics", icon: BarChart3 },
    { title: "Settings", url: "/settings", icon: Settings },
  ];

  const staffMenuItems = [
    { title: "Today's Deliveries", url: "/deliveries", icon: Truck },
    { title: "Orders", url: "/orders", icon: ShoppingCart },
  ];

  const menuItems = userRole === "owner" ? ownerMenuItems : staffMenuItems;

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-md">
            <Sprout className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg">SproutDrive</h1>
            <p className="text-xs text-muted-foreground capitalize">
              {userRole} Portal
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
