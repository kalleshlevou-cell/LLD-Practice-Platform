# LLD Forge — Low-Level Design Practice & Evaluation Platform

An interactive practice platform built to help software engineers practice Low-Level Design (LLD/OOD), submit solutions, receive explainable rubric-based feedback, and track deliberate practice progression.

---

## 🌟 The Core Practice Loop

Unlike algorithmic platforms (LeetCode) with binary pass/fail I/O checks, Low-Level Design is nuanced, open-ended, and multifaceted. **LLD Forge** enables the continuous deliberate practice loop:

$$\text{Choose Problem} \longrightarrow \text{Design \& Code} \longrightarrow \text{Submit Attempt} \longrightarrow \text{Rubric Feedback} \longrightarrow \text{Compare Diff \& Iterate}$$

---

## 🚀 Key Features

### 1. Curated Realistic LLD Problem Set
- **Smart Multi-Level Parking Lot:** Spot types (Bike, Compact, Large, EV), concurrency-guarded allocations, pluggable pricing strategies, gates, and display boards.
- **Intelligent Elevator Dispatcher:** LOOK/SCAN scheduling algorithm, state transitions (Moving, Idle, Emergency), multi-car optimization, and door sensors.
- **Distributed Token-Bucket Rate Limiter:** Client identification tiers, mathematical token refill, thread-safe quotas, and burst tolerance.
- **State-Driven Vending Machine:** Complete GoF State Pattern lifecycle (Idle, HasMoney, Dispensing), transactional money safety, inventory management, and refund rollback.

### 2. Multi-Faceted Practice Canvas
- **Code Editor:** Polyglot syntax support (TypeScript, Java, Python) with line numbers, tab-indentation handling, character count, and `Ctrl + Enter` hotkey execution.
- **Architectural Rationale:** Dedicated reasoning canvas where candidates articulate *why* they chose specific patterns and what trade-offs were accepted.
- **Live UML Diagram Extractor:** Automatically extracts classes, interfaces, inheritance, and implementations from candidate code in real time, rendering an interactive class taxonomy diagram.
- **Reference Benchmarks:** Instant "Load Sample Solution" (both exemplary senior implementation and anti-pattern flawed solution) to experiment with different design paradigms.

### 3. Resilient Hybrid Evaluation Engine (Strategy Pattern)
- **Deterministic Rule Evaluator (~30ms):**
  - AST / Token analysis of class responsibilities and cohesion.
  - **God Class & Bloated Interface Detection:** Flags classes handling excessive disparate duties.
  - **Open-Closed Extensibility (OCP):** Checks for polymorphic interfaces, strategy patterns, and swappable seams.
  - **Concurrency & Race Conditions:** Audits code for critical sections, locks, mutexes, synchronized guards, and atomic primitives.
  - **Boundary Validation:** Detects parameter guards, resource exhaustion checks, and domain exceptions.
- **Semantic Reasoning Evaluator (LLM / Heuristic):**
  - Deep qualitative trade-off analysis.
  - Cohesion critique and domain naming fidelity.
  - Empathetic, mentor-grade actionable advice.
  - **Zero-Config Guarantee:** Works 100% out-of-the-box offline using the built-in Semantic Heuristic Engine, or connects to live Google Gemini 2.5 Flash if an API key is configured.
  - **Circuit-Breaker & Timeout Fallback:** 4-second timeout threshold; if external LLM times out or errors, gracefully degrades to deterministic analysis without user disruption.

### 4. Explainable 5-Pillar Rubric Breakdown
Each attempt is evaluated against five standardized dimensions ($0-20$ points each, max 100):
1. **Single Responsibility (SRP):** Cohesion of entities and orchestrators.
2. **Open-Closed Extensibility (OCP):** Polymorphic seams and interface decoupling.
3. **Interface Segregation (ISP):** Lean, targeted contracts without client pollution.
4. **Concurrency & Thread-Safety:** Race condition prevention in shared mutable state.
5. **Edge-Case Handling:** Defensive guards against empty, null, and boundary conditions.

### 5. Attempt History & Deliberate Progression ($\Delta$)
- Full chronological version timeline per problem.
- **Progression Delta Engine (`ComparisonService`):** Compares Attempt $N$ against Attempt $N-1$, calculating exact score difference ($+32$ pts), listing **resolved anti-patterns**, and identifying improved rubric dimensions.
- Target Refactoring Diff: Shows specific "Before vs After" code snippets recommending concrete next steps.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v22)
- npm 9+

### Installation & Launch
```bash
# 1. Clone or navigate to the project directory
cd "New folder (3)"

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Running Automated Tests
```bash
npm test
```
The test suite runs with Vitest, validating:
- Deterministic rule evaluation (God class detection, pattern matching, concurrency audit)
- Hybrid pipeline execution and circuit-breaker timeout fallback
- Attempt progression deltas and smell resolution tracking
- Domain entity state machines and lifecycle invariants

### Production Build
```bash
npm run build
```

---

## 📁 Repository Structure

```
├── RESEARCH_NOTE.md            # Comprehensive research note (learner problem, existing tools, gaps)
├── DESIGN_NOTE.md              # Technical design note (classes, interfaces, evaluation, trade-offs)
├── AI_USAGE.md                 # 5 meaningful AI-assisted decisions, accepted/rejected trade-offs
├── README.md                   # Project overview, architecture, and run instructions
│
├── src/
│   ├── types/                  # Domain contracts, Problem, Submission, EvaluationResult
│   ├── domain/                 # Domain entities (ProblemEntity, SubmissionEntity, EvaluationEntity)
│   ├── data/                   # Curated LLD problems, starter templates, checklists, samples
│   ├── services/
│   │   ├── evaluation/
│   │   │   ├── IEvaluationStrategy.ts        # Strategy pattern interface
│   │   │   ├── DeterministicRuleEvaluator.ts # AST/Regex static analysis & smell detection
│   │   │   ├── LlmEvaluator.ts               # Gemini API + high-fidelity offline heuristic fallback
│   │   │   ├── EvaluationPipeline.ts         # Orchestrator with 4s circuit-breaker timeout
│   │   │   └── ComparisonService.ts          # Attempt progression & smell delta calculator
│   │   └── storage/
│   │       └── Repository.ts                 # LocalStorage persistence for attempts & drafts
│   ├── components/
│   │   ├── Navbar.tsx                        # Problem switcher, attempt counter, modal triggers
│   │   ├── ProblemView.tsx                   # Specs, rubrics, interactive checklist, solutions
│   │   ├── PracticeCanvas.tsx                # Polyglot editor, rationale canvas, live UML diagram
│   │   ├── EvaluationView.tsx                # Real-time stages, score hero, 5-pillar rubric, diffs
│   │   ├── AttemptHistoryModal.tsx           # Attempt timeline, version compare, code restoration
│   │   ├── ApiKeyModal.tsx                   # Gemini API key configuration
│   │   └── DocumentationModal.tsx            # In-app viewer for Research & Design notes
│   ├── App.tsx                               # Top-level state coordinator
│   └── index.css                             # Obsidian dark-mode design system & animations
│
└── tests/                                    # Vitest automated test suite
    ├── deterministic-evaluator.test.ts       # Pattern, concurrency, and smell detection tests
    ├── evaluation-pipeline.test.ts           # Pipeline execution and timeout fallback tests
    ├── comparison-service.test.ts            # Delta and progression analysis tests
    └── domain-models.test.ts                 # State machine lifecycle and score rating tests
```

---

## 💡 Addressing Key Design Questions

| Design Question | Solution in LLD Forge |
| :--- | :--- |
| **What does a learner need to provide?** | 1) Code skeleton & interfaces, 2) Core orchestration logic, 3) Architectural rationale explaining trade-offs. |
| **What makes feedback useful with multiple valid designs?** | Non-dogmatic, 5-pillar rubric scoring instead of rigid "gold-standard" matching; evaluates cohesion, coupling, and explicit trade-offs. |
| **Deterministic vs. LLM evaluation?** | Deterministic handles contracts, God classes, concurrency primitives, and complexity; LLM/Heuristics handle semantic cohesion, naming fidelity, and empathetic advice. |
| **Accommodating future submission formats?** | Extensible Strategy pattern (`IEvaluationStrategy`) and pipeline architecture allow adding Docker sandboxes or UML parsers without altering domain models. |
| **Handling slow or failing evaluation?** | Asynchronous lifecycle with visual state indicators, 4-second circuit-breaker timeout, and zero-downtime fallback to deterministic rule engine. |

---

## 📜 Deliverables Checklist
- [x] **Research Note:** `RESEARCH_NOTE.md`
- [x] **Design Note:** `DESIGN_NOTE.md`
- [x] **AI Usage Log:** `AI_USAGE.md`
- [x] **Working Prototype:** Fully interactive Vite React TypeScript application
- [x] **Automated Tests:** 11 Vitest unit and edge-case tests
- [x] **README:** Complete architecture and setup documentation
