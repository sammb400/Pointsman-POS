import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Store, Bell, Shield, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePOS } from "@/context/pos-context";

export default function AdminSettings() {
  const { toast } = useToast();
  const { settings: contextSettings, updateSettings } = usePOS();
  
  // Local state for form handling
  const [formData, setFormData] = useState({
    storeName: "ModernPOS Store",
    currency: "KES",
    taxRate: "16",
    accentColor: "#FF6347",
    backgroundColor: "#ffffff",
    enableNotifications: true,
    enableLowStockAlerts: true,
    lowStockThreshold: "10",
    requireManagerApproval: false,
  });

  // Sync local state with context settings when they load
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      ...contextSettings,
      taxRate: contextSettings.taxRate.toString(),
      lowStockThreshold: contextSettings.lowStockThreshold.toString(),
    }));
  }, [contextSettings]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await updateSettings({
        ...formData,
        taxRate: parseFloat(formData.taxRate),
        lowStockThreshold: parseInt(formData.lowStockThreshold),
      });
      toast({
        title: "Settings Saved",
        description: "Your system settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-7 w-7 text-primary" />
            System Settings
          </h1>
          <p className="text-muted-foreground mt-1">Configure application settings and preferences.</p>
        </div>

        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Store Information
            </CardTitle>
            <CardDescription>Basic store configuration settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                value={formData.storeName}
                onChange={(e) => handleChange("storeName", e.target.value)}
                placeholder="Enter store name"
                data-testid="input-store-name"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => handleChange("currency", value)}>
                  <SelectTrigger data-testid="select-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KES">KES (KSh)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="CAD">CAD ($)</SelectItem>
                    <SelectItem value="AUD">AUD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.taxRate}
                  onChange={(e) => handleChange("taxRate", e.target.value)}
                  data-testid="input-tax-rate"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure alert and notification settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableNotifications">Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive system notifications</p>
              </div>
              <Switch
                id="enableNotifications"
                checked={formData.enableNotifications}
                onCheckedChange={(checked) => handleChange("enableNotifications", checked)}
                data-testid="switch-notifications"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableLowStockAlerts">Low Stock Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified when products are running low</p>
              </div>
              <Switch
                id="enableLowStockAlerts"
                checked={formData.enableLowStockAlerts}
                onCheckedChange={(checked) => handleChange("enableLowStockAlerts", checked)}
                data-testid="switch-low-stock"
              />
            </div>
            
            {formData.enableLowStockAlerts && (
              <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  min="1"
                  value={formData.lowStockThreshold}
                  onChange={(e) => handleChange("lowStockThreshold", e.target.value)}
                  className="max-w-[120px]"
                  data-testid="input-low-stock-threshold"
                />
                <p className="text-xs text-muted-foreground">
                  Alert when stock falls to or below this quantity
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Security and access control settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requireManagerApproval">Require Manager Approval</Label>
                <p className="text-sm text-muted-foreground">
                  Require manager approval for refunds and discounts
                </p>
              </div>
              <Switch
                id="requireManagerApproval"
                checked={formData.requireManagerApproval}
                onCheckedChange={(checked) => handleChange("requireManagerApproval", checked)}
                data-testid="switch-manager-approval"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="min-w-[150px]" data-testid="button-save-settings">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
