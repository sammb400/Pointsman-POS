import { Link, useLocation } from "wouter";
import { 
  Shield,
  Users, 
  Package, 
  DollarSign,
  Settings,
  ArrowLeft,
  LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const adminNavItems = [
  { path: "/dashboard/admin", label: "Admin Overview", icon: Shield },
  { path: "/dashboard/admin/employees", label: "View All Employees", icon: Users },
  { path: "/dashboard/admin/stock", label: "Stock Details", icon: Package },
  { path: "/dashboard/admin/financials", label: "Profit/Revenue", icon: DollarSign },
  { path: "/dashboard/admin/settings", label: "System Settings", icon: Settings },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header Banner */}
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6" />
              <div>
                <h1 className="font-bold text-lg">Admin Portal</h1>
                <p className="text-xs opacity-80">Restricted Access Area</p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button variant="secondary" size="sm" data-testid="button-back-dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Admin Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-64px)] bg-card border-r hidden md:block">
          <nav className="p-4 space-y-1">
            {adminNavItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <div
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors
                      hover-elevate cursor-pointer
                      ${isActive ? "bg-primary text-primary-foreground" : ""}
                    `}
                    data-testid={`admin-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                </Link>
              );
            })}
            
            <div className="border-t my-4" />
            
            <Link href="/dashboard">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-md hover-elevate cursor-pointer text-muted-foreground">
                <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">Main Dashboard</span>
              </div>
            </Link>
          </nav>
        </aside>

        {/* Mobile Navigation */}
        <div className="md:hidden p-4 border-b w-full overflow-x-auto">
          <div className="flex gap-2">
            {adminNavItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    <item.icon className="h-4 w-4 mr-1" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
