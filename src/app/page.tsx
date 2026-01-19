import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, BarChart3, Shield, CheckCircle2, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-primary" />
            </div>
            <span className="font-bold text-xl tracking-tight">TailorMade</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
            <Link href="/organizations" className="hover:text-primary transition-colors">Find Tailors</Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="rounded-full px-6">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 lg:py-32">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
          
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center rounded-full border border-border bg-background/50 px-3 py-1 text-sm font-medium text-muted-foreground backdrop-blur-sm mb-8 animate-fade-in">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2" />
              v1.0 is now live
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent max-w-4xl mx-auto animate-slide-up">
              Master Your Tailoring Business with Precision
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up delay-100">
              The all-in-one platform to manage orders, track production, and delight customers. 
              Designed for modern tailors who demand excellence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-200">
              <Link href="/sign-up">
                <Button size="lg" className="rounded-full px-8 h-12 text-base">
                  Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/organizations">
                <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base backdrop-blur-sm bg-background/50">
                  Browse Directory
                </Button>
              </Link>
            </div>

            {/* Hero Image / Bento Grid Preview */}
            <div className="mt-20 relative mx-auto max-w-6xl animate-slide-up delay-300">
              <div className="aspect-[16/9] rounded-2xl border border-border bg-card/50 backdrop-blur-sm shadow-2xl overflow-hidden p-2">
                 <div className="w-full h-full rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/50 flex items-center justify-center">
                    <span className="text-muted-foreground font-medium">Dashboard Preview Placeholder</span>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
              <p className="text-muted-foreground text-lg">
                Powerful features packed into a beautiful, intuitive interface.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Feature 1 - Large */}
              <div className="md:col-span-2 rounded-3xl border border-border bg-card p-8 shadow-sm hover:shadow-md transition-all">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Smart Order Management</h3>
                <p className="text-muted-foreground mb-6">
                  Track every order from measurement to delivery. Get real-time status updates and automated notifications.
                </p>
                <div className="h-48 rounded-xl bg-muted/50 border border-border/50 w-full" />
              </div>

              {/* Feature 2 */}
              <div className="md:col-span-1 rounded-3xl border border-border bg-card p-8 shadow-sm hover:shadow-md transition-all">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                   <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Team Sync</h3>
                <p className="text-muted-foreground">
                  Collaborate with your team seamlessly. Assign tasks and track productivity.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="md:col-span-1 rounded-3xl border border-border bg-card p-8 shadow-sm hover:shadow-md transition-all">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                   <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Analytics</h3>
                <p className="text-muted-foreground">
                  Deep insights into revenue, popular fabrics, and customer retention.
                </p>
              </div>

              {/* Feature 4 - Large */}
              <div className="md:col-span-2 rounded-3xl border border-border bg-card p-8 shadow-sm hover:shadow-md transition-all">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                   <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Secure & Trusted</h3>
                <p className="text-muted-foreground mb-6">
                  Enterprise-grade security for your data. Verified profiles build customer trust.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" /> SSL Encrypted
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" /> Daily Backups
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" /> Role-based Access
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" /> GDPR Compliant
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="relative rounded-3xl bg-primary overflow-hidden px-6 py-20 text-center sm:px-12 lg:px-20 max-w-5xl mx-auto">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent" />
              <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl mb-6">
                Ready to transform your business?
              </h2>
              <p className="mx-auto max-w-xl text-lg text-primary-foreground/80 mb-10">
                Join thousands of tailors who have modernized their workflow. Start your 14-day free trial today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/sign-up">
                  <Button size="lg" variant="secondary" className="rounded-full px-8 h-12 text-primary font-bold">
                    Get Started Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-6 rounded bg-primary" />
                <span className="font-bold text-lg">TailorMade</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Crafting the future of tailoring management.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Features</Link></li>
                <li><Link href="#" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="#" className="hover:text-foreground">Showcase</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">About</Link></li>
                <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground">Careers</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Privacy</Link></li>
                <li><Link href="#" className="hover:text-foreground">Terms</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} TailorMade. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}