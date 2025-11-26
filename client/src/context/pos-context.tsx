import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
  description?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Sale {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentType: "Cash" | "Card";
  amountTendered?: number;
  changeDue?: number;
}

interface POSContextType {
  products: Product[];
  cart: CartItem[];
  sales: Sale[];
  addProduct: (product: Omit<Product, "id">) => void;
  updateProductStock: (productId: number, newStock: number) => void;
  addToCart: (product: Product) => void;
  updateCartQuantity: (productId: number, delta: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  finalizeSale: (paymentType: "Cash" | "Card", amountTendered?: number) => Sale | null;
  getCartTotals: () => { subtotal: number; tax: number; total: number };
}

const POSContext = createContext<POSContextType | undefined>(undefined);

const STORAGE_KEYS = {
  products: "pos_products",
  sales: "pos_sales",
};

// Initial mock products
const initialProducts: Product[] = [
  { id: 1, name: "Espresso", price: 3.50, category: "Beverages", stock: 100, image: "" },
  { id: 2, name: "Cappuccino", price: 4.50, category: "Beverages", stock: 80, image: "" },
  { id: 3, name: "Latte", price: 4.75, category: "Beverages", stock: 90, image: "" },
  { id: 4, name: "Mocha", price: 5.25, category: "Beverages", stock: 60, image: "" },
  { id: 5, name: "Croissant", price: 3.25, category: "Pastries", stock: 25, image: "" },
  { id: 6, name: "Muffin", price: 2.95, category: "Pastries", stock: 30, image: "" },
  { id: 7, name: "Bagel", price: 2.50, category: "Pastries", stock: 40, image: "" },
  { id: 8, name: "Cookie", price: 1.95, category: "Pastries", stock: 50, image: "" },
  { id: 9, name: "Sandwich", price: 7.95, category: "Food", stock: 20, image: "" },
  { id: 10, name: "Salad", price: 8.50, category: "Food", stock: 15, image: "" },
  { id: 11, name: "Soup", price: 5.95, category: "Food", stock: 18, image: "" },
  { id: 12, name: "Water", price: 1.50, category: "Beverages", stock: 200, image: "" },
];

export function POSProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.products);
    return stored ? JSON.parse(stored) : initialProducts;
  });

  const [cart, setCart] = useState<CartItem[]>([]);

  const [sales, setSales] = useState<Sale[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.sales);
    return stored ? JSON.parse(stored) : [];
  });

  // Persist products to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
  }, [products]);

  // Persist sales to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.sales, JSON.stringify(sales));
  }, [sales]);

  const addProduct = (product: Omit<Product, "id">) => {
    const newId = Math.max(...products.map(p => p.id), 0) + 1;
    const newProduct: Product = { ...product, id: newId };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProductStock = (productId: number, newStock: number) => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, stock: newStock } : p))
    );
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        // Check if we have enough stock
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: number, delta: number) => {
    setCart(prev => {
      const product = products.find(p => p.id === productId);
      return prev
        .map(item => {
          if (item.id === productId) {
            const newQuantity = item.quantity + delta;
            // Check stock limit when increasing
            if (delta > 0 && product && newQuantity > product.stock) {
              return item;
            }
            return { ...item, quantity: Math.max(0, newQuantity) };
          }
          return item;
        })
        .filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const finalizeSale = (paymentType: "Cash" | "Card", amountTendered?: number): Sale | null => {
    if (cart.length === 0) return null;

    const { subtotal, tax, total } = getCartTotals();
    
    // Calculate change for cash payments
    const changeDue = paymentType === "Cash" && amountTendered 
      ? amountTendered - total 
      : 0;

    // Create sale record
    const sale: Sale = {
      id: `SALE-${Date.now()}`,
      date: new Date().toISOString(),
      items: [...cart],
      subtotal,
      tax,
      total,
      paymentType,
      amountTendered: paymentType === "Cash" ? amountTendered : undefined,
      changeDue: paymentType === "Cash" ? changeDue : undefined,
    };

    // Reduce stock for each item sold
    cart.forEach(item => {
      const product = products.find(p => p.id === item.id);
      if (product) {
        updateProductStock(product.id, product.stock - item.quantity);
      }
    });

    // Add to sales history
    setSales(prev => [sale, ...prev]);

    // Clear the cart
    clearCart();

    return sale;
  };

  return (
    <POSContext.Provider
      value={{
        products,
        cart,
        sales,
        addProduct,
        updateProductStock,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        finalizeSale,
        getCartTotals,
      }}
    >
      {children}
    </POSContext.Provider>
  );
}

export function usePOS() {
  const context = useContext(POSContext);
  if (context === undefined) {
    throw new Error("usePOS must be used within a POSProvider");
  }
  return context;
}
