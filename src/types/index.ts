export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type SubmissionStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PARSING'
  | 'EVALUATING'
  | 'COMPLETED'
  | 'DEGRADED_FALLBACK'
  | 'FAILED';

export type EvaluatorMode = 
  | 'HYBRID_COMPOSITE'
  | 'DETERMINISTIC_FALLBACK'
  | 'LLM_ASSISTED';

export type ProgrammingLanguage = 'typescript' | 'java' | 'python' | 'cpp';

export interface ChecklistItem {
  id: string;
  category: string;
  title: string;
  hint: string;
}

export interface StarterTemplate {
  typescript: string;
  java: string;
  python: string;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  summary: string;
  description: string;
  domainRequirements: string[];
  nonFunctionalRequirements: string[];
  starterTemplate: StarterTemplate;
  checklist: ChecklistItem[];
  sampleGoodSolution: {
    language: ProgrammingLanguage;
    code: string;
    rationale: string;
    explanation?: string;
  };
  sampleFlawedSolution: {
    language: ProgrammingLanguage;
    code: string;
    rationale: string;
    explanation: string;
  };
  tags: string[];
}

export interface Submission {
  id: string;
  problemId: string;
  attemptNumber: number;
  language: ProgrammingLanguage;
  code: string;
  rationale: string;
  status: SubmissionStatus;
  createdAt: string;
  evaluationId?: string;
}

export interface RubricDimension {
  score: number; // 0 - 20
  maxScore: number; // 20
  status: 'exemplary' | 'proficient' | 'needs_improvement' | 'critical_flaw';
  feedback: string;
  detectedSmells: string[];
  strengths: string[];
}

export interface RubricBreakdown {
  singleResponsibility: RubricDimension;
  openClosedExtensibility: RubricDimension;
  interfaceSegregation: RubricDimension;
  concurrencyAndThreadSafety: RubricDimension;
  edgeCaseHandling: RubricDimension;
}

export interface ActionableAdvice {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  suggestedPatternOrRefactoring?: string;
}

export interface EvaluationResult {
  id: string;
  submissionId: string;
  problemId: string;
  attemptNumber: number;
  overallScore: number; // 0 - 100
  evaluatorMode: EvaluatorMode;
  latencyMs: number;
  timestamp: string;
  summary: string;
  rubrics: RubricBreakdown;
  strengths: string[];
  actionableFeedback: ActionableAdvice[];
  tradeoffAnalysis: string;
  extractedClasses: string[];
  detectedPatterns: string[];
  diffSuggestion?: {
    originalSnip: string;
    suggestedSnip: string;
    explanation: string;
  };
}

export interface AttemptDelta {
  previousScore: number;
  currentScore: number;
  scoreDelta: number;
  resolvedSmells: string[];
  newSmells: string[];
  improvedRubrics: string[];
  summaryNote: string;
}
