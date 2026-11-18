import { OutbreakAlertData } from "@/components/home/outbreak-radar"
import { ArticleData } from "@/components/home/article-modal"

export const FALLBACK_OUTBREAK_ALERTS: OutbreakAlertData[] = [
  {
    id: "alert-cholera-2026",
    title: "Cholera Surveillance & Water Sanitation Alert",
    disease: "Cholera",
    region: "Greater Accra & Central Regions",
    severity: "WARNING",
    summary:
      "Heightened acute watery diarrhea cases reported across coastal districts. Public health teams have escalated rapid response testing and water chlorinated interventions.",
    symptoms:
      "Profuse painless watery diarrhea, rapid dehydration, muscle cramps, severe thirst, sunken eyes.",
    preventionTips:
      "Boil drinking water or use certified chlorine tablets. Wash hands with soap under running water before eating. Consume thoroughly cooked hot meals, and avoid unwashed street salads.",
    casesReported: 142,
    source: "Ghana Health Service (GHS) Surveillance Division",
    publishedAt: new Date(),
  },
  {
    id: "alert-malaria-2026",
    title: "Seasonal Malaria Peak & Febrile Illness Watch",
    disease: "Malaria (Plasmodium falciparum)",
    region: "Ashanti, Western, Eastern & Northern Belts",
    severity: "WATCH",
    summary:
      "Significant spike in outpatient febrile consultations following intermittent rain patterns and stagnant drainage. High risk observed in children under 5 and pregnant mothers.",
    symptoms:
      "Intermittent high fevers, shaking chills, profuse sweating, body aches, loss of appetite, fatigue.",
    preventionTips:
      "Sleep strictly under Long-Lasting Insecticidal Nets (LLINs). Eliminate stagnant water within 50 meters of residential compounds. Seek immediate RDT confirmation before antimalarial therapy.",
    casesReported: 480,
    source: "National Malaria Elimination Programme (NMEP)",
    publishedAt: new Date(),
  },
  {
    id: "alert-mpox-2026",
    title: "Mpox Vigilance at Points of Entry",
    disease: "Mpox",
    region: "All 16 Regions (Focus on KIA, Aflao, Elubo)",
    severity: "INFO",
    summary:
      "Port Health and border control points maintain strict temperature screening and symptom declarations in response to regional cross-border surveillance protocols.",
    symptoms:
      "Unexplained rash progressing from macules to vesicles, fever, swollen lymph nodes, muscle pain, backache.",
    preventionTips:
      "Avoid skin-to-skin contact with individuals displaying active lesions. Practice frequent hand hygiene, and report unusual skin eruptions to the nearest health facility immediately.",
    casesReported: 12,
    source: "Ministry of Health & Ghana Health Service",
    publishedAt: new Date(),
  },
]

export const FALLBACK_ARTICLES: ArticleData[] = [
  {
    id: "art-hypertension-gh",
    slug: "managing-hypertension-in-ghana",
    title: "Managing Hypertension in Ghana: Salt, Stress, and Everyday Diet Modifications",
    category: "Cardiovascular Health",
    readTime: "5 min read",
    authorName: "Dr. Emmanuel Asante",
    authorTitle: "Consultant Cardiologist, MDC Verified",
    featured: true,
    summary:
      "Over 34% of adult Ghanaians live with elevated blood pressure, often without symptoms. Discover culturally tailored dietary shifts, sodium reduction strategies, and home tracking tips.",
    content: `Hypertension is frequently termed the silent killer across West Africa because up to 70% of individuals carrying high blood pressure experience no overt discomfort until complications arise.

In Ghana, traditional seasonings (including salted fish such as momoni, kako, and koobi, bouillon cubes, and processed snacks) substantially elevate daily sodium intake well beyond the WHO recommended maximum of 2,000 mg per day.

Actionable Dietary Steps:
1. Rinse and Moderate Preserved Meats: When preparing soups (light soup, groundnut soup, palm nut soup), soak salted fish thoroughly or replace a portion with fresh herbs like ginger, garlic, scent leaves (nunum), and rosemary.
2. Potassium-Rich Staples: Incorporate more plantains, leafy greens (kontomire, alefu), oranges, and garden eggs which naturally balance blood pressure.
3. Consistent Home Monitoring: Check blood pressure at the same time every morning before medications or caffeine. Keep a log for your virtual physician consultation.
4. Stress Management in Urban Commutes: Prolonged daily traffic in Accra and Kumasi spikes cortisol. Practice 10 minutes of controlled diaphragm breathing during transitions.`,
    publishedAt: new Date(),
  },
  {
    id: "art-malaria-typhoid",
    slug: "malaria-vs-typhoid-warning-signs",
    title: "Malaria vs Typhoid: Key Warning Signs You Shouldn't Ignore",
    category: "Infectious Disease",
    readTime: "4 min read",
    authorName: "Dr. Kwame Mensah",
    authorTitle: "Family Physician, MDC Verified",
    featured: true,
    summary:
      "Why taking self-prescribed antibiotics and antimalarials simultaneously is dangerous, and how to spot the distinct hallmarks of malaria versus Salmonella enterica infection.",
    content: `In Ghanaian community pharmacies and chemical shops, patients experiencing fever, fatigue, and headache frequently request both an Artemisinin-based Combination Therapy (ACT) and Ciprofloxacin without laboratory verification.

This widespread practice drives both antimicrobial resistance and leaves the underlying cause improperly managed.

Key Differentiating Characteristics:
- Malaria Presentation: Classic paroxysms characterized by intense chills, followed by a spiking fever, and concluding in drenching sweats. Onset is usually rapid within 24 to 48 hours.
- Typhoid Fever Presentation: Characterized by an insidious step-ladder fever that climbs progressively over 5 to 7 days, accompanied by profound malaise, abdominal discomfort, coated tongue, and slow heart rate relative to temperature.

Safe Protocol:
Never take antibiotics without a physician prescription. Utilize Carevia's clinical triage to match with a physician who can order a Rapid Diagnostic Test (RDT) or Blood Culture before treatment.`,
    publishedAt: new Date(),
  },
  {
    id: "art-childhood-fevers",
    slug: "childhood-fevers-when-to-seek-care",
    title: "Childhood Fevers: When to Use Virtual Care vs Rushing to the Emergency Room",
    category: "Pediatrics & Child Health",
    readTime: "4 min read",
    authorName: "Dr. Abena Osei",
    authorTitle: "Pediatric Specialist, MDC Verified",
    featured: false,
    summary:
      "A practical guide for Ghanaian parents on pediatric temperature management, febrile seizure warnings, and recognizing true red-flag signs.",
    content: `A child spiking a fever is one of the most stressful events for any parent or caregiver. While most childhood fevers stem from routine viral infections, knowing when to observe at home versus seeking urgent medical intervention is crucial.

Emergency Red Flags (Proceed to nearest emergency department or call 112):
- Any fever in an infant younger than 3 months old.
- Inconsolable, high-pitched crying or extreme lethargy (inability to wake or make eye contact).
- Rigid or stiff neck, or purple pinpoint rash that does not fade under pressure.
- Rapid, grunting breathing or chest wall retractions.

Suitable for Virtual Pediatric Consultation:
- Low-grade fever with mild runny nose or cough, where the child continues to take fluids and interact.
- Persistent mild symptoms after day 2 needing clinical review and medication dosage adjustments.`,
    publishedAt: new Date(),
  },
]
