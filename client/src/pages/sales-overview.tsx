import { useState, useMemo } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, Search, Smartphone, Banknote } from "lucide-react";
import { usePOS } from "@/context/pos-context";

export default function SalesOverview() {
  const { sales } = usePOS();
  const [searchTerm, setSearchTerm] = useState("");

  // Group Sales by Month and Date
  const salesByMonth = useMemo(() => {
    const grouped: Record<string, Record<string, typeof sales>> = {};
    
    // Sort sales by date desc
    const sortedSales = [...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Filter by search
    const filtered = sortedSales.filter(s => 
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.total.toString().includes(searchTerm)
    );

    filtered.forEach(sale => {
      const d = new Date(sale.date);
      const monthYear = d.toLocaleString('default', { month: 'long', year: 'numeric' });
      const dayDate = d.toLocaleDateString('default', { weekday: 'short', day: 'numeric', month: 'short' });

      if (!grouped[monthYear]) grouped[monthYear] = {};
      if (!grouped[monthYear][dayDate]) grouped[monthYear][dayDate] = [];
      
      grouped[monthYear][dayDate].push(sale);
    });

    return grouped;
  }, [sales, searchTerm]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold">Sales Overview</h1>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sales History Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {Object.entries(salesByMonth).map(([month, days]) => (
                <div key={month} className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary border-b pb-2 sticky top-0 bg-card z-10">{month}</h3>
                  <div className="space-y-6 pl-2">
                    {Object.entries(days).map(([day, daySales]) => (
                      <div key={day} className="space-y-3">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {day}
                        </h4>
                        <div className="space-y-2">
                          {daySales.map(sale => (
                            <div key={sale.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-sm border">
                              <div className="flex flex-col gap-1">
                                <span className="font-medium">{sale.id.replace("SALE-", "#")}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {sale.items.length} items
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                                  sale.paymentType === 'Cash' 
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}>
                                  {sale.paymentType === 'Cash' ? <Banknote className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
                                  {sale.paymentType}
                                </span>
                                <span className="font-bold w-24 text-right">Kes {sale.total.toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                          <div className="flex justify-end text-xs font-medium text-muted-foreground pt-1 pr-2">
                            Daily Total: Kes {daySales.reduce((acc, s) => acc + s.total, 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {Object.keys(salesByMonth).length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No sales found matching your criteria.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}