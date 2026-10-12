import type { AttemptDelta, EvaluationResult } from '../../types';

export class ComparisonService {
  public static compareAttempts(
    previous: EvaluationResult | null,
    current: EvaluationResult
  ): AttemptDelta | null {
    if (!previous) return null;

    const scoreDelta = current.overallScore - previous.overallScore;

    // Compare Smells
    const prevSmells = this.collectSmells(previous);
    const currSmells = this.collectSmells(current);

    const resolvedSmells = prevSmells.filter(s => !currSmells.includes(s));
    const newSmells = currSmells.filter(s => !prevSmells.includes(s));

    // Compare Rubrics
    const improvedRubrics: string[] = [];
    const keys = [
      { key: 'singleResponsibility', label: 'Single Responsibility (SRP)' },
      { key: 'openClosedExtensibility', label: 'Open-Closed Extensibility (OCP)' },
      { key: 'interfaceSegregation', label: 'Interface Segregation (ISP)' },
      { key: 'concurrencyAndThreadSafety', label: 'Concurrency & Thread Safety' },
      { key: 'edgeCaseHandling', label: 'Edge Case Handling' }
    ] as const;

    for (const item of keys) {
      const prevScore = previous.rubrics[item.key].score;
      const currScore = current.rubrics[item.key].score;
      if (currScore > prevScore) {
        improvedRubrics.push(`${item.label} (+${currScore - prevScore} pts)`);
      }
    }

    let summaryNote = '';
    if (scoreDelta > 0) {
      summaryNote = `Great iteration! Score improved by +${scoreDelta} points (${previous.overallScore} → ${current.overallScore}). ${
        resolvedSmells.length > 0 ? `Successfully resolved: ${resolvedSmells.join(', ')}.` : ''
      }`;
    } else if (scoreDelta === 0) {
      summaryNote = `Score unchanged at ${current.overallScore}. Review remaining actionable feedback to boost your design.`;
    } else {
      summaryNote = `Score decreased by ${scoreDelta} points (${previous.overallScore} → ${current.overallScore}). Check for regressions or unhandled edge cases.`;
    }

    return {
      previousScore: previous.overallScore,
      currentScore: current.overallScore,
      scoreDelta,
      resolvedSmells,
      newSmells,
      improvedRubrics,
      summaryNote
    };
  }

  private static collectSmells(evaluation: EvaluationResult): string[] {
    const list: string[] = [];
    for (const key of Object.keys(evaluation.rubrics) as (keyof typeof evaluation.rubrics)[]) {
      list.push(...evaluation.rubrics[key].detectedSmells);
    }
    return Array.from(new Set(list));
  }
}
