import { describe, it, expect } from 'vitest';
import { EvaluationPipeline } from '../src/services/evaluation/EvaluationPipeline';
import { PROBLEMS } from '../src/data/problems';
import type { Submission } from '../src/types';

describe('EvaluationPipeline', () => {
  const pipeline = new EvaluationPipeline();
  const problem = PROBLEMS[0];

  it('successfully executes and completes composite evaluation', async () => {
    const submission: Submission = {
      id: 'sub-pipe-1',
      problemId: problem.id,
      attemptNumber: 1,
      language: 'typescript',
      code: problem.sampleGoodSolution.code,
      rationale: problem.sampleGoodSolution.rationale,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString()
    };

    const stages: string[] = [];
    const result = await pipeline.execute(submission, problem, undefined, (s) => stages.push(s));

    expect(result.id).toBeDefined();
    expect(result.overallScore).toBeGreaterThanOrEqual(70);
    expect(stages).toContain('PARSING');
    expect(stages).toContain('RULES');
    expect(stages).toContain('SYNTHESIZING');
    expect(result.latencyMs).toBeGreaterThan(0);
  });

  it('gracefully degrades to deterministic fallback on short timeout or failure', async () => {
    const submission: Submission = {
      id: 'sub-pipe-2',
      problemId: problem.id,
      attemptNumber: 1,
      language: 'typescript',
      code: problem.sampleGoodSolution.code,
      rationale: problem.sampleGoodSolution.rationale,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString()
    };

    // Force 1ms timeout to trigger graceful degradation circuit breaker
    const result = await pipeline.execute(submission, problem, { timeoutMs: 1 });

    expect(result.evaluatorMode).toBe('DETERMINISTIC_FALLBACK');
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.rubrics.singleResponsibility).toBeDefined();
  });
});
