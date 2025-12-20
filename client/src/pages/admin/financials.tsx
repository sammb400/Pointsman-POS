import { useState } from "react";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, ShoppingBag, CreditCard, Banknote, BarChart3, PieChart, Calendar } from "lucide-react";
import { usePOS } from "@/context/pos-context";

export default function AdminFinancials() {
  const { sales, settings } = usePOS();
  const [timeRange, setTimeRange] = useState("all");

  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (timeRange) {
      case "today":
        return saleDate >= startOfDay;
      case "week":
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
        return saleDate >= startOfWeek;
      case "month":
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return saleDate >= startOfMonth;
      default:
        return true;
    }
  });

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalTax = filteredSales.reduce((sum, sale) => sum + sale.tax, 0);
  const totalSalesCount = filteredSales.length;
  const avgTransactionValue = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;

  const cashRevenue = filteredSales
    .filter(s => s.paymentType === "Cash")
    .reduce((sum, sale) => sum + sale.total, 0);
  const cardRevenue = filteredSales
    .filter(s => s.paymentType === "Card")
    .reduce((sum, sale) => sum + sale.total, 0);

  const totalItemsSold = filteredSales.reduce(
    (sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <DollarSign className="h-7 w-7 text-primary" />
              Profit/Revenue Summary
            </h1>
            <p className="text-muted-foreground mt-1">Financial overview and business performance metrics.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Revenue Card */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-muted-foreground mb-2">Total Revenue</p>
                <p className="text-5xl font-bold text-primary">Kes {totalRevenue.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  From {totalSalesCount} completed transactions
                </p>
              </div>
              <div className="p-4 bg-primary/20 rounded-full">
                <TrendingUp className="h-12 w-12 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Sales Count
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalSalesCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Completed transactions</p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Transaction Value
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">Kes {avgTransactionValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Items Sold
              </CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalItemsSold}</div>
              <p className="text-xs text-muted-foreground mt-1">Products sold</p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tax Collected
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">Kes {totalTax.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">{settings.taxRate}% tax rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue by Payment Type */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                Cash Revenue
              </CardTitle>
              <CardDescription>Revenue collected via cash payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">Kes {cashRevenue.toFixed(2)}</div>
              <div className="mt-4 h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all"
                  style={{ width: totalRevenue > 0 ? `${(cashRevenue / totalRevenue) * 100}%` : '0%' }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {totalRevenue > 0 ? ((cashRevenue / totalRevenue) * 100).toFixed(1) : 0}% of total revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Card Revenue
              </CardTitle>
              <CardDescription>Revenue collected via card payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600">Kes {cardRevenue.toFixed(2)}</div>
              <div className="mt-4 h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: totalRevenue > 0 ? `${(cardRevenue / totalRevenue) * 100}%` : '0%' }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {totalRevenue > 0 ? ((cardRevenue / totalRevenue) * 100).toFixed(1) : 0}% of total revenue
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Placeholder Notice */}
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Advanced Analytics Coming Soon</p>
            <p className="text-muted-foreground max-w-md mx-auto mt-2">
              Future updates will include detailed charts, trend analysis, product performance metrics, 
              and exportable financial reports.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
