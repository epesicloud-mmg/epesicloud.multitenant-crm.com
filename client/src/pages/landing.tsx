import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  TrendingUp, 
  BarChart3, 
  Target, 
  Calendar,
  Building2,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">EpesiCRM</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild data-testid="button-nav-login">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild data-testid="button-nav-register">
                <Link href="/register">Get Started Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Grow Your Business with
            <span className="text-blue-600 dark:text-blue-500"> Smart CRM</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Streamline your sales process, manage customer relationships, and close more deals
            with our powerful, AI-driven CRM platform built for modern teams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild data-testid="button-hero-start">
              <Link href="/register">
                Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild data-testid="button-hero-login">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            No credit card required • Free 14-day trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Everything You Need to Succeed
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Users className="w-8 h-8 text-blue-600" />}
            title="Contact Management"
            description="Organize and track all your customer interactions in one centralized platform with detailed contact profiles."
          />
          <FeatureCard
            icon={<Target className="w-8 h-8 text-green-600" />}
            title="Sales Pipeline"
            description="Visualize your sales process with customizable pipelines and stages to track deals from lead to close."
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8 text-purple-600" />}
            title="Advanced Analytics"
            description="Get actionable insights with AI-powered analytics and detailed reports on your sales performance."
          />
          <FeatureCard
            icon={<Calendar className="w-8 h-8 text-orange-600" />}
            title="Activity Tracking"
            description="Never miss a follow-up with automated activity tracking, reminders, and scheduling tools."
          />
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8 text-red-600" />}
            title="Revenue Forecasting"
            description="Predict future revenue with AI-driven forecasting based on your pipeline and historical data."
          />
          <FeatureCard
            icon={<Building2 className="w-8 h-8 text-indigo-600" />}
            title="Multi-Tenant Support"
            description="Manage multiple workspaces with secure data isolation and role-based access control."
          />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-blue-600 dark:bg-blue-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Why Teams Choose EpesiCRM
              </h2>
              <div className="space-y-4">
                <BenefitItem text="Close deals 30% faster with AI-powered insights" />
                <BenefitItem text="Increase productivity with automated workflows" />
                <BenefitItem text="Improve customer relationships with 360° view" />
                <BenefitItem text="Scale your business with enterprise-grade security" />
                <BenefitItem text="Access anywhere with cloud-based platform" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to Transform Your Sales?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Join thousands of teams already using EpesiCRM to grow their business.
              </p>
              <Button size="lg" className="w-full" asChild data-testid="button-cta-start">
                <Link href="/register">
                  Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">EpesiCRM</span>
            </div>
            <p className="text-sm">
              © 2025 EpesiCRM. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <CheckCircle2 className="w-6 h-6 text-blue-200 flex-shrink-0" />
      <span className="text-white text-lg">{text}</span>
    </div>
  );
}
