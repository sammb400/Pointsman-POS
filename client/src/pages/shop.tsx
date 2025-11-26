import { useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

export default function Shop() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // todo: remove mock functionality - replace with real data from API
  const products: Product[] = [
    { id: 1, name: "Espresso", price: 3.50, category: "Beverages", stock: 100 },
    { id: 2, name: "Cappuccino", price: 4.50, category: "Beverages", stock: 80 },
    { id: 3, name: "Latte", price: 4.75, category: "Beverages", stock: 90 },
    { id: 4, name: "Mocha", price: 5.25, category: "Beverages", stock: 60 },
    { id: 5, name: "Croissant", price: 3.25, category: "Pastries", stock: 25 },
    { id: 6, name: "Muffin", price: 2.95, category: "Pastries", stock: 30 },
    { id: 7, name: "Bagel", price: 2.50, category: "Pastries", stock: 40 },
    { id: 8, name: "Cookie", price: 1.95, category: "Pastries", stock: 50 },
    { id: 9, name: "Sandwich", price: 7.95, category: "Food", stock: 20 },
    { id: 10, name: "Salad", price: 8.50, category: "Food", stock: 15 },
    { id: 11, name: "Soup", price: 5.95, category: "Food", stock: 18 },
    { id: 12, name: "Water", price: 1.50, category: "Beverages", stock: 200 },
  ];

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev =>
      prev
        .map(item =>
          item.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleCheckout = (method: string) => {
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to the cart before checkout.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Order Complete!",
      description: `Payment of $${total.toFixed(2)} received via ${method}.`,
    });
    clearCart();
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
                  className="cursor-pointer hover-elevate active-elevate-2"
                  onClick={() => addToCart(product)}
                  data-testid={`product-card-${product.id}`}
                >
                  <CardContent className="p-4 text-center">
                    <div className="h-12 flex items-center justify-center mb-2">
                      <span className="text-2xl">
                        {product.category === "Beverages" ? "☕" : 
                         product.category === "Pastries" ? "🥐" : "🍽️"}
                      </span>
                    </div>
                    <h3 className="font-medium text-sm truncate">{product.name}</h3>
                    <p className="text-primary font-bold">${product.price.toFixed(2)}</p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      Stock: {product.stock}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Current Order</CardTitle>
                  {cart.length > 0 && (
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
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
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
                            ${item.price.toFixed(2)} each
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, -1)}
                            data-testid={`button-decrease-${item.id}`}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, 1)}
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
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    className="h-12"
                    onClick={() => handleCheckout("Cash")}
                    data-testid="button-pay-cash"
                  >
                    <Banknote className="h-4 w-4 mr-2" />
                    Cash
                  </Button>
                  <Button 
                    className="h-12"
                    onClick={() => handleCheckout("Card")}
                    data-testid="button-pay-card"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Card
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
