import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { POSProvider } from "@/context/pos-context";
import Landing from "@/pages/landing";
import SignIn from "@/pages/sign-in";
import SignUp from "@/pages/sign-up";
import Dashboard from "@/pages/dashboard";
import Employees from "@/pages/employees";
import Shop from "@/pages/shop";
import SalesHistory from "@/pages/sales-history";
import AddProduct from "@/pages/add-product";
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
      <Route path="/dashboard/sales" component={SalesHistory} />
      <Route path="/dashboard/products/add" component={AddProduct} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <POSProvider>
          <Toaster />
          <Router />
        </POSProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
