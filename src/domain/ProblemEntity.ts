import type { Problem, ProgrammingLanguage } from '../types';

export class ProblemEntity {
  constructor(private readonly problem: Problem) {}

  public getId(): string {
    return this.problem.id;
  }

  public getTitle(): string {
    return this.problem.title;
  }

  public getDifficulty(): string {
    return this.problem.difficulty;
  }

  public getDomainRequirements(): string[] {
    return [...this.problem.domainRequirements];
  }

  public getNonFunctionalRequirements(): string[] {
    return [...this.problem.nonFunctionalRequirements];
  }

  public getStarterTemplate(language: ProgrammingLanguage): string {
    return this.problem.starterTemplate[language as keyof typeof this.problem.starterTemplate] || this.problem.starterTemplate.typescript;
  }

  public getSampleGoodSolution() {
    return this.problem.sampleGoodSolution;
  }

  public getSampleFlawedSolution() {
    return this.problem.sampleFlawedSolution;
  }

  public getChecklist() {
    return this.problem.checklist;
  }

  public toJSON(): Problem {
    return { ...this.problem };
  }
}
