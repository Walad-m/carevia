export const MEDICAL_SPECIALTIES = [
  "General Practice / Family Medicine",
  "Internal Medicine",
  "Pediatrics",
  "Obstetrics & Gynaecology",
  "General Surgery",
  "Orthopaedics & Trauma",
  "Cardiology",
  "Dermatology & Venereology",
  "Ophthalmology",
  "Ear, Nose & Throat (ENT)",
  "Neurology",
  "Psychiatry & Mental Health",
  "Radiology & Imaging",
  "Urology",
  "Nephrology",
  "Oncology",
  "Endocrinology & Diabetes",
  "Gastroenterology",
  "Pulmonology & Respiratory",
  "Rheumatology",
  "Emergency & Acute Medicine",
  "Dental & Oral Surgery",
  "Anaesthesiology",
  "Pathology & Laboratory Medicine",
] as const

export const BLOOD_GROUPS = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-",
] as const

export const GENDERS = ["Male", "Female", "Prefer not to say"] as const

// Carevia 20% Discounted Telemedicine Pricing (Ghana Market Benchmark)
export const MARKET_GP_FEE_GHS = 100
export const MARKET_SPECIALIST_FEE_GHS = 150

export const GP_CONSULT_FEE_GHS = 80 // 20% off
export const SPECIALIST_CONSULT_FEE_GHS = 120 // 20% off

export const PLATFORM_FEE_GHS = Number(process.env.NEXT_PUBLIC_PLATFORM_FEE) || GP_CONSULT_FEE_GHS
