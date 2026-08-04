'use client';
import { ArrowRight, Zap, Target, RefreshCw, Cpu, Play, Sparkles, Activity, CheckCircle, Bell, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
    const [showDemo, setShowDemo] = useState(false);

    const features = [
        {
            icon: <Target className="w-6 h-6 text-violet-600" />,
            title: "Prospect Sourcing",
            description: "AI-driven prospect scraping that finds decision-makers and drafts hyper-personalized emails instantly.",
            badge: "ML-POWERED",
            color: "bg-violet-100",
        },
        {
            icon: <RefreshCw className="w-6 h-6 text-indigo-500" />,
            title: "Stateless Queue",
            description: "No messy cron jobs. Powered by a robust SQL queue using SKIP LOCKED for true serverless concurrency.",
            badge: "SCALABLE",
            color: "bg-indigo-50",
        },
        {
            icon: <Mail className="w-6 h-6 text-emerald-500" />,
            title: "Gmail Automation",
            description: "Native OAuth integration sends emails directly from your outbox, ensuring maximum deliverability.",
            badge: "AUTOMATED",
            color: "bg-emerald-50",
        },
        {
            icon: <Cpu className="w-6 h-6 text-amber-500" />,
            title: "LangGraph Agent",
            description: "Two-pass AI reasoning verifies every drafted email against your rules before it's dispatched.",
            badge: "AI-DRIVEN",
            color: "bg-amber-50",
        }
    ];

    const stats = [
        { value: "50%", label: "Open Rate", sublabel: "Avg across campaigns" },
        { value: "4.5x", label: "Reply Rate", sublabel: "vs. generic templates" },
        { value: "0ms", label: "Queue Overhead", sublabel: "Stateless SQL worker" },
        { value: "< 2min", label: "Time to Send", sublabel: "From prospect to inbox" },
    ];

    return (
        <div className="min-h-screen bg-[#f5f5f4] font-sans selection:bg-violet-600/20 selection:text-violet-600">

            {/* Floating Top Navigation */}
            <div className="sticky top-0 z-50 pt-4 pb-3 px-4 md:px-8 bg-[#f5f5f4]/90 backdrop-blur-sm">
                <nav
                    className="max-w-6xl mx-auto bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] py-3 px-5 md:px-8 flex items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500"
                >
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 shrink-0">
                        <div className="h-9 w-9 rounded-xl overflow-hidden flex-shrink-0 relative flex items-center justify-center border border-gray-200">
                            <div className="absolute inset-0 flex flex-col">
                                <div className="h-1/2 bg-violet-600" />
                                <div className="h-1/2 bg-cyan-500" />
                            </div>
                            <Zap className="relative z-10 w-4 h-4 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900 tracking-tight leading-none">WarmLeads</span>
                            <span className="text-[11px] text-gray-400 leading-none mt-0.5">for growth teams</span>
                        </div>
                    </Link>

                    {/* Center Nav */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/#features" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                            Features
                        </Link>
                        <Link href="/pricing" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                            Pricing
                        </Link>
                    </div>

                    {/* Right CTA */}
                    <div className="flex items-center gap-3 shrink-0">
                        <Link href="/signin" className="hidden sm:inline text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            Sign In
                        </Link>
                        <Link href="/signin"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
                            Get Started <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </nav>
            </div>

            {/* Announcement Ticker */}
            <div className="bg-violet-600 overflow-hidden">
                <div
                    className="whitespace-nowrap py-2.5 px-8 text-[10px] font-bold uppercase tracking-[0.35em] text-white opacity-90 animate-[marquee_20s_linear_infinite]"
                >
                    🚀 AUTONOMOUS OUTREACH AGENT • STATELESS POSTGRES QUEUE • LANGGRAPH AI REASONING • ZERO OVERHEAD EMAIL SYSTEM • FIRECRAWL PROSPECTING •&nbsp;&nbsp;&nbsp;&nbsp;
                    🚀 AUTONOMOUS OUTREACH AGENT • STATELESS POSTGRES QUEUE • LANGGRAPH AI REASONING • ZERO OVERHEAD EMAIL SYSTEM • FIRECRAWL PROSPECTING •
                </div>
            </div>

            {/* ───── HERO SECTION ───── */}
            <section className="relative py-20 lg:py-32 overflow-hidden">
                {/* Grid background */}
                <div className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px'
                    }}
                />

                <div className="max-w-6xl mx-auto px-6 md:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left Content */}
                        <div className="animate-in slide-in-from-bottom-8 duration-700">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-[11px] font-semibold text-gray-600 mb-6 shadow-sm">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                Autonomous Outreach Platform
                            </div>

                            {/* Heading */}
                            <h1 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-[1.08] tracking-tight">
                                The Zero Overhead <br/>
                                <span className="text-violet-600">Outreach</span>
                                {" "}Agent.
                            </h1>

                            {/* Subtext */}
                            <p className="text-lg text-gray-500 mb-8 max-w-lg leading-relaxed font-medium">
                                Scale your outbound with autonomous LangGraph reasoning and serverless PostgreSQL queues. Connect your Gmail, add prospects, and let the AI close deals.
                            </p>

                            {/* CTAs */}
                            <div className="flex flex-wrap gap-3 mb-12">
                                <Link href="/signin"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-800 transition-all hover:shadow-lg">
                                    Start Sending Free <ArrowRight className="w-4 h-4" />
                                </Link>
                                <button onClick={() => setShowDemo(true)}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold text-sm hover:border-gray-400 transition-all hover:shadow-sm">
                                    <Play className="w-4 h-4 text-violet-600 fill-violet-600" />
                                    Watch Demo
                                </button>
                            </div>

                            {/* Social proof */}
                            <div className="flex items-center gap-4 text-sm text-gray-400 font-medium">
                                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" />Native Gmail OAuth</span>
                                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" />PostgreSQL SKIP LOCKED</span>
                            </div>
                        </div>

                        {/* Right — Dashboard Preview */}
                        <div className="relative hidden lg:block animate-in fade-in slide-in-from-right-8 duration-1000 delay-300 fill-mode-both">
                            {/* Main dashboard card */}
                            <div className="bg-white rounded-2xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                                {/* Card header */}
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        Live Dispatch Queue
                                    </div>
                                </div>

                                {/* Metrics row */}
                                <div className="grid grid-cols-3 gap-px bg-gray-100">
                                    {[
                                        { label: "Emails Sent", value: "2,450", color: "text-violet-600", icon: "🚀" },
                                        { label: "Replies Pending", value: "89", color: "text-amber-500", icon: "📥" },
                                        { label: "Queue Load", value: "0ms", color: "text-emerald-600", icon: "⚡" },
                                    ].map((m, i) => (
                                        <div key={i} className="bg-white px-5 py-5">
                                            <div className="text-lg mb-1">{m.icon}</div>
                                            <div className={`text-2xl font-black ${m.color} tracking-tight`}>{m.value}</div>
                                            <div className="text-[11px] text-gray-400 font-medium mt-0.5">{m.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Risk table */}
                                <div className="px-6 py-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Campaigns</span>
                                        <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-semibold">Live Pipeline</span>
                                    </div>
                                    <div className="space-y-2">
                                        {[
                                            { name: "Acme Corporation", target: "CTO", status: "Verified", time: "2m ago" },
                                            { name: "Stark Industries", target: "VP Eng", status: "Scraping", time: "Now" },
                                            { name: "Wayne Enterprises", target: "CEO", status: "Sent", time: "5m ago" },
                                        ].map((acc, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all cursor-pointer">
                                                <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center shrink-0">
                                                    <span className="text-xs font-black text-violet-600">{acc.name[0]}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-bold text-gray-800 truncate">{acc.name}</div>
                                                    <div className="text-[11px] text-gray-400">Targeting {acc.target}</div>
                                                </div>
                                                <div className="shrink-0 text-right">
                                                    <div className={`text-xs font-black px-2 py-0.5 rounded-full ${acc.status === 'Sent' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {acc.status}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* AI Alert Badge */}
                                <div className="absolute -top-4 -right-4 bg-white border border-gray-200 rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2.5 animate-bounce">
                                    <div className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-violet-600" />
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-bold text-gray-800">AI Verified</div>
                                        <div className="text-[10px] text-gray-400">Acme pitch is ready</div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ───── STATS STRIP ───── */}
            <section className="bg-white border-y border-gray-100 py-12">
                <div className="max-w-6xl mx-auto px-6 md:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, i) => (
                            <div key={i} className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                <div className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</div>
                                <div className="text-sm font-semibold text-gray-700 mt-1">{stat.label}</div>
                                <div className="text-xs text-gray-400 mt-0.5">{stat.sublabel}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ───── FEATURES ───── */}
            <section id="features" className="py-24 bg-[#f5f5f4]">
                <div className="max-w-6xl mx-auto px-6 md:px-8">
                    {/* Section badge + heading */}
                    <div className="text-center mb-16">
                        <span className="inline-block px-3 py-1 border border-gray-300 rounded-full text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-4 bg-white">
                            POWERED BY AI
                        </span>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-3">
                            Everything to maximize outreach.
                        </h2>
                        <p className="text-gray-500 text-base max-w-lg mx-auto font-medium">
                            From scraping company context to executing stateless dispatch, WarmLeads covers the full pipeline.
                        </p>
                    </div>

                    {/* Feature cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {features.map((feature, idx) => (
                            <div
                                key={idx}
                                className="bg-white rounded-2xl border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all cursor-pointer group"
                            >
                                <div className={`w-11 h-11 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    {feature.icon}
                                </div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{feature.badge}</div>
                                <h3 className="text-base font-bold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed font-medium">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ───── HOW IT WORKS ───── */}
            <section className="py-24 bg-white border-t border-gray-100">
                <div className="max-w-6xl mx-auto px-6 md:px-8">
                    <div className="text-center mb-16">
                        <span className="inline-block px-3 py-1 border border-gray-300 rounded-full text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-4 bg-[#f5f5f4]">
                            HOW IT WORKS
                        </span>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight">
                            Three steps to inbox placement.
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { step: "01", title: "Add Prospect", desc: "Just enter an email and domain. Firecrawl scrapes deep context on the target.", icon: <Activity className="w-5 h-5 text-violet-600" /> },
                            { step: "02", title: "AI Drafts Pitch", desc: "LangGraph analyzes the target data and drafts a highly personalized email via LLM.", icon: <Sparkles className="w-5 h-5 text-indigo-500" /> },
                            { step: "03", title: "Dispatch", desc: "The stateless Postgres queue picks it up instantly and sends via your Gmail OAuth.", icon: <CheckCircle className="w-5 h-5 text-emerald-500" /> },
                        ].map((step, i) => (
                            <div key={i} className="relative">
                                <div className="bg-white rounded-2xl border-2 border-black p-8 h-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
                                    <div className="text-5xl font-black text-gray-100 mb-4 leading-none">{step.step}</div>
                                    <div className="w-9 h-9 bg-white rounded-xl border border-gray-200 flex items-center justify-center mb-4 shadow-sm">
                                        {step.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed font-medium">{step.desc}</p>
                                </div>
                                {i < 2 && (
                                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 text-gray-300 text-2xl font-light select-none z-10">→</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ───── CTA ───── */}
            <section className="py-24 bg-white relative overflow-hidden border-t border-gray-100">
                <div className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px'
                    }}
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-3xl mx-auto px-6 md:px-8 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-full text-[11px] font-semibold text-gray-500 mb-6 bg-gray-50">
                        <Bell className="w-3.5 h-3.5 text-violet-600" /> Start sending campaigns today
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
                        Ready to <span className="text-violet-600">automate</span> your outreach?
                    </h2>
                    <p className="text-gray-500 text-base font-medium mb-10 max-w-xl mx-auto">
                        Join growth teams using WarmLeads to scrape prospects, draft AI campaigns, and manage queues.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/signin"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-violet-600 text-white rounded-xl font-bold text-sm hover:bg-violet-700 transition-all hover:shadow-lg hover:shadow-violet-600/20">
                            Start Free Trial <ArrowRight className="w-4 h-4" />
                        </Link>
                        <button onClick={() => setShowDemo(true)}
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-sm hover:border-gray-400 hover:shadow-sm transition-all">
                            <Play className="w-4 h-4 text-violet-600 fill-violet-600" /> Watch Demo
                        </button>
                    </div>
                </div>
            </section>

            {/* ───── FOOTER ───── */}
            <footer className="bg-[#f5f5f4] py-12 border-t border-gray-200">
                <div className="max-w-6xl mx-auto px-6 md:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200 relative">
                                <div className="absolute inset-0 flex flex-col">
                                    <div className="h-1/2 bg-violet-600" />
                                    <div className="h-1/2 bg-cyan-500" />
                                </div>
                                <Zap className="relative z-10 w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-sm font-bold text-gray-600">WarmLeads</span>
                        </div>
                        <div className="flex items-center gap-8 text-sm text-gray-400">
                            {['Privacy', 'Terms', 'Security', 'Status'].map(item => (
                                <a key={item} href="#" className="hover:text-gray-700 transition-colors">{item}</a>
                            ))}
                        </div>
                        <p className="text-sm text-gray-400">© 2026 WarmLeads. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
