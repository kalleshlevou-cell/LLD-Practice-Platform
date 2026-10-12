import React, { useState } from 'react';
import { 
  X, 
  History, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  GitCompare, 
  FileCode 
} from 'lucide-react';
import type { EvaluationResult, Submission } from '../types';
import { ComparisonService } from '../services/evaluation/ComparisonService';

interface AttemptHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissions: Submission[];
  evaluations: EvaluationResult[];
  onRestoreAttempt: (sub: Submission) => void;
}

export const AttemptHistoryModal: React.FC<AttemptHistoryModalProps> = ({
  isOpen,
  onClose,
  submissions,
  evaluations,
  onRestoreAttempt
}) => {
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedSub = submissions.find((s) => s.id === selectedAttemptId) || submissions[submissions.length - 1];
  const selectedEval = selectedSub ? evaluations.find((e) => e.submissionId === selectedSub.id) : null;

  // Find previous attempt to calculate delta
  const previousSub = selectedSub
    ? submissions.find((s) => s.attemptNumber === selectedSub.attemptNumber - 1)
    : null;
  const previousEval = previousSub
    ? evaluations.find((e) => e.submissionId === previousSub.id)
    : null;

  const delta = selectedEval ? ComparisonService.compareAttempts(previousEval || null, selectedEval) : null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 780 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <History size={18} color="var(--accent-indigo)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Attempt History & Progression</h3>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {submissions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <History size={36} />
              <p style={{ marginTop: '0.6rem', fontSize: '0.9rem' }}>No attempts submitted yet for this problem.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.25rem' }}>
              {/* Attempt Selector Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span className="section-label">Attempts Timeline</span>
                {submissions.map((sub) => {
                  const ev = evaluations.find((e) => e.submissionId === sub.id);
                  const isSelected = selectedSub?.id === sub.id;
                  const score = ev?.overallScore ?? 0;

                  return (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedAttemptId(sub.id)}
                      style={{
                        padding: '0.75rem',
                        background: isSelected ? 'var(--bg-tertiary)' : 'var(--bg-card)',
                        border: `1px solid ${isSelected ? 'var(--accent-indigo)' : 'var(--border-color)'}`,
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          Attempt #{sub.attemptNumber}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      <span
                        className="rubric-score-badge"
                        style={{
                          color: score >= 75 ? '#34d399' : score >= 50 ? '#fbbf24' : '#f87171',
                          fontSize: '0.95rem'
                        }}
                      >
                        {score} pts
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Attempt Inspector & Progression Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {selectedEval && (
                  <div className="problem-hero-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: 700 }}>
                        Attempt #{selectedSub.attemptNumber} Report
                      </span>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          onRestoreAttempt(selectedSub);
                          onClose();
                        }}
                      >
                        <RotateCcw size={13} />
                        <span>Restore to Canvas</span>
                      </button>
                    </div>

                    {delta && (
                      <div
                        style={{
                          background: delta.scoreDelta >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                          border: `1px solid ${delta.scoreDelta >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                          borderRadius: 'var(--radius-md)',
                          padding: '0.75rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.35rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.84rem' }}>
                          <TrendingUp size={15} color={delta.scoreDelta >= 0 ? '#34d399' : '#fb7185'} />
                          <span>Progression Analysis: {delta.summaryNote}</span>
                        </div>

                        {delta.resolvedSmells.length > 0 && (
                          <div style={{ fontSize: '0.76rem', color: '#86efac' }}>
                            ✓ Resolved anti-patterns: {delta.resolvedSmells.join(', ')}
                          </div>
                        )}

                        {delta.improvedRubrics.length > 0 && (
                          <div style={{ fontSize: '0.76rem', color: '#93c5fd' }}>
                            ↑ Improved dimensions: {delta.improvedRubrics.join(', ')}
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span className="tag-badge">Score: {selectedEval.overallScore}/100</span>
                      <span className="tag-badge">Evaluator: {selectedEval.evaluatorMode}</span>
                      <span className="tag-badge">Latency: {selectedEval.latencyMs}ms</span>
                    </div>

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {selectedEval.summary}
                    </p>
                  </div>
                )}

                {/* Code Snapshot Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span className="section-label">Code Snapshot</span>
                  <pre
                    style={{
                      background: '#06080f',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem',
                      fontFamily: 'var(--font-code)',
                      fontSize: '0.76rem',
                      lineHeight: 1.5,
                      maxHeight: '220px',
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {selectedSub.code}
                  </pre>
                </div>
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
