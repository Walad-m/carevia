import { db } from "@/lib/db"
import { HomeNavbar } from "@/components/home/navbar"
import { OutbreakBanner } from "@/components/home/outbreak-banner"
import { HomeHeroSection } from "@/components/home/hero-section"
import { OutbreakRadarSection, OutbreakAlertData } from "@/components/home/outbreak-radar"
import { HowItWorksSection } from "@/components/home/how-it-works"
import { HealthArticlesSection } from "@/components/home/articles-section"
import { PricingSection } from "@/components/home/pricing-section"
import { TrustLayerSection } from "@/components/home/trust-layer"
import { HomeFooter } from "@/components/home/footer"
import { FALLBACK_OUTBREAK_ALERTS, FALLBACK_ARTICLES } from "@/lib/fallback-content"

export const instant = false

export default async function HomePage() {
  // 1. Fetch active outbreak alerts from database with safe fallback
  let outbreakAlerts: OutbreakAlertData[] = FALLBACK_OUTBREAK_ALERTS
  try {
    const alerts = await (db as any).outbreakAlert?.findMany?.({
      where: { isActive: true },
      orderBy: { publishedAt: "desc" },
    })
    if (alerts && alerts.length > 0) {
      outbreakAlerts = alerts as OutbreakAlertData[]
    }
  } catch (err) {
    console.warn("[OUTBREAK_FETCH_FALLBACK]", err)
  }

  // 2. Fetch articles from database with safe fallback
  let articles: any[] = FALLBACK_ARTICLES
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
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* 1. Outbreak Alert Ticker */}
      <OutbreakBanner alerts={outbreakAlerts} />

      {/* 2. Top Navigation */}
      <HomeNavbar />

      <main className="flex-1">
        {/* 3. Hero Section with AI Intake Demo */}
        <HomeHeroSection />

        {/* 4. GHS Outbreak Surveillance Radar */}
        <OutbreakRadarSection alerts={outbreakAlerts} />

        {/* 5. 5-Step Care Pathway */}
        <HowItWorksSection />

        {/* 6. Curated Medical Articles */}
        <HealthArticlesSection articles={articles} />

        {/* 7. Discounted Telemedicine Pricing (-20%) */}
        <PricingSection />

        {/* 8. The Trust Layer */}
        <TrustLayerSection />
      </main>

      {/* 9. Ghanaian Healthcare Footer */}
      <HomeFooter />
    </div>
  )
}
