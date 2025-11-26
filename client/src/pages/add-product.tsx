import { useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Package, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function AddProduct() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    description: "",
  });

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.stock || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const price = parseFloat(formData.price);
    const stock = parseInt(formData.stock);

    if (isNaN(price) || price <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid price.",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(stock) || stock < 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid stock quantity.",
        variant: "destructive",
      });
      return;
    }

    console.log("Product added:", formData);
    toast({
      title: "Product Added!",
      description: `${formData.name} has been added to inventory.`,
    });

    setFormData({
      name: "",
      price: "",
      stock: "",
      category: "",
      description: "",
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Add Product</h1>
            <p className="text-muted-foreground mt-1">Add a new product to your inventory.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>Enter the information for your new product.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={handleChange("name")}
                  required
                  data-testid="input-product-name"
                  className="h-12"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleChange("price")}
                    required
                    data-testid="input-product-price"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.stock}
                    onChange={handleChange("stock")}
                    required
                    data-testid="input-product-stock"
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="h-12" data-testid="select-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beverages">Beverages</SelectItem>
                    <SelectItem value="pastries">Pastries</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="snacks">Snacks</SelectItem>
                    <SelectItem value="merchandise">Merchandise</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Enter product description..."
                  value={formData.description}
                  onChange={handleChange("description")}
                  rows={3}
                  data-testid="input-product-description"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="submit" className="h-12 flex-1" data-testid="button-add-product">
                  <Package className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
                <Link href="/dashboard">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="h-12 w-full sm:w-auto"
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
