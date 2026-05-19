import React, { useState, useMemo, useEffect } from 'react';
import { jsPDF } from 'jspdf';

const e = React.createElement;

export default function PracticeMidtermEngine({ 
  operatorName, 
  onBack, 
  module1Quiz, 
  module1Patho,
  module2Quiz,
  module2Patho,
  module3Quiz,
  module3Patho 
}) {
  const [gameState, setGameState] = useState('briefing'); // 'briefing', 'active', 'complete'
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]); // [{ question, choice, correct }]
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [showRationale, setShowRationale] = useState(false);
  const [lockedChoice, setLockedChoice] = useState(null);

  // Combine and shuffle questions on mount
  useEffect(() => {
    const pool = [
      ...module1Quiz.map(q => ({ ...q, source: 'Module 1 Quiz' })),
      ...module1Patho.map(q => ({ ...q, source: 'Module 1 Scenario' })),
      ...module2Quiz.map(q => ({ ...q, source: 'Module 2 Quiz' })),
      ...module2Patho.map(q => ({ ...q, source: 'Module 2 Scenario' })),
      ...module3Quiz.map(q => ({ ...q, source: 'Module 3 Quiz' })),
      ...module3Patho.map(q => ({ ...q, source: 'Module 3 Scenario' })),
    ];

    // Shuffle and pick 75
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 75);
    setShuffledQuestions(shuffled);
  }, [module1Quiz, module1Patho, module2Quiz, module2Patho, module3Quiz, module3Patho]);

  const handleAnswer = (choiceIdx) => {
    if (lockedChoice !== null) return;

    const currentQ = shuffledQuestions[currentQuestionIdx];
    const isCorrect = choiceIdx === currentQ.ans;
    
    if (isCorrect) setScore(s => s + 1);
    
    setLockedChoice(choiceIdx);
    setShowRationale(true);
    setUserAnswers([...userAnswers, { 
      question: currentQ.q, 
      choice: choiceIdx, 
      correct: isCorrect,
      correctIdx: currentQ.ans,
      rationale: (currentQ.rationales && currentQ.rationales[choiceIdx]) || currentQ.rationale || 'No specific rationale provided.'
    }]);
  };

  const nextQuestion = () => {
    if (currentQuestionIdx < shuffledQuestions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
      setLockedChoice(null);
      setShowRationale(false);
    } else {
      setGameState('complete');
    }
  };

  const generateMidtermPDF = () => {
    const doc = new jsPDF();
    const pageW = 210;
    const pageH = 297;
    const margin = 20;
    const contentW = pageW - margin * 2;
    let y = 0;

    const DARK = [13, 2, 8];
    const GREEN = [0, 255, 65];
    const WHITE = [255, 255, 255];
    const GRAY = [170, 170, 170];
    const RED = [255, 80, 80];
    const CYAN = [0, 229, 255];

    const drawBg = () => {
      doc.setFillColor(...DARK);
      doc.rect(0, 0, pageW, pageH, 'F');
      doc.setDrawColor(...GREEN);
      doc.setLineWidth(0.5);
      doc.rect(8, 8, pageW - 16, pageH - 16, 'S');
    };

    const newPage = () => {
      doc.addPage();
      drawBg();
      y = margin;
    };

    const checkSpace = (h) => {
      if (y + h > pageH - margin) newPage();
    };

    const drawText = (text, size, color, isBold = false, indent = 0) => {
      doc.setFont("courier", isBold ? "bold" : "normal");
      doc.setFontSize(size);
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(text, contentW - indent);
      lines.forEach(line => {
        checkSpace(size * 0.5);
        doc.text(line, margin + indent, y);
        y += size * 0.5;
      });
      y += 2;
    };

    drawBg();
    y = 40;
    doc.setFontSize(24);
    doc.setTextColor(...GREEN);
    doc.text('PRACTICE MIDTERM REPORT', pageW / 2, y, { align: 'center' });
    y += 15;
    doc.setFontSize(12);
    doc.setTextColor(...WHITE);
    doc.text(`OPERATOR: ${operatorName}`, pageW / 2, y, { align: 'center' });
    y += 10;
    const scorePct = Math.round((score / shuffledQuestions.length) * 100);
    doc.text(`SCORE: ${score} / ${shuffledQuestions.length} (${scorePct}%)`, pageW / 2, y, { align: 'center' });
    y += 20;

    userAnswers.forEach((ans, i) => {
      checkSpace(40);
      drawText(`Q${i + 1}: ${ans.question}`, 10, WHITE, true);
      const resultColor = ans.correct ? GREEN : RED;
      drawText(`YOUR ANSWER: ${ans.correct ? 'CORRECT' : 'INCORRECT'}`, 9, resultColor, true, 5);
      drawText(`RATIONALE: ${ans.rationale}`, 8, GRAY, false, 5);
      y += 5;
    });

    doc.save(`Midterm_Report_${operatorName}.pdf`);
  };

  if (gameState === 'briefing') {
    return e('div', { className: 'midterm-screen briefing fade-in' },
      e('div', { className: 'midterm-panel' },
        e('h1', { className: 'matrix-text crt-glow' }, 'PRACTICE MIDTERM'),
        e('div', { className: 'matrix-text subtitle' }, 'BLOCK 1-3 COMPREHENSIVE ASSESSMENT'),
        e('div', { className: 'briefing-stats' },
          e('div', null, 'TOTAL QUESTIONS: 75'),
          e('div', null, 'TIME LIMIT: UNLIMITED'),
          e('div', null, 'PASSING SCORE: 80%')
        ),
        e('p', { className: 'briefing-text' }, 
          "This exam pulls randomly from the entire clinical database of Modules 1, 2, and 3. " +
          "Focus on the mechanism of disease. Each question will provide a detailed rationale upon selection."
        ),
        e('button', { className: 'btn-cyber mission-start-btn', onClick: () => setGameState('active') }, 'START EXAM [SPACE]')
      )
    );
  }

  if (gameState === 'active') {
    const q = shuffledQuestions[currentQuestionIdx];
    const isLocked = lockedChoice !== null;

    return e('div', { className: 'midterm-screen active fade-in' },
      e('div', { className: 'midterm-hud' },
        e('div', { className: 'hud-left' },
          e('div', { className: 'matrix-text' }, `QUESTION ${currentQuestionIdx + 1} / ${shuffledQuestions.length}`),
          e('div', { className: 'source-tag' }, q.source)
        ),
        e('div', { className: 'hud-right' },
          e('div', { className: 'matrix-text' }, `SCORE: ${score}`)
        )
      ),
      e('div', { className: 'midterm-question-area' },
        e('div', { className: 'question-card' },
          e('p', { className: 'question-text' }, q.q),
          e('div', { className: 'options-grid' },
            q.opts.map((opt, i) => {
              let cls = 'btn-cyber option-btn';
              if (isLocked) {
                if (i === q.ans) cls += ' correct';
                else if (i === lockedChoice) cls += ' wrong';
              }
              return e('button', { 
                key: i, 
                className: cls, 
                onClick: () => handleAnswer(i) 
              }, 
                e('span', { className: 'opt-index' }, String.fromCharCode(65 + i)),
                e('span', { className: 'opt-label' }, opt)
              );
            })
          ),
          showRationale && e('div', { className: 'rationale-box fade-in' },
            e('div', { className: 'rationale-header matrix-text' }, 'MECHANISM RATIONALE'),
            e('p', null, (q.rationales && q.rationales[lockedChoice]) || q.rationale || 'N/A'),
            e('button', { className: 'btn-cyber next-btn', onClick: nextQuestion, autoFocus: true }, 'NEXT QUESTION [ENTER]')
          )
        )
      )
    );
  }

  if (gameState === 'complete') {
    const scorePct = Math.round((score / shuffledQuestions.length) * 100);
    const passed = scorePct >= 80;

    return e('div', { className: 'midterm-screen complete fade-in' },
      e('div', { className: 'results-panel' },
        e('h1', { className: 'matrix-text crt-glow' }, passed ? 'EXAM PASSED' : 'EXAM FAILED'),
        e('div', { className: 'final-score' }, `${scorePct}%`),
        e('div', { className: 'score-details' }, `${score} Correct / ${shuffledQuestions.length} Total`),
        e('div', { className: 'actions' },
          e('button', { className: 'btn-cyber', onClick: generateMidtermPDF }, 'DOWNLOAD DETAILED REPORT'),
          e('button', { className: 'btn-cyber', onClick: onBack }, 'RETURN TO HUB')
        )
      )
    );
  }

  return null;
}
