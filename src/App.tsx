import React, { useState, useEffect, useMemo } from 'react';
import { PROBLEMS } from './data/problems';
import type { 
  Problem, 
  ProgrammingLanguage, 
  Submission, 
  EvaluationResult, 
  AttemptDelta 
} from './types';
import { SubmissionEntity } from './domain/SubmissionEntity';
import { EvaluationPipeline } from './services/evaluation/EvaluationPipeline';
import { DeterministicRuleEvaluator } from './services/evaluation/DeterministicRuleEvaluator';
import { ComparisonService } from './services/evaluation/ComparisonService';
import { Repository } from './services/storage/Repository';

import { Navbar } from './components/Navbar';
import { ProblemView } from './components/ProblemView';
import { PracticeCanvas } from './components/PracticeCanvas';
import { EvaluationView } from './components/EvaluationView';
import { AttemptHistoryModal } from './components/AttemptHistoryModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { DocumentationModal } from './components/DocumentationModal';

export function App() {
  const [selectedProblem, setSelectedProblem] = useState<Problem>(PROBLEMS[0]);
  const [language, setLanguage] = useState<ProgrammingLanguage>('typescript');
  const [code, setCode] = useState<string>('');
  const [rationale, setRationale] = useState<string>('');

  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationStage, setEvaluationStage] = useState<'PARSING' | 'RULES' | 'LLM' | 'SYNTHESIZING' | 'IDLE'>('IDLE');
  const [currentEvaluation, setCurrentEvaluation] = useState<EvaluationResult | null>(null);
  const [attemptDelta, setAttemptDelta] = useState<AttemptDelta | null>(null);

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationResult[]>([]);

  // Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isApiKeyOpen, setIsApiKeyOpen] = useState<boolean>(false);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);

  const pipeline = useMemo(() => new EvaluationPipeline(), []);
  const deterministicEvaluator = useMemo(() => new DeterministicRuleEvaluator(), []);

  // Initialize or switch problem
  useEffect(() => {
    const subs = Repository.getSubmissions(selectedProblem.id);
    const evals = Repository.getEvaluations(selectedProblem.id);
    setSubmissions(subs);
    setEvaluations(evals);

    if (subs.length > 0) {
      const lastSub = subs[subs.length - 1];
      const lastEval = evals.find(e => e.submissionId === lastSub.id) || null;
      setCode(lastSub.code);
      setRationale(lastSub.rationale);
      setLanguage(lastSub.language);
      setCurrentEvaluation(lastEval);

      if (subs.length > 1 && lastEval) {
        const prevSub = subs[subs.length - 2];
        const prevEval = evals.find(e => e.submissionId === prevSub.id) || null;
        setAttemptDelta(ComparisonService.compareAttempts(prevEval, lastEval));
      } else {
        setAttemptDelta(null);
      }
    } else {
      setCode(selectedProblem.starterTemplate[language as keyof typeof selectedProblem.starterTemplate] || selectedProblem.starterTemplate.typescript);
      setRationale('');
      setCurrentEvaluation(null);
      setAttemptDelta(null);
    }
  }, [selectedProblem]);

  const bestScore = useMemo(() => {
    if (evaluations.length === 0) return null;
    return Math.max(...evaluations.map(e => e.overallScore));
  }, [evaluations]);

  const handleSelectProblem = (problem: Problem) => {
    setSelectedProblem(problem);
  };

  const handleLanguageChange = (newLang: ProgrammingLanguage) => {
    setLanguage(newLang);
    // If code is still the starter template of previous language, switch template
    const prevTemplate = selectedProblem.starterTemplate[language as keyof typeof selectedProblem.starterTemplate];
    if (code.trim() === (prevTemplate || '').trim()) {
      setCode(selectedProblem.starterTemplate[newLang as keyof typeof selectedProblem.starterTemplate] || selectedProblem.starterTemplate.typescript);
    }
  };

  const handleResetDraft = () => {
    setCode(selectedProblem.starterTemplate[language as keyof typeof selectedProblem.starterTemplate] || selectedProblem.starterTemplate.typescript);
    setRationale('');
  };

  const handleLoadSolution = (newCode: string, newRationale: string) => {
    setCode(newCode);
    setRationale(newRationale);
  };

  const handleRestoreAttempt = (sub: Submission) => {
    setCode(sub.code);
    setRationale(sub.rationale);
    setLanguage(sub.language);
    const ev = evaluations.find(e => e.submissionId === sub.id) || null;
    setCurrentEvaluation(ev);
  };

  // Full hybrid evaluation pipeline submission
  const handleSubmit = async () => {
    if (code.trim().length === 0 || isEvaluating) return;

    const attemptNumber = submissions.length + 1;
    const submissionId = 'sub-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

    const submissionEntity = SubmissionEntity.create(
      submissionId,
      selectedProblem.id,
      attemptNumber,
      language,
      code,
      rationale
    );

    submissionEntity.markAsSubmitted();
    setIsEvaluating(true);
    setEvaluationStage('PARSING');

    try {
      const prevEval = currentEvaluation;
      const evaluationResult = await pipeline.execute(
        submissionEntity.toJSON(),
        selectedProblem,
        undefined,
        (stage) => setEvaluationStage(stage)
      );

      submissionEntity.attachEvaluation(
        evaluationResult.id, 
        evaluationResult.evaluatorMode === 'DETERMINISTIC_FALLBACK'
      );

      // Save to persistence layer
      Repository.saveSubmission(submissionEntity.toJSON());
      Repository.saveEvaluation(evaluationResult);

      const updatedSubs = Repository.getSubmissions(selectedProblem.id);
      const updatedEvals = Repository.getEvaluations(selectedProblem.id);
      setSubmissions(updatedSubs);
      setEvaluations(updatedEvals);

      setCurrentEvaluation(evaluationResult);

      // Compute progression delta
      const delta = ComparisonService.compareAttempts(prevEval, evaluationResult);
      setAttemptDelta(delta);
    } catch (err) {
      console.error('Submission evaluation failed:', err);
      submissionEntity.transitionTo('FAILED');
    } finally {
      setIsEvaluating(false);
      setEvaluationStage('IDLE');
    }
  };

  // Quick instant static AST check
  const handleRunStaticCheck = async () => {
    if (code.trim().length === 0 || isEvaluating) return;

    setIsEvaluating(true);
    setEvaluationStage('RULES');

    try {
      const mockSub: Submission = {
        id: 'static-check-preview',
        problemId: selectedProblem.id,
        attemptNumber: submissions.length,
        language,
        code,
        rationale,
        status: 'SUBMITTED',
        createdAt: new Date().toISOString()
      };

      const result = await deterministicEvaluator.evaluate(mockSub, selectedProblem);
      setCurrentEvaluation({
        id: 'eval-static-' + Date.now(),
        submissionId: mockSub.id,
        problemId: selectedProblem.id,
        attemptNumber: mockSub.attemptNumber,
        overallScore: result.overallScore,
        evaluatorMode: 'DETERMINISTIC_FALLBACK',
        latencyMs: 32,
        timestamp: new Date().toISOString(),
        summary: 'Instant AST Static Analysis Check (Uncommitted preview).',
        rubrics: result.rubrics,
        strengths: result.strengths,
        actionableFeedback: result.actionableFeedback,
        tradeoffAnalysis: result.tradeoffAnalysis,
        extractedClasses: result.extractedClasses,
        detectedPatterns: result.detectedPatterns,
        diffSuggestion: result.diffSuggestion
      });
      setAttemptDelta(null);
    } finally {
      setIsEvaluating(false);
      setEvaluationStage('IDLE');
    }
  };

  return (
    <div className="app-container">
      <Navbar
        problems={PROBLEMS}
        selectedProblem={selectedProblem}
        onSelectProblem={handleSelectProblem}
        attemptCount={submissions.length}
        bestScore={bestScore}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenApiKey={() => setIsApiKeyOpen(true)}
        onOpenDocs={() => setIsDocsOpen(true)}
        onResetDraft={handleResetDraft}
      />

      <main className="main-workspace">
        {/* Left: Problem specs, checklists, rubrics, samples */}
        <ProblemView
          problem={selectedProblem}
          onLoadSolution={handleLoadSolution}
        />

        {/* Center: Code Canvas, Rationale & Live UML Diagram */}
        <PracticeCanvas
          code={code}
          rationale={rationale}
          language={language}
          isEvaluating={isEvaluating}
          onCodeChange={setCode}
          onRationaleChange={setRationale}
          onLanguageChange={handleLanguageChange}
          onSubmit={handleSubmit}
          onRunStaticCheck={handleRunStaticCheck}
        />

        {/* Right: Rubric Results, Live Stages, Actionable Feedback, Diff */}
        <EvaluationView
          evaluation={currentEvaluation}
          isEvaluating={isEvaluating}
          stage={evaluationStage}
          attemptDelta={attemptDelta}
          onRetry={handleSubmit}
        />
      </main>

      {/* Modals */}
      <AttemptHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        submissions={submissions}
        evaluations={evaluations}
        onRestoreAttempt={handleRestoreAttempt}
      />

      <ApiKeyModal
        isOpen={isApiKeyOpen}
        onClose={() => setIsApiKeyOpen(false)}
      />

      <DocumentationModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />
    </div>
  );
}

export default App;
