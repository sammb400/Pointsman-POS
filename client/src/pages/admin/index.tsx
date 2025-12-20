import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Users, Package, DollarSign, Settings, ArrowRight, Shield, AlertTriangle } from "lucide-react";
import { usePOS } from "@/context/pos-context";

export default function AdminPortal() {
  const { employees } = usePOS();

  const adminSections = [
    {
      title: `View All Employees (${employees.length})`,
      description: "Manage employee records, roles, and access permissions",
      icon: Users,
      path: "/dashboard/admin/employees",
      color: "bg-blue-500",
    },
    {
      title: "Stock Details & Reorder",
      description: "Monitor inventory levels and identify products needing restock",
      icon: Package,
      path: "/dashboard/admin/stock",
      color: "bg-green-500",
    },
    {
      title: "Profit/Revenue Summary",
      description: "View financial reports and business performance metrics",
      icon: DollarSign,
      path: "/dashboard/admin/financials",
      color: "bg-yellow-500",
    },
    {
      title: "System Settings",
      description: "Configure application settings and preferences",
      icon: Settings,
      path: "/dashboard/admin/settings",
      color: "bg-purple-500",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Warning Banner */}
        <Card className="border-primary bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Restricted Access Area</p>
                <p className="text-sm text-muted-foreground">
                  This portal contains sensitive business data. In production, access will be restricted to administrators and managers only.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Admin Portal
          </h1>
          <p className="text-muted-foreground mt-1">Access administrative functions and sensitive data views.</p>
        </div>

        {/* Admin Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adminSections.map((section) => (
            <Link key={section.path} href={section.path}>
              <Card className="h-full cursor-pointer hover-elevate active-elevate-2 group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${section.color}`}>
                      <section.icon className="h-6 w-6 text-white" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <CardTitle className="mt-4">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{section.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
