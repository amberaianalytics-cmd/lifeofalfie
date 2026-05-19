import React, { useState, useMemo, useEffect } from 'react';
import { MOD3_DATABASE, MOD3_GAME_MODES } from './module3-content.js';

const e = React.createElement;

export default function Module3Engine({ operatorName, onBack, activeMode, onModeChange }) {
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', msg: '', rationale: '' }
  const [weakConcepts, setWeakConcepts] = useState([]); // Track missed concepts for Adaptive Exam

  const setActiveMode = (mode) => {
    setFeedback(null);
    onModeChange(mode);
  };

  // --- SHARED UI COMPONENTS ---

  function FeedbackOverlay({ onNext }) {
    if (!feedback) return null;
    const isCorrect = feedback.type === 'success';
    return e('div', { className: `mod3-feedback-overlay ${feedback.type} fade-in` },
      e('div', { className: 'feedback-card' },
        e('div', { className: 'feedback-header-box' },
            e('h1', { className: isCorrect ? 'text-green' : 'text-red' }, isCorrect ? '✓ CORRECT' : '✗ INCORRECT'),
            e('h2', { className: 'matrix-text' }, feedback.msg)
        ),
        e('div', { className: 'feedback-rationale-box' },
            e('div', { className: 'rationale-label' }, 'PHYSIOLOGIC RATIONALE:'),
            e('div', { className: 'feedback-rationale' }, feedback.rationale)
        ),
        feedback.complication && e('div', { className: 'feedback-complication-box' },
            e('div', { className: 'rationale-label' }, 'POTENTIAL COMPLICATION:'),
            e('div', { className: 'feedback-complication' }, feedback.complication)
        ),
        e('button', { className: 'btn-cyber feedback-btn', autoFocus: true, onClick: () => { setFeedback(null); onNext && onNext(); } }, 'CONTINUE [ENTER]')
      )
    );
  }

  function MechanismChain({ chain, currentStep = 7, showAll = false }) {
    return e('div', { className: 'mod3-chain-container' },
      chain.slice(0, showAll ? 7 : currentStep).map((item, idx) => e('div', { 
        key: idx, 
        className: `mod3-chain-node ${item.type} ${!showAll && idx === currentStep-1 ? 'active' : ''}`
      },
        e('div', { className: 'node-label' }, item.type.toUpperCase()),
        e('div', { className: 'node-content' }, item.label),
        idx < 6 && (showAll || idx < 6) && e('div', { className: 'node-arrow' }, '→')
      ))
    );
  }

  // --- MODE: MECHANISM LAB (Explorer) ---
  function MechanismLab() {
    const [selectedId, setSelectedId] = useState(MOD3_DATABASE[0].id);
    const [step, setStep] = useState(1);
    const [showFull, setShowFull] = useState(false);

    const disease = MOD3_DATABASE.find(d => d.id === selectedId) || MOD3_DATABASE[0];

    useEffect(() => {
        const handleKey = (ev) => {
            if (ev.key === 'ArrowRight') setStep(s => Math.min(7, s + 1));
            if (ev.key === 'ArrowLeft') setStep(s => Math.max(1, s - 1));
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    return e('div', { className: 'mod3-lab-screen fade-in' },
      e('div', { className: 'lab-sidebar' },
        e('div', { className: 'sidebar-header matrix-text' }, 'MECHANISM CATALOG'),
        e('div', { className: 'sidebar-scroll' },
            MOD3_DATABASE.map(d => e('div', {
              key: d.id,
              className: `sidebar-item ${selectedId === d.id ? 'active' : ''}`,
              onClick: () => { setSelectedId(d.id); setStep(1); setShowFull(false); }
            }, d.name))
        )
      ),
      e('div', { className: 'lab-main' },
        e('div', { className: 'lab-display' },
            e('div', { className: 'category-badge' }, disease.category.toUpperCase()),
            e('h2', { className: 'matrix-text lab-title' }, disease.name),
            e(MechanismChain, { chain: disease.chain, currentStep: step, showAll: showFull }),
            !showFull && e('div', { className: 'step-explanation fade-in', key: step },
                e('div', { className: 'explanation-title matrix-text' }, disease.chain[step-1].label),
                e('p', { className: 'explanation-text' }, disease.chain[step-1].detail)
            )
        ),
        e('div', { className: 'lab-controls' },
          e('button', { className: 'btn-cyber-small', onClick: () => setShowFull(!showFull) }, showFull ? 'STEP-BY-STEP VIEW' : 'VIEW FULL CHAIN'),
          !showFull && e('div', { className: 'nav-group' },
              e('button', { disabled: step === 1, onClick: () => setStep(s => s - 1) }, '← PREV'),
              e('div', { className: 'step-count' }, `PHASE ${step} / 7`),
              e('button', { disabled: step === 7, onClick: () => setStep(s => s + 1) }, 'NEXT →')
          ),
          e('button', { className: 'btn-cyber-small', onClick: () => setStep(1) }, 'RESET')
        )
      )
    );
  }

  // --- MODE: PATHWAY BUILDER (Logic Reconstruction) ---
  function PathwayBuilder() {
    const [disease, setDisease] = useState(() => MOD3_DATABASE[Math.floor(Math.random() * MOD3_DATABASE.length)]);
    const [slots, setSlots] = useState(new Array(7).fill(null));
    const [scrambled, setScrambled] = useState(() => [...disease.chain].sort(() => Math.random() - 0.5));

    const handleSelectPool = (item) => {
        const firstEmpty = slots.indexOf(null);
        if (firstEmpty === -1) return;
        const newSlots = [...slots];
        newSlots[firstEmpty] = item;
        setSlots(newSlots);
    };

    const validate = () => {
        const firstErrorIdx = slots.findIndex((s, i) => !s || s.label !== disease.chain[i].label);
        if (firstErrorIdx === -1) {
            setScore(s => s + 100);
            setFeedback({ 
                type: 'success', 
                msg: `STABILIZED: ${disease.name}`, 
                rationale: `Perfect sequence. The process flows from ${disease.chain[0].label} through ${disease.chain[3].label} to ${disease.chain[6].label}.`,
                complication: disease.chain[6].detail
            });
        } else {
            const errorStep = disease.chain[firstErrorIdx];
            setFeedback({ 
                type: 'error', 
                msg: `SEQUENCE ERROR at Step ${firstErrorIdx + 1}`, 
                rationale: `Expected "${errorStep.label}". ${errorStep.detail}` 
            });
        }
    };

    const nextDisease = () => {
        const next = MOD3_DATABASE[Math.floor(Math.random() * MOD3_DATABASE.length)];
        setDisease(next);
        setSlots(new Array(7).fill(null));
        setScrambled([...next.chain].sort(() => Math.random() - 0.5));
    };

    return e('div', { className: 'mod3-builder-screen fade-in' },
      e('div', { className: 'builder-header' }, e('h2', { className: 'matrix-text' }, `RECONSTRUCT CHAIN: ${disease.name}`)),
      e('div', { className: 'builder-layout' },
        e('div', { className: 'slots-column' },
            slots.map((s, i) => e('div', { key: i, className: `path-slot ${s ? 'filled' : 'empty'}` }, 
                e('span', { className: 'slot-num' }, i + 1),
                e('span', { className: 'slot-type' }, disease.chain[i].type.toUpperCase()),
                e('span', { className: 'slot-label' }, s ? s.label : 'DROP HERE')
            ))
        ),
        e('div', { className: 'pool-column' },
            e('div', { className: 'pool-header matrix-text' }, 'MECHANISM PIECES'),
            e('div', { className: 'pool-grid' },
                scrambled.map((item, i) => {
                    const used = slots.some(s => s?.label === item.label);
                    return e('button', { key: i, className: `pool-btn ${used ? 'used' : ''}`, onClick: () => !used && handleSelectPool(item) }, item.label);
                })
            )
        )
      ),
      e('div', { className: 'builder-controls' },
        e('button', { className: 'btn-cyber', onClick: () => setSlots(new Array(7).fill(null)) }, 'CLEAR'),
        e('button', { className: 'btn-cyber submit-btn', onClick: validate }, 'VERIFY LOGIC')
      ),
      e(FeedbackOverlay, { onNext: nextDisease })
    );
  }

  // --- UNIVERSAL SIM ENGINE (Coronary, Pulm, Shock, ED) ---
  function ClinicalSim({ type }) {
    const [scenario, setScenario] = useState(null);
    const [answered, setAnswered] = useState(false);

    const pool = useMemo(() => {
        if (type === 'coronary') return MOD3_DATABASE.filter(d => d.category === 'cardiovascular');
        if (type === 'pulm') return MOD3_DATABASE.filter(d => d.category === 'respiratory');
        if (type === 'shock') return MOD3_DATABASE.filter(d => d.category === 'shock');
        if (type === 'hemo') return MOD3_DATABASE.filter(d => d.category === 'coagulation' || d.category === 'hematology');
        if (type === 'ed') return MOD3_DATABASE; // Mixed triage
        return MOD3_DATABASE;
    }, [type]);

    const refresh = () => {
        let d = pool[Math.floor(Math.random() * pool.length)];
        // Ensure disease has scenarios
        while (!d.scenarios || d.scenarios.length === 0) {
            d = pool[Math.floor(Math.random() * pool.length)];
        }
        const s = d.scenarios[Math.floor(Math.random() * d.scenarios.length)];
        setScenario({ ...s, disease: d.name, category: d.category, complication: d.chain[6].label });
        setAnswered(false);
    };

    useEffect(() => refresh(), [type]);

    const handleAnswer = (choice) => {
        if (answered) return;
        setAnswered(true);
        if (choice.correct) {
            setScore(s => s + 50);
            setFeedback({ 
                type: 'success', 
                msg: 'PHYSIOLOGIC STABILITY RESTORED', 
                rationale: choice.feedback,
                complication: scenario.complication
            });
        } else {
            setWeakConcepts(prev => [...prev, scenario.disease]);
            setFeedback({ 
                type: 'error', 
                msg: 'SYSTEM COLLAPSE', 
                rationale: choice.feedback 
            });
        }
    };

    if (!scenario) return null;

    const modeLabel = {
        coronary: 'CARDIAC INTERVENTION',
        pulm: 'RESPIRATORY SUPPORT',
        shock: 'HEMODYNAMIC STABILIZATION',
        hemo: 'HEMATOLOGIC ACTION',
        ed: 'TRIAGE DECISION'
    }[type] || 'CLINICAL ACTION';

    return e('div', { className: 'mod3-sim-screen fade-in' },
      e('div', { className: 'sim-header' },
        e('div', { className: 'sim-type-badge matrix-text' }, `${type.toUpperCase()} SIMULATOR`),
        e('div', { className: 'sim-disease-label' }, `PRESENTATION: ${scenario.disease.toUpperCase()}`)
      ),
      e('div', { className: 'sim-hud-v2' },
        e('div', { className: 'vitals-monitor' },
            e('div', { className: 'monitor-header' }, 'REAL-TIME VITALS'),
            e('div', { className: 'vitals-grid' },
                e('div', { className: 'vital-box' }, e('label', null, 'BP'), e('span', { className: 'val' }, scenario.vitals.bp)),
                e('div', { className: 'vital-box' }, e('label', null, 'HR'), e('span', { className: 'val yellow' }, scenario.vitals.hr)),
                e('div', { className: 'vital-box' }, e('label', null, 'SpO2'), e('span', { className: 'val cyan' }, `${scenario.vitals.spo2}%`)),
                e('div', { className: 'vital-box' }, e('label', null, 'TEMP'), e('span', { className: 'val' }, `${scenario.vitals.temp}F`))
            )
        ),
        e('div', { className: 'clinical-evidence' },
            e('div', { className: 'monitor-header' }, 'DIAGNOSTIC CLUES'),
            e('div', { className: 'clues-list' },
                scenario.clues?.map((c, i) => e('div', { key: i, className: 'clue-item' }, `> ${c}`))
            )
        )
      ),
      e('div', { className: 'sim-main-v2' },
        e('div', { className: 'scenario-box' },
            e('p', { className: 'symptoms-text' }, scenario.symptoms)
        ),
        e('div', { className: 'intervention-grid' },
            e('div', { className: 'intervention-label matrix-text' }, `${modeLabel}:`),
            e('div', { className: 'choices-wrap' },
                scenario.interventions.map((choice, i) => e('button', { 
                    key: i, 
                    className: 'btn-cyber choice-btn',
                    onClick: () => handleAnswer(choice)
                }, choice.label))
            )
        )
      ),
      e(FeedbackOverlay, { onNext: refresh })
    );
  }

  // --- MODE: CLOT RUNNER (Paced Perfusion Action) ---
  function ClotRunner() {
    const [lane, setLane] = useState(1);
    const [clots, setClots] = useState([]);
    const [pickups, setPickups] = useState([]);
    const [distance, setDistance] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [speed, setSpeed] = useState(3); // Slower for readability

    useEffect(() => {
        if (isGameOver || feedback) return;
        const tick = setInterval(() => {
            setDistance(d => d + 1);
            setClots(prev => prev.map(c => ({ ...c, y: c.y + speed })).filter(c => c.y < 100));
            setPickups(prev => prev.map(p => ({ ...p, y: p.y + speed })).filter(p => p.y < 100));
            
            // Varied logic: obstacle type based on distance
            const spawnChance = 0.08 + (distance / 5000); // Increases difficulty slowly
            if (Math.random() < spawnChance) {
                let type = 'clot';
                if (distance > 1000) type = Math.random() > 0.5 ? 'clot' : 'plaque';
                if (distance > 2000) type = Math.random() > 0.3 ? (Math.random() > 0.5 ? 'clot' : 'plaque') : 'embolus';
                
                setClots(prev => [...prev, { id: Math.random(), lane: Math.floor(Math.random() * 3), y: 0, type }]);
            }
            if (Math.random() < 0.04) {
                setPickups(prev => [...prev, { id: Math.random(), lane: Math.floor(Math.random() * 3), y: 0, type: 'O2' }]);
            }
        }, 200); 
        return () => clearInterval(tick);
    }, [isGameOver, feedback, speed, distance]);

    useEffect(() => {
        const handleKey = (ev) => {
            if (ev.key === 'ArrowLeft') setLane(l => Math.max(0, l - 1));
            if (ev.key === 'ArrowRight') setLane(l => Math.min(2, l + 1));
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    // Collision
    useEffect(() => {
        const hitClot = clots.find(c => c.lane === lane && c.y > 75 && c.y < 90);
        if (hitClot) {
            setIsGameOver(true);
            setFeedback({ 
                type: 'error', 
                msg: hitClot.type === 'clot' ? 'VASCULAR OBSTRUCTION' : 'PLAQUE RUPTURE', 
                rationale: hitClot.type === 'clot' 
                    ? "A thrombus has occluded the vessel, causing immediate downstream ischemia and hypoxemia." 
                    : "Plaque build-up narrows the lumen, increasing resistance and risking acute occlusion."
            });
        }
        const hitPickup = pickups.find(p => p.lane === lane && p.y > 75 && p.y < 90);
        if (hitPickup) {
            setScore(s => s + 25);
            setPickups(prev => prev.filter(p => p.id !== hitPickup.id));
        }
    }, [clots, pickups, lane]);

    return e('div', { className: 'mod3-runner-screen' },
      e('div', { className: 'runner-hud' }, 
        e('div', null, `PERFUSION DISTANCE: ${distance}um`),
        e('div', { className: 'text-green' }, `O2 SATURATION: STABLE`),
        e('div', null, `SCORE: ${score}`)
      ),
      e('div', { className: 'vessel-area' },
        e('div', { className: 'vessel-wall left' }),
        [0, 1, 2].map(i => e('div', { key: i, className: `vessel-lane ${lane === i ? 'active' : ''}` })),
        e('div', { className: 'vessel-wall right' }),
        clots.map(c => e('div', { key: c.id, className: `clot-obstacle ${c.type}`, style: { left: `${c.lane * 33.3}%`, top: `${c.y}%` } }, c.type.toUpperCase())),
        pickups.map(p => e('div', { key: p.id, className: 'pickup-o2', style: { left: `${p.lane * 33.3}%`, top: `${p.y}%` } }, 'O2')),
        e('div', { className: 'player-cell', style: { left: `${lane * 33.3 + 16.6}%` } }, 
            e('div', { className: 'erythrocyte-art' }, 'RBC')
        )
      ),
      e('div', { className: 'runner-instructions' }, 'USE ARROW KEYS TO NAVIGATE VESSEL FLOW // COLLECT O2 // AVOID THROMBI'),
      e(FeedbackOverlay, { onNext: () => { setIsGameOver(false); setDistance(0); setClots([]); setPickups([]); } })
    );
  }

  // --- MODE: FINAL INTEGRATION (Domino visualizer) ---
  function IntegrationSim() {
    const [pathway, setPathway] = useState('cardio');
    const [step, setStep] = useState(0);

    const chains = {
        cardio: [
            { label: 'Atherosclerosis', rationale: 'LDL oxidation and plaque formation narrow the coronary lumen.' },
            { label: 'Myocardial Infarction', rationale: 'Plaque rupture triggers thrombus, causing irreversible myocyte death.' },
            { label: 'Left Heart Failure', rationale: 'Necrotic muscle fails to eject blood, increasing LVEDP.' },
            { label: 'Pulmonary Edema', rationale: 'Backup pressure forces fluid into alveoli, causing crackles and orthopnea.' },
            { label: 'Cardiogenic Shock', rationale: 'Systemic perfusion fails as the primary pump collapses.' }
        ],
        respiratory: [
            { label: 'Smoking/Alpha-1', rationale: 'Protease/Antiprotease imbalance destroys alveolar elastin.' },
            { label: 'COPD/Emphysema', rationale: 'Alveoli fuse and lose recoil, causing air trapping and hyperinflation.' },
            { label: 'Chronic Hypoxemia', rationale: 'Persistent low O2 triggers reactive pulmonary vasoconstriction.' },
            { label: 'Pulm Hypertension', rationale: 'Increased vascular resistance forces the RV to work harder.' },
            { label: 'Cor Pulmonale', rationale: 'Right ventricle fails due to primary lung disease; JVD and edema follow.' }
        ],
        sepsis: [
            { label: 'Systemic Infection', rationale: 'Pathogens enter the blood, triggering a massive cytokine storm.' },
            { label: 'Profound Vasodilation', rationale: 'Nitric oxide release causes systemic vascular resistance to collapse.' },
            { label: 'Capillary Leak', rationale: 'Cytokines increase permeability; fluid escapes into the interstitium.' },
            { label: 'Distributive Shock', rationale: 'Preload and SVR both drop, causing critical hypotension.' },
            { label: 'DIC/Organ Failure', rationale: 'Widespread clotting consumes factors, leading to multi-system hemorrhage.' }
        ],
        renal_cardio: [
            { label: 'Renal Artery Stenosis', rationale: 'Decreased perfusion to the kidney triggers the RAAS cascade.' },
            { label: 'Secondary Hypertension', rationale: 'Angiotensin II and Aldosterone cause systemic vasoconstriction and fluid retention.' },
            { label: 'Left Ventricular Hypertrophy', rationale: 'Chronic high afterload causes the heart wall to thicken and stiffen.' },
            { label: 'Diastolic Dysfunction', rationale: 'The stiff heart cannot fill properly, raising backward pressure.' },
            { label: 'Flash Pulmonary Edema', rationale: 'Sudden surge in pressure leads to rapid alveolar fluid accumulation.' }
        ],
        liver_coag: [
            { label: 'Chronic Cirrhosis', rationale: 'Fibrosis destroys hepatocytes responsible for protein synthesis.' },
            { label: 'Hypoalbuminemia', rationale: 'Loss of oncotic pressure causes fluid to leak into the abdomen (Ascites).' },
            { label: 'Factor Deficiency', rationale: 'Liver can no longer produce Vitamin K-dependent clotting factors.' },
            { label: 'Portal Hypertension', rationale: 'Blood backs up into the esophagus, creating fragile varices.' },
            { label: 'Massive Hematemesis', rationale: 'Ruptured varices and poor clotting lead to life-threatening hemorrhage.' }
        ],
        valve_failure: [
            { label: 'Aortic Stenosis', rationale: 'Calcified valve restricts blood flow from the LV to the Aorta.' },
            { label: 'Concentric Hypertrophy', rationale: 'The LV thickens significantly to overcome the high resistance.' },
            { label: 'Myocardial O2 Demand ↑', rationale: 'The massive muscle requires more oxygen than the coronaries can provide.' },
            { label: 'Exertional Syncope', rationale: 'Brain is deprived of blood when cardiac output cannot meet demand during activity.' },
            { label: 'Sudden Cardiac Death', rationale: 'Extreme hypertrophy leads to lethal ventricular arrhythmias.' }
        ],
        pulm_embolism: [
            { label: 'Deep Vein Thrombosis', rationale: 'Stasis or injury leads to a clot in the deep leg veins.' },
            { label: 'Clot Embolization', rationale: 'The thrombus detaches and travels through the right heart to the lungs.' },
            { label: 'V/Q Mismatch', rationale: 'Lungs have ventilation (air) but no perfusion (blood), preventing gas exchange.' },
            { label: 'Acute Right Strain', rationale: 'Sudden backup pressure causes the thin-walled RV to dilate and fail.' },
            { label: 'Obstructive Shock', rationale: 'Blood cannot return to the left heart, causing systemic BP to plummet.' }
        ],
        trauma_dic: [
            { label: 'Crush Injury', rationale: 'Massive tissue destruction releases Tissue Factor into circulation.' },
            { label: 'Widespread Thrombi', rationale: 'The extrinsic pathway triggers microclots in every organ.' },
            { label: 'Platelet Consumption', rationale: 'Tiny clots use up all available platelets and fibrinogen.' },
            { label: 'Diffuse Hemorrhage', rationale: 'The body can no longer form functional clots; patient bleeds from all sites.' },
            { label: 'Ischemic Organ Failure', rationale: 'Microthrombi block nutrient flow to the kidneys, liver, and brain.' }
        ]
    };

    const currentChain = chains[pathway];

    return e('div', { className: 'mod3-integration-screen fade-in' },
        e('div', { className: 'integration-header' },
            e('h2', { className: 'matrix-text' }, 'SYSTEM INTEGRATION DOMINOES'),
            e('div', { className: 'path-tabs' },
                Object.keys(chains).map(k => e('button', { key: k, className: pathway === k ? 'active' : '', onClick: () => { setPathway(k); setStep(0); } }, k.toUpperCase()))
            )
        ),
        e('div', { className: 'domino-container' },
            currentChain.map((c, i) => e('div', { key: i, className: `domino-card ${i <= step ? 'active' : 'inactive'} ${i < step ? 'collapsed' : ''}` },
                e('div', { className: 'domino-num' }, i + 1),
                e('div', { className: 'domino-label matrix-text' }, c.label),
                i === step && e('div', { className: 'domino-rationale' }, c.rationale),
                i < step && e('div', { className: 'domino-status' }, '✓ COLLAPSED')
            ))
        ),
        e('div', { className: 'integration-controls' },
            step < currentChain.length - 1 && e('button', { className: 'btn-cyber', onClick: () => setStep(s => s + 1) }, 'TRIGGER NEXT LINK →'),
            step === currentChain.length - 1 && e('button', { className: 'btn-mastered', onClick: () => { 
                setScore(s => s + 200); 
                setFeedback({ 
                    type: 'success', 
                    msg: 'SYSTEM COLLAPSE ANALYSIS COMPLETE', 
                    rationale: `You successfully mapped the domino effect from ${currentChain[0].label} to ${currentChain[4].label}.` 
                });
            } }, 'SYSTEM FULLY MASTERED')
        ),
        e(FeedbackOverlay, { onNext: () => { setStep(0); setActiveMode(null); } })
    );
  }

  // --- MODE: MECHANISM BOSS BATTLES ---
  function BossBattles() {
    const [phase, setStepPhase] = useState(0); // 0: Cause, 1: Mechanism, 2: Structural, 3: Clinical, 4: Complication
    const [bossHp, setBossHp] = useState(100);
    const [disease, setDisease] = useState(() => MOD3_DATABASE[Math.floor(Math.random() * MOD3_DATABASE.length)]);

    const handleAction = (isCorrect, rationale) => {
        if (isCorrect) {
            setBossHp(h => Math.max(0, h - 20));
            if (phase < 4) setStepPhase(p => p + 1);
            else {
                setScore(s => s + 500);
                setFeedback({ 
                    type: 'success', 
                    msg: `THREAT NEUTRALIZED: ${disease.name}`, 
                    rationale: "You successfully countered the entire physiologic collapse chain by predicting every step of the pathophysiology." 
                });
            }
        } else {
            setFeedback({ 
                type: 'error', 
                msg: 'CRITICAL FAILURE: BOSS COUNTERATTACK', 
                rationale: "Pathophysiologic misinterpretation allowed the condition to deteriorate. " + rationale 
            });
        }
    };

    const nextBoss = () => {
        setDisease(MOD3_DATABASE[Math.floor(Math.random() * MOD3_DATABASE.length)]);
        setStepPhase(0);
        setBossHp(100);
    };

    const phaseQuestions = [
        { type: 'cause', q: `PHASE 1: Identify the primary TRIGGER for ${disease.name}.` },
        { type: 'mechanism', q: `PHASE 2: Which PHYSIOLOGIC PROCESS drives ${disease.name}?` },
        { type: 'structural', q: `PHASE 3: What STRUCTURAL CHANGE occurs in ${disease.name}?` },
        { type: 'clinical', q: `PHASE 4: Identify the hallmark CLINICAL FINDING.` },
        { type: 'complication', q: `PHASE 5: Predict the LETHAL COMPLICATION.` }
    ];

    const currentQ = phaseQuestions[phase];
    const correctNode = disease.chain.find(n => n.type === currentQ.type);
    
    // Generate distractors
    const distractors = useMemo(() => {
        const others = MOD3_DATABASE.filter(d => d.id !== disease.id);
        const distracts = [];
        while(distracts.length < 2) {
            const randomD = others[Math.floor(Math.random() * others.length)];
            const randomN = randomD.chain.find(n => n.type === currentQ.type);
            if (randomN && !distracts.includes(randomN.label)) distracts.push(randomN.label);
        }
        return distracts;
    }, [disease, currentQ.type]);

    const options = useMemo(() => [correctNode.label, ...distractors].sort(), [correctNode.label, distractors]);

    return e('div', { className: 'mod3-boss-screen fade-in' },
        e('div', { className: 'boss-hud' },
            e('div', { className: 'boss-name-box' },
                e('div', { className: 'matrix-text', style: { color: '#ff3e3e', fontSize: '0.8rem' } }, 'ULTIMATE THREAT DETECTED'),
                e('h1', { className: 'text-red', style: { margin: '5px 0' } }, disease.name.toUpperCase())
            ),
            e('div', { className: 'boss-hp-outer' }, 
                e('div', { className: 'hp-label matrix-text' }, `STABILIZATION PROGRESS: ${phase + 1} / 5`),
                e('div', { className: 'hp-bar' }, e('div', { className: 'hp-fill', style: { width: `${bossHp}%` } }))
            )
        ),
        e('div', { className: 'boss-arena' },
            e('div', { className: 'boss-visual-area' },
                e('div', { className: 'boss-glitch-effect' }),
                e('div', { className: 'boss-prompt-box' },
                    e('div', { className: 'phase-type matrix-text' }, currentQ.type.toUpperCase()),
                    e('p', { className: 'boss-question' }, currentQ.q)
                )
            ),
            e('div', { className: 'boss-options' },
                options.map((o, i) => e('button', { 
                    key: i, 
                    className: 'btn-cyber boss-btn', 
                    onClick: () => handleAction(o === correctNode.label, `The correct ${currentQ.type} is ${correctNode.label}. ${correctNode.detail}`) 
                }, o))
            )
        ),
        e(FeedbackOverlay, { onNext: phase === 4 && bossHp === 0 ? nextBoss : undefined })
    );
  }

  // --- MODE: ADAPTIVE EXAM (Mechanism Retrieval) ---
  function AdaptiveExam() {
    const [currentIdx, setCurrentIdx] = useState(0);

    const scenario = useMemo(() => {
        const useWeak = weakConcepts.length > 0 && Math.random() > 0.4;
        const dName = useWeak ? weakConcepts[Math.floor(Math.random() * weakConcepts.length)] : MOD3_DATABASE[Math.floor(Math.random() * MOD3_DATABASE.length)].name;
        const d = MOD3_DATABASE.find(db => db.name === dName) || MOD3_DATABASE[0];
        
        const types = ['mechanism', 'functional', 'clinical', 'lab', 'complication'];
        const type = types[Math.floor(Math.random() * types.length)];
        const targetNode = d.chain.find(n => n.type === type);
        
        const others = MOD3_DATABASE.filter(db => db.id !== d.id);
        const distractors = others.map(db => db.chain.find(n => n.type === type)?.label).filter(l => l && l !== targetNode.label).slice(0, 3);

        return {
            disease: d.name,
            type: type.toUpperCase(),
            context: `Retrieve the underlying ${type} for:`,
            q: d.name.toUpperCase(),
            correct: targetNode.label,
            rationale: targetNode.detail,
            options: [targetNode.label, ...distractors].sort(() => Math.random() - 0.5)
        };
    }, [currentIdx]);

    const handleAnswer = (opt) => {
        if (opt === scenario.correct) {
            setScore(s => s + 75);
            setFeedback({ type: 'success', msg: 'STABILITY MAINTAINED', rationale: scenario.rationale });
        } else {
            setWeakConcepts(prev => [...prev, scenario.disease]);
            setFeedback({ type: 'error', msg: 'KNOWLEDGE GAP DETECTED', rationale: `The correct ${scenario.type.toLowerCase()} for ${scenario.disease} is ${scenario.correct}.` });
        }
    };

    return e('div', { className: 'mod3-exam-screen fade-in' },
        e('div', { className: 'exam-card' },
            e('div', { className: 'exam-header-v2' }, 
                e('span', { className: 'matrix-text' }, 'ADAPTIVE RETRIEVAL ENGINE'),
                e('div', { className: 'weak-tally' }, `WEAK CONCEPTS: ${weakConcepts.length}`)
            ),
            e('div', { className: 'exam-content' },
                e('p', { className: 'exam-context' }, scenario.context),
                e('h1', { className: 'exam-subject' }, scenario.q),
                e('div', { className: 'exam-options-grid' },
                    scenario.options.map((opt, i) => e('button', { key: i, className: 'btn-cyber exam-btn', onClick: () => handleAnswer(opt) }, opt))
                )
            )
        ),
        e(FeedbackOverlay, { onNext: () => setCurrentIdx(i => i + 1) })
    );
  }

  // --- MAIN ENGINE ROUTER ---
  const renderGame = () => {
    switch(activeMode) {
      case 'mech_lab': return e(MechanismLab);
      case 'path_builder': return e(PathwayBuilder);
      case 'coronary_crisis': return e(ClinicalSim, { type: 'coronary' });
      case 'pulm_collapse': return e(ClinicalSim, { type: 'pulm' });
      case 'shock_unit': return e(ClinicalSim, { type: 'shock' });
      case 'emergency_dept': return e(ClinicalSim, { type: 'ed' });
      case 'clot_runner': return e(ClotRunner);
      case 'hemo_arena': return e(ClinicalSim, { type: 'hemo' });
      case 'boss_battles': return e(BossBattles);
      case 'adaptive_exam': return e(AdaptiveExam);
      case 'final_sim': return e(IntegrationSim);
      default: return e('div', { className: 'mod3-placeholder' }, e('h2', null, 'UNDER CONSTRUCTION'));
    }
  };

  if (!activeMode) {
    return e('div', { className: 'mod3-hub-screen fade-in' },
      e('div', { className: 'hub-header-v2' },
        e('div', { className: 'matrix-text hub-title-glow' }, 'MODULE 3 AND BEYOND'),
        e('div', { className: 'hub-subtitle' }, 'SYSTEM FAILURE & SURVIVAL'),
        e('button', { className: 'btn-return-home', onClick: onBack }, '← RETURN TO CAMPUS')
      ),
      e('div', { className: 'mode-grid' },
        MOD3_GAME_MODES.map(mode => e('div', {
          key: mode.id,
          className: 'mode-card-v2',
          onClick: () => setActiveMode(mode.id)
        },
          e('div', { className: 'mode-icon' }, mode.icon),
          e('div', { className: 'mode-name matrix-text' }, mode.name),
          e('div', { className: 'mode-desc' }, mode.description)
        ))
      )
    );
  }

  return e('div', { className: 'mod3-engine-root' },
    e('div', { className: 'mod3-hud' },
        e('div', { className: 'hud-left' }, e('span', null, modeNameById(activeMode))),
        e('div', { className: 'hud-right' }, 
            e('span', null, `SCORE: ${score}`),
            e('button', { className: 'hud-back-btn', onClick: () => setActiveMode(null) }, 'EXIT')
        )
    ),
    e('div', { className: 'mod3-viewport' }, renderGame())
  );
}

function modeNameById(id) {
    return MOD3_GAME_MODES.find(m => m.id === id)?.name.toUpperCase() || 'MODE';
}
