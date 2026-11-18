import { db } from "@/lib/db"
import { HomeNavbar } from "@/components/home/navbar"
import { OutbreakBanner } from "@/components/home/outbreak-banner"
import { HomeHeroSection } from "@/components/home/hero-section"
import { HowItWorksSection } from "@/components/home/how-it-works"
import { PricingSection } from "@/components/home/pricing-section"
import { TrustLayerSection } from "@/components/home/trust-layer"
import { HomeFooter } from "@/components/home/footer"
import { FALLBACK_OUTBREAK_ALERTS } from "@/lib/fallback-content"

export const instant = false

export default async function HomePage() {
  // Fetch active outbreak alerts for subtle top announcement
  let outbreakAlerts = FALLBACK_OUTBREAK_ALERTS
  try {
    const alerts = await (db as any).outbreakAlert?.findMany?.({
      where: { isActive: true },
      orderBy: { publishedAt: "desc" },
    })
    if (alerts && alerts.length > 0) {
      outbreakAlerts = alerts
    }
  } catch (err) {
    console.warn("[OUTBREAK_FETCH_FALLBACK]", err)
  }

  return (
    <div className="min-h-screen bg-white text-slate-950 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* 1. Subtle Apple-style Public Health Announcement */}
      <OutbreakBanner alerts={outbreakAlerts} />

      {/* 2. Frosted Apple Navigation */}
      <HomeNavbar />

      <main className="flex-1">
        {/* 3. Hero: Grand Typography & Live Consultation Showpiece */}
        <HomeHeroSection />

        {/* 4. Care Pathway & Technology Bento */}
        <HowItWorksSection />

        {/* 5. Clear, Transparent Pricing */}
        <PricingSection />

        {/* 6. Privacy & MDC Clinical Governance */}
        <TrustLayerSection />
      </main>

      {/* 7. Apple Footnote & Footer */}
      <HomeFooter />
    </div>
  )
}
