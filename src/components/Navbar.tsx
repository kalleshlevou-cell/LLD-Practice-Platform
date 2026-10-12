import React from 'react';
import { Layers, Sparkles, History, Key, BookOpen, RotateCcw } from 'lucide-react';
import type { Problem } from '../types';

interface NavbarProps {
  problems: Problem[];
  selectedProblem: Problem;
  onSelectProblem: (problem: Problem) => void;
  attemptCount: number;
  bestScore: number | null;
  onOpenHistory: () => void;
  onOpenApiKey: () => void;
  onOpenDocs: () => void;
  onResetDraft: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  problems,
  selectedProblem,
  onSelectProblem,
  attemptCount,
  bestScore,
  onOpenHistory,
  onOpenApiKey,
  onOpenDocs,
  onResetDraft
}) => {
  return (
    <header className="navbar">
      <div className="brand-section">
        <div className="brand-logo-icon">
          <Layers size={22} />
        </div>
        <div>
          <span className="brand-title">LLD Forge</span>
          <span className="brand-badge" style={{ marginLeft: '0.6rem' }}>Practice Platform</span>
        </div>

        <div className="problem-select-wrapper" style={{ marginLeft: '1rem' }}>
          <select
            className="problem-select"
            value={selectedProblem.id}
            onChange={(e) => {
              const p = problems.find((item) => item.id === e.target.value);
              if (p) onSelectProblem(p);
            }}
          >
            {problems.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.difficulty})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="nav-actions">
        {attemptCount > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '0.35rem 0.75rem',
              borderRadius: '999px',
              border: '1px solid var(--border-color)'
            }}
          >
            <History size={14} color="var(--accent-indigo)" />
            <span>Attempts: <strong>{attemptCount}</strong></span>
            {bestScore !== null && (
              <>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span>Best: <strong style={{ color: bestScore >= 75 ? '#34d399' : '#fbbf24' }}>{bestScore}</strong>/100</span>
              </>
            )}
          </div>
        )}

        <button
          className="btn btn-secondary btn-sm"
          onClick={onOpenHistory}
          title="View attempt history and progression diff"
        >
          <History size={15} />
          <span>History & Diff</span>
        </button>

        <button
          className="btn btn-secondary btn-sm"
          onClick={onOpenApiKey}
          title="Configure Gemini API Key"
        >
          <Key size={15} />
          <span>AI Engine</span>
        </button>

        <button
          className="btn btn-secondary btn-sm"
          onClick={onOpenDocs}
          title="View Research & Architecture Notes"
        >
          <BookOpen size={15} />
          <span>Design Notes</span>
        </button>

        <button
          className="btn btn-ghost btn-sm"
          onClick={onResetDraft}
          title="Reset to starter template"
        >
          <RotateCcw size={15} />
        </button>
      </div>
    </header>
  );
};
