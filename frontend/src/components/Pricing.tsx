'use client';
import React, { useState } from 'react';
import { Check, Sparkles, Zap, Shield, Crown } from 'lucide-react';

interface PricingProps {
  onSelectPlan?: (planName: string) => void;
}

export const Pricing: React.FC<PricingProps> = ({ onSelectPlan }) => {
  const [isAnnual, setIsAnnual] = useState<boolean>(false);

  const plans = [
    {
      name: "Free Tier",
      subtitle: "Experience WarmLeads",
      priceMonthly: "₹0",
      priceAnnual: "₹0",
      period: "/ month",
      badge: "Free Forever",
      badgeStyle: "bg-gray-800 text-gray-300 border-gray-700",
      isPopular: false,
      ctaText: "Start Free — No Card Required",
      features: [
        "50 emails / month",
        "15 prospect research credits",
        "1 follow-up sequence",
        "Basic open/reply tracking",
        "WarmLeads email branding"
      ]
    },
    {
      name: "Starter Tier",
      subtitle: "For Solopreneurs & Freelancers",
      priceMonthly: "₹5,000",
      priceAnnual: "₹4,000",
      period: "/ month",
      badge: "Most Popular",
      badgeStyle: "bg-violet-accent/20 text-violet-300 border-violet-500/40 shadow-violet-glow",
      isPopular: true,
      ctaText: "Upgrade to Starter",
      features: [
        "300 emails / month",
        "Unlimited prospect research & scraping",
        "5-touchpoint sequences",
        "Custom sending domain (Resend API)",
        "Full analytics dashboard",
        "Priority email support",
        "No WarmLeads branding"
      ]
    },
    {
      name: "Growth Tier",
      subtitle: "For Growing Teams & Founders",
      priceMonthly: "₹12,000",
      priceAnnual: "₹9,800",
      period: "/ month",
      badge: "For Scale",
      badgeStyle: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-cyan-glow",
      isPopular: false,
      ctaText: "Scale Outreach",
      features: [
        "1,000 emails / month",
        "Everything in Starter +",
        "HubSpot & Notion CRM sync",
        "3–4 Mailbox rotation",
        "A/B Subject line testing",
        "LinkedIn profile research layer",
        "Up to 3 team seats"
      ]
    },
    {
      name: "Agency Tier",
      subtitle: "For Agencies & Consultants",
      priceMonthly: "₹25,000+",
      priceAnnual: "₹20,000+",
      period: "/ month",
      badge: "White Label",
      badgeStyle: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      isPopular: false,
      ctaText: "Book Agency Call",
      features: [
        "Unlimited emails / month",
        "Everything in Growth +",
        "100% White-label (custom domain & logo)",
        "Multi-client workspace dashboard",
        "Unlimited team seats",
        "Dedicated IP / domain pool",
        "Priority LLM processing queue"
      ]
    }
  ];

  return (
    <section id="pricing" className="py-16 space-y-10 max-w-7xl mx-auto px-4">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-semibold uppercase tracking-widest text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20">
          Transparent Pricing
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Flexible Plans for Every Growth Stage
        </h2>
        <p className="text-gray-400 text-sm">
          Start for free with Neon DB & Gmail API. Upgrade anytime for custom domains & unlimited scaling.
        </p>

        {/* Monthly / Annual Toggle */}
        <div className="flex items-center justify-center gap-3 pt-4">
          <span className={`text-xs font-medium ${!isAnnual ? 'text-white' : 'text-gray-400'}`}>Monthly</span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-12 h-6 rounded-full bg-obsidian-700 p-1 relative transition border border-gray-700"
          >
            <div className={`w-4 h-4 rounded-full bg-violet-accent transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
          <span className={`text-xs font-medium flex items-center gap-1.5 ${isAnnual ? 'text-white' : 'text-gray-400'}`}>
            Annual Billing
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full font-bold">Save 20%</span>
          </span>
        </div>
      </div>

      {/* 4-Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`rounded-2xl p-6 flex flex-col justify-between transition-all relative ${
              plan.isPopular
                ? 'bg-obsidian-800/90 border-2 border-violet-accent shadow-violet-glow scale-[1.02]'
                : 'glass-panel border-gray-800 hover:border-gray-700'
            }`}
          >
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${plan.badgeStyle}`}>
                  {plan.badge}
                </span>
                {plan.isPopular && <Sparkles className="w-4 h-4 text-violet-accent animate-pulse" />}
              </div>

              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <p className="text-xs text-gray-400 mt-1 min-h-[32px]">{plan.subtitle}</p>

              {/* Price */}
              <div className="my-5 pb-5 border-b border-gray-800">
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  {isAnnual ? plan.priceAnnual : plan.priceMonthly}
                </span>
                <span className="text-xs text-gray-400 font-medium ml-1">{plan.period}</span>
              </div>

              {/* Features List */}
              <ul className="space-y-2.5 text-xs text-gray-300 mb-6">
                {plan.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-glow shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => onSelectPlan?.(plan.name)}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-lg ${
                plan.isPopular
                  ? 'btn-glowing-border text-white shadow-violet-glow'
                  : 'bg-obsidian-700 hover:bg-obsidian-600 text-gray-100 border border-gray-700'
              }`}
            >
              {plan.ctaText}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
