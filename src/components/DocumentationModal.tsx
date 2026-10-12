import React, { useState } from 'react';
import { X, BookOpen, FileText, CheckCircle2, Shield, Layers } from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'design' | 'research' | 'ai'>('design');

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 840, height: '85vh' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <BookOpen size={18} color="var(--accent-indigo)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Engineering Notes & Assignment Deliverables</h3>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="tab-bar">
          <button
            className={`tab-btn ${activeTab === 'design' ? 'active' : ''}`}
            onClick={() => setActiveTab('design')}
          >
            <Layers size={14} />
            <span>Design Note (Architecture & LLD)</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'research' ? 'active' : ''}`}
            onClick={() => setActiveTab('research')}
          >
            <FileText size={14} />
            <span>Research Note (Learner Journey & Gaps)</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai')}
          >
            <Shield size={14} />
            <span>AI Usage Decisions</span>
          </button>
        </div>

        <div className="modal-body" style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {activeTab === 'design' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="problem-hero-card">
                <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>Design Note Summary</h4>
                <p>
                  The platform implements a modular monolith architecture centered strictly on the deliberate practice loop:
                  <strong> Choose problem → Think / design → Submit → Get rubric feedback → Review → Iterate</strong>.
                </p>
              </div>

              <div className="req-section">
                <span className="section-label">Core Classes & Domain Boundaries</span>
                <ul className="req-list">
                  <li className="req-item">
                    <span className="bullet-dot" />
                    <span><strong>ProblemEntity:</strong> Encapsulates domain specs, non-functional quality attributes, and reference checklists.</span>
                  </li>
                  <li className="req-item">
                    <span className="bullet-dot" />
                    <span><strong>SubmissionEntity:</strong> Governs attempt lifecycle state transitions (<code>DRAFT</code> → <code>SUBMITTED</code> → <code>PARSING</code> → <code>EVALUATING</code> → <code>COMPLETED</code> / <code>DEGRADED_FALLBACK</code>).</span>
                  </li>
                  <li className="req-item">
                    <span className="bullet-dot" />
                    <span><strong>EvaluationEntity:</strong> Manages score calculations, dimension ratings, and tier boundaries.</span>
                  </li>
                  <li className="req-item">
                    <span className="bullet-dot" />
                    <span><strong>IEvaluationStrategy:</strong> Common interface implemented by <code>DeterministicRuleEvaluator</code> and <code>LlmEvaluator</code>.</span>
                  </li>
                  <li className="req-item">
                    <span className="bullet-dot" />
                    <span><strong>EvaluationPipeline:</strong> Strategy orchestrator running deterministic checks first (~30ms) and overlaying semantic reasoning with a 4-second circuit breaker.</span>
                  </li>
                  <li className="req-item">
                    <span className="bullet-dot" />
                    <span><strong>ComparisonService:</strong> Calculates progression deltas ($\Delta$), tracking resolved smells and score improvements across consecutive attempts.</span>
                  </li>
                </ul>
              </div>

              <div className="req-section">
                <span className="section-label">Extensibility & Failure Resilience</span>
                <p>
                  To accommodate new formats (e.g. Dockerized test execution, C++ AST parser, or Mermaid diagram input), one simply registers an <code>IEvaluationStrategy</code> stage in <code>EvaluationPipeline</code> without altering domain models. If evaluation fails or times out, the system automatically falls back to deterministic analysis, guaranteeing zero downtime.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'research' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="problem-hero-card">
                <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>The Learner Problem in LLD</h4>
                <p>
                  Unlike DSA where automated unit tests provide binary pass/fail, Low-Level Design practice suffers from the "blank canvas" dilemma. Learners design a Parking Lot or Elevator and remain unsure if their abstractions, relationships, or concurrency models are sound.
                </p>
              </div>

              <div className="req-section">
                <span className="section-label">Existing Approaches & Market Gaps</span>
                <p>
                  Platforms like LeetCode treat code as black-box algorithms. Grokking/Educative offers static reading without evaluating student code. Mock interviews are expensive and unscalable. Raw ChatGPT prompts hallucinate requirements and lack deterministic consistency.
                </p>
              </div>

              <div className="req-section">
                <span className="section-label">Our Solution: Multi-Dimensional Rubric</span>
                <p>
                  We reject binary pass/fail and gold-standard matching. A student's design is evaluated across 5 fundamental software engineering pillars: Single Responsibility, Open-Closed Extensibility, Interface Segregation, Concurrency, and Edge Cases.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="problem-hero-card">
                <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>Meaningful AI-Assisted Decisions</h4>
                <p>Highlights of key architectural trade-offs made during development (full log in <code>AI_USAGE.md</code>):</p>
              </div>

              <div className="checklist-item">
                <strong>1. Rejected Pure LLM Pipeline:</strong>
                <span>AI suggested a single prompt for everything. Rejected in favor of a hybrid composite pipeline with deterministic AST baseline to eliminate latency spikes and scoring variance.</span>
              </div>

              <div className="checklist-item">
                <strong>2. Rejected Drag-and-Drop UML Builder:</strong>
                <span>AI suggested a visual drag-and-drop canvas. Rejected because engineering interviews and real-world design center on code and trade-off rationale. Substituted with live auto-generated class diagrams from code.</span>
              </div>

              <div className="checklist-item">
                <strong>3. Rejected Canonical Reference Matching:</strong>
                <span>AI suggested exact class name matching. Rejected because multiple patterns (Strategy vs Decorator vs State) are equally valid; replaced with principle-grounded rubrics.</span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
