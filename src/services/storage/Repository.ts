import type { EvaluationResult, Submission } from '../../types';

export class Repository {
  private static readonly SUBMISSIONS_KEY = 'lld_submissions';
  private static readonly EVALUATIONS_KEY = 'lld_evaluations';

  public static getSubmissions(problemId: string): Submission[] {
    try {
      const raw = localStorage.getItem(this.SUBMISSIONS_KEY);
      if (!raw) return [];
      const list: Submission[] = JSON.parse(raw);
      return list
        .filter(s => s.problemId === problemId)
        .sort((a, b) => a.attemptNumber - b.attemptNumber);
    } catch {
      return [];
    }
  }

  public static saveSubmission(submission: Submission): void {
    try {
      const raw = localStorage.getItem(this.SUBMISSIONS_KEY);
      const list: Submission[] = raw ? JSON.parse(raw) : [];
      const existingIdx = list.findIndex(s => s.id === submission.id);
      if (existingIdx >= 0) {
        list[existingIdx] = submission;
      } else {
        list.push(submission);
      }
      localStorage.setItem(this.SUBMISSIONS_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save submission to localStorage:', e);
    }
  }

  public static getEvaluations(problemId: string): EvaluationResult[] {
    try {
      const raw = localStorage.getItem(this.EVALUATIONS_KEY);
      if (!raw) return [];
      const list: EvaluationResult[] = JSON.parse(raw);
      return list
        .filter(e => e.problemId === problemId)
        .sort((a, b) => a.attemptNumber - b.attemptNumber);
    } catch {
      return [];
    }
  }

  public static getEvaluationBySubmissionId(submissionId: string): EvaluationResult | undefined {
    try {
      const raw = localStorage.getItem(this.EVALUATIONS_KEY);
      if (!raw) return undefined;
      const list: EvaluationResult[] = JSON.parse(raw);
      return list.find(e => e.submissionId === submissionId);
    } catch {
      return undefined;
    }
  }

  public static saveEvaluation(evaluation: EvaluationResult): void {
    try {
      const raw = localStorage.getItem(this.EVALUATIONS_KEY);
      const list: EvaluationResult[] = raw ? JSON.parse(raw) : [];
      const existingIdx = list.findIndex(e => e.id === evaluation.id);
      if (existingIdx >= 0) {
        list[existingIdx] = evaluation;
      } else {
        list.push(evaluation);
      }
      localStorage.setItem(this.EVALUATIONS_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save evaluation to localStorage:', e);
    }
  }

  public static clearHistory(problemId: string): void {
    try {
      const subRaw = localStorage.getItem(this.SUBMISSIONS_KEY);
      if (subRaw) {
        const subList: Submission[] = JSON.parse(subRaw);
        const filtered = subList.filter(s => s.problemId !== problemId);
        localStorage.setItem(this.SUBMISSIONS_KEY, JSON.stringify(filtered));
      }

      const evalRaw = localStorage.getItem(this.EVALUATIONS_KEY);
      if (evalRaw) {
        const evalList: EvaluationResult[] = JSON.parse(evalRaw);
        const filtered = evalList.filter(e => e.problemId !== problemId);
        localStorage.setItem(this.EVALUATIONS_KEY, JSON.stringify(filtered));
      }
    } catch (e) {
      console.error('Failed to clear history:', e);
    }
  }
}
