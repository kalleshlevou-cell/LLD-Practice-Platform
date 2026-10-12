# AI Usage Log: Key Architectural Decisions & Judgement

**Assignment:** LLD Practice Platform  
**Purpose:** Document 3–5 meaningful AI-assisted decisions, including what the AI suggested, what was accepted or rejected, and the engineering rationale.

---

### Decision 1: Evaluation Architecture — Pure LLM vs. Hybrid Deterministic Pipeline
- **What AI Suggested:**  
  The AI initially suggested routing all submissions directly to a single Large Language Model prompt (e.g. Gemini / Claude) with a JSON-mode schema output to grade SOLID principles, score from 0–100, and generate all feedback in one round-trip.
- **What Was Accepted:**  
  Using an LLM for nuanced qualitative commentary, trade-off appraisal, and empathetic mentoring tone.
- **What Was Rejected:**  
  Using pure LLM for the entire evaluation pipeline.
- **Engineering Rationale:**  
  Pure LLM evaluation introduces latency (3–8 seconds), non-deterministic scoring variance across identical submissions, and vulnerability to network failures or API token limits. We instead implemented a **Composite Pipeline (Strategy Pattern)**: deterministic rule checks (contract completeness, God class method thresholds, concurrency primitive detection) run first in under 30ms, and the LLM layer enriches it with semantic critique. If the LLM fails or times out, a deterministic fallback ensures zero downtime for the learner.

---

### Decision 2: Submission Format — Freeform Code vs. Strict Multi-Field Forms vs. Visual UML
- **What AI Suggested:**  
  The AI suggested creating a visual node-based drag-and-drop UML diagram builder where learners connect class boxes with arrows.
- **What Was Accepted:**  
  Providing live visual class diagram preview (via Mermaid UML) so learners can visually confirm their class relationships.
- **What Was Rejected:**  
  Mandating drag-and-drop diagramming as the primary input mechanism.
- **Engineering Rationale:**  
  In senior LLD technical interviews and real-world software engineering, candidates articulate designs through code (interfaces, classes, methods) and verbal trade-off rationale, not clunky GUI canvas diagram builders. A multi-faceted code-and-rationale canvas with automated UML visualization provides the exact balance of realistic coding practice and visual feedback without the friction of canvas manipulation.

---

### Decision 3: Scoring Philosophy — Canonical Reference Solution vs. Multi-Dimensional Rubric
- **What AI Suggested:**  
  The AI suggested comparing learner submissions directly against a "Gold Standard" reference implementation (e.g., matching class names like `Car` and `Bike` and checking method return types against the problem author's solution).
- **What Was Accepted:**  
  Providing reference checklists and sample good solutions for learner review *after* completing attempts.
- **What Was Rejected:**  
  Diff-matching or penalizing learners for not matching the author's exact class naming or pattern choices.
- **Engineering Rationale:**  
  There is rarely a single "correct" answer in Low-Level Design. For instance, a Parking Lot pricing engine can be elegantly solved using a Strategy Pattern, a Decorator Pattern, or a functional rule engine. Penalizing a student for choosing one valid pattern over another teaches dogmatism rather than engineering judgement. We restructured the scoring into a **5-pillar rubric** (Single Responsibility, Open-Closed/Extensibility, Interface Segregation, Concurrency & Thread-Safety, Edge-Case Handling) that rewards principled trade-offs.

---

### Decision 4: Attempt History & Progression Tracking
- **What AI Suggested:**  
  The AI suggested storing only the latest attempt or keeping a simple flat list of submissions with timestamps.
- **What Was Accepted:**  
  An immutable attempt log with timestamps and status indicators.
- **What Was Added / Modified:**  
  A dedicated **Delta Comparison Engine (`computeDelta`)** that actively compares Attempt $N$ against Attempt $N-1$.
- **Engineering Rationale:**  
  Deliberate practice requires feedback on improvement. A learner who refactors a God class into multiple cohesive classes wants to see the specific score delta ($+18$ points) and the diff showing that the "God Class smell" was resolved. Adding comparative progression directly fulfills the assignment's mandate that the platform "supports improvement, not just one-time solving."

---

### Decision 5: Concurrency Evaluation in LLD Problems
- **What AI Suggested:**  
  The AI initially suggested spinning up a sandbox container to execute concurrent worker threads and stress-test the learner's code for deadlocks.
- **What Was Accepted:**  
  Explicitly assessing concurrency and thread safety as a core rubric dimension.
- **What Was Rejected:**  
  Executing multi-threaded test harnesses in a heavy sandbox container for the MVP.
- **Engineering Rationale:**  
  As stated in Scope Boundary (Section 5 of the challenge brief), this is an LLD and domain-design exercise, not a distributed systems or sandboxed OS engineering assignment. We instead created deterministic static detection for concurrency primitives (`synchronized`, `ReentrantLock`, `AtomicInteger`, `Mutex`, `thread-safe collections`), combined with LLM semantic reasoning on critical race-condition scenarios (such as two cars competing for the final spot). This keeps the platform responsive, lightweight, and completely portable.
