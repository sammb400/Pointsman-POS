import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";

export default function SignUp() {
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    accessCode: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { signup } = useAuth();
  const [, setLocation] = useLocation();

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.accessCode !== "007") {
      toast({
        title: "Invalid Access Code",
        description: "The provided access code is incorrect.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    if (!acceptedTerms) {
      toast({
        title: "Error",
        description: "Please accept the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await signup({
        email: formData.email,
        password: formData.password,
        businessName: formData.businessName,
        phoneNumber: formData.phone,
      });
      toast({
        title: "Account Created!",
        description: `Welcome to Pointsman POS, ${formData.businessName}!`,
      });
      setLocation("/dashboard"); // Redirect to dashboard after successful signup
    } catch (error: any) {
      console.error("Signup failed:", error);
      const message = error.code === 'auth/email-already-in-use' ? 'This email is already registered.' : 'Failed to create an account.';
      toast({ title: "Sign-up Error", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center gap-2 mb-4 hover-elevate px-3 py-2 rounded-md">
              <ShoppingCart className="h-8 w-8 text-primary" />
              <span className="font-bold text-2xl">Pointsman POS</span>
            </div>
          </Link>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center">Create your account</CardTitle>
            <CardDescription className="text-center">
              Start your 14-day free trial. No credit card required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  type="text"
                  placeholder="Your Business"
                  value={formData.businessName}
                  onChange={handleChange("businessName")}
                  required
                  data-testid="input-business-name"
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accessCode">Access Code</Label>
                <Input
                  id="accessCode"
                  type="password"
                  placeholder="Enter access code"
                  value={formData.accessCode}
                  onChange={handleChange("accessCode")}
                  required
                  data-testid="input-access-code"
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange("email")}
                  required
                  data-testid="input-email"
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange("phone")}
                  required
                  data-testid="input-phone"
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange("password")}
                  required
                  data-testid="input-password"
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  required
                  data-testid="input-confirm-password"
                  className="h-12"
                />
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                  data-testid="checkbox-terms"
                  className="mt-1"
                />
                <Label
                  htmlFor="terms"
                  className="text-sm font-normal leading-relaxed cursor-pointer"
                >
                  I agree to the{" "}
                  <a href="#" className="text-primary hover-elevate px-1 rounded-sm">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-primary hover-elevate px-1 rounded-sm">
                    Privacy Policy
                  </a>
                </Label>
              </div>
              <Button type="submit" className="w-full h-12" data-testid="button-submit" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/sign-in" className="text-primary font-semibold hover-elevate px-2 py-1 rounded-md inline-block" data-testid="link-signin">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          14-day free trial • No credit card required • Cancel anytime
        </p>
      </div>
    </div>
  );
}
