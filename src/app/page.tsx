"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  BarChart3, Users, Briefcase, Ticket, Zap, Shield, Globe, 
  Layers, LayoutTemplate, 
  Settings2, Fingerprint, Command, CheckCircle2,
  Orbit, Database, Workflow, Monitor, ArrowRight
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"

export default function CRMLandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10">
      {/* NAVBAR */}
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="flex items-center justify-between px-4 py-2 w-full max-w-4xl bg-background/80 backdrop-blur-md rounded-full border border-border shadow-sm">
          <div className="flex items-center gap-2 px-2">
            <div className="size-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
              <Layers className="size-4" />
            </div>
            <span className="font-bold tracking-tight">CRM Portal</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About Us</Link>
            <Link href="#services" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Services</Link>
            <Link href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact Us</Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground px-4 hidden sm:block">Log in</Link>
            <Link href="/signup">
              <Button className="rounded-full px-6">Sign Up</Button>
            </Link>
          </div>
        </nav>
      </div>

      {/* HERO */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
        {/* Soft Background Beam */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full opacity-50"></div>
          <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full opacity-40 mix-blend-multiply dark:mix-blend-screen"></div>
        </div>

        <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-8 relative z-10">
          <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-sm font-medium border-border shadow-sm">
            New AI-Powered Insights <span className="ml-2 text-primary">See what&apos;s new &rarr;</span>
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl text-balance leading-[1.1]">
            Build Better Customer <br className="hidden md:block" />
            Relationships.
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl text-balance">
            The all-in-one CRM platform designed to help you close deals faster, 
            track leads effortlessly, and manage your entire sales pipeline.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="rounded-full px-8 h-12 text-base shadow-sm w-full sm:w-auto">
                Start Free Trial
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base bg-background/50 backdrop-blur w-full sm:w-auto">
              Request Demo
            </Button>
          </div>
        </div>

        {/* Hero Footer Stats */}
        <div className="mt-24 w-full max-w-5xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x-0 md:divide-x divide-border/50 text-center">
            <div className="flex flex-col gap-1">
              <span className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">$2B+</span>
              <span className="text-sm font-medium text-muted-foreground">Deals Closed</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">10k+</span>
              <span className="text-sm font-medium text-muted-foreground">Sales Teams</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">99.9%</span>
              <span className="text-sm font-medium text-muted-foreground">Uptime SLA</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">24/7</span>
              <span className="text-sm font-medium text-muted-foreground">Customer Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* ICON GRID (Services) */}
      <section id="services" className="py-24 bg-muted/30 border-y border-border/50">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="flex flex-col gap-3 items-start">
              <div className="size-10 rounded-xl bg-background border border-border shadow-sm flex items-center justify-center text-primary">
                <Users className="size-5" />
              </div>
              <h3 className="font-semibold text-lg">Lead Tracking</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Capture, score, and route leads automatically so your team can focus on selling.</p>
            </div>
            <div className="flex flex-col gap-3 items-start">
              <div className="size-10 rounded-xl bg-background border border-border shadow-sm flex items-center justify-center text-primary">
                <Briefcase className="size-5" />
              </div>
              <h3 className="font-semibold text-lg">Pipeline Management</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Visualize your sales process with drag-and-drop kanban boards and custom stages.</p>
            </div>
            <div className="flex flex-col gap-3 items-start">
              <div className="size-10 rounded-xl bg-background border border-border shadow-sm flex items-center justify-center text-primary">
                <BarChart3 className="size-5" />
              </div>
              <h3 className="font-semibold text-lg">Activity Logging</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Automatically log emails, calls, and meetings directly to the relevant contact.</p>
            </div>
            <div className="flex flex-col gap-3 items-start">
              <div className="size-10 rounded-xl bg-background border border-border shadow-sm flex items-center justify-center text-primary">
                <Ticket className="size-5" />
              </div>
              <h3 className="font-semibold text-lg">Customer Support</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Turn issues into opportunities with integrated ticketing and customer history.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TABBED FEATURES */}
      <section id="about" className="py-32">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Everything your sales team needs</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A unified platform to manage relationships from the first touchpoint to the final contract.
            </p>
          </div>

          <Tabs defaultValue="leads" className="w-full">
            <TabsList className="w-full h-auto p-1.5 bg-muted/50 rounded-2xl flex flex-col sm:flex-row overflow-x-auto sm:overflow-visible justify-between shadow-sm border border-border/40">
              <TabsTrigger value="leads" className="w-full rounded-xl px-4 py-2.5 text-sm sm:text-base data-[state=active]:shadow-sm">Leads</TabsTrigger>
              <TabsTrigger value="contacts" className="w-full rounded-xl px-4 py-2.5 text-sm sm:text-base data-[state=active]:shadow-sm">Contacts</TabsTrigger>
              <TabsTrigger value="deals" className="w-full rounded-xl px-4 py-2.5 text-sm sm:text-base data-[state=active]:shadow-sm">Deals</TabsTrigger>
              <TabsTrigger value="tickets" className="w-full rounded-xl px-4 py-2.5 text-sm sm:text-base data-[state=active]:shadow-sm">Tickets</TabsTrigger>
              <TabsTrigger value="analytics" className="w-full rounded-xl px-4 py-2.5 text-sm sm:text-base data-[state=active]:shadow-sm">Analytics</TabsTrigger>
            </TabsList>

            <div className="mt-8 md:mt-12 bg-background border border-border rounded-3xl shadow-sm p-8 md:p-12 overflow-hidden relative">
              <TabsContent value="leads" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-2.5">
                      <Zap className="size-6 text-primary" />
                      <h4 className="font-semibold">Auto-Routing</h4>
                      <p className="text-sm text-muted-foreground">Instantly assign new leads to the right rep based on territory.</p>
                    </div>
                    <div className="space-y-2.5">
                      <LayoutTemplate className="size-6 text-primary" />
                      <h4 className="font-semibold">Smart Forms</h4>
                      <p className="text-sm text-muted-foreground">Capture lead data dynamically and enrich it automatically.</p>
                    </div>
                    <div className="space-y-2.5">
                      <Command className="size-6 text-primary" />
                      <h4 className="font-semibold">Lead Scoring</h4>
                      <p className="text-sm text-muted-foreground">Prioritize prospects showing the highest buying intent.</p>
                    </div>
                    <div className="space-y-2.5">
                      <Monitor className="size-6 text-primary" />
                      <h4 className="font-semibold">Central Hub</h4>
                      <p className="text-sm text-muted-foreground">View all lead activity and history in a single, unified feed.</p>
                    </div>
                  </div>
                  <div className="relative rounded-2xl bg-muted/30 border border-border/50 aspect-video flex items-center justify-center overflow-hidden shadow-inner">
                    <div className="absolute inset-4 rounded-xl bg-background shadow-lg border border-border/50 flex flex-col">
                      <div className="h-8 border-b border-border flex items-center px-3 gap-1.5 bg-muted/20">
                        <div className="size-2.5 rounded-full bg-red-400"></div>
                        <div className="size-2.5 rounded-full bg-amber-400"></div>
                        <div className="size-2.5 rounded-full bg-green-400"></div>
                      </div>
                      <div className="p-4 flex-1 flex gap-4">
                        <div className="w-24 md:w-32 h-full bg-muted/50 rounded-lg hidden sm:block"></div>
                        <div className="flex-1 flex flex-col gap-3">
                           <div className="h-6 w-1/3 bg-muted rounded-md"></div>
                           <div className="h-24 w-full bg-primary/5 rounded-md border border-primary/10 mt-2 flex items-center justify-center text-primary/40 font-medium">Lead Dashboard UI</div>
                           <div className="h-4 w-5/6 bg-muted/30 rounded-md"></div>
                           <div className="h-4 w-4/6 bg-muted/30 rounded-md"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="contacts" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500 flex items-center justify-center py-20 text-muted-foreground">
                <div className="text-center space-y-4">
                  <Users className="size-12 mx-auto text-primary/50" />
                  <p>Comprehensive contact profiles and communication history.</p>
                </div>
              </TabsContent>
              <TabsContent value="deals" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500 flex items-center justify-center py-20 text-muted-foreground">
                <div className="text-center space-y-4">
                  <Briefcase className="size-12 mx-auto text-primary/50" />
                  <p>Visual sales pipelines and forecasting capabilities.</p>
                </div>
              </TabsContent>
              <TabsContent value="tickets" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500 flex items-center justify-center py-20 text-muted-foreground">
                <div className="text-center space-y-4">
                  <Ticket className="size-12 mx-auto text-primary/50" />
                  <p>Integrated customer support and issue tracking.</p>
                </div>
              </TabsContent>
              <TabsContent value="analytics" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500 flex items-center justify-center py-20 text-muted-foreground">
                <div className="text-center space-y-4">
                  <BarChart3 className="size-12 mx-auto text-primary/50" />
                  <p>Real-time sales reports and team performance dashboards.</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>

      {/* CTA CARD */}
      <section className="py-24 mb-12">
        <div className="container px-4 md:px-6 flex justify-center">
          <Card className="w-full max-w-3xl bg-card border-border shadow-lg shadow-black/5 rounded-[2rem] p-8 md:p-16 text-center relative overflow-hidden">
             <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-[60px] rounded-full pointer-events-none"></div>
             <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none"></div>
             
             <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 relative z-10">Ready to accelerate your sales?</h2>
             <p className="text-muted-foreground text-lg mb-10 relative z-10 max-w-lg mx-auto text-balance">
               Join thousands of businesses that use CRM Portal to close deals faster and build lasting customer relationships.
             </p>
             
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
               <Link href="/signup" className="w-full sm:w-auto">
                 <Button size="lg" className="rounded-full px-10 h-14 text-base w-full shadow-md font-semibold">
                   Start your 14-day free trial
                 </Button>
               </Link>
               <span className="text-sm text-muted-foreground sm:ml-4 flex items-center gap-2 mt-4 sm:mt-0">
                 <CheckCircle2 className="size-4 text-green-500" /> No credit card required
               </span>
             </div>
          </Card>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="bg-background border-t border-border/50 pt-20 pb-10">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
            <div className="md:col-span-1 space-y-5">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-md bg-foreground flex items-center justify-center text-background">
                  <Layers className="size-3.5" />
                </div>
                <span className="font-bold text-xl tracking-tight">CRM Portal</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-[16rem] leading-relaxed">
                The intelligent CRM platform empowering modern sales and support teams.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:col-span-3">
              <div className="space-y-5">
                <h4 className="font-semibold text-sm tracking-wide">Product</h4>
                <ul className="space-y-3.5">
                  <li><Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
                  <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
                  <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Integrations</Link></li>
                  <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Changelog</Link></li>
                </ul>
              </div>
              <div className="space-y-5">
                <h4 className="font-semibold text-sm tracking-wide">Support</h4>
                <ul className="space-y-3.5">
                  <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Help Center</Link></li>
                  <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Developer API</Link></li>
                  <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Community</Link></li>
                  <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact Sales</Link></li>
                </ul>
              </div>
              <div className="space-y-5">
                <h4 className="font-semibold text-sm tracking-wide">Company</h4>
                <ul className="space-y-3.5">
                  <li><Link href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</Link></li>
                  <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
                  <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Careers</Link></li>
                  <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} CRM Portal Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
