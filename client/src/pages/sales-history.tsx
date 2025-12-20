import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Receipt, CreditCard, Banknote, Search, Calendar, DollarSign, ShoppingBag, ChevronDown, ChevronRight } from "lucide-react";
import { usePOS, type Sale } from "@/context/pos-context";
import { useState } from "react";

interface GroupedSales {
  date: string;
  displayDate: string;
  sales: Sale[];
  dailyTotal: number;
}

export default function SalesHistory() {
  const { sales } = usePOS();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"All" | "Cash" | "Card">("All");
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === "All" || sale.paymentType === filterType;
    return matchesSearch && matchesType;
  });

  // Group sales by date
  const groupedSales: GroupedSales[] = filteredSales.reduce((groups: GroupedSales[], sale) => {
    const saleDate = new Date(sale.date);
    const dateKey = saleDate.toISOString().split('T')[0];
    const displayDate = saleDate.toLocaleDateString("en-US", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const existingGroup = groups.find(g => g.date === dateKey);
    if (existingGroup) {
      existingGroup.sales.push(sale);
      existingGroup.dailyTotal += sale.total;
    } else {
      groups.push({
        date: dateKey,
        displayDate,
        sales: [sale],
        dailyTotal: sale.total
      });
    }
    return groups;
  }, []).sort((a, b) => b.date.localeCompare(a.date));

  const toggleDay = (date: string) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedDays(new Set(groupedSales.map(g => g.date)));
  };

  const collapseAll = () => {
    setExpandedDays(new Set());
  };

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = sales.length;
  const cashTransactions = sales.filter(s => s.paymentType === "Cash").length;
  const cardTransactions = sales.filter(s => s.paymentType === "Card").length;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Sales History</h1>
          <p className="text-muted-foreground mt-1">View all completed transactions organized by date.</p>
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
              <div className="text-2xl font-bold text-primary">Kes{totalRevenue.toFixed(2)}</div>
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
          <div className="flex gap-2 flex-wrap">
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
            <div className="border-l mx-2" />
            <Button variant="outline" size="sm" onClick={expandAll}>
              Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              Collapse All
            </Button>
          </div>
        </div>

        {/* Sales by Date */}
        {groupedSales.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No transactions found</p>
                <p className="text-muted-foreground">
                  {sales.length === 0 
                    ? "Complete your first sale to see it here." 
                    : "Try adjusting your search or filter."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {groupedSales.map(group => {
              const isExpanded = expandedDays.has(group.date);
              return (
                <Card key={group.date}>
                  <CardHeader 
                    className="cursor-pointer hover-elevate rounded-t-lg"
                    onClick={() => toggleDay(group.date)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle className="text-lg">{group.displayDate}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {group.sales.length} transaction{group.sales.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">Kes{group.dailyTotal.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Daily Total</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {isExpanded && (
                    <CardContent className="pt-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Time</th>
                              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Transaction ID</th>
                              <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Items</th>
                              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Payment</th>
                              <th className="text-right py-3 px-4 font-medium text-muted-foreground">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.sales.map((sale) => (
                              <tr key={sale.id} className="border-b last:border-0 hover-elevate" data-testid={`sale-row-${sale.id}`}>
                                <td className="py-4 px-4 text-sm">
                                  {formatTime(sale.date)}
                                </td>
                                <td className="py-4 px-4">
                                  <span className="font-mono text-sm">{sale.id}</span>
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
                                  <span className="font-bold">Kes{sale.total.toFixed(2)}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
