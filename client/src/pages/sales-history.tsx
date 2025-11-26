import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Receipt, CreditCard, Banknote, Search, Calendar, DollarSign, ShoppingBag } from "lucide-react";
import { usePOS } from "@/context/pos-context";
import { useState } from "react";

export default function SalesHistory() {
  const { sales } = usePOS();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"All" | "Cash" | "Card">("All");

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === "All" || sale.paymentType === filterType;
    return matchesSearch && matchesType;
  });

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = sales.length;
  const cashTransactions = sales.filter(s => s.paymentType === "Cash").length;
  const cardTransactions = sales.filter(s => s.paymentType === "Card").length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Sales History</h1>
          <p className="text-muted-foreground mt-1">View all completed transactions and sales reports.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">From all transactions</p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Transactions
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTransactions}</div>
              <p className="text-xs text-muted-foreground mt-1">Completed sales</p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Cash Payments
              </CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cashTransactions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalTransactions > 0 ? ((cashTransactions / totalTransactions) * 100).toFixed(0) : 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Card Payments
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cardTransactions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalTransactions > 0 ? ((cardTransactions / totalTransactions) * 100).toFixed(0) : 0}% of total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by transaction ID or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-sales"
            />
          </div>
          <div className="flex gap-2">
            {(["All", "Cash", "Card"] as const).map(type => (
              <Button
                key={type}
                variant={filterType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType(type)}
                data-testid={`button-filter-${type.toLowerCase()}`}
              >
                {type === "Cash" && <Banknote className="h-4 w-4 mr-1" />}
                {type === "Card" && <CreditCard className="h-4 w-4 mr-1" />}
                {type}
              </Button>
            ))}
          </div>
        </div>

        {/* Sales Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSales.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No transactions found</p>
                <p className="text-muted-foreground">
                  {sales.length === 0 
                    ? "Complete your first sale to see it here." 
                    : "Try adjusting your search or filter."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Transaction ID</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date & Time</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Items</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Payment</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map((sale) => (
                      <tr key={sale.id} className="border-b last:border-0 hover-elevate" data-testid={`sale-row-${sale.id}`}>
                        <td className="py-4 px-4">
                          <span className="font-mono text-sm">{sale.id}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(sale.date)}
                          </div>
                        </td>
                        <td className="py-4 px-4 hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {sale.items.slice(0, 3).map((item, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {item.name} x{item.quantity}
                              </Badge>
                            ))}
                            {sale.items.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{sale.items.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge 
                            variant={sale.paymentType === "Cash" ? "outline" : "default"}
                            className="gap-1"
                          >
                            {sale.paymentType === "Cash" ? (
                              <Banknote className="h-3 w-3" />
                            ) : (
                              <CreditCard className="h-3 w-3" />
                            )}
                            {sale.paymentType}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="font-bold text-primary">${sale.total.toFixed(2)}</span>
                          {sale.paymentType === "Cash" && sale.changeDue !== undefined && sale.changeDue > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Change: ${sale.changeDue.toFixed(2)}
                            </p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
