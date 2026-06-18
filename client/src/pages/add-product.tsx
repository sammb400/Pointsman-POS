import { useState, useEffect, useRef, ChangeEvent, useMemo } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Package, ArrowLeft, Upload, ImageIcon, Camera, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { usePOS } from "@/context/pos-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useZxing } from "react-zxing";
import AiProductScanner from "@/components/ai-product-scanner";
import * as Papa from "papaparse";
import * as XLSX from "xlsx";

interface FormErrors {
  name?: string;
  price?: string;
  stock?: string;
  category?: string;
}

// Declare the cloudinary object on the window
declare global {
  interface Window {
    cloudinary: any;
  }
}

export default function AddProduct() {
  const { toast } = useToast();
  const { addProduct, products } = usePOS();
  
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    description: "",
    image: "",
    barcode: "",
  });

  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  const categoriesList = useMemo(() => {
    const defaults = ["Beverages", "Pastries", "Food", "Snacks", "Merchandise"];
    const existing = products.map(p => p.category);
    return Array.from(new Set([...defaults, ...existing])).sort();
  }, [products]);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cloudinaryWidget = useRef<any>(null);

  // Barcode Scanner Logic for USB Scanners
  const barcodeBuffer = useRef("");
  const lastKeyTime = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore input if the user is typing in an input field or textarea
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") return;

      const currentTime = Date.now();
      if (currentTime - lastKeyTime.current > 2000) {
        barcodeBuffer.current = "";
      }
      lastKeyTime.current = currentTime;

      if (e.key === "Enter") {
        if (barcodeBuffer.current) {
          setFormData(prev => ({ ...prev, barcode: barcodeBuffer.current }));
          toast({ title: "Barcode Scanned", description: barcodeBuffer.current });
          barcodeBuffer.current = "";
        }
      } else if (e.key.length === 1) {
        barcodeBuffer.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toast]);

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
    if (value === "other") {
      setIsOtherSelected(true);
      setFormData(prev => ({ ...prev, category: "" }));
    } else {
      setIsOtherSelected(false);
      setFormData(prev => ({ ...prev, category: value }));
    }
    setErrors(prev => ({ ...prev, category: undefined }));
  };

  useEffect(() => {
    // Initialize the widget when the component mounts
    if (window.cloudinary) {
      cloudinaryWidget.current = window.cloudinary.createUploadWidget(
        {
          cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
          uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
          sources: ["local", "url", "camera"],
          multiple: false,
        },
        (error: unknown, result: { event: string; info: { secure_url: string } }) => {
          if (!error && result && result.event === "success") {
            const secureUrl = result.info.secure_url;
            setFormData(prev => ({ ...prev, image: secureUrl }));
            setImagePreview(secureUrl);
          }
        }
      );
    }
  }, []);

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value.trim();
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

    const categoryToValidate = isOtherSelected ? customCategory : formData.category;

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

    if (!categoryToValidate) {
      newErrors.category = "Please select a category";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    const finalCategory = isOtherSelected ? customCategory.trim() : formData.category;

    setIsUploading(true);
    try {
      await addProduct({
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: finalCategory.charAt(0).toUpperCase() + finalCategory.slice(1).toLowerCase(),
        description: formData.description.trim(),
        image: formData.image,
        barcode: formData.barcode.trim() || undefined,
      });
    } catch (error) {
      console.error("Failed to add product:", error);
      toast({ title: "Error", description: "Could not add product. Please try again.", variant: "destructive" });
      setIsUploading(false);
      return;
    }
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
      barcode: "",
    });
    setCustomCategory("");
    setIsOtherSelected(false);
    setImagePreview(null);
    setErrors({});
    setIsUploading(false);
  };

  // Helper to find value in object by checking multiple potential key names (case-insensitive)
  const getFieldValue = (item: any, possibleKeys: string[]) => {
    const keys = Object.keys(item);
    for (const pKey of possibleKeys) {
      const foundKey = keys.find(k => k.toLowerCase().replace(/[^a-z]/g, '') === pKey.toLowerCase().replace(/[^a-z]/g, ''));
      if (foundKey && (item[foundKey] !== undefined && item[foundKey] !== null)) return item[foundKey];
    }
    return "";
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results: Papa.ParseResult<any>) => {
          processBulkData(results.data as any[]);
        },
        error: (error: Error) => {
          toast({ title: "Parsing Error", description: error.message, variant: "destructive" });
        }
      });
    } else if (extension === 'xlsx' || extension === 'xls') {
      reader.onload = (evt: ProgressEvent<FileReader>) => {
        try {
          const arrayBuffer = evt.target?.result;
          if (!(arrayBuffer instanceof ArrayBuffer)) return;
          const data = new Uint8Array(arrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          processBulkData(json);
        } catch (error) {
          toast({ title: "Parsing Error", description: "Failed to parse Excel file", variant: "destructive" });
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast({ title: "Invalid File", description: "Please upload a CSV or Excel file", variant: "destructive" });
    }
  };

  const processBulkData = async (data: any[]) => {
    setIsUploading(true);
    let count = 0;
    for (const item of data) {
      try {
        const name = getFieldValue(item, ["name", "productname", "title"]);
        const priceRaw = getFieldValue(item, ["price", "cost", "rate"]);
        const stockRaw = getFieldValue(item, ["stock", "quantity", "qty", "count"]);
        const categoryRaw = getFieldValue(item, ["category", "type", "group"]) || "Other";

        if (!name || String(name).trim() === "") continue;

        const price = parseFloat(String(priceRaw)) || 0;
        const stock = parseInt(String(stockRaw)) || 0;
        const category = String(categoryRaw).trim();

        await addProduct({
          name: String(name).trim(),
          price: price,
          stock: stock,
          category: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(),
          description: String(getFieldValue(item, ["description", "info"]) || "").trim(),
          image: String(getFieldValue(item, ["image", "img", "photo", "url"]) || "").trim(),
          barcode: String(getFieldValue(item, ["barcode", "upc", "sku"]) || "").trim() || undefined,
        });
        count++;
      } catch (err) {
        console.error("Bulk upload error for item:", item, err);
      }
    }
    toast({ title: "Bulk Upload Complete", description: `Added ${count} products successfully.` });
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
    setIsUploading(false);
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

        <AiProductScanner onDataExtracted={processBulkData} />

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Bulk Import
            </CardTitle>
            <CardDescription>Upload a CSV or Excel file with product details (Name, Price, Stock, Category, etc.)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Input 
                ref={fileInputRef}
                type="file" 
                accept=".csv, .xlsx, .xls" 
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </div>
          </CardContent>
        </Card>

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
                  <div 
                    className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50 relative overflow-hidden cursor-pointer hover:bg-muted/70 transition-colors"
                    onClick={() => cloudinaryWidget.current?.open()}
                    title="Click to upload image"
                  >
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
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage();
                          }}
                          data-testid="button-remove-image"
                        >
                          ×
                        </Button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-muted-foreground">
                        <ImageIcon className="h-8 w-8" />
                        <span className="text-xs font-medium">Upload</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    {/* File Upload */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => cloudinaryWidget.current?.open()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload an Image
                    </Button>
                    
                    {/* Or URL Input */}
                    <div>
                      <Label htmlFor="imageUrl" className="text-sm text-muted-foreground">
                        Or enter image URL
                      </Label>
                      <Input
                        id="imageUrl"
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={formData.image}
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

              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="barcode"
                    placeholder="Scan or enter barcode"
                    value={formData.barcode}
                    onChange={handleChange("barcode")}
                    data-testid="input-product-barcode"
                    className="h-12"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-12 shrink-0"
                    onClick={() => setIsScannerOpen(true)}
                    title="Scan Barcode"
                  >
                    <Camera className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (Kes) *</Label>
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
                    <SelectValue placeholder={isOtherSelected ? "Custom Category..." : "Select a category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesList.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                    <SelectItem value="other" className="font-medium text-primary">Other...</SelectItem>
                  </SelectContent>
                </Select>
                {isOtherSelected && (
                  <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <Input
                      placeholder="Enter new category name"
                      value={customCategory}
                      onChange={(e) => {
                        setCustomCategory(e.target.value);
                        setErrors(prev => ({ ...prev, category: undefined }));
                      }}
                      className={`h-10 ${errors.category ? "border-destructive" : ""}`}
                    />
                  </div>
                )}
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
                <Button type="submit" className="h-12 flex-1" data-testid="button-add-product" disabled={isUploading}>
                  <Package className="h-4 w-4 mr-2" />
                  {isUploading ? "Adding Product..." : "Add Product"}
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

      <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Barcode</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            {isScannerOpen && (
              <BarcodeScanner 
                onScan={(code) => {
                  setFormData(prev => ({ ...prev, barcode: code }));
                  setIsScannerOpen(false);
                  toast({ title: "Barcode Scanned", description: code });
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
  const lastScan = useRef("");
  const lastTime = useRef(0);

  const { ref } = useZxing({
    constraints: { video: { facingMode: "environment" } },
    timeBetweenDecodingAttempts: 300,
    onDecodeResult(result: any) {
      const text = result.getText();
      const now = Date.now();
      if (text === lastScan.current && now - lastTime.current < 2000) return;
      
      lastScan.current = text;
      lastTime.current = now;
      onScan(text);
    },
  });

  return (
    <div className="relative w-full aspect-square max-w-sm overflow-hidden rounded-lg bg-black">
      <video ref={ref as any} className="w-full h-full object-cover" muted playsInline />
      <div className="absolute inset-0 border-2 border-primary/50 m-12 rounded-lg pointer-events-none animate-pulse" />
    </div>
  );
}
