import type { ProgrammingLanguage, Submission, SubmissionStatus } from '../types';

export class SubmissionEntity {
  private status: SubmissionStatus;
  private code: string;
  private rationale: string;
  private language: ProgrammingLanguage;
  private evaluationId?: string;

  constructor(
    public readonly id: string,
    public readonly problemId: string,
    public readonly attemptNumber: number,
    language: ProgrammingLanguage,
    code: string,
    rationale: string,
    status: SubmissionStatus = 'DRAFT',
    public readonly createdAt: string = new Date().toISOString(),
    evaluationId?: string
  ) {
    this.language = language;
    this.code = code;
    this.rationale = rationale;
    this.status = status;
    this.evaluationId = evaluationId;
  }

  public static create(
    id: string,
    problemId: string,
    attemptNumber: number,
    language: ProgrammingLanguage,
    code: string,
    rationale: string
  ): SubmissionEntity {
    return new SubmissionEntity(
      id,
      problemId,
      attemptNumber,
      language,
      code,
      rationale,
      'DRAFT'
    );
  }

  public getStatus(): SubmissionStatus {
    return this.status;
  }

  public getCode(): string {
    return this.code;
  }

  public getRationale(): string {
    return this.rationale;
  }

  public getLanguage(): ProgrammingLanguage {
    return this.language;
  }

  public getEvaluationId(): string | undefined {
    return this.evaluationId;
  }

  public updateDraft(code: string, rationale: string, language?: ProgrammingLanguage): void {
    if (this.status !== 'DRAFT') {
      throw new Error(`Cannot update code when submission is in ${this.status} state`);
    }
    this.code = code;
    this.rationale = rationale;
    if (language) this.language = language;
  }

  public markAsSubmitted(): void {
    if (this.code.trim().length === 0) {
      throw new Error('Cannot submit empty code solution.');
    }
    this.status = 'SUBMITTED';
  }

  public transitionTo(newStatus: SubmissionStatus): void {
    const validTransitions: Record<SubmissionStatus, SubmissionStatus[]> = {
      DRAFT: ['SUBMITTED', 'FAILED'],
      SUBMITTED: ['PARSING', 'EVALUATING', 'FAILED'],
      PARSING: ['EVALUATING', 'FAILED'],
      EVALUATING: ['COMPLETED', 'DEGRADED_FALLBACK', 'FAILED'],
      COMPLETED: [],
      DEGRADED_FALLBACK: [],
      FAILED: ['DRAFT', 'SUBMITTED']
    };

    const allowed = validTransitions[this.status];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid lifecycle transition from ${this.status} to ${newStatus}`);
    }
    this.status = newStatus;
  }

  public attachEvaluation(evaluationId: string, isFallback: boolean = false): void {
    this.evaluationId = evaluationId;
    this.status = isFallback ? 'DEGRADED_FALLBACK' : 'COMPLETED';
  }

  public toJSON(): Submission {
    return {
      id: this.id,
      problemId: this.problemId,
      attemptNumber: this.attemptNumber,
      language: this.language,
      code: this.code,
      rationale: this.rationale,
      status: this.status,
      createdAt: this.createdAt,
      evaluationId: this.evaluationId,
    };
  }
}
