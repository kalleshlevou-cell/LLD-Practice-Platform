# Research Note: Low-Level Design (LLD) Practice & Evaluation Platform

**Author:** Staff Systems / Platform Engineer  
**Date:** October 2026  
**Assignment:** 2-Day Engineering Challenge — LLD Practice Experience

---

## 1. Executive Summary & Learner Problem

Low-Level Design (LLD) and Object-Oriented Design (OOD) are foundational competencies for senior software engineering roles. While algorithmic problem solving (Data Structures & Algorithms via LeetCode, HackerRank, Codeforces) benefits from unambiguous binary verifiers (I/O test cases and execution benchmarks), **LLD practice is notoriously open-ended and difficult to evaluate**.

A learner tasked with designing a *Parking Lot*, an *Elevator Controller*, or a *Vending Machine* typically experiences the following core pain points:
1. **The "Blank Canvas" Paralysis:** Unlike DSA where the method signature is fixed (`int twoSum(...)`), LLD requires deciding class boundaries, interfaces, access modifiers, and interactions from scratch.
2. **Ambiguity of "Good":** A learner might write 400 lines of working code without knowing whether their design violates the Open-Closed Principle, leaks abstraction details, exhibits God-Class antipatterns, or fails under concurrent multi-threaded execution.
3. **Absence of Explainable Feedback:** Human code reviews in mock interviews are expensive, asynchronous, and inconsistent. Off-the-shelf LLMs frequently generate either superficial flattery ("Looks great! Good use of classes!") or pedantic, non-actionable suggestions that don't address trade-offs.
4. **Lack of an Iterative Practice Loop:** Traditional interview prep consists of reading static GitHub solutions (e.g., "Awesome LLD") and passively memorizing patterns rather than actively practicing deliberate refactoring from Attempt 1 to Attempt 2.

---

## 2. Competitive Landscape & Existing Approaches

We surveyed current tools and educational resources:

| Platform / Approach | Evaluation Mechanism | Strengths | Critical Gaps in LLD Practice |
| :--- | :--- | :--- | :--- |
| **LeetCode / HackerRank** | Automated unit tests (I/O matching) | Instant execution, definitive pass/fail | Treats code as a black-box function; completely ignores object modeling, coupling, cohesion, and extensible patterns. |
| **Educative / Grokking LLD** | Static text, pre-drawn UML, video solutions | Curated diagrams, standard design patterns | Purely passive consumption; zero evaluation of learner's own code or custom design choices. |
| **Pramp / Interviewing.io** | Human peer or senior mock interviews | Nuanced qualitative feedback, trade-off discussions | Extremely high scheduling overhead, expensive, non-scalable, inconsistent reviewer quality. |
| **Raw ChatGPT / Claude Prompting** | Generalist LLM chat prompt | High reasoning capacity, conversational | Hallucinates requirements; fails to enforce deterministic constraints (e.g. required methods); provides inconsistent grading rubrics without historical progress tracking. |

### Key Insights & Industry Gaps Identified
1. **Binary pass/fail does not work for LLD:** Multiple distinct designs are equally valid depending on priorities (e.g., using a `Strategy` pattern vs. `State` pattern vs. rule-based functional mapping). Feedback must be **rubric-driven** and **trade-off-aware**.
2. **Pure LLM evaluation is flaky and slow:** Relying solely on LLM prompts produces variable scoring across runs and leaves the system vulnerable to rate limits and latency spikes (3–10 seconds).
3. **Pure AST/static analysis is too rigid:** Static linters (like SonarQube or ESLint) detect cyclomatic complexity and naming conventions, but cannot understand domain semantics or architectural intent.
4. **Learners need iterative diffs:** The highest-leverage learning moment happens when a student updates their code to fix an abstraction leak and sees their specific score and rubric improve from Attempt $N$ to $N+1$.

---

## 3. Product Direction & MVP Hypothesis

### Core Product Hypothesis
> *If we combine deterministic structural analysis (immediate contract and pattern verification) with rubric-grounded semantic reasoning (LLM-assisted trade-off critique) within an iterative, multi-stage attempt loop, learners will gain actionable, explainable insights and demonstrably improve their object-oriented designs across successive attempts.*

### The Practice Loop
The platform embodies a tightly coupled 6-step feedback cycle:
```
[Choose Problem] 
       │
       ▼
[Understand Requirements & Edge Cases]
       │
       ▼
[Model Entities, Interfaces & Design Rationale]
       │
       ▼
[Submit Solution] ──► [Hybrid Deterministic + Semantic Evaluation]
       │
       ▼
[Review Multi-Dimensional Rubric & Actionable Advice]
       │
       ▼
[Iterate & Compare Diff against Previous Attempt]
```

---

## 4. Answering the Core Product Questions

### Q1: What does a learner actually need to provide for an LLD attempt to be meaningful?
- **Class/Interface Declarations & Method Signatures:** The foundational taxonomy of the domain (e.g., `IParkingStrategy`, `Ticket`, `Gate`, `ParkingSpot`).
- **Core Orchestration Logic:** How primary use-cases are executed (e.g., how `parkVehicle` finds a spot, acquires locks, and issues tickets).
- **Architectural Rationale & Trade-offs:** The intentionality behind design choices (e.g., *"Why did you use Strategy over State? How did you ensure thread safety?"*).
- **Edge Case & Concurrency Awareness:** Explicit handling of race conditions (e.g., two cars entering simultaneously) and boundary limits.

### Q2: What makes feedback useful when there can be more than one valid LLD solution?
- **Non-dogmatic Evaluation:** Useful feedback does not mandate a single canonical implementation. If the student uses an enum-based dispatcher instead of a full Strategy pattern, the platform evaluates whether it satisfies current requirements and articulates the exact trade-off:
  > *"Your enum-based pricing handles flat rates cleanly. However, if weekend surge rates or loyalty discounts are introduced, this violates OCP because modifying pricing requires altering the core enum."*
- **Actionable Next Steps:** Providing 2–3 concrete, high-leverage refactorings rather than an exhaustive list of trivial nitpicks.

### Q3: Which parts of evaluation should be deterministic vs. LLM-assisted?
- **Deterministic Evaluation (0–50ms, 100% reliable):**
  - Contract & Entity completeness (required domain entities present).
  - God Class / Fat Interface detection (excessive public methods, responsibility bloat).
  - Explicit concurrency primitive checks (`Mutex`, `Atomic`, `Synchronized`, `ReadWriteLock`).
  - Common antipatterns (tight coupling via direct instantiation in orchestrators, magic numbers, empty catch blocks).
- **LLM / Semantic Evaluation (Reasoning layer):**
  - Cohesion and domain naming fidelity.
  - Evaluation of the student's declared trade-off rationale.
  - Synthesis of tailored, empathetic mentoring feedback.

### Q4: How to accommodate future submission formats and evaluators?
- Designed using the **Strategy Pattern** and a **Composable Evaluation Pipeline** (`EvaluationPipeline`).
- Future evaluators (e.g., Dockerized sandbox running unit tests, AST parser for C++/Java, Mermaid diagram semantic validator) can be added as modular pipeline stages without altering the core domain.

### Q5: How to handle slow or failing evaluation?
- **Circuit-Breaker with Graceful Fallback:** If the LLM call times out (5s threshold) or errors out, the pipeline seamlessly degrades to the deterministic static evaluation, provides an informative banner, and still delivers immediate, actionable feedback to the student.

---

## 5. Conclusion & Next Steps
With these research insights, we architect an MVP focused strictly on the learner's journey, combining a rich interactive frontend, a resilient hybrid evaluation engine, and a domain model with full test coverage.
