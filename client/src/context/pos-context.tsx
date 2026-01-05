import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react";
import { useAuth } from "./auth-context";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, doc, updateDoc, writeBatch, setDoc, collectionGroup, query, where, getDocs, getDoc, increment, deleteDoc } from "firebase/firestore";

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
  barcode?: string;
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
  paymentType: "Cash" | "M-Pesa";
  amountTendered?: number;
  changeDue?: number;
  soldByUid: string;
  soldByEmail: string;
}

export interface DashboardSummary {
  today: {
    revenue: number;
    transactions: number;
  };
  week: {
    revenue: number;
    transactions: number;
  };
  lowStockItems: Product[];
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
}

export interface Settings {
  storeName: string;
  currency: string;
  taxRate: number;
  themeColor: string;
  enableNotifications: boolean;
  enableLowStockAlerts: boolean;
  lowStockThreshold: number;
  requireManagerApproval: boolean;
}

interface POSContextType {
  products: Product[];
  cart: CartItem[];
  sales: Sale[];
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  addProduct: (product: Omit<Product, "id" | "addedByUid" | "addedByEmail">) => Promise<void>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  updateProductStock: (productId: string, newStock: number) => Promise<void>;
  restockProduct: (productId: string, amount: number) => Promise<void>;
  addToCart: (product: Product) => void;
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, "id">) => Promise<void>;
  updateEmployeeStatus: (employeeId: string, status: string) => Promise<void>;
  scanBarcode: (barcode: string) => boolean;
  updateCartQuantity: (productId: string, change: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  finalizeSale: (cart: CartItem[], paymentType: "Cash" | "M-Pesa", amountTendered?: number) => Promise<Sale | null>;
  getCartTotals: () => { subtotal: number; tax: number; total: number };
  getDashboardSummary: () => DashboardSummary;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

const STORAGE_KEYS = {
  cart: "pos_cart",
  sales: "pos_sales",
};

export function POSProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [settings, setSettings] = useState<Settings>({
    storeName: "ModernPOS Store",
    currency: "KES",
    taxRate: 16,
    themeColor: "#FF6347", // Default Tomato
    enableNotifications: true,
    enableLowStockAlerts: true,
    lowStockThreshold: 10,
    requireManagerApproval: false,
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.cart);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
      return [];
    }
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.sales);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load sales from localStorage:", error);
      return [];
    }
  });

  // Determine the correct business ID (Owner UID)
  useEffect(() => {
    const resolveBusinessId = async () => {
      try {
        if (!currentUser) {
          setBusinessId(null);
          return;
        }

        // 1. Check if the current user is an owner
        const businessDocRef = doc(db, "businesses", currentUser.uid);
        const businessDocSnap = await getDoc(businessDocRef);
        
        if (businessDocSnap.exists()) {
          // Only treat as owner if the document has a valid business name.
          // Employees created via signup will have an empty businessName.
          const data = businessDocSnap.data();
          if (data.businessName) {
            setBusinessId(currentUser.uid);
            return;
          }
        }

        // 2. Check if the current user is an employee
        if (currentUser.email) {
          const q = query(collectionGroup(db, "employees"), where("email", "==", currentUser.email.toLowerCase()));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const employeeDoc = querySnapshot.docs[0];
            const employeeData = employeeDoc.data();

            const ownerUid = employeeDoc.ref.parent.parent?.id;
            if (ownerUid) setBusinessId(ownerUid);
          }
        }
      } catch (error) {
        console.error("Failed to resolve business ID:", error);
      }
    };

    resolveBusinessId();
  }, [currentUser]);

  // Fetch products from Firestore in real-time
  useEffect(() => {
    if (!currentUser || !businessId) {
      setProducts([]);
      setEmployees([]);
      setSales([]);
      return;
    }

    // Fetch Products
    const productsCollection = collection(db, "businesses", businessId, "products");
    const unsubscribeProducts = onSnapshot(productsCollection, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Product));
      setProducts(productsData);
    });

    // Fetch Employees
    const employeesCollection = collection(db, "businesses", businessId, "employees");
    const unsubscribeEmployees = onSnapshot(employeesCollection, (snapshot) => {
      const employeesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Employee));
      setEmployees(employeesData);
    });

    // Fetch Settings
    const businessDoc = doc(db, "businesses", businessId);
    const unsubscribeSettings = onSnapshot(businessDoc, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        if (data.settings) {
          setSettings(prev => ({ ...prev, ...data.settings }));
        }
      }
    });

    // Fetch Sales
    const salesCollection = collection(db, "businesses", businessId, "sales");
    const unsubscribeSales = onSnapshot(salesCollection, (snapshot) => {
      const salesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Sale));
      // Sort by date descending (newest first)
      salesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setSales(salesData);
      try {
        localStorage.setItem(STORAGE_KEYS.sales, JSON.stringify(salesData));
      } catch (error) {
        console.error("Failed to save sales to localStorage:", error);
      }
    });

    return () => {
      unsubscribeProducts();
      unsubscribeEmployees();
      unsubscribeSettings();
      unsubscribeSales();
    };
  }, [currentUser, businessId]);

  // Apply Theme Color Globally
  useEffect(() => {
    const applyTheme = (hex: string) => {
      // Helper to convert Hex to HSL for Tailwind CSS variables
      let r = 0, g = 0, b = 0;
      if (hex.length === 4) {
        r = parseInt("0x" + hex[1] + hex[1]);
        g = parseInt("0x" + hex[2] + hex[2]);
        b = parseInt("0x" + hex[3] + hex[3]);
      } else if (hex.length === 7) {
        r = parseInt("0x" + hex[1] + hex[2]);
        g = parseInt("0x" + hex[3] + hex[4]);
        b = parseInt("0x" + hex[5] + hex[6]);
      }
      
      r /= 255; g /= 255; b /= 255;
      const cmin = Math.min(r,g,b), cmax = Math.max(r,g,b), delta = cmax - cmin;
      let h = 0, s = 0, l = 0;
      
      if (delta === 0) h = 0;
      else if (cmax === r) h = ((g - b) / delta) % 6;
      else if (cmax === g) h = (b - r) / delta + 2;
      else h = (r - g) / delta + 4;
      
      h = Math.round(h * 60);
      if (h < 0) h += 360;
      l = (cmax + cmin) / 2;
      s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
      
      const hslValue = `${h} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
      document.documentElement.style.setProperty('--primary', hslValue);
      document.documentElement.style.setProperty('--ring', hslValue);
    };

    if (settings.themeColor) {
      applyTheme(settings.themeColor);
    }
  }, [settings.themeColor]);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  }, [cart]);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (!currentUser || !businessId) return;
    const businessDoc = doc(db, "businesses", businessId);
    // Merge with existing settings in Firestore
    await setDoc(businessDoc, { settings: newSettings }, { merge: true });
    // State will update automatically via the onSnapshot listener
  };

  const addProduct = async (product: Omit<Product, "id" | "addedByUid" | "addedByEmail">) => {
    if (!currentUser || !businessId) throw new Error("No user logged in to add product.");

    // Check if product with same barcode exists
    if (product.barcode) {
      const existingProduct = products.find(p => p.barcode === product.barcode);
      if (existingProduct) {
        // If it exists, update the stock instead of creating a duplicate
        await restockProduct(existingProduct.id, product.stock);
        return;
      }
    }

    const productData = {
      ...product,
      addedByUid: currentUser.uid,
      addedByEmail: currentUser.email || "Unknown", // Fallback if email is not available
    };
    const productsCollection = collection(db, "businesses", businessId, "products");
    await addDoc(productsCollection, productData);
  };

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    if (!currentUser || !businessId) throw new Error("No user logged in to update product.");
    const productDoc = doc(db, "businesses", businessId, "products", productId);
    await updateDoc(productDoc, updates);
  };

  const deleteProduct = async (productId: string) => {
    if (!currentUser || !businessId) throw new Error("No user logged in to delete product.");
    const productDoc = doc(db, "businesses", businessId, "products", productId);
    await deleteDoc(productDoc);
  };

  const updateProductStock = async (productId: string, newStock: number) => {
    if (!currentUser || !businessId) throw new Error("No user logged in to update stock.");
    const productDoc = doc(db, "businesses", businessId, "products", productId);
    await updateDoc(productDoc, { stock: newStock });
  };

  const restockProduct = async (productId: string, amount: number) => {
    if (!currentUser || !businessId) throw new Error("No user logged in to restock.");
    const productDoc = doc(db, "businesses", businessId, "products", productId);
    await updateDoc(productDoc, { stock: increment(amount) });
  };

  const addEmployee = async (employee: Omit<Employee, "id">) => {
    if (!currentUser || !businessId) throw new Error("No user logged in to add employee.");
    const employeesCollection = collection(db, "businesses", businessId, "employees");
    
    // Normalize email to lowercase to ensure matching works when the user signs up via Firebase Auth
    const employeeData = {
      ...employee,
      email: employee.email.toLowerCase().trim(),
    };
    await addDoc(employeesCollection, employeeData);
  };

  const updateEmployeeStatus = async (employeeId: string, status: string) => {
    if (!currentUser || !businessId) throw new Error("No user logged in to update employee.");
    const employeeDoc = doc(db, "businesses", businessId, "employees", employeeId);
    await updateDoc(employeeDoc, { status });
  };

  const scanBarcode = (barcode: string) => {
    const scannedProduct = products.find(p => p.barcode === barcode);
    if (scannedProduct) {
      addToCart(scannedProduct);
      return true;
    }
    return false;
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

  const updateCartQuantity = (productId: string, change: number) => {
    setCart(prev => {
      const product = products.find(p => p.id === productId);
      return prev
        .map(item => {
          if (item.id === productId) {
            const newQuantity = item.quantity + change;
            // Check stock limit when increasing
            if (change > 0 && product && newQuantity > product.stock) {
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

  const getCartTotals = useMemo(() => {
    return () => {
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tax = subtotal * (settings.taxRate / 100);
      const total = subtotal + tax;
      return { subtotal, tax, total };
    }
  }, [cart, settings.taxRate]);

  const finalizeSale = async (cart: CartItem[], paymentType: "Cash" | "M-Pesa", amountTendered?: number): Promise<Sale | null> => {
    if (cart.length === 0) return null;
    if (!currentUser || !businessId) throw new Error("User must be logged in to finalize a sale.");
  
    const { subtotal, tax, total } = getCartTotals(); // This now uses the memoized function
    
    // Calculate change (defaults to 0 if amountTendered is undefined)
    // For M-Pesa (or Card), exact amount is charged, so change is always 0
    const changeDue = (paymentType === "Cash" && amountTendered) ? amountTendered - total : 0;

    // Create sale record
    const sale: Sale = {
      id: `SALE-${Date.now()}`,
      date: new Date().toISOString(),
      // Sanitize items to remove undefined values which Firestore rejects
      items: JSON.parse(JSON.stringify(cart)),
      subtotal,
      tax,
      total,
      paymentType,
      amountTendered: amountTendered ?? 0,
      changeDue: changeDue,
      soldByUid: currentUser.uid,
      soldByEmail: currentUser.email || "Unknown",
    };

    // Use a batched write to update all product stocks atomically
    try {
      const batch = writeBatch(db);
      cart.forEach(item => {
        const productRef = doc(db, "businesses", businessId, "products", item.id);
        // It's safer to read the latest stock from the `products` state
        // to avoid using stale stock data from the cart item.
        const productInState = products.find(p => p.id === item.id);
        if (productInState) {
          batch.update(productRef, { stock: increment(-item.quantity) });
        }
      });
      // Also add the new sale to the batch
      const salesCollection = collection(db, "businesses", businessId, "sales");
      batch.set(doc(salesCollection, sale.id), sale);

      await batch.commit();
    } catch (error) {
      console.error("Failed to update stock levels:", error);
      return null; // Return null to indicate the sale failed
    }
    
    // Clear the cart
    clearCart();

    return sale;
  };

  const getDashboardSummary = useMemo(() => {
    return (): DashboardSummary => {
      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      weekStart.setHours(0, 0, 0, 0);

      const todaySales = sales.filter(s => new Date(s.date) >= todayStart);
      const weekSales = sales.filter(s => new Date(s.date) >= weekStart);

      const todaySummary = todaySales.reduce((acc, sale) => {
        acc.revenue += sale.total;
        acc.transactions += 1;
        return acc;
      }, { revenue: 0, transactions: 0 });

      const weekSummary = weekSales.reduce((acc, sale) => {
        acc.revenue += sale.total;
        acc.transactions += 1;
        return acc;
      }, { revenue: 0, transactions: 0 });

      const lowStockItems = products
        .filter(p => p.stock > 0 && p.stock <= settings.lowStockThreshold)
        .sort((a, b) => a.stock - b.stock);

      return {
        today: todaySummary,
        week: weekSummary,
        lowStockItems,
      };
    }
  }, [sales, products, settings.lowStockThreshold]);

  return (
    <POSContext.Provider
      value={{
        products,
        cart,
        sales,
        employees,
        settings,
        updateSettings,
        addEmployee,
        updateEmployeeStatus,
        scanBarcode,
        addProduct,
        updateProduct,
        deleteProduct,
        updateProductStock,
        restockProduct,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        finalizeSale,
        getCartTotals,
        getDashboardSummary,
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
