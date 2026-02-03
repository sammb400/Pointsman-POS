import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Package, Search, AlertTriangle, CheckCircle, XCircle, RefreshCw, Trash2 } from "lucide-react";
import { usePOS, type Product } from "@/context/pos-context";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function AdminStock() {
  const { products, settings, restockProduct, deleteProduct } = usePOS();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "OK" | "Low" | "Critical">("All");
  const [reorderProduct, setReorderProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [reorderAmount, setReorderAmount] = useState("10");

  const lowStockThreshold = settings.lowStockThreshold || 10;

  const getReorderStatus = (stock: number) => {
    if (stock === 0) return "Critical";
    if (settings.enableLowStockAlerts && stock <= lowStockThreshold) return "Low";
    return "OK";
  };

  const productsWithStatus = products.map(p => ({
    ...p,
    reorderStatus: getReorderStatus(p.stock)
  }));

  const filteredProducts = productsWithStatus.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "All" || product.reorderStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const criticalCount = productsWithStatus.filter(p => p.reorderStatus === "Critical").length;
  const lowCount = productsWithStatus.filter(p => p.reorderStatus === "Low").length;
  const okCount = productsWithStatus.filter(p => p.reorderStatus === "OK").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Critical":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Critical
          </Badge>
        );
      case "Low":
        return (
          <Badge className="bg-yellow-500 text-white gap-1">
            <AlertTriangle className="h-3 w-3" />
            Low
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
            <CheckCircle className="h-3 w-3" />
            OK
          </Badge>
        );
    }
  };

  const handleReorderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reorderProduct) return;
    
    const amount = parseInt(reorderAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid quantity.", variant: "destructive" });
      return;
    }

    try {
      await restockProduct(reorderProduct.id, amount);
      toast({
        title: "Stock Updated",
        description: `Added ${amount} units to ${reorderProduct.name}.`,
      });
      setReorderProduct(null);
      setReorderAmount("10");
    } catch (error) {
      toast({ title: "Error", description: "Failed to update stock.", variant: "destructive" });
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete.id);
      toast({ title: "Product Deleted", description: `${productToDelete.name} has been removed from inventory.` });
      setProductToDelete(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete product.", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-7 w-7 text-primary" />
            Stock Details & Reorder
          </h1>
          <p className="text-muted-foreground mt-1">Monitor inventory levels and identify products needing restocking.</p>
        </div>

        {/* Status Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card 
            className={`cursor-pointer hover-elevate ${filterStatus === "Critical" ? "ring-2 ring-primary" : ""}`}
            onClick={() => setFilterStatus(filterStatus === "Critical" ? "All" : "Critical")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical (Out of Stock)</p>
                  <p className="text-3xl font-bold text-red-500">{criticalCount}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer hover-elevate ${filterStatus === "Low" ? "ring-2 ring-primary" : ""}`}
            onClick={() => setFilterStatus(filterStatus === "Low" ? "All" : "Low")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock (≤{lowStockThreshold})</p>
                  <p className="text-3xl font-bold text-yellow-500">{lowCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer hover-elevate ${filterStatus === "OK" ? "ring-2 ring-primary" : ""}`}
            onClick={() => setFilterStatus(filterStatus === "OK" ? "All" : "OK")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Stock OK</p>
                  <p className="text-3xl font-bold text-green-500">{okCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-stock"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setFilterStatus("All")}
            className={filterStatus === "All" ? "bg-primary text-primary-foreground" : ""}
          >
            Show All
          </Button>
        </div>

        {/* Stock Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Inventory Details ({filteredProducts.length} products)</CardTitle>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product Name</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Price</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Current Quantity</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Reorder Status</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr 
                      key={product.id} 
                      className={`border-b last:border-0 hover-elevate ${
                        product.reorderStatus === "Critical" ? "bg-red-50 dark:bg-red-950/20" : 
                        product.reorderStatus === "Low" ? "bg-yellow-50 dark:bg-yellow-950/20" : ""
                      }`}
                      data-testid={`stock-row-${product.id}`}
                    >
                      <td className="py-4 px-4">
                        <div className="font-medium">{product.name}</div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline">{product.category}</Badge>
                      </td>
                      <td className="py-4 px-4 font-medium">
                        Kes {product.price.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`font-bold text-lg ${
                          product.stock === 0 ? "text-red-500" :
                          product.stock <= lowStockThreshold ? "text-yellow-600" : ""
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {getStatusBadge(product.reorderStatus)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant={product.reorderStatus === "Critical" ? "default" : "outline"}
                            data-testid={`button-reorder-${product.id}`}
                            onClick={() => setReorderProduct(product)}
                          >
                            Reorder
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setProductToDelete(product)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reorder Dialog */}
      <Dialog open={!!reorderProduct} onOpenChange={(open) => !open && setReorderProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reorder Stock</DialogTitle>
          </DialogHeader>
          {reorderProduct && (
            <form onSubmit={handleReorderSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Product</Label>
                <div className="font-medium">{reorderProduct.name}</div>
                <div className="text-sm text-muted-foreground">Current Stock: {reorderProduct.stock}</div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorder-amount">Quantity to Add</Label>
                <Input
                  id="reorder-amount"
                  type="number"
                  min="1"
                  value={reorderAmount}
                  onChange={(e) => setReorderAmount(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Confirm Reorder</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete <strong>{productToDelete?.name}</strong>? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setProductToDelete(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteProduct}>Delete</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
