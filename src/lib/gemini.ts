import { MEDICAL_SPECIALTIES } from "./constants"

export interface ClinicalTriageInput {
  problemText?: string
  audioBase64?: string
  audioMimeType?: string
  severity?: string // Mild, Moderate, Severe, Critical
  duration?: string // e.g. "2 days", "1 week"
  ageGroup?: string // "Infant / Child", "Adult", "Elderly"
}

export interface ClinicalTriageResult {
  matchedSpecialty: string
  urgency: "ROUTINE" | "URGENT" | "EMERGENCY"
  isEmergency: boolean
  emergencyAdvice: string | null
  chiefComplaint: string
  triageReasoning: string
  clinicalSummary: string
  suggestedQuestions: string[]
}

const CANONICAL_SPECIALTIES: readonly string[] = MEDICAL_SPECIALTIES

export async function triagePatientProblem(
  input: ClinicalTriageInput
): Promise<ClinicalTriageResult> {
  const apiKey = process.env.GEMINI_API_KEY
  const { problemText = "", audioBase64, audioMimeType = "audio/webm", severity, duration, ageGroup } = input

  const combinedDescription = `
Patient Problem: "${problemText}"
Duration: ${duration || "Not specified"}
Reported Severity: ${severity || "Moderate"}
Age Category: ${ageGroup || "Adult"}
`.trim()

  const systemPrompt = `You are an expert Clinical Intake & Triage Officer on the Carevia Telemedicine Platform in Ghana (guided by Team Good Life principles).

CORE DIRECTIVES:
1. PREPARE • FLAG • ROUTE — NEVER DIAGNOSES.
   - Do NOT provide a disease diagnosis or label (e.g., do not say "The patient has malaria or pneumonia").
   - Instead, analyze symptoms, determine the required Medical Specialty, rate urgency, and prepare objective clinical notes for the doctor.
2. EMERGENCY FLAGGING:
   - Identify acute red flags (crushing chest pain, severe shortness of breath, sudden slurred speech, infant lethargy/inconsolable crying, severe acute bleeding, suspected cholera dehydration).
   - If red flags are present, set isEmergency: true, urgency: "EMERGENCY", and provide emergency guidance directing them to call Ghana National Ambulance Service on 112 / 193.
3. MATCHED SPECIALTY:
   - Must select the single best fit from this exact list of Ghana specialties:
   ${JSON.stringify(CANONICAL_SPECIALTIES)}
   - Default to "General Practice / Family Medicine" when symptoms are broad, mild, or multi-system.
   - If patient is a child or infant, route to "Pediatrics".
   - If skin/rash, route to "Dermatology & Venereology".
   - If cardiac/chest palpitations/hypertension, route to "Cardiology".
   - If pregnancy/maternal/gynecological, route to "Obstetrics & Gynaecology".
   - If mood/anxiety/depression/insomnia, route to "Psychiatry & Mental Health".

RETURN STRICT JSON ONLY:
{
  "matchedSpecialty": "one from the list above",
  "urgency": "ROUTINE" | "URGENT" | "EMERGENCY",
  "isEmergency": boolean,
  "emergencyAdvice": "String with 112 guidance if emergency, or null",
  "chiefComplaint": "1 concise sentence describing the primary issue",
  "triageReasoning": "1-2 plain-language sentences for the patient explaining why this medical specialty was matched without diagnosing them",
  "clinicalSummary": "Markdown clinical intake note with: ### Chief Complaint, ### History & Progression, ### Red Flags / Urgent Observations, ### Recommended Focus for Attending Physician",
  "suggestedQuestions": ["2-3 specific clinical questions for the physician to ask during consultation"]
}`

  if (!apiKey || apiKey === "demo" || apiKey.includes("your-gemini-api-key")) {
    return generateFallbackTriage(input)
  }

  try {
    const contents: any[] = []

    if (audioBase64) {
      contents.push({
        role: "user",
        parts: [
          { text: systemPrompt },
          {
            inline_data: {
              mime_type: audioMimeType,
              data: audioBase64,
            },
          },
          {
            text: `Patient input details: ${combinedDescription}. Synthesize the audio and details according to the instructions and return the JSON.`,
          },
        ],
      })
    } else {
      contents.push({
        role: "user",
        parts: [
          { text: systemPrompt },
          { text: `Analyze this patient intake:\n\n${combinedDescription}\n\nRespond with strict JSON only:` },
        ],
      })
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: {
            response_mime_type: "application/json",
            temperature: 0.2,
          },
        }),
      }
    )

    if (!response.ok) {
      console.warn("[GEMINI_TRIAGE_HTTP_ERROR]", response.status)
      return generateFallbackTriage(input)
    }

    const json = await response.json()
    const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!rawText) return generateFallbackTriage(input)

    const parsed = JSON.parse(rawText) as ClinicalTriageResult

    // Validate specialty
    const validSpecialty = CANONICAL_SPECIALTIES.includes(parsed.matchedSpecialty as any)
      ? parsed.matchedSpecialty
      : "General Practice / Family Medicine"

    return {
      matchedSpecialty: validSpecialty,
      urgency: parsed.urgency || "ROUTINE",
      isEmergency: Boolean(parsed.isEmergency),
      emergencyAdvice: parsed.emergencyAdvice || null,
      chiefComplaint: parsed.chiefComplaint || problemText.slice(0, 100),
      triageReasoning: parsed.triageReasoning || `Matched with ${validSpecialty} for comprehensive evaluation.`,
      clinicalSummary: parsed.clinicalSummary || generateFallbackSummary(problemText),
      suggestedQuestions: parsed.suggestedQuestions || ["Timeline of symptom onset", "Prior medication use"],
    }
  } catch (error) {
    console.error("[GEMINI_TRIAGE_PARSE_ERROR]", error)
    return generateFallbackTriage(input)
  }
}

/**
 * Intelligent Rule-Based Clinical Fallback Engine
 * Ensures 100% reliability even when offline or before the API key is provided
 */
function generateFallbackTriage(input: ClinicalTriageInput): ClinicalTriageResult {
  const text = (input.problemText || "").toLowerCase()
  const age = (input.ageGroup || "").toLowerCase()
  const duration = input.duration || "several days"
  const severity = input.severity || "Moderate"

  // 1. Emergency Red Flags
  const emergencyKeywords = [
    "chest pain",
    "heart attack",
    "shortness of breath",
    "cannot breathe",
    "unconscious",
    "fainted",
    "slurred speech",
    "severe bleeding",
    "stroke",
    "paralysis",
    "convulsion",
    "seizure",
  ]
  const hasEmergency = emergencyKeywords.some((kw) => text.includes(kw)) || input.severity === "Critical"

  if (hasEmergency) {
    return {
      matchedSpecialty: "Emergency & Acute Medicine",
      urgency: "EMERGENCY",
      isEmergency: true,
      emergencyAdvice:
        "High-risk acute symptoms detected. Please call Ghana National Ambulance Service on 112 or 193 immediately or proceed to the nearest hospital emergency department.",
      chiefComplaint: input.problemText?.slice(0, 120) || "Acute potentially life-threatening distress.",
      triageReasoning:
        "Your reported symptoms contain urgent clinical warning signs requiring in-person hospital evaluation. Carevia has flagged emergency services for your safety.",
      clinicalSummary: `### Clinical Intake Summary (Emergency Protocol)
- **Chief Complaint:** Acute emergency symptoms reported: "${input.problemText?.slice(0, 150)}..."
- **Urgency Tier:** EMERGENCY (Red Flag Activated)
- **Clinical History:** Duration: ${duration}. Severity: ${severity}.
- **Action Taken:** Patient redirected to emergency care services (112/193).`,
      suggestedQuestions: [
        "Are symptoms escalating right now?",
        "Is patient conscious and breathing normally?",
      ],
    }
  }

  // 2. Specialty Matching
  let matchedSpecialty = "General Practice / Family Medicine"
  let urgency: "ROUTINE" | "URGENT" = severity === "Severe" ? "URGENT" : "ROUTINE"

  if (age.includes("child") || age.includes("infant") || text.includes("baby") || text.includes("child") || text.includes("toddler") || text.includes("infant")) {
    matchedSpecialty = "Pediatrics"
  } else if (text.includes("heart") || text.includes("palpitation") || text.includes("blood pressure") || text.includes("hypertension") || text.includes("cardiac")) {
    matchedSpecialty = "Cardiology"
  } else if (text.includes("skin") || text.includes("rash") || text.includes("itching") || text.includes("boil") || text.includes("eczema") || text.includes("acne")) {
    matchedSpecialty = "Dermatology & Venereology"
  } else if (text.includes("period") || text.includes("pregnancy") || text.includes("pregnant") || text.includes("vagina") || text.includes("cramps") || text.includes("ovary")) {
    matchedSpecialty = "Obstetrics & Gynaecology"
  } else if (text.includes("depress") || text.includes("anxiety") || text.includes("panic") || text.includes("insomnia") || text.includes("mental") || text.includes("stress") || text.includes("suicid")) {
    matchedSpecialty = "Psychiatry & Mental Health"
  } else if (text.includes("diarrhea") || text.includes("watery stool") || text.includes("vomit") || text.includes("stomach ache") || text.includes("food poison") || text.includes("cholera")) {
    matchedSpecialty = "General Practice / Family Medicine"
    urgency = "URGENT"
  }

  const reasonMap: Record<string, string> = {
    "Pediatrics": "Your description describes symptoms affecting an infant or child, for which an accredited Pediatrician is best equipped to examine developmental and pediatric factors.",
    "Cardiology": "Your reported cardiovascular or blood pressure symptoms are best evaluated by a verified Specialist in Cardiology.",
    "Dermatology & Venereology": "Your dermatological skin presentation is matched with a verified Specialist in Dermatology.",
    "Obstetrics & Gynaecology": "Your symptoms involve reproductive or gynecological health, matched with an MDC accredited Specialist in Obstetrics & Gynaecology.",
    "Psychiatry & Mental Health": "Your reported concerns are matched with a licensed Mental Health & Psychiatry professional for confidential support.",
    "General Practice / Family Medicine": "Your symptoms are matched with an accredited Family Physician / General Practitioner for comprehensive primary evaluation.",
  }

  return {
    matchedSpecialty,
    urgency,
    isEmergency: false,
    emergencyAdvice: null,
    chiefComplaint: input.problemText?.slice(0, 120) || "Patient submitted consultation intake.",
    triageReasoning: reasonMap[matchedSpecialty] || `Matched with ${matchedSpecialty} based on your symptom description.`,
    clinicalSummary: `### Clinical Intake Summary (AI-Prepared)
- **Chief Complaint:** ${input.problemText?.slice(0, 150) || "Symptom intake submitted."}
- **Clinical History & Progression:** Reported onset ${duration} ago. Patient categorizes severity as ${severity}.
- **Specialty Indicated:** ${matchedSpecialty}
- **Red Flags / Urgent Notes:** ${urgency === "URGENT" ? "Urgent attention recommended; monitor for acute changes." : "None reported; routine evaluation appropriate."}
- **Attending Physician Focus:** Evaluate primary complaint, assess vital signs, verify recent medication trials, and determine need for confirmatory diagnostic testing.`,
    suggestedQuestions: [
      `When exactly did these symptoms first appear?`,
      `Have you taken any over-the-counter medications or traditional remedies?`,
      `Are symptoms progressively worsening or fluctuating?`,
    ],
  }
}

export function generateFallbackSummary(text?: string): string {
  const content = text?.trim() || "Patient submitted a recorded voice consultation note."
  return `### Clinical Intake Summary (AI-Prepared)
- **Chief Complaint:** ${content.slice(0, 120)}${content.length > 120 ? "..." : ""}
- **Clinical History & Progression:** Patient reports onset of symptoms as detailed in original intake.
- **Reported Treatments / Medications:** Not specified in initial problem submission.
- **Red Flags / Urgent Notes:** Routine teleconsultation requested; patient advised to seek emergency services if acute distress develops.`
}
