import { useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Package, ArrowLeft, Upload, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { usePOS } from "@/context/pos-context";

interface FormErrors {
  name?: string;
  price?: string;
  stock?: string;
  category?: string;
}

export default function AddProduct() {
  const { toast } = useToast();
  const { addProduct } = usePOS();
  
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    description: "",
    image: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: undefined }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File",
          description: "Please upload an image file.",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Image must be less than 5MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, image: url }));
    setImagePreview(url || null);
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price)) {
      newErrors.price = "Valid price is required";
    } else if (price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    const stock = parseInt(formData.stock);
    if (!formData.stock || isNaN(stock)) {
      newErrors.stock = "Valid stock quantity is required";
    } else if (stock < 0) {
      newErrors.stock = "Stock cannot be negative";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    addProduct({
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category: formData.category.charAt(0).toUpperCase() + formData.category.slice(1),
      description: formData.description.trim(),
      image: formData.image,
    });

    toast({
      title: "Product Added!",
      description: `${formData.name} has been added to inventory with ${formData.stock} units.`,
    });

    // Reset form
    setFormData({
      name: "",
      price: "",
      stock: "",
      category: "",
      description: "",
      image: "",
    });
    setImagePreview(null);
    setErrors({});
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
              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label>Product Image (Optional)</Label>
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Image Preview */}
                  <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50 relative overflow-hidden">
                    {imagePreview ? (
                      <>
                        <img 
                          src={imagePreview} 
                          alt="Product preview" 
                          className="w-full h-full object-cover"
                          onError={() => setImagePreview(null)}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={removeImage}
                          data-testid="button-remove-image"
                        >
                          ×
                        </Button>
                      </>
                    ) : (
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    {/* File Upload */}
                    <div>
                      <Label htmlFor="imageUpload" className="text-sm text-muted-foreground">
                        Upload Image
                      </Label>
                      <div className="mt-1">
                        <label htmlFor="imageUpload" className="cursor-pointer">
                          <div className="flex items-center gap-2 px-3 py-2 border rounded-md hover-elevate">
                            <Upload className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Choose file...</span>
                          </div>
                          <input
                            id="imageUpload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            data-testid="input-image-upload"
                          />
                        </label>
                      </div>
                    </div>
                    
                    {/* Or URL Input */}
                    <div>
                      <Label htmlFor="imageUrl" className="text-sm text-muted-foreground">
                        Or enter image URL
                      </Label>
                      <Input
                        id="imageUrl"
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={formData.image.startsWith("data:") ? "" : formData.image}
                        onChange={handleImageUrlChange}
                        className="mt-1"
                        data-testid="input-image-url"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={handleChange("name")}
                  data-testid="input-product-name"
                  className={`h-12 ${errors.name ? "border-destructive" : ""}`}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
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
                    data-testid="input-product-price"
                    className={`h-12 ${errors.price ? "border-destructive" : ""}`}
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive">{errors.price}</p>
                  )}
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
                    data-testid="input-product-stock"
                    className={`h-12 ${errors.stock ? "border-destructive" : ""}`}
                  />
                  {errors.stock && (
                    <p className="text-sm text-destructive">{errors.stock}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger 
                    className={`h-12 ${errors.category ? "border-destructive" : ""}`} 
                    data-testid="select-category"
                  >
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
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category}</p>
                )}
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
