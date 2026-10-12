import type { 
  EvaluationResult, 
  RubricBreakdown, 
  RubricDimension, 
  EvaluatorMode, 
  ActionableAdvice 
} from '../types';

export class EvaluationEntity {
  constructor(private readonly result: EvaluationResult) {}

  public static computeOverallScore(rubrics: RubricBreakdown): number {
    const total = 
      rubrics.singleResponsibility.score +
      rubrics.openClosedExtensibility.score +
      rubrics.interfaceSegregation.score +
      rubrics.concurrencyAndThreadSafety.score +
      rubrics.edgeCaseHandling.score;
    
    return Math.min(100, Math.max(0, Math.round(total)));
  }

  public static calculateDimensionStatus(score: number): RubricDimension['status'] {
    if (score >= 18) return 'exemplary';
    if (score >= 14) return 'proficient';
    if (score >= 9) return 'needs_improvement';
    return 'critical_flaw';
  }

  public getOverallScore(): number {
    return this.result.overallScore;
  }

  public getEvaluatorMode(): EvaluatorMode {
    return this.result.evaluatorMode;
  }

  public isDegraded(): boolean {
    return this.result.evaluatorMode === 'DETERMINISTIC_FALLBACK';
  }

  public getRubrics(): RubricBreakdown {
    return this.result.rubrics;
  }

  public getActionableFeedback(): ActionableAdvice[] {
    return [...this.result.actionableFeedback];
  }

  public getRatingTier(): { label: string; color: string } {
    const score = this.result.overallScore;
    if (score >= 85) return { label: 'Production Ready / Senior Level', color: '#10b981' };
    if (score >= 70) return { label: 'Solid Architecture / Minor Smells', color: '#3b82f6' };
    if (score >= 50) return { label: 'Intermediate / Needs Refactoring', color: '#f59e0b' };
    return { label: 'Novice / Architectural Flaws Detected', color: '#ef4444' };
  }

  public toJSON(): EvaluationResult {
    return { ...this.result };
  }
}
