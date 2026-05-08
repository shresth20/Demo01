/* Declarative data — no DOM, no side-effects */

var exploreSteps = [
  {
    id: 'intro',
    expression: '6 + 4 × 2 − (8 ÷ 4)',
    annotation: 'This expression has Brackets, Multiplication, Division, Addition and Subtraction. BODMAS tells us the order!',
    highlightPart: null,
    resolvedExpression: null
  },
  {
    id: 'brackets',
    expression: '6 + 4 × 2 − (8 ÷ 4)',
    annotation: '🟠 B — Brackets first. Solve (8 ÷ 4) = 2',
    highlightPart: '(8 ÷ 4)',
    resolvedExpression: '6 + 4 × 2 − 2'
  },
  {
    id: 'orders',
    expression: '6 + 4 × 2 − 2',
    annotation: '⭐ O — Orders (powers/roots). None here — skip!',
    highlightPart: null,
    resolvedExpression: null
  },
  {
    id: 'multiply',
    expression: '6 + 4 × 2 − 2',
    annotation: '🔵 D/M — Multiplication next. Solve 4 × 2 = 8',
    highlightPart: '4 × 2',
    resolvedExpression: '6 + 8 − 2'
  },
  {
    id: 'addition',
    expression: '6 + 8 − 2',
    annotation: '🟢 A/S — Addition left to right. 6 + 8 = 14',
    highlightPart: '6 + 8',
    resolvedExpression: '14 − 2'
  },
  {
    id: 'subtraction',
    expression: '14 − 2',
    annotation: '🎉 Finally: 14 − 2 = 12. The answer is 12!',
    highlightPart: '14 − 2',
    resolvedExpression: '12'
  }
];

var practiceQuestions = [
  {
    id: 'q1',
    expression: '8 + 4 × 2',
    options: ['16', '24', '20', '12'],
    correctIndex: 0,
    hint: 'Multiply before adding',
    bodmasRule: 'Multiplication (M) comes before Addition (A) in BODMAS'
  },
  {
    id: 'q2',
    expression: '3 × (4 + 2)',
    options: ['18', '9', '20', '24'],
    correctIndex: 0,
    hint: 'Solve the brackets first',
    bodmasRule: 'Brackets (B) are always solved first in BODMAS'
  },
  {
    id: 'q3',
    expression: '10 − 2 × 3',
    options: ['4', '24', '6', '8'],
    correctIndex: 0,
    hint: 'Multiply before subtracting',
    bodmasRule: 'Multiplication (M) comes before Subtraction (S) in BODMAS'
  },
  {
    id: 'q4',
    expression: '6 + 4 ÷ 2',
    options: ['8', '5', '10', '3'],
    correctIndex: 0,
    hint: 'Divide before adding',
    bodmasRule: 'Division (D) comes before Addition (A) in BODMAS'
  },
  {
    id: 'q5',
    expression: '(5 + 3) × 2',
    options: ['16', '11', '13', '10'],
    correctIndex: 0,
    hint: 'Solve the brackets first',
    bodmasRule: 'Brackets (B) are always solved first in BODMAS'
  },
  {
    id: 'q6',
    expression: '12 ÷ 4 + 5',
    options: ['8', '4', '10', '17'],
    correctIndex: 0,
    hint: 'Divide before adding',
    bodmasRule: 'Division (D) comes before Addition (A) in BODMAS'
  }
];
