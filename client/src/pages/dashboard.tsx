import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Package, TrendingUp, ArrowUpRight } from "lucide-react";
import { usePOS } from "@/context/pos-context";

export default function Dashboard() {
  const { products, sales } = usePOS();

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalOrders = sales.length;
  const totalProducts = products.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const stats = [
    {
      title: "Total Revenue",
      value: `Kes ${totalRevenue.toFixed(2)}`,
      change: `${totalOrders} sales`,
      icon: DollarSign,
    },
    {
      title: "Total Orders",
      value: totalOrders.toString(),
      change: "Completed",
      icon: ShoppingBag,
    },
    {
      title: "Products",
      value: totalProducts.toString(),
      change: "In inventory",
      icon: Package,
    },
    {
      title: "Avg. Order Value",
      value: `Kes ${avgOrderValue.toFixed(2)}`,
      change: "Per transaction",
      icon: TrendingUp,
    },
  ];

  // Get recent orders from sales
  const recentOrders = sales.slice(0, 5).map(sale => ({
    id: sale.id.replace("SALE-", "#"),
    customer: "Walk-in",
    items: sale.items.reduce((sum, item) => sum + item.quantity, 0),
    total: `Kes ${sale.total.toFixed(2)}`,
    status: "Completed",
    paymentType: sale.paymentType,
  }));

  // Low stock products
  const lowStockProducts = products.filter(p => p.stock <= 10).slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your business overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs mt-1 text-muted-foreground">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  {stat.change}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No orders yet. Complete your first sale!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground text-sm">Order ID</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground text-sm">Items</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground text-sm">Total</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="border-b last:border-0 hover-elevate">
                          <td className="py-3 px-2 font-medium text-sm" data-testid={`order-id-${order.id}`}>{order.id}</td>
                          <td className="py-3 px-2 text-muted-foreground text-sm">{order.items}</td>
                          <td className="py-3 px-2 font-medium text-sm">{order.total}</td>
                          <td className="py-3 px-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alert</CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>All products are well stocked!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lowStockProducts.map((product) => (
                    <div 
                      key={product.id} 
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                      data-testid={`low-stock-${product.id}`}
                    >
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.stock === 0 
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" 
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}>
                          {product.stock === 0 ? "Out of Stock" : `${product.stock} left`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
