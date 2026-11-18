import { db } from "@/lib/db"
import { HomeNavbar } from "@/components/home/navbar"
import { OutbreakBanner } from "@/components/home/outbreak-banner"
import { HomeHeroSection } from "@/components/home/hero-section"
import { HowItWorksSection } from "@/components/home/how-it-works"
import { HealthArticlesSection } from "@/components/home/articles-section"
import { PricingSection } from "@/components/home/pricing-section"
import { TrustLayerSection } from "@/components/home/trust-layer"
import { HomeFooter } from "@/components/home/footer"
import { FALLBACK_OUTBREAK_ALERTS, FALLBACK_ARTICLES } from "@/lib/fallback-content"

export const instant = false

export default async function HomePage() {
  // 1. Fetch active outbreak alerts
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

  // 2. Fetch curated health articles
  let articles = FALLBACK_ARTICLES
  try {
    const fetchedArticles = await (db as any).healthArticle?.findMany?.({
      orderBy: { publishedAt: "desc" },
    })
    if (fetchedArticles && fetchedArticles.length > 0) {
      articles = fetchedArticles
    }
  } catch (err) {
    console.warn("[ARTICLES_FETCH_FALLBACK]", err)
  }

  return (
    <div className="min-h-screen bg-white text-slate-950 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* 1. Subtle Public Health Announcement with direct link to articles */}
      <OutbreakBanner alerts={outbreakAlerts} />

      {/* 2. Frosted Apple Navigation */}
      <HomeNavbar />

      <main className="flex-1">
        {/* 3. Hero: Grand Typography & Live Consultation Showpiece */}
        <HomeHeroSection />

        {/* 4. Care Pathway & Technology Bento */}
        <HowItWorksSection />

        {/* 5. Evidence-Based Clinical Articles & Guides */}
        <HealthArticlesSection articles={articles} />

        {/* 6. Clear, Transparent Pricing */}
        <PricingSection />

        {/* 7. Privacy & MDC Clinical Governance */}
        <TrustLayerSection />
      </main>

      {/* 8. Apple Footnote & Footer */}
      <HomeFooter />
    </div>
  )
}
