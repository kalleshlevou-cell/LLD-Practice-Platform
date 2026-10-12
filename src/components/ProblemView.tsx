import React, { useState } from 'react';
import { 
  FileText, 
  Award, 
  CheckSquare, 
  Lightbulb, 
  Info, 
  Code, 
  AlertTriangle 
} from 'lucide-react';
import type { Problem } from '../types';

interface ProblemViewProps {
  problem: Problem;
  onLoadSolution: (code: string, rationale: string) => void;
}

export const ProblemView: React.FC<ProblemViewProps> = ({ problem, onLoadSolution }) => {
  const [activeTab, setActiveTab] = useState<'requirements' | 'rubric' | 'checklist' | 'reference'>('requirements');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const difficultyClass = 
    problem.difficulty === 'Easy' ? 'diff-easy' :
    problem.difficulty === 'Medium' ? 'diff-medium' : 'diff-hard';

  return (
    <div className="workspace-panel">
      <div className="panel-header">
        <span className="panel-title">
          <FileText size={17} color="var(--accent-indigo)" />
          <span>Problem Context</span>
        </span>
        <span className={`difficulty-pill ${difficultyClass}`}>
          {problem.difficulty}
        </span>
      </div>

      <div className="tab-bar">
        <button
          className={`tab-btn ${activeTab === 'requirements' ? 'active' : ''}`}
          onClick={() => setActiveTab('requirements')}
        >
          <Info size={14} />
          <span>Overview</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'rubric' ? 'active' : ''}`}
          onClick={() => setActiveTab('rubric')}
        >
          <Award size={14} />
          <span>Rubric</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'checklist' ? 'active' : ''}`}
          onClick={() => setActiveTab('checklist')}
        >
          <CheckSquare size={14} />
          <span>Checklist</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'reference' ? 'active' : ''}`}
          onClick={() => setActiveTab('reference')}
        >
          <Lightbulb size={14} />
          <span>Samples</span>
        </button>
      </div>

      <div className="panel-body">
        {activeTab === 'requirements' && (
          <>
            <div className="problem-hero-card">
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700 }}>
                {problem.title}
              </h2>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {problem.summary}
              </p>
              <div className="tags-row">
                {problem.tags.map((tag) => (
                  <span key={tag} className="tag-badge">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="req-section">
              <span className="section-label">Detailed Scenario</span>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                {problem.description}
              </p>
            </div>

            <div className="req-section">
              <span className="section-label">Functional Requirements</span>
              <ul className="req-list">
                {problem.domainRequirements.map((req, idx) => (
                  <li key={idx} className="req-item">
                    <span className="bullet-dot" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="req-section">
              <span className="section-label">Non-Functional & Quality Attributes</span>
              <ul className="req-list">
                {problem.nonFunctionalRequirements.map((req, idx) => (
                  <li key={idx} className="req-item">
                    <span className="bullet-dot" style={{ background: 'var(--accent-purple)' }} />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {activeTab === 'rubric' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Submissions are evaluated against a 5-pillar design rubric (20 pts each):
            </p>

            <div className="checklist-item">
              <div className="checklist-title">
                <span style={{ color: 'var(--accent-indigo)' }}>1. Single Responsibility (SRP)</span>
              </div>
              <p className="checklist-hint">
                Evaluates cohesion. Avoid God classes or bloated orchestrators that perform parsing, storage, and domain logic simultaneously.
              </p>
            </div>

            <div className="checklist-item">
              <div className="checklist-title">
                <span style={{ color: 'var(--accent-purple)' }}>2. Open-Closed Extensibility (OCP)</span>
              </div>
              <p className="checklist-hint">
                Evaluates polymorphic seams. Can new algorithms or policies (pricing, scheduling) be added without modifying existing core code?
              </p>
            </div>

            <div className="checklist-item">
              <div className="checklist-title">
                <span style={{ color: 'var(--accent-cyan)' }}>3. Interface Segregation (ISP)</span>
              </div>
              <p className="checklist-hint">
                Evaluates contract granularity. Clients should not depend on large monolithic interfaces with methods they do not invoke.
              </p>
            </div>

            <div className="checklist-item">
              <div className="checklist-title">
                <span style={{ color: 'var(--accent-rose)' }}>4. Concurrency & Thread-Safety</span>
              </div>
              <p className="checklist-hint">
                Evaluates race conditions and critical sections. Are state mutations guarded by locks, synchronization, or atomic primitives?
              </p>
            </div>

            <div className="checklist-item">
              <div className="checklist-title">
                <span style={{ color: 'var(--accent-emerald)' }}>5. Edge-Case Handling & Invariants</span>
              </div>
              <p className="checklist-hint">
                Evaluates defensive validation. Checks for null inputs, resource depletion, out-of-stock conditions, and domain exceptions.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'checklist' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Self-audit your solution against these architectural checkpoints:
            </p>

            {problem.checklist.map((item) => {
              const isDone = !!checkedItems[item.id];
              return (
                <div
                  key={item.id}
                  className="checklist-item"
                  onClick={() => toggleCheck(item.id)}
                  style={{
                    cursor: 'pointer',
                    borderColor: isDone ? 'rgba(16, 185, 129, 0.4)' : undefined,
                    background: isDone ? 'rgba(16, 185, 129, 0.05)' : undefined
                  }}
                >
                  <div className="checklist-title">
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => {}}
                      style={{ cursor: 'pointer', accentColor: 'var(--accent-emerald)' }}
                    />
                    <span style={{ textDecoration: isDone ? 'line-through' : 'none', color: isDone ? '#94a3b8' : undefined }}>
                      {item.title}
                    </span>
                  </div>
                  <p className="checklist-hint">{item.hint}</p>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'reference' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Compare approaches. Load either sample into the editor to inspect how the evaluation engine analyzes different architectural patterns:
            </p>

            <div className="checklist-item" style={{ borderLeft: '3px solid var(--accent-emerald)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#86efac' }}>
                  Exemplary Senior Solution
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onLoadSolution(problem.sampleGoodSolution.code, problem.sampleGoodSolution.rationale)}
                >
                  <Code size={13} />
                  <span>Load</span>
                </button>
              </div>
              <p className="checklist-hint">
                {problem.sampleGoodSolution.rationale}
              </p>
            </div>

            <div className="checklist-item" style={{ borderLeft: '3px solid var(--accent-rose)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fca5a5' }}>
                  Flawed God-Class Solution
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onLoadSolution(problem.sampleFlawedSolution.code, problem.sampleFlawedSolution.rationale)}
                >
                  <AlertTriangle size={13} />
                  <span>Load</span>
                </button>
              </div>
              <p className="checklist-hint">
                {problem.sampleFlawedSolution.explanation}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
