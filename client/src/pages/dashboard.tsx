import { useMemo } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Package, TrendingUp, ArrowUpRight, Calendar, CreditCard, Banknote } from "lucide-react";
import { usePOS } from "@/context/pos-context";

export default function Dashboard() {
  const { products, sales, settings } = usePOS();

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalOrders = sales.length;
  const totalProducts = products.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // 1. Sales by Date (Last 7 Days)
  const salesByDate = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      const daySales = sales.filter(s => s.date.startsWith(dateStr));
      const revenue = daySales.reduce((sum, s) => sum + s.total, 0);
      
      days.push({ date: dateStr, dayName, revenue, count: daySales.length });
    }
    return days;
  }, [sales]);

  const maxDailyRevenue = Math.max(...salesByDate.map(d => d.revenue), 100);

  // 2. Top Selling Products
  const topProducts = useMemo(() => {
    const productStats: Record<string, { name: string; quantity: number; revenue: number }> = {};
    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productStats[item.id]) {
          productStats[item.id] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productStats[item.id].quantity += item.quantity;
        productStats[item.id].revenue += (item.price * item.quantity);
      });
    });

    return Object.values(productStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [sales]);

  // 3. Payment Split
  const paymentSplit = useMemo(() => {
    const split = { Cash: 0, Card: 0 };
    sales.forEach(s => {
      if (s.paymentType === "Cash") split.Cash += s.total;
      else if (s.paymentType === "Card") split.Card += s.total;
    });
    return split;
  }, [sales]);

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
  const lowStockProducts = products.filter(p => p.stock <= settings.lowStockThreshold).slice(0, 5);

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

        {/* Sales Chart & Insights Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                Sales Overview (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full flex items-end justify-between gap-2 mt-4">
                {salesByDate.map((day) => (
                  <div key={day.date} className="flex flex-col items-center gap-2 flex-1 group">
                    <div className="relative w-full flex items-end justify-center h-full">
                      <div 
                        className="w-full max-w-[40px] bg-primary/80 rounded-t-md transition-all group-hover:bg-primary relative"
                        style={{ height: `${(day.revenue / maxDailyRevenue) * 100}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border">
                          Kes {day.revenue.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">{day.dayName}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <Banknote className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="font-medium">Cash</span>
                  </div>
                  <span className="font-bold">Kes {paymentSplit.Cash.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-medium">Card</span>
                  </div>
                  <span className="font-bold">Kes {paymentSplit.Card.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No sales yet.</p>
                ) : (
                  topProducts.map((product, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="truncate max-w-[120px]" title={product.name}>{product.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">x{product.quantity}</span>
                        <span className="font-medium">Kes {product.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
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
