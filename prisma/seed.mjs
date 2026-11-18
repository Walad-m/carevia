import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting Carevia database seed...")

  // 1. System Administrator
  const adminEmail = "admin@carevia.gh"
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } })

  if (!existingAdmin) {
    const adminPassword = await bcrypt.hash("Admin123!", 12)
    await prisma.user.create({
      data: {
        name: "Carevia Administrator",
        email: adminEmail,
        password: adminPassword,
        role: "ADMIN",
        consentGivenAt: new Date(),
      },
    })
    console.log(`✅ Admin created: ${adminEmail} (Password: Admin123!)`)
  } else {
    console.log(`ℹ️ Admin already exists: ${adminEmail}`)
  }

  // 2. Approved Doctors (Ready for consultations)
  const approvedDoctors = [
    {
      name: "Dr. Kwame Mensah",
      email: "doctor@carevia.gh",
      password: "Doctor123!",
      specialty: "General Practice / Family Medicine",
      mdcId: "MDC/GP/2019/0421",
      phone: "+233 24 111 2233",
      bio: "Family physician with over 8 years experience in outpatient clinical medicine and chronic illness management.",
      status: "APPROVED",
      consultFee: 80,
    },
    {
      name: "Dr. Emmanuel Asante",
      email: "doctor.cardio@carevia.gh",
      password: "Doctor123!",
      specialty: "Cardiology",
      mdcId: "MDC/SPEC/2017/0118",
      phone: "+233 20 444 5566",
      bio: "Consultant Cardiologist specializing in adult cardiac health, hypertension, and preventive cardiovascular care.",
      status: "APPROVED",
      consultFee: 120,
    },
  ]

  for (const doc of approvedDoctors) {
    const existing = await prisma.user.findUnique({ where: { email: doc.email } })
    if (!existing) {
      const hashedPassword = await bcrypt.hash(doc.password, 12)
      await prisma.user.create({
        data: {
          name: doc.name,
          email: doc.email,
          password: hashedPassword,
          role: "DOCTOR",
          consentGivenAt: new Date(),
          doctorProfile: {
            create: {
              specialty: doc.specialty,
              mdcId: doc.mdcId,
              phone: doc.phone,
              bio: doc.bio,
              status: doc.status,
              consultFee: doc.consultFee,
              reviewedAt: new Date(),
            },
          },
        },
      })
      console.log(`✅ Approved Doctor created: ${doc.email} (Password: ${doc.password}) [${doc.specialty}]`)
    } else {
      console.log(`ℹ️ Doctor already exists: ${doc.email}`)
    }
  }

  // 3. Pending Doctor (to demo the Admin Approval workflow in /admin/doctors)
  const pendingDoc = {
    name: "Dr. Abena Osei",
    email: "doctor.pending@carevia.gh",
    password: "Doctor123!",
    specialty: "Pediatrics",
    mdcId: "MDC/PD/2024/0932",
    phone: "+233 26 777 8899",
    bio: "Pediatric specialist focused on neonatal care and childhood infectious diseases.",
    status: "PENDING",
    consultFee: 100,
  }

  const existingPending = await prisma.user.findUnique({ where: { email: pendingDoc.email } })
  if (!existingPending) {
    const hashedPassword = await bcrypt.hash(pendingDoc.password, 12)
    await prisma.user.create({
      data: {
        name: pendingDoc.name,
        email: pendingDoc.email,
        password: hashedPassword,
        role: "DOCTOR",
        consentGivenAt: new Date(),
        doctorProfile: {
          create: {
            specialty: pendingDoc.specialty,
            mdcId: pendingDoc.mdcId,
            phone: pendingDoc.phone,
            bio: pendingDoc.bio,
            status: "PENDING",
            consultFee: pendingDoc.consultFee,
          },
        },
      },
    })
    console.log(`✅ Pending Doctor created: ${pendingDoc.email} (Password: ${pendingDoc.password}) [MDC ID: ${pendingDoc.mdcId}]`)
  } else {
    console.log(`ℹ️ Pending Doctor already exists: ${pendingDoc.email}`)
  }

  // 4. Demo Patients
  const demoPatients = [
    {
      name: "Kofi Boateng",
      email: "patient@carevia.gh",
      password: "Patient123!",
      phone: "+233 24 333 4455",
      gender: "Male",
      bloodGroup: "O+",
      dateOfBirth: new Date("1992-05-14"),
      allergies: "None",
      emergencyContact: "Akosua Boateng (Spouse)",
      emergencyPhone: "+233 24 333 4456",
    },
    {
      name: "Ama Serwaa",
      email: "patient.ama@carevia.gh",
      password: "Patient123!",
      phone: "+233 50 999 0011",
      gender: "Female",
      bloodGroup: "A+",
      dateOfBirth: new Date("1996-11-20"),
      allergies: "Penicillin, NSAIDs",
      emergencyContact: "Kwabena Serwaa (Brother)",
      emergencyPhone: "+233 50 999 0012",
    },
  ]

  for (const pat of demoPatients) {
    const existing = await prisma.user.findUnique({ where: { email: pat.email } })
    if (!existing) {
      const hashedPassword = await bcrypt.hash(pat.password, 12)
      await prisma.user.create({
        data: {
          name: pat.name,
          email: pat.email,
          password: hashedPassword,
          role: "PATIENT",
          consentGivenAt: new Date(),
          patientProfile: {
            create: {
              phone: pat.phone,
              gender: pat.gender,
              bloodGroup: pat.bloodGroup,
              dateOfBirth: pat.dateOfBirth,
              allergies: pat.allergies,
              emergencyContact: pat.emergencyContact,
              emergencyPhone: pat.emergencyPhone,
            },
          },
        },
      })
      console.log(`✅ Demo Patient created: ${pat.email} (Password: ${pat.password}) [Blood Group: ${pat.bloodGroup}]`)
    } else {
      console.log(`ℹ️ Patient already exists: ${pat.email}`)
    }
  }

  // 5. Demo Appointment with Gemini AI Summary (Stage 2)
  const patientUser = await prisma.user.findUnique({ where: { email: "patient@carevia.gh" } })
  const doctorUser = await prisma.user.findUnique({ where: { email: "doctor@carevia.gh" } })

  if (patientUser && doctorUser) {
    const existingAppointment = await prisma.appointment.findFirst({
      where: { patientId: patientUser.id, doctorId: doctorUser.id },
    })

    if (!existingAppointment) {
      await prisma.appointment.create({
        data: {
          patientId: patientUser.id,
          doctorId: doctorUser.id,
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
          status: "PENDING",
          problemText:
            "Good day doctor, I have been having recurrent headaches on both temples for about 4 days now, especially in the late afternoons after working on my laptop. It feels like a tight band around my head. I have also felt mild neck tightness. I took 2 tablets of Paracetamol 500mg yesterday evening which reduced the pain for a few hours, but it returned this morning. No vomiting, no vision blurring.",
          aiSummary: `### Clinical Intake Summary (Gemini AI Distillation)
- **Chief Complaint:** Bilateral temporal tension-type headache and neck tightness ongoing for 4 days.
- **Clinical History & Progression:** Symptoms exacerbate late in the afternoon following prolonged screen time. Pain described as tight band pressure without photophobia, blurring of vision, or emesis.
- **Reported Treatments / Medications:** Paracetamol (acetaminophen) 1000mg oral dose taken previous evening with transient relief.
- **Red Flags / Urgent Notes:** None reported. No focal neurological deficits or severe acute signs.`,
        },
      })
      console.log("✅ Demo Appointment created with Gemini AI Clinical Summary")
    }
  }

  // 6. Disease Outbreak Alerts (Ghana Health Service Surveillance Hub)
  const outbreaks = [
    {
      title: "Cholera Surveillance & Water Sanitation Alert",
      disease: "Cholera",
      region: "Greater Accra & Central Regions",
      severity: "WARNING",
      summary: "Heightened acute watery diarrhea cases reported across coastal districts. Public health teams have escalated rapid response testing and water chlorinated interventions.",
      symptoms: "Profuse painless watery diarrhea ('rice-water stools'), rapid dehydration, muscle cramps, severe thirst, sunken eyes.",
      preventionTips: "Boil drinking water or use certified chlorine tablets; wash hands with soap under running water before eating; consume thoroughly cooked piping-hot meals; avoid unwashed street salads.",
      casesReported: 142,
      source: "Ghana Health Service (GHS) Surveillance Division",
      isActive: true,
    },
    {
      title: "Seasonal Malaria Peak & Febrile Illness Watch",
      disease: "Malaria (Plasmodium falciparum)",
      region: "Ashanti, Western, Eastern & Northern Belts",
      severity: "WATCH",
      summary: "Significant spike in outpatient febrile consultations following intermittent rain patterns and stagnant drainage. High risk observed in children under 5 and pregnant mothers.",
      symptoms: "Intermittent high fevers, shaking chills, profuse sweating, body aches, loss of appetite, fatigue.",
      preventionTips: "Sleep strictly under Long-Lasting Insecticidal Nets (LLINs); eliminate stagnant water within 50 meters of residential compounds; seek immediate RDT confirmation before antimalarial therapy.",
      casesReported: 480,
      source: "National Malaria Elimination Programme (NMEP)",
      isActive: true,
    },
    {
      title: "Mpox (Clade Ib) Vigilance at Points of Entry",
      disease: "Mpox",
      region: "All 16 Regions (Focus on KIA, Aflao, Elubo)",
      severity: "INFO",
      summary: "Port Health and border control points maintain strict temperature screening and symptom declarations in response to regional cross-border surveillance protocols.",
      symptoms: "Unexplained rash progressing from macules to vesicles, fever, swollen lymph nodes (lymphadenopathy), muscle pain, backache.",
      preventionTips: "Avoid skin-to-skin contact with individuals displaying active lesions; practice frequent hand hygiene; report unusual skin eruptions to the nearest health facility immediately.",
      casesReported: 12,
      source: "Ministry of Health & Ghana Health Service",
      isActive: true,
    },
  ]

  for (const item of outbreaks) {
    const existing = await prisma.outbreakAlert.findFirst({ where: { disease: item.disease } })
    if (!existing) {
      await prisma.outbreakAlert.create({ data: item })
      console.log(`✅ Outbreak Alert created: ${item.disease} - ${item.region}`)
    }
  }

  // 7. Curated Health Articles & Public Health Guides
  const articles = [
    {
      slug: "managing-hypertension-in-ghana",
      title: "Managing Hypertension in Ghana: Salt, Stress, and Everyday Diet Modifications",
      category: "Cardiovascular Health",
      readTime: "5 min read",
      authorName: "Dr. Emmanuel Asante",
      authorTitle: "Consultant Cardiologist, MDC Verified",
      featured: true,
      summary: "Over 34% of adult Ghanaians live with elevated blood pressure, often without symptoms. Discover culturally tailored dietary shifts, sodium reduction strategies, and home tracking tips.",
      content: `Hypertension is frequently termed the 'silent killer' across West Africa because up to 70% of individuals carrying high blood pressure experience no overt discomfort until complications arise.

In Ghana, traditional seasonings—including salted fish (momoni, kako, koobi), boullion cubes, and processed snacks—substantially elevate daily sodium intake well beyond the WHO recommended maximum of 2,000 mg per day.

### Actionable Dietary Steps:
1. **Rinse and Moderate Preserved Meats:** When preparing soups (light soup, groundnut soup, palm nut soup), soak salted fish thoroughly or replace a portion with fresh herbs like ginger, garlic, scent leaves (nunum), and rosemary.
2. **Potassium-Rich Staples:** Incorporate more plantains, leafy greens (kontomire, alefu), oranges, and garden eggs which naturally balance blood pressure.
3. **Consistent Home Monitoring:** Check blood pressure at the same time every morning before medications or caffeine. Keep a log for your virtual physician consultation.
4. **Stress Management in Urban Commutes:** Prolonged daily traffic in Accra and Kumasi spikes cortisol. Practice 10 minutes of controlled diaphragm breathing during transitions.`,
    },
    {
      slug: "malaria-vs-typhoid-warning-signs",
      title: "Malaria vs Typhoid: Key Warning Signs You Shouldn't Ignore",
      category: "Infectious Disease",
      readTime: "4 min read",
      authorName: "Dr. Kwame Mensah",
      authorTitle: "Family Physician, MDC Verified",
      featured: true,
      summary: "Why taking self-prescribed antibiotics and antimalarials simultaneously is dangerous, and how to spot the distinct hallmarks of malaria versus Salmonella enterica infection.",
      content: `In Ghanaian community pharmacies and chemical shops, patients experiencing fever, fatigue, and headache frequently request both an Artemisinin-based Combination Therapy (ACT) and Ciprofloxacin without laboratory verification.

This widespread practice drives both antimicrobial resistance and leaves the underlying cause improperly managed.

### Key Differentiating Characteristics:
- **Malaria Presentation:** Classic paroxysms characterized by intense chills, followed by a spiking fever, and concluding in drenching sweats. Onset is usually rapid within 24 to 48 hours.
- **Typhoid Fever Presentation:** Characterized by an insidious, 'step-ladder' fever that climbs progressively over 5 to 7 days, accompanied by profound malaise, abdominal discomfort, coated tongue, and bradycardia relative to temperature.

### Safe Protocol:
Never take antibiotics without prescription. Utilize Carevia's AI guided triage to match with a physician who can order a Rapid Diagnostic Test (RDT) or Blood Culture before treatment.`,
    },
    {
      slug: "childhood-fevers-when-to-seek-care",
      title: "Childhood Fevers: When to Use Virtual Care vs Rushing to the Emergency Room",
      category: "Pediatrics & Child Health",
      readTime: "4 min read",
      authorName: "Dr. Abena Osei",
      authorTitle: "Pediatric Specialist, MDC Verified",
      featured: false,
      summary: "A practical guide for Ghanaian parents on pediatric temperature management, febrile seizure warnings, and recognizing true red-flag signs.",
      content: `A child spiking a fever is one of the most stressful events for any parent or caregiver. While most childhood fevers stem from routine viral infections, knowing when to observe at home versus seeking urgent medical intervention is crucial.

### Emergency Red Flags (Proceed to nearest emergency department or call 112):
- Any fever in an infant younger than 3 months old.
- Inconsolable, high-pitched crying or extreme lethargy (inability to wake or make eye contact).
- Rigid or stiff neck, or purple pinpoint rash that does not fade under pressure.
- Rapid, grunting breathing or chest wall retractions.

### Suitable for Virtual Pediatric Consultation:
- Low-grade fever with mild runny nose or cough, where the child continues to take fluids and interact.
- Persistent mild symptoms after day 2 needing clinical review and medication dosage adjustments.`,
    },
  ]

  for (const art of articles) {
    const existing = await prisma.healthArticle.findUnique({ where: { slug: art.slug } })
    if (!existing) {
      await prisma.healthArticle.create({ data: art })
      console.log(`✅ Health Article created: ${art.title}`)
    }
  }

  console.log("✨ Seed completed successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
