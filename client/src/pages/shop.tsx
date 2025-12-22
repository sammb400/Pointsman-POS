import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, X, CheckCircle2, AlertCircle, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePOS } from "@/context/pos-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useZxing } from "react-zxing";

export default function Shop() {
  const { toast } = useToast();
  const { products, cart, addToCart, updateCartQuantity, removeFromCart, clearCart, finalizeSale, getCartTotals, settings, scanBarcode } = usePOS();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [paymentType, setPaymentType] = useState<"Cash" | "Card">("Cash");
  const [amountTendered, setAmountTendered] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  
  // Barcode Scanner Logic
  const barcodeBuffer = useRef("");
  const lastKeyTime = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore input if the user is typing in a search box or input field
      if ((e.target as HTMLElement).tagName === "INPUT") return;

      const currentTime = Date.now();
      // If more than 2 seconds have passed since the last keypress, reset buffer
      // This prevents accidental stray keys from ruining a scan
      if (currentTime - lastKeyTime.current > 2000) {
        barcodeBuffer.current = "";
      }
      lastKeyTime.current = currentTime;

      if (e.key === "Enter") {
        if (barcodeBuffer.current) {
          const success = scanBarcode(barcodeBuffer.current);
          if (success) {
            toast({ title: "Item Scanned", description: `Added product to cart.` });
          } else {
            toast({ title: "Not Found", description: `No product found with barcode: ${barcodeBuffer.current}`, variant: "destructive" });
          }
          barcodeBuffer.current = ""; // Clear buffer
        }
      } else if (e.key.length === 1) {
        barcodeBuffer.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scanBarcode, toast]);

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const { subtotal, tax, total } = getCartTotals();
  const tenderedAmount = parseFloat(amountTendered) || 0;
  const changeDue = paymentType === "Cash" ? tenderedAmount - total : 0;
  const canFinalize = cart.length > 0 && (paymentType === "Card" || tenderedAmount >= total);

  const handleFinalizeSale = async () => {
    if (!canFinalize) {
      toast({
        title: "Cannot Complete Sale",
        description: paymentType === "Cash" 
          ? "Amount tendered must be equal or greater than total." 
          : "Cart is empty.",
        variant: "destructive",
      });
      return;
    }

    // Pass the current cart to finalizeSale so it can update stock
    const sale = await finalizeSale(
      cart, 
      paymentType, 
      paymentType === "Cash" ? tenderedAmount : undefined);
    
    if (sale) {
      toast({
        title: "Sale Complete!",
        description: `Transaction ${sale.id} - Kes ${sale.total.toFixed(2)} via ${paymentType}${
          paymentType === "Cash" && sale.changeDue ? ` | Change: Kes ${sale.changeDue.toFixed(2)}` : ""
        }`,
      });
      setAmountTendered("");
      setShowCheckout(false);
    }
  };

  const handleAddToCart = (product: typeof products[0]) => {
    if (product.stock <= 0) {
      toast({
        title: "Out of Stock",
        description: `${product.name} is currently out of stock.`,
        variant: "destructive",
      });
      return;
    }

    const cartItem = cart.find(item => item.id === product.id);
    if (cartItem && cartItem.quantity >= product.stock) {
      toast({
        title: "Stock Limit Reached",
        description: `Only ${product.stock} units of ${product.name} available.`,
        variant: "destructive",
      });
      return;
    }

    addToCart(product);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Shop / POS</h1>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search and Categories */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-products"
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
              <div className="flex gap-2 flex-wrap">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    data-testid={`button-category-${category.toLowerCase()}`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredProducts.map(product => (
                <Card
                  key={product.id}
                  className={`cursor-pointer hover-elevate active-elevate-2 ${product.stock <= 0 ? "opacity-50" : ""}`}
                  onClick={() => handleAddToCart(product)}
                  data-testid={`product-card-${product.id}`}
                >
                  <CardContent className="p-4 text-center">
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
                    <h3 className="font-medium text-sm truncate">{product.name}</h3>
                    <p className="text-primary font-bold">Kes {product.price.toFixed(2)}</p>
                    <Badge 
                      variant={product.stock <= 5 ? "destructive" : "outline"} 
                      className="mt-1 text-xs"
                    >
                      {product.stock <= 0 ? "Out of Stock" : `Stock: ${product.stock}`}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Cart & Checkout Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>{showCheckout ? "Checkout" : "Current Order"}</CardTitle>
                  {cart.length > 0 && !showCheckout && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearCart}
                      data-testid="button-clear-cart"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                  {showCheckout && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowCheckout(false)}
                      data-testid="button-back-to-cart"
                    >
                      Back
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showCheckout ? (
                  <>
                    {/* Cart Items */}
                    <div className="max-h-[300px] overflow-y-auto space-y-2">
                      {cart.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          Cart is empty. Tap products to add.
                        </p>
                      ) : (
                        cart.map(item => (
                          <div 
                            key={item.id} 
                            className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                            data-testid={`cart-item-${item.id}`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{item.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Kes {item.price.toFixed(2)} x {item.quantity} = Kes {(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updateCartQuantity(item.id, -1)}
                                data-testid={`button-decrease-${item.id}`}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updateCartQuantity(item.id, 1)}
                                data-testid={`button-increase-${item.id}`}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => removeFromCart(item.id)}
                                data-testid={`button-remove-${item.id}`}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Totals */}
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>Kes {subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax ({settings.taxRate}%)</span>
                        <span>Kes {tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total</span>
                        <span className="text-primary">Kes {total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Proceed to Checkout */}
                    <Button 
                      className="w-full h-12"
                      disabled={cart.length === 0}
                      onClick={() => setShowCheckout(true)}
                      data-testid="button-proceed-checkout"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Proceed to Checkout
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Checkout Panel */}
                    <div className="space-y-4">
                      {/* Order Summary */}
                      <div className="p-3 bg-muted/50 rounded-md">
                        <p className="text-sm font-medium mb-2">Order Summary</p>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Items ({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
                            <span>Kes {subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tax</span>
                            <span>Kes {tax.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-bold pt-1 border-t">
                            <span>Total</span>
                            <span className="text-primary">Kes {total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Type Selection */}
                      <div className="space-y-2">
                        <Label>Payment Type</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant={paymentType === "Cash" ? "default" : "outline"}
                            className="h-12"
                            onClick={() => setPaymentType("Cash")}
                            data-testid="button-payment-cash"
                          >
                            <Banknote className="h-4 w-4 mr-2" />
                            Cash
                          </Button>
                          <Button
                            variant={paymentType === "Card" ? "default" : "outline"}
                            className="h-12"
                            onClick={() => setPaymentType("Card")}
                            data-testid="button-payment-card"
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Card
                          </Button>
                        </div>
                      </div>

                      {/* Cash Payment - Amount Tendered */}
                      {paymentType === "Cash" && (
                        <div className="space-y-2">
                          <Label htmlFor="amountTendered">Amount Tendered</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Kes</span>
                            <Input
                              id="amountTendered"
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={amountTendered}
                              onChange={(e) => setAmountTendered(e.target.value)}
                              className="pl-12 h-12 text-lg"
                              data-testid="input-amount-tendered"
                            />
                          </div>
                          
                          {/* Quick Amount Buttons */}
                          <div className="grid grid-cols-4 gap-1">
                            {[Math.ceil(total), Math.ceil(total / 5) * 5, Math.ceil(total / 10) * 10, Math.ceil(total / 20) * 20].map((amount, i) => (
                              <Button
                                key={i}
                                variant="outline"
                                size="sm"
                                onClick={() => setAmountTendered(amount.toString())}
                                data-testid={`button-quick-amount-${amount}`}
                              >
                                Kes {amount}
                              </Button>
                            ))}
                          </div>

                          {/* Change Due */}
                          <div className={`p-3 rounded-md ${changeDue >= 0 ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Change Due:</span>
                              <span className={`text-xl font-bold ${changeDue >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                Kes {Math.max(0, changeDue).toFixed(2)}
                              </span>
                            </div>
                            {changeDue < 0 && (
                              <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 mt-1">
                                <AlertCircle className="h-3 w-3" />
                                <span>Amount insufficient by Kes {Math.abs(changeDue).toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Card Payment Message */}
                      {paymentType === "Card" && (
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm text-blue-600 dark:text-blue-400">
                              Card payment will be processed
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Finalize Sale Button */}
                      <Button 
                        className="w-full h-14 text-lg"
                        disabled={!canFinalize}
                        onClick={handleFinalizeSale}
                        data-testid="button-finalize-sale"
                      >
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        Finalize Sale - Kes {total.toFixed(2)}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
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
                  const success = scanBarcode(barcode);
                  if (success) {
                    toast({ title: "Item Scanned", description: "Product added to cart." });
                    setIsScannerOpen(false); // Close on success
                  } else {
                    toast({ title: "Not Found", description: `Unknown barcode: ${barcode}`, variant: "destructive" });
                  }
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
  const [lastScan, setLastScan] = useState("");
  const [lastTime, setLastTime] = useState(0);

  const { ref } = useZxing({
    onResult(result) {
      const text = result.getText();
      const now = Date.now();
      // Prevent duplicate scans of the same code within 2 seconds
      if (text === lastScan && now - lastTime < 2000) return;
      
      setLastScan(text);
      setLastTime(now);
      onScan(text);
    },
  });

  return (
    <div className="relative w-full aspect-square max-w-sm overflow-hidden rounded-lg bg-black">
      <video ref={ref} className="w-full h-full object-cover" />
      <div className="absolute inset-0 border-2 border-primary/50 m-12 rounded-lg pointer-events-none animate-pulse" />
    </div>
  );
}
