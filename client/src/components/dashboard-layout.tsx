import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Package, 
  PlusCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  BarChart3,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/dashboard/shop", label: "Shop / POS", icon: ShoppingCart },
  { path: "/dashboard/sales", label: "Sales Overview", icon: BarChart3 },
  // { path: "/dashboard/employees", label: "Employees", icon: Users },
  { path: "/dashboard/products/add", label: "Add Products", icon: PlusCircle },
  { path: "/dashboard/products/restock", label: "Restock Products", icon: Package },
  { path: "/dashboard/admin", label: "Admin Portal", icon: Shield, isAdmin: true },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout, userRole } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await logout();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      setLocation("/");
    } catch (error) {
      toast({ title: "Sign Out Failed", description: "Could not sign out. Please try again.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        data-testid="button-mobile-menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed md:sticky top-0 left-0 h-screen bg-card border-r z-50
          transition-all duration-300 flex flex-col
          ${collapsed ? "w-16" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className={`h-16 border-b flex items-center ${collapsed ? "justify-center px-2" : "px-4"}`}>
          <Link href="/dashboard">
            <div className="flex items-center gap-2 hover-elevate px-2 py-1 rounded-md">
              <ShoppingCart className="h-6 w-6 text-primary flex-shrink-0" />
              {!collapsed && <span className="font-bold text-lg">ModernPOS</span>}
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.filter(item => !item.isAdmin).map((item) => {
            const isActive = location === item.path || 
              (item.path !== "/dashboard" && location.startsWith(item.path));
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors
                    hover-elevate cursor-pointer
                    ${isActive ? "bg-primary text-primary-foreground" : ""}
                  `}
                  onClick={() => setMobileOpen(false)}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </div>
              </Link>
            );
          })}
          
          {/* Admin Section Divider */}
          {userRole === "admin" && (
            <div className="pt-4 mt-4 border-t">
              {!collapsed && (
                <p className="px-3 text-xs font-medium text-muted-foreground mb-2">ADMINISTRATION</p>
              )}
              {navItems.filter(item => item.isAdmin).map((item) => {
                const isActive = location.startsWith(item.path);
                return (
                  <Link key={item.path} href={item.path}>
                    <div
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors
                        hover-elevate cursor-pointer
                        ${isActive ? "bg-primary text-primary-foreground" : "text-primary"}
                      `}
                      onClick={() => setMobileOpen(false)}
                      data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t p-2 space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className={`w-full justify-start gap-3 ${collapsed ? "px-3" : ""}`}
            onClick={() => setCollapsed(!collapsed)}
            data-testid="button-collapse-sidebar"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            {!collapsed && <span>Collapse</span>}
          </Button>
          <Link href="/">
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className={`w-full justify-start gap-3 text-destructive hover:text-destructive ${collapsed ? "px-3" : ""}`}
            data-testid="button-logout"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 pt-16 md:pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}
