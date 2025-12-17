import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useAuth } from "./auth-context";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, doc, updateDoc, writeBatch } from "firebase/firestore";

export interface Product {
  id: string; // Firestore uses string IDs
  name: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
  description?: string;
  addedByUid: string;
  addedByEmail: string;
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
  addProduct: (product: Omit<Product, "id" | "addedByUid" | "addedByEmail">) => Promise<void>;
  updateProductStock: (productId: string, newStock: number) => Promise<void>;
  addToCart: (product: Product) => void;
  updateCartQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  finalizeSale: (paymentType: "Cash" | "Card", amountTendered?: number) => Sale | null;
  getCartTotals: () => { subtotal: number; tax: number; total: number };
}

const POSContext = createContext<POSContextType | undefined>(undefined);

const STORAGE_KEYS = {
  products: "pos_products",
  sales: "pos_sales",
};

export function POSProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [sales, setSales] = useState<Sale[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.sales);
    return stored ? JSON.parse(stored) : [];
  });

  // Fetch products from Firestore in real-time
  useEffect(() => {
    if (!currentUser) {
      setProducts([]);
      return;
    }

    const productsCollection = collection(db, "businesses", currentUser.uid, "products");
    const unsubscribe = onSnapshot(productsCollection, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Product));
      setProducts(productsData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Persist sales to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.sales, JSON.stringify(sales));
  }, [sales]);

  const addProduct = async (product: Omit<Product, "id" | "addedByUid" | "addedByEmail">) => {
    if (!currentUser) throw new Error("No user logged in to add product.");

    const productData = {
      ...product,
      addedByUid: currentUser.uid,
      addedByEmail: currentUser.email || "Unknown", // Fallback if email is not available
    };
    const productsCollection = collection(db, "businesses", currentUser.uid, "products");
    await addDoc(productsCollection, productData);
  };

  const updateProductStock = async (productId: string, newStock: number) => {
    if (!currentUser) throw new Error("No user logged in to update stock.");
    const productDoc = doc(db, "businesses", currentUser.uid, "products", productId);
    await updateDoc(productDoc, { stock: newStock });
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

  const updateCartQuantity = (productId: string, delta: number) => {
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

  const removeFromCart = (productId: string) => {
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
