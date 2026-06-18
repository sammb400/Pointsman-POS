import { useState, useRef, ChangeEvent } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as XLSX from "xlsx";
import { Camera, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface AiProductScannerProps {
  onDataExtracted: (data: any[]) => void;
}

export default function AiProductScanner({ onDataExtracted }: AiProductScannerProps) {
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const { toast } = useToast();
  const aiInputRef = useRef<HTMLInputElement>(null);

  const generateAndDownloadExcel = (data: any[]) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AI_Extracted_Products");
    
    // Generate filename with timestamp
    const fileName = `ai_inventory_scan_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
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
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Convert file to base64
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
        
        Return ONLY the raw JSON array. No markdown, no "json" code blocks.
      `;

      const result = await model.generateContent([
        prompt,
        { inlineData: { data: base64Data, mimeType: file.type } }
      ]);

      const response = await result.response;
      const text = response.text().trim();
      
      // Clean response if Gemini adds markdown markers
      const jsonString = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      const extractedData = JSON.parse(jsonString);

      if (Array.isArray(extractedData)) {
        generateAndDownloadExcel(extractedData);
        toast({ 
          title: "AI Extraction Success", 
          description: `Found ${extractedData.length} items. Excel file generated.` 
        });
        onDataExtracted(extractedData);
      }
    } catch (error) {
      console.error("Gemini Error:", error);
      toast({ 
        title: "AI Processing Failed", 
        description: "Could not read the image. Ensure the text is clear.", 
        variant: "destructive" 
      });
    } finally {
      setIsAiProcessing(false);
      if (aiInputRef.current) aiInputRef.current.value = "";
    }
  };

  return (
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
  );
}