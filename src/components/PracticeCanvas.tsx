import React, { useState } from 'react';
import { 
  Code2, 
  MessageSquare, 
  GitBranch, 
  Play, 
  Send, 
  CheckCircle2, 
  FileCode 
} from 'lucide-react';
import type { ProgrammingLanguage } from '../types';

interface PracticeCanvasProps {
  code: string;
  rationale: string;
  language: ProgrammingLanguage;
  isEvaluating: boolean;
  onCodeChange: (code: string) => void;
  onRationaleChange: (rationale: string) => void;
  onLanguageChange: (lang: ProgrammingLanguage) => void;
  onSubmit: () => void;
  onRunStaticCheck: () => void;
}

export const PracticeCanvas: React.FC<PracticeCanvasProps> = ({
  code,
  rationale,
  language,
  isEvaluating,
  onCodeChange,
  onRationaleChange,
  onLanguageChange,
  onSubmit,
  onRunStaticCheck
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'rationale' | 'diagram'>('editor');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab key support for clean 2-space indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      onCodeChange(newCode);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }

    // Ctrl + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isEvaluating && code.trim().length > 0) {
        onSubmit();
      }
    }
  };

  // Real-time Class & Interface Extractor for Live Diagram
  const extractDiagramEntities = () => {
    const clean = code.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
    const classMatches = clean.matchAll(/(?:class|struct)\s+([A-Za-z0-9_]+)(?:\s+extends\s+([A-Za-z0-9_]+))?(?:\s+implements\s+([A-Za-z0-9_,\s]+))?/g);
    const interfaceMatches = clean.matchAll(/(?:interface|abstract\s+class)\s+([A-Za-z0-9_]+)/g);

    const entities: Array<{
      type: 'class' | 'interface';
      name: string;
      extendsFrom?: string;
      implementsList?: string[];
      methods: string[];
    }> = [];

    for (const match of interfaceMatches) {
      const name = match[1];
      if (name && !entities.some((e) => e.name === name)) {
        entities.push({
          type: 'interface',
          name,
          methods: []
        });
      }
    }

    for (const match of classMatches) {
      const name = match[1];
      const extendsFrom = match[2];
      const implementsRaw = match[3];
      const implementsList = implementsRaw ? implementsRaw.split(',').map((s) => s.trim()) : undefined;

      if (name && !entities.some((e) => e.name === name)) {
        entities.push({
          type: 'class',
          name,
          extendsFrom,
          implementsList,
          methods: []
        });
      }
    }

    return entities;
  };

  const diagramEntities = extractDiagramEntities();

  return (
    <div className="center-canvas">
      {/* Canvas Header & Tabs */}
      <div className="editor-toolbar">
        <div className="editor-toolbar-group">
          <div className="tab-bar" style={{ padding: 0, border: 'none', background: 'transparent' }}>
            <button
              className={`tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
              onClick={() => setActiveTab('editor')}
            >
              <Code2 size={15} />
              <span>Design & Code</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'rationale' ? 'active' : ''}`}
              onClick={() => setActiveTab('rationale')}
            >
              <MessageSquare size={15} />
              <span>Architectural Rationale</span>
              {rationale.trim().length > 0 && (
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-emerald)' }} />
              )}
            </button>
            <button
              className={`tab-btn ${activeTab === 'diagram' ? 'active' : ''}`}
              onClick={() => setActiveTab('diagram')}
            >
              <GitBranch size={15} />
              <span>Live UML Diagram</span>
              <span className="tag-badge" style={{ fontSize: '0.68rem', padding: '0.1rem 0.35rem' }}>
                {diagramEntities.length}
              </span>
            </button>
          </div>
        </div>

        <div className="editor-toolbar-group">
          <select
            className="lang-select"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as ProgrammingLanguage)}
          >
            <option value="typescript">TypeScript</option>
            <option value="java">Java</option>
            <option value="python">Python</option>
          </select>

          <button
            className="btn btn-secondary btn-sm"
            onClick={onRunStaticCheck}
            disabled={isEvaluating || code.trim().length === 0}
            title="Perform instant AST and rule analysis"
          >
            <Play size={14} />
            <span>Check AST</span>
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={onSubmit}
            disabled={isEvaluating || code.trim().length === 0}
            title="Submit design for full hybrid evaluation (Ctrl + Enter)"
          >
            <Send size={14} />
            <span>{isEvaluating ? 'Evaluating...' : 'Submit Attempt'}</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Code Canvas */}
      {activeTab === 'editor' && (
        <div className="code-editor-wrapper">
          <textarea
            className="code-textarea"
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="// Model your domain classes, interfaces, and methods here..."
            spellCheck={false}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.4rem 1.25rem',
              background: '#05070d',
              borderTop: '1px solid var(--border-color)',
              fontSize: '0.74rem',
              color: 'var(--text-muted)'
            }}
          >
            <span>Hotkeys: <kbd style={{ background: '#1e293b', padding: '0.1rem 0.3rem', borderRadius: 3 }}>Ctrl</kbd> + <kbd style={{ background: '#1e293b', padding: '0.1rem 0.3rem', borderRadius: 3 }}>Enter</kbd> to submit</span>
            <span>{code.split('\n').length} lines | {code.length} characters</span>
          </div>
        </div>
      )}

      {/* Tab 2: Rationale Canvas */}
      {activeTab === 'rationale' && (
        <div className="rationale-wrapper">
          <div className="problem-hero-card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Architectural Intent & Trade-offs</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              A senior engineer can justify *why* they chose a pattern and what trade-offs they made. Use this space to explain:
            </p>
            <ul style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '1.2rem', lineHeight: 1.5 }}>
              <li>Why you chose particular Design Patterns (e.g. Strategy vs State vs Factory)</li>
              <li>How you ensured thread-safety and race-condition prevention under high concurrency</li>
              <li>What trade-offs were accepted (memory footprint vs extensible indirection)</li>
            </ul>
          </div>

          <textarea
            className="rationale-textarea"
            value={rationale}
            onChange={(e) => onRationaleChange(e.target.value)}
            placeholder="Explain your architectural reasoning here (e.g., 'I chose the Strategy Pattern for pricing to adhere to OCP. Concurrency is handled by locking at the spot level...')"
          />
        </div>
      )}

      {/* Tab 3: Live UML Diagram */}
      {activeTab === 'diagram' && (
        <div className="diagram-wrapper">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Extracted Class Taxonomy ({diagramEntities.length} entities detected)
            </span>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Auto-generated from your current code skeleton
            </span>
          </div>

          {diagramEntities.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem',
                color: 'var(--text-muted)',
                gap: '0.5rem'
              }}
            >
              <FileCode size={36} color="var(--text-muted)" />
              <p style={{ fontSize: '0.86rem' }}>No classes or interfaces declared yet.</p>
              <p style={{ fontSize: '0.78rem' }}>Write class and interface definitions in the editor to visualize relationships.</p>
            </div>
          ) : (
            <div className="diagram-cards-grid">
              {diagramEntities.map((entity) => (
                <div key={entity.name} className="diagram-card">
                  <div className="diagram-card-header">
                    <span className="diagram-card-name">{entity.name}</span>
                    <span
                      className="diagram-card-type"
                      style={{
                        color: entity.type === 'interface' ? 'var(--accent-purple)' : 'var(--accent-cyan)'
                      }}
                    >
                      «{entity.type}»
                    </span>
                  </div>

                  {entity.extendsFrom && (
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Extends:</span> <strong>{entity.extendsFrom}</strong>
                    </div>
                  )}

                  {entity.implementsList && entity.implementsList.length > 0 && (
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Implements:</span>{' '}
                      <span style={{ color: 'var(--accent-indigo)' }}>
                        {entity.implementsList.join(', ')}
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: 'auto', paddingTop: '0.4rem' }}>
                    <CheckCircle2 size={13} color="var(--accent-emerald)" />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Encapsulated domain entity
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
