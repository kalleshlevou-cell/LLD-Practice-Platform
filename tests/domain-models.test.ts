import { describe, it, expect } from 'vitest';
import { SubmissionEntity } from '../src/domain/SubmissionEntity';
import { EvaluationEntity } from '../src/domain/EvaluationEntity';
import { ProblemEntity } from '../src/domain/ProblemEntity';
import { PROBLEMS } from '../src/data/problems';

describe('Domain Entities', () => {
  it('manages SubmissionEntity lifecycle transitions correctly', () => {
    const sub = SubmissionEntity.create('sub-1', 'parking-lot', 1, 'typescript', 'class Test {}', 'My rationale');

    expect(sub.getStatus()).toBe('DRAFT');

    sub.markAsSubmitted();
    expect(sub.getStatus()).toBe('SUBMITTED');

    sub.transitionTo('PARSING');
    expect(sub.getStatus()).toBe('PARSING');

    sub.transitionTo('EVALUATING');
    expect(sub.getStatus()).toBe('EVALUATING');

    sub.attachEvaluation('eval-123', false);
    expect(sub.getStatus()).toBe('COMPLETED');
    expect(sub.getEvaluationId()).toBe('eval-123');
  });

  it('rejects invalid lifecycle state transitions in SubmissionEntity', () => {
    const sub = SubmissionEntity.create('sub-2', 'parking-lot', 1, 'typescript', 'class Test {}', 'Rationale');

    // Cannot transition straight from DRAFT to EVALUATING
    expect(() => sub.transitionTo('EVALUATING')).toThrowError(/Invalid lifecycle transition/);
  });

  it('calculates score ratings and status in EvaluationEntity correctly', () => {
    expect(EvaluationEntity.calculateDimensionStatus(20)).toBe('exemplary');
    expect(EvaluationEntity.calculateDimensionStatus(15)).toBe('proficient');
    expect(EvaluationEntity.calculateDimensionStatus(10)).toBe('needs_improvement');
    expect(EvaluationEntity.calculateDimensionStatus(4)).toBe('critical_flaw');
  });

  it('encapsulates ProblemEntity queries properly', () => {
    const entity = new ProblemEntity(PROBLEMS[0]);
    expect(entity.getId()).toBe('parking-lot');
    expect(entity.getDomainRequirements().length).toBeGreaterThan(0);
    expect(entity.getStarterTemplate('typescript')).toContain('VehicleType');
  });
});
