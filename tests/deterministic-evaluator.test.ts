import { describe, it, expect } from 'vitest';
import { DeterministicRuleEvaluator } from '../src/services/evaluation/DeterministicRuleEvaluator';
import { PROBLEMS } from '../src/data/problems';
import type { Submission } from '../src/types';

describe('DeterministicRuleEvaluator', () => {
  const evaluator = new DeterministicRuleEvaluator();
  const parkingProblem = PROBLEMS[0];

  it('correctly scores high for a clean solution with interfaces, patterns and concurrency', async () => {
    const cleanSubmission: Submission = {
      id: 'sub-test-1',
      problemId: parkingProblem.id,
      attemptNumber: 1,
      language: 'typescript',
      code: parkingProblem.sampleGoodSolution.code,
      rationale: parkingProblem.sampleGoodSolution.rationale,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString()
    };

    const result = await evaluator.evaluate(cleanSubmission, parkingProblem);

    expect(result.overallScore).toBeGreaterThanOrEqual(75);
    expect(result.extractedClasses.length).toBeGreaterThanOrEqual(3);
    expect(result.detectedPatterns).toContain('Strategy Pattern');
    expect(result.rubrics.singleResponsibility.score).toBeGreaterThanOrEqual(15);
    expect(result.rubrics.openClosedExtensibility.score).toBeGreaterThanOrEqual(15);
    expect(result.rubrics.concurrencyAndThreadSafety.score).toBeGreaterThanOrEqual(15);
    expect(result.strengths.length).toBeGreaterThan(0);
  });

  it('detects God Class anti-pattern and penalizes Single Responsibility', async () => {
    const flawedSubmission: Submission = {
      id: 'sub-test-2',
      problemId: parkingProblem.id,
      attemptNumber: 1,
      language: 'typescript',
      code: parkingProblem.sampleFlawedSolution.code,
      rationale: parkingProblem.sampleFlawedSolution.rationale,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString()
    };

    const result = await evaluator.evaluate(flawedSubmission, parkingProblem);
    // console.log('DEBUG RUBRICS:', JSON.stringify(result.rubrics, null, 2), 'OVERALL:', result.overallScore);
    expect(result.overallScore).toBeLessThanOrEqual(68);
    expect(result.rubrics.singleResponsibility.score).toBeLessThanOrEqual(10);
    expect(result.actionableFeedback.some(f => f.title.includes('God Class'))).toBe(true);
    expect(result.rubrics.concurrencyAndThreadSafety.score).toBeLessThanOrEqual(12);
  });

  it('flags missing concurrency primitives for concurrent problems', async () => {
    const noLocksCode = `
      export class SimpleParkingLot {
        private spots: any[] = [];
        public park(vehicle: any) {
          // Direct unprotected mutation
          this.spots.push(vehicle);
          return true;
        }
      }
    `;

    const submission: Submission = {
      id: 'sub-test-3',
      problemId: parkingProblem.id,
      attemptNumber: 1,
      language: 'typescript',
      code: noLocksCode,
      rationale: 'Simple park method',
      status: 'SUBMITTED',
      createdAt: new Date().toISOString()
    };

    const result = await evaluator.evaluate(submission, parkingProblem);
    expect(result.rubrics.concurrencyAndThreadSafety.score).toBeLessThanOrEqual(10);
    expect(result.actionableFeedback.some(f => f.title.includes('Race Conditions'))).toBe(true);
  });
});
