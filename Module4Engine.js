import React, { useState, useMemo, useEffect } from 'react';
import { MOD4_DATABASE, MOD4_GAME_MODES } from './module4-content.js';

const e = React.createElement;

export default function Module4Engine({ operatorName, onBack, activeMode, onModeChange }) {
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null); 
  const [weakConcepts, setWeakConcepts] = useState([]); 

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

  // --- MODE: RENAL LAB (Explorer) ---
  function RenalLab() {
    const [selectedId, setSelectedId] = useState(MOD4_DATABASE[0].id);
    const [step, setStep] = useState(1);
    const [showFull, setShowFull] = useState(false);

    const disease = MOD4_DATABASE.find(d => d.id === selectedId) || MOD4_DATABASE[0];

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
        e('div', { className: 'sidebar-header matrix-text' }, 'RENAL MECHANISMS'),
        e('div', { className: 'sidebar-scroll' },
            MOD4_DATABASE.map(d => e('div', {
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

  // --- MODE: NEPHRON BUILDER ---
  function NephronBuilder() {
    const [disease, setDisease] = useState(() => MOD4_DATABASE[Math.floor(Math.random() * MOD4_DATABASE.length)]);
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
                msg: `FILTRATION RESTORED: ${disease.name}`, 
                rationale: `Perfect sequence. The path from ${disease.chain[0].label} to ${disease.chain[6].label} is accurate.`,
                complication: disease.chain[6].detail
            });
        } else {
            const errorStep = disease.chain[firstErrorIdx];
            setFeedback({ 
                type: 'error', 
                msg: `FILTRATION ERROR at Step ${firstErrorIdx + 1}`, 
                rationale: `Expected "${errorStep.label}". ${errorStep.detail}` 
            });
        }
    };

    const nextDisease = () => {
        const next = MOD4_DATABASE[Math.floor(Math.random() * MOD4_DATABASE.length)];
        setDisease(next);
        setSlots(new Array(7).fill(null));
        setScrambled([...next.chain].sort(() => Math.random() - 0.5));
    };

    return e('div', { className: 'mod3-builder-screen fade-in' },
      e('div', { className: 'builder-header' }, e('h2', { className: 'matrix-text' }, `BUILD RENAL CHAIN: ${disease.name}`)),
      e('div', { className: 'builder-layout' },
        e('div', { className: 'slots-column' },
            slots.map((s, i) => e('div', { key: i, className: `path-slot ${s ? 'filled' : 'empty'}` }, 
                e('span', { className: 'slot-num' }, i + 1),
                e('span', { className: 'slot-type' }, disease.chain[i].type.toUpperCase()),
                e('span', { className: 'slot-label' }, s ? s.label : 'SELECT STEP')
            ))
        ),
        e('div', { className: 'pool-column' },
            e('div', { className: 'pool-header matrix-text' }, 'AVAILABLE STEPS'),
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
        e('button', { className: 'btn-cyber submit-btn', onClick: validate }, 'VERIFY NEPHRON')
      ),
      e(FeedbackOverlay, { onNext: nextDisease })
    );
  }

  // --- UNIVERSAL SIM ENGINE (Ion Arena, Dialysis Unit) ---
  function ClinicalSim({ type }) {
    const [scenario, setScenario] = useState(null);
    const [answered, setAnswered] = useState(false);

    const pool = useMemo(() => MOD4_DATABASE, []);

    const refresh = () => {
        let d = pool[Math.floor(Math.random() * pool.length)];
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
                msg: 'RENAL HOMEOSTASIS RESTORED', 
                rationale: choice.feedback,
                complication: scenario.complication
            });
        } else {
            setWeakConcepts(prev => [...prev, scenario.disease]);
            setFeedback({ 
                type: 'error', 
                msg: 'ACUTE RENAL FAILURE', 
                rationale: choice.feedback 
            });
        }
    };

    if (!scenario) return null;

    const modeLabel = {
        electrolyte_sim: 'IONIC CORRECTION',
        dialysis_unit: 'DIALYSIS MANAGEMENT'
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
                scenario.clues?.map((c, i) => e('div', { key: i, className: `clue-item` }, `> ${c}`))
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

  // --- MAIN ENGINE ROUTER ---
  const renderGame = () => {
    switch(activeMode) {
      case 'renal_lab': return e(RenalLab);
      case 'nephron_builder': return e(NephronBuilder);
      case 'electrolyte_sim': return e(ClinicalSim, { type: 'electrolyte_sim' });
      case 'dialysis_unit': return e(ClinicalSim, { type: 'dialysis_unit' });
      default: return e('div', { className: 'mod3-placeholder' }, e('h2', null, 'RENAL MODE COMING SOON'));
    }
  };

  if (!activeMode) {
    return e('div', { className: 'mod3-hub-screen fade-in' },
      e('div', { className: 'hub-header-v2' },
        e('div', { className: 'matrix-text hub-title-glow' }, 'MODULE 4: RENAL DYNAMICS'),
        e('div', { className: 'hub-subtitle' }, 'FILTRATION, BALANCE & FAILURE'),
        e('button', { className: 'btn-return-home', onClick: onBack }, '← RETURN TO HUB')
      ),
      e('div', { className: 'mode-grid' },
        MOD4_GAME_MODES.map(mode => e('div', {
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
    return MOD4_GAME_MODES.find(m => m.id === id)?.name.toUpperCase() || 'MODE';
}
