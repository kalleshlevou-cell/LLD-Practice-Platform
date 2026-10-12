import React, { useState } from 'react';
import { 
  Award, 
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Cpu, 
  Code, 
  ArrowRight, 
  Sparkles,
  TrendingUp
} from 'lucide-react';
import type { EvaluationResult, AttemptDelta } from '../types';
import { EvaluationEntity } from '../domain/EvaluationEntity';

interface EvaluationViewProps {
  evaluation: EvaluationResult | null;
  isEvaluating: boolean;
  stage: 'PARSING' | 'RULES' | 'LLM' | 'SYNTHESIZING' | 'IDLE';
  attemptDelta: AttemptDelta | null;
  onRetry: () => void;
}

export const EvaluationView: React.FC<EvaluationViewProps> = ({
  evaluation,
  isEvaluating,
  stage,
  attemptDelta,
  onRetry
}) => {
  const [activeTab, setActiveTab] = useState<'rubric' | 'feedback' | 'tradeoffs' | 'diff'>('rubric');

  if (isEvaluating) {
    const stageLabels = {
      PARSING: 'Parsing class contracts and AST nodes...',
      RULES: 'Analyzing SOLID rules, coupling, and concurrency...',
      LLM: 'Performing semantic trade-off and reasoning critique...',
      SYNTHESIZING: 'Synthesizing actionable feedback and rubric scores...',
      IDLE: 'Starting evaluation...'
    };

    return (
      <div className="workspace-panel right">
        <div className="panel-header">
          <span className="panel-title">
            <Award size={17} color="var(--accent-indigo)" />
            <span>Design Evaluation</span>
          </span>
        </div>

        <div className="evaluating-spinner">
          <Loader2 size={38} className="spinner-icon" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center' }}>
            <span className="stage-badge">Stage: {stage}</span>
            <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
              {stageLabels[stage]}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              marginTop: '1rem',
              justifyContent: 'center'
            }}
          >
            {(['PARSING', 'RULES', 'LLM', 'SYNTHESIZING'] as const).map((s) => (
              <span
                key={s}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background:
                    s === stage
                      ? 'var(--accent-indigo)'
                      : stage === 'SYNTHESIZING'
                      ? 'var(--accent-emerald)'
                      : 'var(--border-color)',
                  transition: 'background 0.3s ease'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="workspace-panel right">
        <div className="panel-header">
          <span className="panel-title">
            <Award size={17} color="var(--accent-indigo)" />
            <span>Design Evaluation</span>
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 1.5rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
            gap: '0.85rem'
          }}
        >
          <Award size={48} color="var(--border-glow)" />
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            No Evaluation Yet
          </h3>
          <p style={{ fontSize: '0.82rem', maxWidth: 280, lineHeight: 1.5 }}>
            Work on your classes, interfaces, and methods in the canvas, then click <strong>Submit Attempt</strong> to receive explainable feedback.
          </p>
        </div>
      </div>
    );
  }

  const evalEntity = new EvaluationEntity(evaluation);
  const ratingTier = evalEntity.getRatingTier();

  const rubricDimensions = [
    { key: 'singleResponsibility', label: 'Single Responsibility (SRP)', dim: evaluation.rubrics.singleResponsibility },
    { key: 'openClosedExtensibility', label: 'Open-Closed Extensibility (OCP)', dim: evaluation.rubrics.openClosedExtensibility },
    { key: 'interfaceSegregation', label: 'Interface Segregation (ISP)', dim: evaluation.rubrics.interfaceSegregation },
    { key: 'concurrencyAndThreadSafety', label: 'Concurrency & Thread Safety', dim: evaluation.rubrics.concurrencyAndThreadSafety },
    { key: 'edgeCaseHandling', label: 'Edge Case Handling', dim: evaluation.rubrics.edgeCaseHandling }
  ] as const;

  return (
    <div className="workspace-panel right">
      <div className="panel-header">
        <span className="panel-title">
          <Award size={17} color="var(--accent-indigo)" />
          <span>Attempt #{evaluation.attemptNumber} Evaluation</span>
        </span>
        <span
          className="tier-badge"
          style={{
            background: evaluation.evaluatorMode === 'HYBRID_COMPOSITE' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            color: evaluation.evaluatorMode === 'HYBRID_COMPOSITE' ? '#a5b4fc' : '#fbbf24',
            border: '1px solid currentColor'
          }}
        >
          {evaluation.evaluatorMode === 'HYBRID_COMPOSITE' ? 'Hybrid AI' : 'Deterministic'}
        </span>
      </div>

      <div className="tab-bar">
        <button
          className={`tab-btn ${activeTab === 'rubric' ? 'active' : ''}`}
          onClick={() => setActiveTab('rubric')}
        >
          <span>Rubric</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          <span>Advice ({evaluation.actionableFeedback.length})</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'tradeoffs' ? 'active' : ''}`}
          onClick={() => setActiveTab('tradeoffs')}
        >
          <span>Trade-offs</span>
        </button>
        {evaluation.diffSuggestion && (
          <button
            className={`tab-btn ${activeTab === 'diff' ? 'active' : ''}`}
            onClick={() => setActiveTab('diff')}
          >
            <span>Suggested Diff</span>
          </button>
        )}
      </div>

      <div className="evaluation-content">
        {/* Score Hero Card */}
        <div className="score-hero">
          <div className="score-circle-container">
            <span className="score-number">{evaluation.overallScore}</span>
            <span className="score-max">Score out of 100</span>
          </div>

          <div className="score-meta">
            <span
              className="tier-badge"
              style={{
                background: `${ratingTier.color}20`,
                color: ratingTier.color,
                border: `1px solid ${ratingTier.color}40`
              }}
            >
              {ratingTier.label}
            </span>

            <div className="latency-indicator">
              <Clock size={12} />
              <span>Evaluated in {evaluation.latencyMs}ms</span>
            </div>

            {attemptDelta && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.78rem',
                  color: attemptDelta.scoreDelta >= 0 ? '#34d399' : '#f87171',
                  fontWeight: 600,
                  marginTop: '0.2rem'
                }}
              >
                <TrendingUp size={14} />
                <span>
                  {attemptDelta.scoreDelta >= 0 ? `+${attemptDelta.scoreDelta}` : attemptDelta.scoreDelta} pts vs Attempt #{evaluation.attemptNumber - 1}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tab 1: Rubric Breakdown */}
        {activeTab === 'rubric' && (
          <div className="rubric-section">
            {rubricDimensions.map(({ key, label, dim }) => {
              const pct = (dim.score / dim.maxScore) * 100;
              const barColor = 
                dim.score >= 17 ? '#10b981' :
                dim.score >= 13 ? '#6366f1' :
                dim.score >= 9 ? '#f59e0b' : '#ef4444';

              return (
                <div key={key} className="rubric-card">
                  <div className="rubric-header">
                    <span className="rubric-name">{label}</span>
                    <span className="rubric-score-badge" style={{ color: barColor }}>
                      {dim.score} / {dim.maxScore}
                    </span>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${pct}%`,
                        background: barColor
                      }}
                    />
                  </div>

                  <p className="rubric-feedback-text">{dim.feedback}</p>

                  {dim.detectedSmells.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.2rem' }}>
                      {dim.detectedSmells.map((smell, idx) => (
                        <span key={idx} className="smell-tag">
                          <AlertTriangle size={11} />
                          <span>{smell}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Actionable Feedback */}
        {activeTab === 'feedback' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {evaluation.actionableFeedback.length === 0 ? (
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                No critical flaws detected. Your design is in excellent shape!
              </p>
            ) : (
              evaluation.actionableFeedback.map((adv, idx) => (
                <div key={idx} className={`advice-card ${adv.priority}`}>
                  <div className="advice-title">
                    <span>{adv.title}</span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        color:
                          adv.priority === 'high' ? 'var(--accent-rose)' :
                          adv.priority === 'medium' ? 'var(--accent-amber)' : 'var(--text-muted)'
                      }}
                    >
                      {adv.priority} priority
                    </span>
                  </div>
                  <p className="advice-desc">{adv.description}</p>
                  {adv.suggestedPatternOrRefactoring && (
                    <span className="pattern-chip">
                      Refactoring: {adv.suggestedPatternOrRefactoring}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Trade-offs Analysis */}
        {activeTab === 'tradeoffs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="problem-hero-card">
              <span className="section-label" style={{ color: 'var(--accent-indigo)' }}>
                Architectural Trade-off Appraisal
              </span>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                {evaluation.tradeoffAnalysis}
              </p>
            </div>

            {evaluation.strengths.length > 0 && (
              <div className="req-section">
                <span className="section-label">Identified Strengths</span>
                <ul className="req-list">
                  {evaluation.strengths.map((s, idx) => (
                    <li key={idx} className="req-item">
                      <CheckCircle size={14} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Diff Suggestion */}
        {activeTab === 'diff' && evaluation.diffSuggestion && (
          <div className="diff-card">
            <span className="section-label">Targeted Refactoring Recommendation</span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {evaluation.diffSuggestion.explanation}
            </p>

            <span style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 600 }}>
              Before (Current Smelling Pattern):
            </span>
            <pre className="diff-snippet diff-original">
              {evaluation.diffSuggestion.originalSnip}
            </pre>

            <span style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 600, marginTop: '0.3rem' }}>
              After (Proposed Extensible Pattern):
            </span>
            <pre className="diff-snippet diff-suggested">
              {evaluation.diffSuggestion.suggestedSnip}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
