import { useState, useEffect, useRef } from "react";
import { usePOS } from "../context/pos-context";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Minus, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useZxing } from "react-zxing";

export default function RestockProduct() {
  const { toast } = useToast();
  const { products, restockProduct } = usePOS();
  const [searchTerm, setSearchTerm] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);

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

  const handleScan = async (barcode: string) => {
    const product = products.find((p) => p.barcode === barcode);
    if (product) {
      try {
        await restockProduct(product.id, 1);
        toast({
          title: "Stock Updated",
          description: `Added 1 unit to ${product.name}`,
        });
      } catch (error) {
        console.error("Failed to update stock:", error);
      }
    } else {
      toast({
        title: "Not Found",
        description: `No product found with barcode: ${barcode}`,
        variant: "destructive",
      });
    }
  };

  // Barcode Scanner Logic for USB Scanners
  const barcodeBuffer = useRef("");
  const lastKeyTime = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;

      const currentTime = Date.now();
      if (currentTime - lastKeyTime.current > 2000) {
        barcodeBuffer.current = "";
      }
      lastKeyTime.current = currentTime;

      if (e.key === "Enter") {
        if (barcodeBuffer.current) {
          handleScan(barcodeBuffer.current);
          barcodeBuffer.current = "";
        }
      } else if (e.key.length === 1) {
        barcodeBuffer.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [products]);

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
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setIsScannerOpen(true)}
            title="Scan Barcode with Camera"
          >
            <Camera className="h-4 w-4" />
          </Button>
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

      <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Product Barcode</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            {isScannerOpen && (
              <BarcodeScanner 
                onScan={(barcode) => {
                  handleScan(barcode);
                  setIsScannerOpen(false);
                }} 
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function BarcodeScanner({ onScan }: { onScan: (data: string) => void }) {
  const lastScan = useRef("");
  const lastTime = useRef(0);

  const { ref } = useZxing({
    onDecodeResult(result: any) {
      const text = result.getText();
      const now = Date.now();
      if (text === lastScan.current && now - lastTime.current < 2000) return;
      
      lastScan.current = text;
      lastTime.current = now;
      onScan(text);
    },
  });

  return (
    <div className="relative w-full aspect-square max-w-sm overflow-hidden rounded-lg bg-black">
      <video ref={ref as any} className="w-full h-full object-cover" />
      <div className="absolute inset-0 border-2 border-primary/50 m-12 rounded-lg pointer-events-none animate-pulse" />
    </div>
  );
}