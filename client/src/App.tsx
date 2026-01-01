import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { POSProvider } from "@/context/pos-context";
import { AuthProvider } from "@/context/auth-context";
import Landing from "@/pages/landing";
import SignIn from "@/pages/sign-in";
import SignUp from "@/pages/sign-up";
import Dashboard from "@/pages/dashboard";
import Employees from "@/pages/employees";
import Shop from "@/pages/shop";
import SalesOverview from "@/pages/sales-overview";
import AddProduct from "@/pages/add-product";
import RestockProduct from "@/pages/restock-product";
import AdminPortal from "@/pages/admin/index";
import AdminEmployees from "@/pages/admin/employees";
import AdminStock from "@/pages/admin/stock";
import AdminFinancials from "@/pages/admin/financials";
import AdminSettings from "@/pages/admin/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/sign-in" component={SignIn} />
      <Route path="/sign-up" component={SignUp} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/employees" component={Employees} />
      <Route path="/dashboard/shop" component={Shop} />
      <Route path="/dashboard/sales" component={SalesOverview} />
      <Route path="/dashboard/products/add" component={AddProduct} />
      <Route path="/dashboard/products/restock" component={RestockProduct} />
      <Route path="/dashboard/admin" component={AdminPortal} />
      <Route path="/dashboard/admin/employees" component={AdminEmployees} />
      <Route path="/dashboard/admin/stock" component={AdminStock} />
      <Route path="/dashboard/admin/financials" component={AdminFinancials} />
      <Route path="/dashboard/admin/settings" component={AdminSettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <POSProvider>
            <Toaster />
            <Router />
          </POSProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
