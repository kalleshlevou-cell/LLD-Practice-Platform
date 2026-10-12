import React, { useState, useEffect } from 'react';
import { X, Key, CheckCircle, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem('lld_gemini_api_key') || '';
    setApiKey(existing);
    setIsSaved(!!existing);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('lld_gemini_api_key', apiKey.trim());
      setIsSaved(true);
    } else {
      localStorage.removeItem('lld_gemini_api_key');
      setIsSaved(false);
    }
    onClose();
  };

  const handleClear = () => {
    localStorage.removeItem('lld_gemini_api_key');
    setApiKey('');
    setIsSaved(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Key size={18} color="var(--accent-indigo)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>AI Evaluation Engine Configuration</h3>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="problem-hero-card" style={{ borderLeft: '3px solid var(--accent-emerald)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#86efac', fontWeight: 600 }}>
              <ShieldCheck size={16} />
              <span>Zero-Config Guaranteed Out-of-the-Box</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              No API key is required to evaluate designs! The platform includes a high-fidelity <strong>Deterministic AST Analyzer & Semantic Heuristic Engine</strong> that evaluates SOLID principles, concurrency risks, and trade-offs offline in sub-100ms.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Optional Google Gemini API Key:
            </label>
            <input
              type="password"
              className="rationale-textarea"
              style={{ height: '42px', padding: '0.6rem 0.85rem', fontFamily: 'var(--font-code)' }}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
            />
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              If provided, calls <code>gemini-2.5-flash</code> with a 4-second circuit-breaker timeout. Stored locally in your browser session.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: isSaved ? '#10b981' : '#6366f1' }} />
            <span>Active Engine: <strong>{isSaved ? 'Live Gemini 2.5 Flash' : 'Built-in High-Fidelity Heuristic Engine'}</strong></span>
          </div>
        </div>

        <div className="modal-footer">
          {isSaved && (
            <button className="btn btn-ghost btn-sm" onClick={handleClear} style={{ marginRight: 'auto' }}>
              Remove Key
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
