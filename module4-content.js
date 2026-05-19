// ADITLOA Module 4 — RENAL & GU PATHOPHYSIOLOGY
// Version 1.0.0 — Block 2 Kickoff

export const MOD4_DATABASE = [
  // --- RENAL CORE ---
  {
    id: 'aki_prerenal',
    name: 'Prerenal AKI',
    category: 'renal',
    highYield: true,
    chain: [
      { type: 'cause', label: 'Hypoperfusion', detail: 'Decreased blood flow to the kidney due to shock, dehydration, or HF.' },
      { type: 'mechanism', label: 'Decreased GFR', detail: 'Lowered hydrostatic pressure in the glomerulus reduces filtration rate.' },
      { type: 'structural', label: 'Intact Nephrons', detail: 'The kidney structure is initially normal; the problem is "before" the kidney.' },
      { type: 'functional', label: 'RAAS Activation', detail: 'Kidneys conserve salt and water to restore systemic volume.' },
      { type: 'clinical', label: 'Oliguria', detail: 'Sudden drop in urine output (<0.5 mL/kg/hr).' },
      { type: 'lab', label: 'BUN:Cr > 20:1 / FeNa < 1%', detail: 'High urea reabsorption and efficient sodium conservation.' },
      { type: 'complication', label: 'Ischemic ATN', detail: 'Prolonged hypoperfusion leads to actual structural damage (Intrarenal).' }
    ],
    scenarios: [
        {
            symptoms: "Patient with severe diarrhea for 3 days has dry mouth and BP of 90/60. Urine output is 10mL in 4 hours.",
            vitals: { bp: '90/60', hr: 115, spo2: 98, temp: 98.6 },
            clues: ["BUN: 45 (High)", "Creatinine: 1.5 (Slightly High)", "FeNa: 0.5%"],
            interventions: [
                { label: 'Isotonic IV Fluids', correct: true, feedback: 'CORRECT. Restoring volume reverses the prerenal state.' },
                { label: 'Give Furosemide (Lasix)', correct: false, feedback: 'INCORRECT. Diuretics will worsen the volume depletion and hypoperfusion.' }
            ]
        }
    ]
  },
  {
    id: 'atn_intrarenal',
    name: 'Acute Tubular Necrosis (ATN)',
    category: 'renal',
    highYield: true,
    chain: [
      { type: 'cause', label: 'Ischemia / Nephrotoxins', detail: 'Prolonged shock or drugs (Aminoglycosides, Contrast) damage tubules.' },
      { type: 'mechanism', label: 'Tubular Cell Death', detail: 'Epithelial cells necrose and slough off into the lumen.' },
      { type: 'structural', label: 'Cylindrical Casts', detail: 'Dead cells clump together, forming "muddy brown" casts.' },
      { type: 'functional', label: 'Lumen Obstruction', detail: 'Casts block the tubule, increasing back-pressure and stopping GFR.' },
      { type: 'clinical', label: 'Fixed Specific Gravity', detail: 'Kidney loses the ability to concentrate or dilute urine.' },
      { type: 'lab', label: 'FeNa > 2% / Muddy Brown Casts', detail: 'The damaged kidney cannot reabsorb sodium.' },
      { type: 'complication', label: 'Hyperkalemia / Metabolic Acidosis', detail: 'Loss of electrolyte and acid-base regulation.' }
    ],
    scenarios: [
        {
            symptoms: "Patient post-septic shock has rising Creatinine despite normal BP now. Urine is dark.",
            vitals: { bp: '122/75', hr: 80, spo2: 96, temp: 98.6 },
            clues: ["Microscopy: Muddy brown granular casts", "FeNa: 3.2%"],
            interventions: [
                { label: 'Fluid Balance & Monitor K+', correct: true, feedback: 'CORRECT. Management is supportive while tubules regenerate.' },
                { label: 'Give IV Gentamicin', correct: false, feedback: 'INCORRECT. Gentamicin is nephrotoxic and could worsen ATN.' }
            ]
        }
    ]
  },
  {
    id: 'nephrotic_syndrome_classic',
    name: 'Nephrotic Syndrome',
    category: 'renal',
    highYield: true,
    chain: [
      { type: 'cause', label: 'Podocyte Injury', detail: 'Damage to the filtration slits (e.g., Minimal Change, Diabetes).' },
      { type: 'mechanism', label: 'Massive Proteinuria', detail: 'Loss of >3.5g of protein per day in the urine.' },
      { type: 'structural', label: 'Hypoalbuminemia', detail: 'Liver cannot keep up with the massive loss of albumin.' },
      { type: 'functional', label: 'Low Oncotic Pressure', detail: 'Fluid leaks out of the vessels because albumin is missing.' },
      { type: 'clinical', label: 'Anasarca (Full Body Edema)', detail: 'Severe swelling, especially periorbital and pretibial.' },
      { type: 'lab', label: 'Hyperlipidemia / Fatty Casts', detail: 'Liver makes extra lipids to compensate for low protein.' },
      { type: 'complication', label: 'Hypercoagulability', detail: 'Loss of Antithrombin III in urine increases clot risk.' }
    ],
    scenarios: [
        {
            symptoms: "A 6yo child has puffy eyes and swollen ankles. Mother says his urine looks 'foamy'.",
            vitals: { bp: '105/65', hr: 90, spo2: 99, temp: 98.6 },
            clues: ["Urine Protein: 4+ (Large)", "Albumin: 1.8 (Low)"],
            interventions: [
                { label: 'Steroids (Corticosteroids)', correct: true, feedback: 'CORRECT. Minimal Change Disease is highly steroid-responsive.' },
                { label: 'High Salt Diet', correct: false, feedback: 'INCORRECT. Salt will worsen the profound edema.' }
            ]
        }
    ]
  },
  {
    id: 'nephritic_syndrome_gn',
    name: 'Nephritic Syndrome (GN)',
    category: 'renal',
    highYield: true,
    chain: [
      { type: 'cause', label: 'Immune Complex Deposition', detail: 'Inflammation of the glomerulus (e.g., Post-Strep GN).' },
      { type: 'mechanism', label: 'Glomerular Inflammation', detail: 'Neutrophils and cytokines damage the capillary walls.' },
      { type: 'structural', label: 'RBC Leakage', detail: 'Red blood cells pass through the inflamed, porous basement membrane.' },
      { type: 'functional', label: 'Reduced Surface Area', detail: 'Inflammation clogs the filter, reducing GFR.' },
      { type: 'clinical', label: 'Hematuria & Hypertension', detail: 'Cola-colored urine and fluid retention due to low GFR.' },
      { type: 'lab', label: 'RBC Casts / Dysmorphic RBCs', detail: 'Proof of glomerular bleeding.' },
      { type: 'complication', label: 'Acute Renal Failure', detail: 'Rapidly progressive GN can lead to total kidney shutdown.' }
    ],
    scenarios: [
        {
            symptoms: "A 10yo has 'tea-colored' urine and a headache. He had a sore throat 2 weeks ago.",
            vitals: { bp: '155/95', hr: 85, spo2: 98, temp: 98.6 },
            clues: ["Urine: Red cell casts", "ASO Titer: Positive"],
            interventions: [
                { label: 'BP Control & Sodium Restriction', correct: true, feedback: 'CORRECT. Managing HTN and fluid is key in Post-Strep GN.' },
                { label: 'Push 2L Fluid Bolus', correct: false, feedback: 'INCORRECT. The patient is already hypertensive and fluid overloaded.' }
            ]
        }
    ]
  },
  {
    id: 'ckd_progression',
    name: 'Chronic Kidney Disease',
    category: 'renal',
    chain: [
      { type: 'cause', label: 'Diabetes / HTN', detail: 'Years of hyperfiltration or high pressure scar the nephrons.' },
      { type: 'mechanism', label: 'Glomerulosclerosis', detail: 'Replacement of functional filter units with non-functional scar tissue.' },
      { type: 'structural', label: 'Adaptive Hypertrophy', detail: 'Remaining nephrons work harder, leading to further damage (vicious cycle).' },
      { type: 'functional', label: 'Uremic Syndrome', detail: 'Systemic buildup of nitrogenous waste (BUN) and toxins.' },
      { type: 'clinical', label: 'Pruritus / Uremic Frost', detail: 'Itchy skin and waste crystals on the skin surface.' },
      { type: 'lab', label: 'GFR < 60 for 3+ Months', detail: 'The definition of chronic kidney dysfunction.' },
      { type: 'complication', label: 'Renal Osteodystrophy', detail: 'Bone disease due to low Vit D and high Phosphorus.' }
    ],
    scenarios: [
        {
            symptoms: "Patient with long-term Diabetes has high Phosphorus and low Calcium. Reports bone pain.",
            vitals: { bp: '148/92', hr: 78, spo2: 96, temp: 98.6 },
            clues: ["GFR: 22 (Stage 4)", "Phosphorus: 6.2 (High)"],
            interventions: [
                { label: 'Phosphate Binders', correct: true, feedback: 'CORRECT. Prevents absorption of phosphorus to protect bones.' },
                { label: 'High Protein Diet', correct: false, feedback: 'INCORRECT. Protein breakdown increases uremic waste in CKD.' }
            ]
        }
    ]
  },
  {
    id: 'aki_postrenal',
    name: 'Postrenal AKI',
    category: 'renal',
    chain: [
      { type: 'cause', label: 'BPH / Stones', detail: 'Physical obstruction of urine flow below the level of the kidney.' },
      { type: 'mechanism', label: 'Retrograde Pressure', detail: 'Urine backs up, increasing hydrostatic pressure in Bowman\'s space.' },
      { type: 'structural', label: 'Hydronephrosis', detail: 'Dilation of the renal pelvis and calyces due to pressure.' },
      { type: 'functional', label: 'GFR Collapse', detail: 'Backward pressure equals filtration pressure, stopping the filter.' },
      { type: 'clinical', label: 'Anuria / Pain', detail: 'Sudden total stop of urine flow or intense flank/suprapubic pain.' },
      { type: 'lab', label: 'Post-Void Residual > 100mL', detail: 'Proof that urine is being made but not evacuated.' },
      { type: 'complication', label: 'Irreversible Atrophy', detail: 'Chronic pressure eventually kills the functional kidney tissue.' }
    ],
    scenarios: [
        {
            symptoms: "75yo male with history of BPH has not voided in 12 hours. Lower abdomen is distended and painful.",
            vitals: { bp: '140/90', hr: 95, spo2: 98, temp: 99.0 },
            clues: ["Ultrasound: Bilateral Hydronephrosis", "Bladder: Palpable mass"],
            interventions: [
                { label: 'Emergency Catheterization', correct: true, feedback: 'CORRECT. Relieving the obstruction restores GFR immediately.' },
                { label: 'Aggressive IVF', correct: false, feedback: 'INCORRECT. Adding more fluid to a blocked system will increase pain and pressure.' }
            ]
        }
    ]
  },
  {
    id: 'pyelonephritis_full',
    name: 'Pyelonephritis',
    category: 'renal',
    chain: [
      { type: 'cause', label: 'Ascending UTI', detail: 'Bacteria (usually E. coli) travel from the bladder to the kidneys.' },
      { type: 'mechanism', label: 'Tubulointerstitial Inflammation', detail: 'Bacterial invasion triggers a massive neutrophil response.' },
      { type: 'structural', label: 'Renal Pelvic Edema', detail: 'The kidney becomes swollen and covered in small abscesses.' },
      { type: 'functional', label: 'Temporary GFR Impairment', detail: 'Inflammation slows down normal tubular function.' },
      { type: 'clinical', label: 'CVA Tenderness / Fever', detail: 'Fever, chills, and intense pain when the back is tapped.' },
      { type: 'lab', label: 'WBC Casts in Urine', detail: 'Hallmark finding indicating the infection is in the kidney itself.' },
      { type: 'complication', label: 'Urosepsis', detail: 'Bacteria enter the systemic circulation via the renal vessels.' }
    ],
    scenarios: [
        {
            symptoms: "Young female has 103F fever, shaking chills, and intense right-sided back pain.",
            vitals: { bp: '110/65', hr: 110, spo2: 97, temp: 103.2 },
            clues: ["Urine: Positive Nitrites and Leukocyte Esterase", "Exam: Positive CVA Tenderness"],
            interventions: [
                { label: 'IV Antibiotics & Culture', correct: true, feedback: 'CORRECT. Upper UTI requires aggressive antimicrobial therapy.' },
                { label: 'Heating pad to back only', correct: false, feedback: 'INCORRECT. Pain is secondary to a life-threatening infection.' }
            ]
        }
    ]
  },
  {
    id: 'nephrolithiasis_full',
    name: 'Nephrolithiasis (Stones)',
    category: 'renal',
    chain: [
      { type: 'cause', label: 'Supersaturation', detail: 'High concentration of solutes (Calcium, Oxalate) in urine.' },
      { type: 'mechanism', label: 'Crystal Precipitation', detail: 'Solutes come out of solution and form solid aggregates.' },
      { type: 'structural', label: 'Calculus Formation', detail: 'Aggregates grow into stones, often in the renal pelvis.' },
      { type: 'functional', label: 'Ureteral Peristalsis Obstruction', detail: 'The stone blocks the ureter, causing smooth muscle spasms.' },
      { type: 'clinical', label: 'Renal Colic / Hematuria', detail: 'Excruciating waves of flank pain radiating to the groin.' },
      { type: 'lab', label: 'CT Abdomen/Pelvis (Non-con)', detail: 'Gold standard for visualizing the location and size of stones.' },
      { type: 'complication', label: 'Hydronephrosis / Infection', detail: 'Obstruction leads to pressure buildup and static urine prone to infection.' }
    ],
    scenarios: [
        {
            symptoms: "Patient is rolling on the floor in agony, clutching his left side. Pain comes in waves.",
            vitals: { bp: '150/90', hr: 105, spo2: 98, temp: 98.6 },
            clues: ["Urine: Macroscopic hematuria", "Pain: Radiates to the scrotum"],
            interventions: [
                { label: 'Analgesics & Hydration', correct: true, feedback: 'CORRECT. Pain management and fluid to help pass the stone.' },
                { label: 'Start Heparin', correct: false, feedback: 'INCORRECT. Heparin is an anticoagulant and not indicated for stones.' }
            ]
        }
    ]
  }
];

export const MODULE4_RIG_METADATA = (MOD4_DATABASE || []).map(d => ({ id: d.id, label: d.name }));

export const MODULE4_QUIZ_DATA = (MOD4_DATABASE || []).map(d => ({ 
    q: `Identify the hallmark finding for ${d.name}.`,
    opts: [d.chain?.[5]?.label || 'Lab Finding', 'Normal Exam', 'Hypotension', 'Tachycardia'],
    ans: 0,
    rationales: [d.chain?.[5]?.detail || 'Hallmark finding.', 'Incorrect', 'Incorrect', 'Incorrect']
}));

export const MODULE4_CLINICAL_SUMMARIES = (MOD4_DATABASE || []).reduce((acc, d) => {
    acc[d.id] = { 
        mechanism: d.chain?.[1]?.detail || 'Underlying mechanism.', 
        pearl: d.chain?.[2]?.detail || 'Clinical pearl.', 
        visual: d.chain?.[0]?.label || d.name 
    };
    return acc;
}, {});

export const MODULE4_PATHOPHYSIOLOGY_DATA = (MOD4_DATABASE || []).map(d => ({ 
    act: "Module 4: Renal Dynamics", 
    day: "N/A", 
    event: d.name, 
    location: "clinic",
    beats: [{ text: d.name, speaker: 'alfie', diagram: [] }],
    q: `What is the hallmark of ${d.name}?`,
    opts: [d.chain?.[5]?.label || 'Lab result', 'No symptoms', 'Clear lungs', 'Normal heart rate'],
    ans: 0,
    rationales: [d.chain?.[5]?.detail || 'Key diagnostic finding.', 'Incorrect', 'Incorrect', 'Incorrect']
}));

export const MODULE4_NPC_DATA = [
  { id: 'dr_nephro', name: 'Dr. Nephro', image: 'https://rosebud.ai/assets/kenji-stocky-sprite.webp?BsZX', steps: [0, 1, 2, 3, 4] }
];

export const MODULE4_WORLD_LOCATIONS = [
  { id: 'clinic', label: 'WESTBRIDGE RENAL CLINIC', interior: 'https://rosebud.ai/assets/clinic-interior.webp?PvB0' }
];

export const MOD4_GAME_MODES = [
    { id: 'renal_lab', name: 'Renal Lab', icon: '🧫', description: 'Analyze kidney filtration chains.' },
    { id: 'nephron_builder', name: 'Nephron Builder', icon: '🧬', description: 'Reconstruct tubular transport.' },
    { id: 'electrolyte_sim', name: 'Ion Arena', icon: '🔋', description: 'Master K+, Na+, and Ca++ balance.' },
    { id: 'dialysis_unit', name: 'Dialysis Unit', icon: '⛲', description: 'Manage end-stage complications.' }
];
