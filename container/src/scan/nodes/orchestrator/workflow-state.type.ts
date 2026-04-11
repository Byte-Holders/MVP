import { Target } from 'src/scan/target.types';
import { DepsReport } from './dependency/deps-report.type';
import { VulnerabilitiesReport } from './security/security-report.type';
import { DocsReport } from './docs/docs-report.type';
import { TestReport } from './coverage/coverage-report.type';
import { Report, CodeQualityReport } from './synthesizer/synthesizer.types';
import { Annotation } from '@langchain/langgraph';
import { Language } from './github/language.type';

export const WorkflowAnnotation = Annotation.Root({
  target: Annotation<Target>(),
  repoPath: Annotation<string>(),
  startScanTime: Annotation<Date>(),
  vulnerabilitiesReportPath: Annotation<string | undefined>(),
  languages: Annotation<Language[] | undefined | null>(),
  depsReport: Annotation<DepsReport | undefined | null>(),
  vulnerabilitiesReport: Annotation<VulnerabilitiesReport | undefined | null>(),
  docsReport: Annotation<DocsReport | undefined | null>(),
  testReport: Annotation<TestReport | undefined | null>(),
  codeQualityReport: Annotation<CodeQualityReport | undefined | null>(),
  finalReport: Annotation<Report | undefined>(),
});

export type WorkflowState = typeof WorkflowAnnotation.State;
