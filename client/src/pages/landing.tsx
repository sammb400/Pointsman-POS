import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, BarChart3, Package, Smartphone, Clock, Shield, CheckCircle2, ArrowRight } from "lucide-react";
import heroImage from "@assets/generated_images/pos_terminal_in_retail_store.png";
import dashboardImage from "@assets/generated_images/pos_dashboard_analytics_interface.png";
import inventoryImage from "@assets/generated_images/inventory_management_interface_display.png";
import reportsImage from "@assets/generated_images/sales_reports_on_tablet.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Pointsman POS</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium hover-elevate px-3 py-2 rounded-md">Features</a>
            <a href="#benefits" className="text-sm font-medium hover-elevate px-3 py-2 rounded-md">Benefits</a>
            <a href="#testimonials" className="text-sm font-medium hover-elevate px-3 py-2 rounded-md">Testimonials</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" data-testid="button-signin">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button data-testid="button-signup">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Streamline Your Sales with Modern POS
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Transform your retail business with our intuitive point of sale system. 
                Process transactions faster, manage inventory effortlessly, and gain insights 
                that drive growth.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/sign-up">
                  <Button size="lg" className="w-full sm:w-auto" data-testid="button-hero-trial">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto" data-testid="button-watch-demo">
                  Watch Demo
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </div>
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Modern POS terminal in use" 
                className="rounded-xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 bg-card">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">Everything You Need</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help you run your business smoothly
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: ShoppingCart,
                title: "Quick Checkout",
                description: "Process transactions in seconds with our intuitive interface. Accept all payment methods seamlessly."
              },
              {
                icon: BarChart3,
                title: "Real-Time Analytics",
                description: "Track sales, monitor performance, and make data-driven decisions with comprehensive reports."
              },
              {
                icon: Package,
                title: "Inventory Management",
                description: "Keep track of stock levels, get low inventory alerts, and manage products effortlessly."
              },
              {
                icon: Smartphone,
                title: "Mobile Ready",
                description: "Run your business from anywhere with our mobile app. Perfect for pop-ups and events."
              },
              {
                icon: Clock,
                title: "24/7 Support",
                description: "Our dedicated support team is always here to help you succeed, whenever you need us."
              },
              {
                icon: Shield,
                title: "Secure & Reliable",
                description: "Bank-level security and 99.9% uptime guarantee. Your data is always safe and accessible."
              }
            ].map((feature, index) => (
              <Card key={index} className="hover-elevate">
                <CardContent className="p-6 space-y-4">
                  <feature.icon className="h-10 w-10 text-primary" />
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16">
        <div className="max-w-6xl mx-auto px-4 space-y-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src={dashboardImage} 
                alt="POS Dashboard Analytics" 
                className="rounded-xl w-full h-auto"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-semibold">Powerful Dashboard Analytics</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Get instant insights into your business performance. Monitor sales trends, 
                track best-selling products, and identify growth opportunities with our 
                comprehensive analytics dashboard.
              </p>
              <ul className="space-y-3">
                {["Real-time sales tracking", "Customer behavior insights", "Revenue forecasting", "Custom reports"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 order-2 md:order-1">
              <h2 className="text-3xl md:text-4xl font-semibold">Smart Inventory Control</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Never run out of stock again. Our intelligent inventory system tracks every 
                product, sends alerts when stock is low, and helps you make smarter purchasing 
                decisions.
              </p>
              <ul className="space-y-3">
                {["Automatic stock alerts", "Multi-location support", "Barcode scanning", "Supplier management"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 md:order-2">
              <img 
                src={inventoryImage} 
                alt="Inventory Management Interface" 
                className="rounded-xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 bg-card">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">Trusted by Businesses</h2>
            <p className="text-lg text-muted-foreground">
              See what our customers have to say
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "ModernPOS transformed how we handle transactions. Our checkout time decreased by 60%!",
                author: "Sarah Johnson",
                business: "Boutique Retail Store"
              },
              {
                quote: "The inventory management feature alone has saved us thousands in lost revenue. Highly recommend!",
                author: "Michael Chen",
                business: "Electronics Shop"
              },
              {
                quote: "Easy to use, reliable, and the support team is outstanding. Best investment we've made.",
                author: "Emma Williams",
                business: "Coffee Shop Chain"
              }
            ].map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-8 space-y-4">
                  <p className="text-muted-foreground italic leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.business}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Modernize Your Business?</h2>
          <p className="text-lg opacity-90">
            Join thousands of businesses already using ModernPOS to grow their sales
          </p>
          <Link href="/sign-up">
            <Button size="lg" variant="secondary" data-testid="button-cta-final">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <p className="text-sm opacity-75">14-day free trial • No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-card">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover-elevate px-2 py-1 rounded-md inline-block">Features</a></li>
                <li><a href="#" className="hover-elevate px-2 py-1 rounded-md inline-block">Pricing</a></li>
                <li><a href="#" className="hover-elevate px-2 py-1 rounded-md inline-block">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover-elevate px-2 py-1 rounded-md inline-block">About</a></li>
                <li><a href="#" className="hover-elevate px-2 py-1 rounded-md inline-block">Blog</a></li>
                <li><a href="#" className="hover-elevate px-2 py-1 rounded-md inline-block">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover-elevate px-2 py-1 rounded-md inline-block">Documentation</a></li>
                <li><a href="#" className="hover-elevate px-2 py-1 rounded-md inline-block">Help Center</a></li>
                <li><a href="#" className="hover-elevate px-2 py-1 rounded-md inline-block">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover-elevate px-2 py-1 rounded-md inline-block">Support</a></li>
                <li><a href="#" className="hover-elevate px-2 py-1 rounded-md inline-block">Sales</a></li>
                <li><a href="#" className="hover-elevate px-2 py-1 rounded-md inline-block">Partners</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <span className="font-semibold">ModernPOS</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 ModernPOS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
