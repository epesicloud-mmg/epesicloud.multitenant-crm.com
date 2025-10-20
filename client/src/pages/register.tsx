import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest("POST", "/api/auth/register", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        username: formData.username,
        password: formData.password,
      });
      const data = await response.json();

      // Store auth data in localStorage
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      // Handle both response formats: register returns tenant.id, login returns tenantId
      const tenantId = data.tenant?.id || data.tenantId;
      localStorage.setItem("tenantId", tenantId.toString());

      toast({
        title: "Account created!",
        description: "Welcome to EpesiCRM. Let's get started!",
      });

      // Redirect to CRM dashboard
      setLocation("/crm");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "Unable to create account. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center gap-2 mb-4 cursor-pointer">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">EpesiCRM</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Get Started Free
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Create your account in minutes
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  disabled={loading}
                  data-testid="input-firstname"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={loading}
                  data-testid="input-lastname"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={loading}
                data-testid="input-email"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                required
                minLength={3}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={loading}
                data-testid="input-username"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 6 characters"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={loading}
                data-testid="input-password"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                required
                minLength={6}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                disabled={loading}
                data-testid="input-confirm-password"
                className="mt-2"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              data-testid="button-register"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium" data-testid="link-login">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" data-testid="link-home">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
