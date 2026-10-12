import type { EvaluationResult, Problem, Submission } from '../../types';

export interface EvaluationContext {
  timeoutMs?: number;
  apiKey?: string;
}

export interface PartialEvaluationResult {
  overallScore: number;
  rubrics: EvaluationResult['rubrics'];
  strengths: string[];
  actionableFeedback: EvaluationResult['actionableFeedback'];
  tradeoffAnalysis: string;
  extractedClasses: string[];
  detectedPatterns: string[];
  diffSuggestion?: EvaluationResult['diffSuggestion'];
}

export interface IEvaluationStrategy {
  name: string;
  evaluate(
    submission: Submission, 
    problem: Problem, 
    context?: EvaluationContext
  ): Promise<PartialEvaluationResult>;
}
