import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function Dashboard() {
  // todo: remove mock functionality - replace with real data from API
  const stats = [
    {
      title: "Total Revenue",
      value: "$12,426",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Total Orders",
      value: "284",
      change: "+8.2%",
      trend: "up",
      icon: ShoppingBag,
    },
    {
      title: "Active Employees",
      value: "12",
      change: "+2",
      trend: "up",
      icon: Users,
    },
    {
      title: "Avg. Order Value",
      value: "$43.75",
      change: "-2.4%",
      trend: "down",
      icon: TrendingUp,
    },
  ];

  // todo: remove mock functionality - replace with real data from API
  const recentOrders = [
    { id: "#001234", customer: "Walk-in", items: 3, total: "$45.99", status: "Completed" },
    { id: "#001233", customer: "Walk-in", items: 1, total: "$12.50", status: "Completed" },
    { id: "#001232", customer: "John D.", items: 5, total: "$89.00", status: "Completed" },
    { id: "#001231", customer: "Walk-in", items: 2, total: "$28.75", status: "Completed" },
    { id: "#001230", customer: "Sarah M.", items: 4, total: "$67.25", status: "Completed" },
  ];

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
                <div className={`flex items-center text-xs mt-1 ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {stat.change} from last month
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Order ID</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Items</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0 hover-elevate">
                      <td className="py-3 px-4 font-medium" data-testid={`order-id-${order.id}`}>{order.id}</td>
                      <td className="py-3 px-4 text-muted-foreground">{order.customer}</td>
                      <td className="py-3 px-4 text-muted-foreground">{order.items}</td>
                      <td className="py-3 px-4 font-medium">{order.total}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
