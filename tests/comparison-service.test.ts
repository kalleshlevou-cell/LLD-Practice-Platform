import { describe, it, expect } from 'vitest';
import { ComparisonService } from '../src/services/evaluation/ComparisonService';
import type { EvaluationResult } from '../src/types';

describe('ComparisonService', () => {
  const baseRubric = {
    singleResponsibility: { score: 10, maxScore: 20, status: 'needs_improvement' as const, feedback: '', detectedSmells: ['God Class'], strengths: [] },
    openClosedExtensibility: { score: 10, maxScore: 20, status: 'needs_improvement' as const, feedback: '', detectedSmells: ['Hardcoded rules'], strengths: [] },
    interfaceSegregation: { score: 12, maxScore: 20, status: 'needs_improvement' as const, feedback: '', detectedSmells: [], strengths: [] },
    concurrencyAndThreadSafety: { score: 8, maxScore: 20, status: 'critical_flaw' as const, feedback: '', detectedSmells: ['Race condition'], strengths: [] },
    edgeCaseHandling: { score: 12, maxScore: 20, status: 'needs_improvement' as const, feedback: '', detectedSmells: [], strengths: [] }
  };

  const attempt1: EvaluationResult = {
    id: 'eval-1',
    submissionId: 'sub-1',
    problemId: 'parking-lot',
    attemptNumber: 1,
    overallScore: 52,
    evaluatorMode: 'HYBRID_COMPOSITE',
    latencyMs: 120,
    timestamp: new Date().toISOString(),
    summary: 'Initial attempt',
    rubrics: baseRubric,
    strengths: ['Basic flow working'],
    actionableFeedback: [],
    tradeoffAnalysis: 'Procedural',
    extractedClasses: ['Manager'],
    detectedPatterns: []
  };

  const attempt2: EvaluationResult = {
    id: 'eval-2',
    submissionId: 'sub-2',
    problemId: 'parking-lot',
    attemptNumber: 2,
    overallScore: 84,
    evaluatorMode: 'HYBRID_COMPOSITE',
    latencyMs: 110,
    timestamp: new Date().toISOString(),
    summary: 'Refactored attempt',
    rubrics: {
      singleResponsibility: { score: 18, maxScore: 20, status: 'exemplary', feedback: '', detectedSmells: [], strengths: [] },
      openClosedExtensibility: { score: 18, maxScore: 20, status: 'exemplary', feedback: '', detectedSmells: [], strengths: [] },
      interfaceSegregation: { score: 16, maxScore: 20, status: 'proficient', feedback: '', detectedSmells: [], strengths: [] },
      concurrencyAndThreadSafety: { score: 16, maxScore: 20, status: 'proficient', feedback: '', detectedSmells: [], strengths: [] },
      edgeCaseHandling: { score: 16, maxScore: 20, status: 'proficient', feedback: '', detectedSmells: [], strengths: [] }
    },
    strengths: ['Solid abstraction'],
    actionableFeedback: [],
    tradeoffAnalysis: 'Strategy pattern with concurrency lock',
    extractedClasses: ['ParkingSpot', 'ParkingLotService', 'Ticket', 'Vehicle'],
    detectedPatterns: ['Strategy Pattern']
  };

  it('calculates positive delta and detects resolved smells', () => {
    const delta = ComparisonService.compareAttempts(attempt1, attempt2);
    expect(delta).not.toBeNull();
    expect(delta!.scoreDelta).toBe(32);
    expect(delta!.resolvedSmells).toContain('God Class');
    expect(delta!.resolvedSmells).toContain('Race condition');
    expect(delta!.improvedRubrics.length).toBeGreaterThan(0);
    expect(delta!.summaryNote).toContain('+32');
  });

  it('handles first attempt with null previous gracefully', () => {
    const delta = ComparisonService.compareAttempts(null, attempt1);
    expect(delta).toBeNull();
  });
});
