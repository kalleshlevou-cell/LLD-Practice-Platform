import type { 
  EvaluationResult, 
  EvaluatorMode, 
  Problem, 
  Submission 
} from '../../types';
import { DeterministicRuleEvaluator } from './DeterministicRuleEvaluator';
import { LlmEvaluator } from './LlmEvaluator';
import type { EvaluationContext, PartialEvaluationResult } from './IEvaluationStrategy';

export class EvaluationPipeline {
  private deterministicEvaluator: DeterministicRuleEvaluator;
  private llmEvaluator: LlmEvaluator;

  constructor() {
    this.deterministicEvaluator = new DeterministicRuleEvaluator();
    this.llmEvaluator = new LlmEvaluator();
  }

  public async execute(
    submission: Submission,
    problem: Problem,
    context?: EvaluationContext,
    onStageChange?: (stage: 'PARSING' | 'RULES' | 'LLM' | 'SYNTHESIZING') => void
  ): Promise<EvaluationResult> {
    const startTime = performance.now();
    const evaluationId = 'eval-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

    onStageChange?.('PARSING');
    await new Promise((r) => setTimeout(r, 80)); // Smooth UX transition

    onStageChange?.('RULES');
    const deterministicResult = await this.deterministicEvaluator.evaluate(submission, problem);

    onStageChange?.('LLM');
    let llmResult: PartialEvaluationResult | null = null;
    let mode: EvaluatorMode = 'HYBRID_COMPOSITE';

    try {
      // 4-second circuit-breaker timeout
      const timeoutMs = context?.timeoutMs ?? 4000;
      llmResult = await Promise.race([
        this.llmEvaluator.evaluate(submission, problem, context),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('LLM Evaluation timeout exceeded')), timeoutMs)
        )
      ]);
    } catch (error) {
      console.warn('LLM stage degraded or timed out:', error);
      mode = 'DETERMINISTIC_FALLBACK';
      llmResult = null;
    }

    onStageChange?.('SYNTHESIZING');
    await new Promise((r) => setTimeout(r, 60));

    const finalResult = this.synthesize(
      evaluationId,
      submission,
      problem,
      deterministicResult,
      llmResult,
      mode,
      Math.round(performance.now() - startTime)
    );

    return finalResult;
  }

  private synthesize(
    id: string,
    submission: Submission,
    problem: Problem,
    deterministic: PartialEvaluationResult,
    llm: PartialEvaluationResult | null,
    mode: EvaluatorMode,
    latencyMs: number
  ): EvaluationResult {
    if (!llm || mode === 'DETERMINISTIC_FALLBACK') {
      return {
        id,
        submissionId: submission.id,
        problemId: problem.id,
        attemptNumber: submission.attemptNumber,
        overallScore: deterministic.overallScore,
        evaluatorMode: 'DETERMINISTIC_FALLBACK',
        latencyMs,
        timestamp: new Date().toISOString(),
        summary: `Deterministic structural evaluation completed in ${latencyMs}ms. Analyzed class contracts, interface segregation, concurrency primitives, and SOLID principles.`,
        rubrics: deterministic.rubrics,
        strengths: deterministic.strengths,
        actionableFeedback: deterministic.actionableFeedback,
        tradeoffAnalysis: deterministic.tradeoffAnalysis,
        extractedClasses: deterministic.extractedClasses,
        detectedPatterns: deterministic.detectedPatterns,
        diffSuggestion: deterministic.diffSuggestion
      };
    }

    // Blend Deterministic (40% weight on strict rules) + LLM (60% weight on semantics)
    const blendedScore = Math.min(100, Math.max(0, Math.round(
      (deterministic.overallScore * 0.4) + (llm.overallScore * 0.6)
    )));

    // Union strengths and actionable feedback
    const combinedStrengths = Array.from(new Set([...deterministic.strengths, ...llm.strengths])).slice(0, 5);
    const combinedFeedback = [...deterministic.actionableFeedback, ...llm.actionableFeedback]
      .filter((v, idx, arr) => arr.findIndex(t => t.title === v.title) === idx)
      .slice(0, 5);

    const mergedPatterns = Array.from(new Set([...deterministic.detectedPatterns, ...llm.detectedPatterns]));
    const mergedClasses = Array.from(new Set([...deterministic.extractedClasses, ...llm.extractedClasses]));

    return {
      id,
      submissionId: submission.id,
      problemId: problem.id,
      attemptNumber: submission.attemptNumber,
      overallScore: blendedScore,
      evaluatorMode: 'HYBRID_COMPOSITE',
      latencyMs,
      timestamp: new Date().toISOString(),
      summary: `Comprehensive evaluation completed in ${latencyMs}ms combining AST rule checks with semantic architectural critique.`,
      rubrics: {
        singleResponsibility: {
          ...deterministic.rubrics.singleResponsibility,
          score: Math.round((deterministic.rubrics.singleResponsibility.score * 0.5) + (llm.rubrics.singleResponsibility.score * 0.5)),
          feedback: llm.rubrics.singleResponsibility.feedback || deterministic.rubrics.singleResponsibility.feedback
        },
        openClosedExtensibility: {
          ...deterministic.rubrics.openClosedExtensibility,
          score: Math.round((deterministic.rubrics.openClosedExtensibility.score * 0.5) + (llm.rubrics.openClosedExtensibility.score * 0.5)),
          feedback: llm.rubrics.openClosedExtensibility.feedback || deterministic.rubrics.openClosedExtensibility.feedback
        },
        interfaceSegregation: {
          ...deterministic.rubrics.interfaceSegregation,
          score: Math.round((deterministic.rubrics.interfaceSegregation.score * 0.5) + (llm.rubrics.interfaceSegregation.score * 0.5)),
          feedback: llm.rubrics.interfaceSegregation.feedback || deterministic.rubrics.interfaceSegregation.feedback
        },
        concurrencyAndThreadSafety: {
          ...deterministic.rubrics.concurrencyAndThreadSafety,
          score: Math.round((deterministic.rubrics.concurrencyAndThreadSafety.score * 0.5) + (llm.rubrics.concurrencyAndThreadSafety.score * 0.5)),
          feedback: llm.rubrics.concurrencyAndThreadSafety.feedback || deterministic.rubrics.concurrencyAndThreadSafety.feedback
        },
        edgeCaseHandling: {
          ...deterministic.rubrics.edgeCaseHandling,
          score: Math.round((deterministic.rubrics.edgeCaseHandling.score * 0.5) + (llm.rubrics.edgeCaseHandling.score * 0.5)),
          feedback: llm.rubrics.edgeCaseHandling.feedback || deterministic.rubrics.edgeCaseHandling.feedback
        }
      },
      strengths: combinedStrengths,
      actionableFeedback: combinedFeedback,
      tradeoffAnalysis: llm.tradeoffAnalysis || deterministic.tradeoffAnalysis,
      extractedClasses: mergedClasses,
      detectedPatterns: mergedPatterns,
      diffSuggestion: llm.diffSuggestion || deterministic.diffSuggestion
    };
  }
}
