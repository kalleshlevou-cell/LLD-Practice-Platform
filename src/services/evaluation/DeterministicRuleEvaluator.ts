import type { Problem, RubricDimension, Submission } from '../../types';
import type { IEvaluationStrategy, PartialEvaluationResult } from './IEvaluationStrategy';

export class DeterministicRuleEvaluator implements IEvaluationStrategy {
  public readonly name = 'DeterministicRuleEvaluator';

  public async evaluate(
    submission: Submission,
    problem: Problem
  ): Promise<PartialEvaluationResult> {
    const code = submission.code;
    const rationale = submission.rationale || '';
    // Strip comments to prevent comment text from matching class/interface regexes
    const cleanCode = code.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');

    // 1. Structural Extraction
    const extractedClasses = this.extractClasses(cleanCode);
    const extractedInterfaces = this.extractInterfaces(cleanCode);
    const detectedPatterns = this.detectPatterns(code, rationale);
    const concurrencyTokens = this.detectConcurrencyPrimitives(cleanCode);
    const hasErrorHandling = this.detectErrorHandling(cleanCode);
    const hasGodClass = this.detectGodClassSmell(cleanCode, extractedClasses);

    // 2. Score 5 Rubric Dimensions (0-20 each)
    const srp = this.evaluateSingleResponsibility(extractedClasses, hasGodClass, code);
    const ocp = this.evaluateOpenClosed(extractedInterfaces, detectedPatterns, code);
    const isp = this.evaluateInterfaceSegregation(extractedInterfaces, code);
    const concurrency = this.evaluateConcurrency(concurrencyTokens, problem, code);
    const edgeCases = this.evaluateEdgeCases(hasErrorHandling, code);

    const overallScore = Math.min(100, Math.max(0, 
      srp.score + ocp.score + isp.score + concurrency.score + edgeCases.score
    ));

    // 3. Assemble Strengths and Actionable Feedback
    const strengths: string[] = [];
    const actionableFeedback: PartialEvaluationResult['actionableFeedback'] = [];

    if (extractedClasses.length >= 3) {
      strengths.push(`Modular domain modeling with ${extractedClasses.length} distinct classes (${extractedClasses.join(', ')}).`);
    }
    if (extractedInterfaces.length > 0) {
      strengths.push(`Good abstraction boundaries: Identified interfaces (${extractedInterfaces.join(', ')}).`);
    }
    if (detectedPatterns.length > 0) {
      strengths.push(`Architectural design pattern application: Detected ${detectedPatterns.join(', ')}.`);
    }
    if (concurrencyTokens.length > 0) {
      strengths.push(`Thread safety mechanisms present: Utilizes ${concurrencyTokens.join(', ')}.`);
    }

    // High Priority Smells
    if (hasGodClass) {
      actionableFeedback.push({
        priority: 'high',
        title: 'Decompose Monolithic Class (God Class Smell)',
        description: `Class contains bloated responsibilities with excessive methods. Split orchestration, storage, and calculation into dedicated delegates.`,
        suggestedPatternOrRefactoring: 'Extract Class / Facade Pattern'
      });
    }

    if (extractedInterfaces.length === 0) {
      actionableFeedback.push({
        priority: 'high',
        title: 'Introduce Abstractions to Satisfy Open-Closed Principle (OCP)',
        description: 'Direct concrete coupling detected. Introduce interfaces for core algorithms or policies so new variants can be added without modifying existing code.',
        suggestedPatternOrRefactoring: 'Strategy Pattern / Dependency Inversion'
      });
    }

    if (concurrencyTokens.length === 0 && (problem.id === 'parking-lot' || problem.id === 'rate-limiter' || problem.id === 'elevator-system')) {
      actionableFeedback.push({
        priority: 'high',
        title: 'Address Race Conditions in Critical Sections',
        description: 'Multiple concurrent requests could double-book resources or corrupt state. Implement atomic state updates or explicit locking around shared state mutations.',
        suggestedPatternOrRefactoring: 'Mutex / Synchronized Block / Atomic Guards'
      });
    }

    if (!hasErrorHandling) {
      actionableFeedback.push({
        priority: 'medium',
        title: 'Harden Boundary Validation and Error Handling',
        description: 'Missing explicit boundary checks or domain exceptions for invalid states (e.g. invalid IDs, empty queues, capacity overflows).',
        suggestedPatternOrRefactoring: 'Domain Specific Exceptions & Guard Clauses'
      });
    }

    if (rationale.trim().length < 20) {
      actionableFeedback.push({
        priority: 'low',
        title: 'Articulate Architectural Rationale and Trade-offs',
        description: 'Document your design reasoning: Why did you choose this pattern? What trade-offs between memory, complexity, and performance were accepted?',
        suggestedPatternOrRefactoring: 'Design Rationale Note'
      });
    }

    // Trade-off Analysis
    const tradeoffAnalysis = this.synthesizeTradeoffs(detectedPatterns, extractedClasses, concurrencyTokens);

    // Refactoring Suggestion
    const diffSuggestion = this.generateDiffSuggestion(hasGodClass, extractedInterfaces.length === 0, code);

    return {
      overallScore,
      rubrics: {
        singleResponsibility: srp,
        openClosedExtensibility: ocp,
        interfaceSegregation: isp,
        concurrencyAndThreadSafety: concurrency,
        edgeCaseHandling: edgeCases
      },
      strengths,
      actionableFeedback,
      tradeoffAnalysis,
      extractedClasses,
      detectedPatterns,
      diffSuggestion
    };
  }

  private extractClasses(code: string): string[] {
    const classRegex = /(?:class|struct)\s+([A-Za-z0-9_]+)/g;
    const matches: string[] = [];
    let match;
    while ((match = classRegex.exec(code)) !== null) {
      if (match[1] && !matches.includes(match[1])) {
        matches.push(match[1]);
      }
    }
    return matches;
  }

  private extractInterfaces(code: string): string[] {
    const interfaceRegex = /(?:interface|abstract\s+class)\s+([A-Za-z0-9_]+)/g;
    const matches: string[] = [];
    let match;
    while ((match = interfaceRegex.exec(code)) !== null) {
      if (match[1] && !matches.includes(match[1])) {
        matches.push(match[1]);
      }
    }
    return matches;
  }

  private detectPatterns(code: string, rationale: string): string[] {
    const patterns: string[] = [];
    const text = (code + ' ' + rationale).toLowerCase();

    if (text.includes('strategy') || /(?:compute|calculate|allocate|dispatch)strategy/i.test(code)) {
      patterns.push('Strategy Pattern');
    }
    if (text.includes('state') && (text.includes('idlestate') || text.includes('dispensingstate') || /(?:ivendingstate|ielevatorstate)/i.test(code))) {
      patterns.push('State Pattern');
    }
    if (text.includes('factory') || /create[A-Z][a-zA-Z]+/i.test(code)) {
      patterns.push('Factory Pattern');
    }
    if (text.includes('observer') || text.includes('listener') || text.includes('subscriber')) {
      patterns.push('Observer Pattern');
    }
    if (text.includes('singleton') || text.includes('getinstance')) {
      patterns.push('Singleton Pattern');
    }
    return patterns;
  }

  private detectConcurrencyPrimitives(code: string): string[] {
    const primitives: string[] = [];

    if (/\bsynchronized\b/i.test(code) || /synchronizedassign/i.test(code)) primitives.push('synchronized');
    if (/\b(?:lock|mutex|reentrantlock|semaphore)\b/i.test(code)) primitives.push('Lock/Mutex');
    if (/\b(?:atomic|compareandset)\b/i.test(code)) primitives.push('Atomic Guard');
    if (/\b(?:concurrenthashmap|threadsafe)\b/i.test(code)) primitives.push('Concurrent Data Structure');
    return primitives;
  }

  private detectErrorHandling(code: string): boolean {
    const hasThrow = /\b(?:throw\s+new|raise\s+|throw\s+)/i.test(code);
    const hasTryCatch = /\b(?:try\s*\{|except\s+|catch\s*\()/i.test(code);
    const hasParamGuard = /(?:if\s*\(![a-zA-Z0-9_]+|if\s*[a-zA-Z0-9_]+\s*===?\s*(?:null|undefined))/i.test(code);
    return hasThrow || hasTryCatch || hasParamGuard;
  }

  private detectGodClassSmell(code: string, classes: string[]): boolean {
    if (classes.length === 1 && code.length > 500) {
      return true;
    }
    const methodMatches = code.match(/(?:public|private|def)\s+[A-Za-z0-9_]+\s*\(/g);
    if (classes.length <= 2 && methodMatches && methodMatches.length > 7) {
      return true;
    }
    return false;
  }

  private evaluateSingleResponsibility(classes: string[], hasGodClass: boolean, code: string): RubricDimension {
    let score = 15;
    const smells: string[] = [];
    const strengths: string[] = [];

    if (classes.length >= 3 && !hasGodClass) {
      score = 18;
      strengths.push('Clean separation of concerns across multiple domain entities.');
    } else if (hasGodClass) {
      score = 8;
      smells.push('God Class anti-pattern: Core class coordinates too many disparate domain duties.');
    } else if (classes.length === 0) {
      score = 5;
      smells.push('No explicit object-oriented class structure defined.');
    } else {
      score = 13;
      smells.push('Moderate cohesion: Some classes could benefit from splitting orchestration and data.');
    }

    return {
      score,
      maxScore: 20,
      status: score >= 18 ? 'exemplary' : score >= 14 ? 'proficient' : score >= 9 ? 'needs_improvement' : 'critical_flaw',
      feedback: score >= 15 
        ? 'Well decoupled classes with distinct responsibilities.' 
        : 'Responsibilities are bunched together; consider splitting management from execution.',
      detectedSmells: smells,
      strengths
    };
  }

  private evaluateOpenClosed(interfaces: string[], patterns: string[], code: string): RubricDimension {
    let score = 14;
    const smells: string[] = [];
    const strengths: string[] = [];

    if (interfaces.length >= 2 || patterns.includes('Strategy Pattern')) {
      score = 19;
      strengths.push('Extensible architecture leveraging interfaces and pluggable strategies.');
    } else if (interfaces.length === 1) {
      score = 15;
      strengths.push('Interface abstraction provides an extension seam.');
    } else {
      score = 9;
      smells.push('Hardcoded concrete implementations violate Open-Closed Principle (OCP).');
    }

    return {
      score,
      maxScore: 20,
      status: score >= 18 ? 'exemplary' : score >= 14 ? 'proficient' : score >= 9 ? 'needs_improvement' : 'critical_flaw',
      feedback: score >= 15
        ? 'Good abstraction boundaries make the system extensible for future requirements.'
        : 'Adding a new pricing model or dispatch policy requires modifying core code directly.',
      detectedSmells: smells,
      strengths
    };
  }

  private evaluateInterfaceSegregation(interfaces: string[], code: string): RubricDimension {
    let score = 15;
    const smells: string[] = [];
    const strengths: string[] = [];

    if (interfaces.length >= 1) {
      score = 17;
      strengths.push('Focussed interfaces with cohesive method contracts.');
    } else {
      score = 11;
      smells.push('Clients depend directly on concrete classes without fine-grained contracts.');
    }

    return {
      score,
      maxScore: 20,
      status: score >= 18 ? 'exemplary' : score >= 14 ? 'proficient' : score >= 9 ? 'needs_improvement' : 'critical_flaw',
      feedback: score >= 15 
        ? 'Contract interfaces avoid client method pollution.'
        : 'Introduce targeted interfaces to decouple high-level orchestration from low-level details.',
      detectedSmells: smells,
      strengths
    };
  }

  private evaluateConcurrency(tokens: string[], problem: Problem, code: string): RubricDimension {
    let score = 12;
    const smells: string[] = [];
    const strengths: string[] = [];

    if (tokens.length >= 1) {
      score = 18;
      strengths.push(`Explicit concurrency primitives utilized: ${tokens.join(', ')}.`);
    } else {
      score = 8;
      smells.push('Critical race conditions: Shared mutable state is modified without locks or synchronization.');
    }

    return {
      score,
      maxScore: 20,
      status: score >= 18 ? 'exemplary' : score >= 14 ? 'proficient' : score >= 9 ? 'needs_improvement' : 'critical_flaw',
      feedback: score >= 15
        ? 'Thread-safety mechanisms guard concurrent state access.'
        : 'Under high concurrent load, race conditions may lead to inconsistent or corrupted state.',
      detectedSmells: smells,
      strengths
    };
  }

  private evaluateEdgeCases(hasErrorHandling: boolean, code: string): RubricDimension {
    let score = hasErrorHandling ? 17 : 10;
    const smells = hasErrorHandling ? [] : ['Missing guard clauses and exceptions for boundary or empty states.'];
    const strengths = hasErrorHandling ? ['Defensive input validation and domain exception guards.'] : [];

    return {
      score,
      maxScore: 20,
      status: score >= 18 ? 'exemplary' : score >= 14 ? 'proficient' : score >= 9 ? 'needs_improvement' : 'critical_flaw',
      feedback: hasErrorHandling 
        ? 'Defensive edge-case handling is actively enforced.'
        : 'Insufficient validation against empty collections, invalid inputs, or resource depletion.',
      detectedSmells: smells,
      strengths
    };
  }

  private synthesizeTradeoffs(patterns: string[], classes: string[], concurrency: string[]): string {
    const parts: string[] = [];
    if (patterns.includes('Strategy Pattern')) {
      parts.push('You chose the Strategy Pattern: this elevates extensibility (OCP) and testability by isolating algorithms into swappable classes, at the cost of slight class count overhead.');
    }
    if (patterns.includes('State Pattern')) {
      parts.push('You chose the State Pattern: transitions are explicitly encapsulated in state classes, avoiding brittle nested if-else checks, though state creation can introduce slight memory allocation overhead.');
    }
    if (concurrency.length > 0) {
      parts.push('Synchronized/lock-based guards ensure strict data consistency across concurrent requests, while introducing slight thread contention latency under heavy load.');
    } else {
      parts.push('Current design opts for simpler single-threaded state manipulation, which maximizes execution speed in single-worker loops but fails under multi-worker concurrency.');
    }
    return parts.join(' ');
  }

  private generateDiffSuggestion(hasGodClass: boolean, lacksInterfaces: boolean, code: string): PartialEvaluationResult['diffSuggestion'] {
    if (hasGodClass) {
      return {
        originalSnip: `// Monolithic Class Handling Everything
public class Manager {
  public park(...) { ... }
  public calculateFee(...) { /* Hardcoded pricing */ }
  public releaseSpot(...) { ... }
}`,
        suggestedSnip: `// Refactored with Strategy & Cohesive Roles
public interface IPricingStrategy {
  calculateFee(ticket: Ticket, exitTime: Date): number;
}

public class ParkingService {
  constructor(private pricingStrategy: IPricingStrategy) {}
  // Delegates pricing calculation to injected strategy
}`,
        explanation: 'Extract pricing computation out of the orchestrator to decouple business math from workflow logic.'
      };
    }

    if (lacksInterfaces) {
      return {
        originalSnip: `class ConcreteService {
  public execute() { /* direct implementation */ }
}`,
        suggestedSnip: `interface IServiceStrategy {
  execute(): Result;
}

class ConcreteService implements IServiceStrategy {
  public execute(): Result { /* swappable implementation */ }
}`,
        explanation: 'Introduce an interface contract to allow swapping algorithms or mocking in automated tests.'
      };
    }

    return {
      originalSnip: `spot.assign(vehicle);`,
      suggestedSnip: `// Concurrency-safe atomic check
if (!spot.synchronizedAssign(vehicle)) {
  throw new ConflictException("Spot was acquired concurrently");
}`,
      explanation: 'Use guarded atomic reservation to prevent race conditions during high concurrent traffic.'
    };
  }
}
