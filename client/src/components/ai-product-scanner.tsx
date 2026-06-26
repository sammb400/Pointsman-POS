import { useState, useRef, ChangeEvent } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as XLSX from "xlsx";
import { Camera, Sparkles, Edit2, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Product {
  name: string;
  price: number;
  stock: number;
  category: string;
  description: string;
  barcode?: string;
}

interface AiProductScannerProps {
  onDataExtracted: (data: Product[]) => void;
}

export default function AiProductScanner({ onDataExtracted }: AiProductScannerProps) {
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [pendingData, setPendingData] = useState<Product[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  const aiInputRef = useRef<HTMLInputElement>(null);

  const generateAndDownloadExcel = (data: Product[]) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AI_Extracted_Products");
    
    const fileName = `ai_inventory_scan_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleConfirmAdd = () => {
    if (pendingData.length === 0) {
      toast({
        title: "No Products",
        description: "Please review the extracted products.",
        variant: "destructive"
      });
      return;
    }

    generateAndDownloadExcel(pendingData);
    onDataExtracted(pendingData);
    
    toast({ 
      title: "Products Added Successfully", 
      description: `Added ${pendingData.length} products to inventory.` 
    });
    
    setShowPreview(false);
    setPendingData([]);
    setEditingIndex(null);
    setEditingProduct(null);
  };

  const handleCancel = () => {
    setShowPreview(false);
    setPendingData([]);
    setEditingIndex(null);
    setEditingProduct(null);
  };

  const handleEditProduct = (index: number, product: Product) => {
    setEditingIndex(index);
    setEditingProduct({ ...product });
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editingProduct) {
      const updatedData = [...pendingData];
      updatedData[editingIndex] = editingProduct;
      setPendingData(updatedData);
      setEditingIndex(null);
      setEditingProduct(null);
      toast({
        title: "Product Updated",
        description: "Changes have been saved."
      });
    }
  };

  const handleDeleteProduct = (index: number) => {
    const updatedData = pendingData.filter((_, i) => i !== index);
    setPendingData(updatedData);
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditingProduct(null);
    }
    toast({
      title: "Product Removed",
      description: "The product has been deleted."
    });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingProduct(null);
  };

  const handleAiScan = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      toast({
        title: "AI Configuration Missing",
        description: "Please add VITE_GEMINI_API_KEY to your .env file.",
        variant: "destructive"
      });
      return;
    }

    setIsAiProcessing(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Pass generationConfig configuration to guarantee pure raw JSON array
      const model = genAI.getGenerativeModel({ 
        model: "gemini-pro-vision",
        generationConfig: {
          responseMimeType: "application/json"
        }
      });

      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });

      const prompt = `
        Analyze this image of products, price lists, or menus. 
        Extract all products and return a JSON array of objects. 
        Each object MUST have these exact keys:
        - "name": The full product name.
        - "price": The price as a number (no currency symbols).
        - "stock": If visible, extract it; otherwise default to 0.
        - "category": One of: Beverages, Pastries, Food, Snacks, Merchandise.
        - "description": A brief description.
        - "barcode": If a barcode number is readable, include it.
      `;

      const result = await model.generateContent([
        prompt,
        { inlineData: { data: base64Data, mimeType: file.type } }
      ]);

      const response = await result.response;
      const text = response.text().trim();
      
      console.log("AI Response received, full response:", text);
      
      // Because responseMimeType is set, 'text' is directly a pure parseable JSON string
      let extractedData = JSON.parse(text);
      
      console.log("Parsed JSON structure:", extractedData);
      console.log("Is array?", Array.isArray(extractedData));
      console.log("Type:", typeof extractedData);

      // Handle if response is wrapped in an object (e.g., { products: [...] })
      if (!Array.isArray(extractedData) && typeof extractedData === "object") {
        console.log("Response is an object, checking for common array keys...");
        const arrayKey = Object.keys(extractedData).find(key => Array.isArray(extractedData[key]));
        if (arrayKey) {
          console.log(`Found array in key: "${arrayKey}"`);
          extractedData = extractedData[arrayKey];
        }
      }

      if (Array.isArray(extractedData) && extractedData.length > 0) {
        console.log(`✅ Successfully extracted ${extractedData.length} products`);
        setPendingData(extractedData);
        setShowPreview(true);
        toast({ 
          title: "AI Extraction Complete", 
          description: `Found ${extractedData.length} items. Review before adding.` 
        });
      } else if (Array.isArray(extractedData) && extractedData.length === 0) {
        console.warn("⚠️ Extracted array is empty");
        throw new Error("No products detected in the image. Try a clearer photo with visible prices and product names.");
      } else {
        console.warn("Extracted data is not a valid array:", extractedData);
        throw new Error("API response format is invalid. Expected array of products.");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorDetails = error instanceof Error ? error.stack : JSON.stringify(error, null, 2);
      
      console.error("❌ AI Scan Failed:");
      console.error("Error Message:", errorMessage);
      console.error("Full Error:", errorDetails);
      
      // Log to localStorage for debugging
      const logs = JSON.parse(localStorage.getItem("aiScanLogs") || "[]");
      logs.push({
        timestamp: new Date().toISOString(),
        error: errorMessage,
        details: errorDetails
      });
      localStorage.setItem("aiScanLogs", JSON.stringify(logs.slice(-10))); // Keep last 10
      
      toast({ 
        title: "AI Processing Failed", 
        description: errorMessage.includes("not found") 
          ? "Model not available. Check your API key and quota."
          : errorMessage.includes("No products")
          ? errorMessage
          : errorMessage.includes("JSON") 
          ? "API returned invalid data format. Check browser console."
          : "Could not read the image. Ensure the text is clear.",
        variant: "destructive" 
      });
    } finally {
      setIsAiProcessing(false);
      if (aiInputRef.current) aiInputRef.current.value = "";
    }
  };

  return (
    <>
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI Smart Scan
          </CardTitle>
          <CardDescription>Take a photo of a menu or price list to bulk add products.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input 
            ref={aiInputRef}
            type="file" 
            accept="image/*"
            capture="environment"
            onChange={handleAiScan}
            disabled={isAiProcessing}
            className="hidden"
            id="ai-image-upload"
          />
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 font-semibold" 
            disabled={isAiProcessing}
            onClick={() => document.getElementById('ai-image-upload')?.click()}
          >
            {isAiProcessing ? "Analyzing Image..." : (
              <>
                <Camera className="h-5 w-5 mr-2" />
                Scan Menu to Excel & Inventory
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Preview & Edit Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Extracted Products</DialogTitle>
            <DialogDescription>
              Review and edit the extracted products before adding to inventory. ({pendingData.length} items)
            </DialogDescription>
          </DialogHeader>

          {/* Edit Form */}
          {editingIndex !== null && editingProduct && (
            <Card className="bg-amber-50 border-amber-200 dark:bg-amber-900/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Edit Product</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <Input 
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Price</label>
                    <Input 
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Stock</label>
                    <Input 
                      type="number"
                      value={editingProduct.stock}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <select 
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full mt-1 px-2 py-2 border rounded-md text-sm"
                    >
                      <option>Beverages</option>
                      <option>Pastries</option>
                      <option>Food</option>
                      <option>Snacks</option>
                      <option>Merchandise</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Description</label>
                    <Input 
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Barcode</label>
                    <Input 
                      value={editingProduct.barcode || ""}
                      onChange={(e) => setEditingProduct({ ...editingProduct, barcode: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={handleSaveEdit}>
                    <Check className="h-4 w-4 mr-1" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Products Table */}
          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800 border-b">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Name</th>
                  <th className="px-3 py-2 text-left font-semibold">Price</th>
                  <th className="px-3 py-2 text-left font-semibold">Stock</th>
                  <th className="px-3 py-2 text-left font-semibold">Category</th>
                  <th className="px-3 py-2 text-left font-semibold">Description</th>
                  <th className="px-3 py-2 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingData.map((product, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-3 py-2">{product.name}</td>
                    <td className="px-3 py-2">${product.price.toFixed(2)}</td>
                    <td className="px-3 py-2">{product.stock}</td>
                    <td className="px-3 py-2">{product.category}</td>
                    <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">{product.description}</td>
                    <td className="px-3 py-2 flex gap-1 justify-center">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditProduct(index, product)}
                        disabled={editingIndex !== null}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteProduct(index)}
                        disabled={editingIndex !== null}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleConfirmAdd} disabled={editingIndex !== null}>
              <Check className="h-4 w-4 mr-1" />
              Add {pendingData.length} Products
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}