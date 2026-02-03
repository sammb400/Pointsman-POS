import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Store, Bell, Shield, Save, Loader2, Palette, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePOS } from "@/context/pos-context";
import emailjs from "@emailjs/browser";

const PRESET_COLORS = [
  { name: "Tomato", value: "#FF6347" },
  { name: "Blue", value: "#2563EB" },
  { name: "Green", value: "#16A34A" },
  { name: "Purple", value: "#9333EA" },
  { name: "Orange", value: "#EA580C" },
  { name: "Slate", value: "#475569" },
];

export default function AdminSettings() {
  const { toast } = useToast();
  const { settings: contextSettings, updateSettings } = usePOS();
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  
  // Local state for form handling
  const [formData, setFormData] = useState({
    storeName: "",
    currency: "KES",
    taxRate: "0",
    themeColor: "#FF6347",
    enableNotifications: true,
    notificationEmail: "",
    enableSoundEffects: true,
    enableLowStockAlerts: true,
    lowStockThreshold: "10",
    requireManagerApproval: false,
  });

  // Sync local state with context settings when they load
  useEffect(() => {
    if (contextSettings) {
      setFormData(prev => ({
        ...prev,
        ...contextSettings,
        // Use saved tax rate from context if available, otherwise keep default
        taxRate: contextSettings.taxRate !== undefined ? contextSettings.taxRate.toString() : prev.taxRate,
        lowStockThreshold: contextSettings.lowStockThreshold?.toString() ?? prev.lowStockThreshold,
        notificationEmail: contextSettings.notificationEmail || "",
        enableSoundEffects: contextSettings.enableSoundEffects ?? true,
      }));
    }
  }, [contextSettings]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const taxRate = parseFloat(formData.taxRate);
    const lowStockThreshold = parseInt(formData.lowStockThreshold);

    if (isNaN(taxRate) || isNaN(lowStockThreshold)) {
      toast({
        title: "Validation Error",
        description: "Please enter valid numbers for Tax Rate and Low Stock Threshold.",
        variant: "destructive",
      });
      return;
    }

    if (formData.enableNotifications && !formData.notificationEmail) {
      toast({
        title: "Validation Error",
        description: "Notification email is required when notifications are enabled.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateSettings({
        ...formData,
        taxRate,
        lowStockThreshold,
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
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    // Use environment variables for EmailJS configuration
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      toast({
        title: "Configuration Missing",
        description: "EmailJS configuration missing in environment variables.",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          to_email: formData.notificationEmail,
          store_name: formData.storeName,
          message: "This is a test notification from your POS system settings.",
        },
        publicKey
      );
      toast({
        title: "Test Email Sent",
        description: "Please check your inbox to confirm receipt.",
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Could not send email. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
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
                <p className="text-xs text-muted-foreground">
                  Updates currency symbol across the system
                </p>
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

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel of the application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Primary Theme Color</Label>
              
              <div className="flex flex-wrap gap-3">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`w-8 h-8 rounded-full border shadow-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                      formData.themeColor.toLowerCase() === color.value.toLowerCase() ? "ring-2 ring-ring ring-offset-2" : ""
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => handleChange("themeColor", color.value)}
                    title={color.name}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Input
                  id="themeColor"
                  type="color"
                  value={formData.themeColor}
                  onChange={(e) => handleChange("themeColor", e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                  data-testid="input-theme-color"
                />
                <div className="flex-1 max-w-[150px]">
                  <Input
                    type="text"
                    value={formData.themeColor}
                    onChange={(e) => handleChange("themeColor", e.target.value)}
                    placeholder="#000000"
                    className="font-mono uppercase"
                    maxLength={7}
                    data-testid="input-theme-color-hex"
                  />
                </div>
                <span className="text-sm text-muted-foreground">Custom Hex</span>
              </div>
              <p className="text-xs text-muted-foreground">Select a preset or enter a custom hex code for buttons and accents.</p>
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

            {formData.enableNotifications && (
              <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                <Label htmlFor="notificationEmail">Notification Email</Label>
                <Input
                  id="notificationEmail"
                  type="email"
                  value={formData.notificationEmail}
                  onChange={(e) => handleChange("notificationEmail", e.target.value)}
                  placeholder="alerts@example.com"
                  data-testid="input-notification-email"
                />
                
                <div className="flex justify-end pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleTestEmail}
                    disabled={isTesting || !formData.notificationEmail}
                  >
                    {isTesting ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <Send className="h-3 w-3 mr-2" />}
                    Test Connection
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Ensure EmailJS environment variables are configured.</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableSoundEffects">Sound Effects</Label>
                <p className="text-sm text-muted-foreground">Play sounds for scan and sale events</p>
              </div>
              <Switch
                id="enableSoundEffects"
                checked={formData.enableSoundEffects}
                onCheckedChange={(checked) => handleChange("enableSoundEffects", checked)}
                data-testid="switch-sound-effects"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableLowStockAlerts">Low Stock Alerts</Label>
                <p className="text-sm text-muted-foreground">Show visual warnings on dashboard and product lists</p>
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
        {/* Commented out until Refunds/Discounts are implemented
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
        */}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="min-w-[150px]" disabled={isSaving} data-testid="button-save-settings">
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
