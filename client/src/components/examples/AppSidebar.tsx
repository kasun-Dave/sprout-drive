import { AppSidebar } from "../AppSidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";

export default function AppSidebarExample() {
  return (
    <SidebarProvider>
      <AppSidebar
        userRole="owner"
        userName="John Owner"
        onLogout={() => console.log("Logout clicked")}
      />
      <SidebarInset>
        <header className="flex items-center gap-4 p-4 border-b">
          <SidebarTrigger />
          <h1 className="font-semibold">Dashboard</h1>
        </header>
        <main className="p-4">
          <p className="text-muted-foreground">Main content area</p>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
