import { useState } from "react";
import { usePOS } from "../context/pos-context";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Minus } from "lucide-react";

export default function RestockProduct() {
  const { products, restockProduct } = usePOS();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter products based on search term
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStockChange = async (productId: string, change: number) => {
    try {
      await restockProduct(productId, change);
    } catch (error) {
      console.error("Failed to update stock:", error);
      alert("Failed to update stock. Please try again.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold">Stock Management</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 pb-20">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover-elevate">
              <CardContent className="p-4 text-center flex flex-col h-full justify-between gap-2">
                <div>
                  <div className="h-12 flex items-center justify-center mb-2">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="h-12 w-12 object-cover rounded" />
                    ) : (
                      <span className="text-2xl">
                        {product.category === "Beverages" ? "☕" : 
                         product.category === "Pastries" ? "🥐" : "🍽️"}
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-sm truncate" title={product.name}>{product.name}</h3>
                  <p className="text-muted-foreground text-xs">{product.category}</p>
                  <Badge 
                    variant={product.stock <= 5 ? "destructive" : "outline"} 
                    className="mt-1 text-xs"
                  >
                    {product.stock <= 0 ? "Out of Stock" : `Stock: ${product.stock}`}
                  </Badge>
                </div>

                <div className="flex items-center justify-center gap-2 mt-2 bg-muted/30 p-2 rounded-lg">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleStockChange(product.id, -1)}
                    disabled={product.stock <= 0}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>

                  <div className="flex flex-col items-center min-w-[2rem]">
                    <span className={`font-bold ${product.stock <= 5 ? "text-destructive" : ""}`}>
                      {product.stock}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleStockChange(product.id, 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredProducts.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
              <p className="text-lg">No products found.</p>
              {searchTerm && <p className="text-sm">Try adjusting your search terms.</p>}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}