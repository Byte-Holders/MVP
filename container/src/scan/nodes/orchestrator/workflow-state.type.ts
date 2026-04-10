import { Target } from 'src/scan/target.types';
import { DepsReport } from './dependency/deps-report.type';
import { VulnerabilitiesReport } from './security/security-report.type';
import { DocsReport } from './docs/docs-report.type';
import { CoverageReport } from './coverage/coverage-report.type';
import { Report } from './synthesizer/synthesizer.types';
import { Annotation } from '@langchain/langgraph';

export const WorkflowAnnotation = Annotation.Root({
  target: Annotation<Target>(),
  repoPath: Annotation<string>(),
  startScanTime: Annotation<Date>(),
  vulnerabilitiesReportPath: Annotation<string | undefined>(),
  languageBreakdown: Annotation<Record<string, number> | undefined | null>(),
  depsReport: Annotation<DepsReport | undefined | null>(),
  vulnerabilitiesReport: Annotation<VulnerabilitiesReport | undefined | null>(),
  docsReport: Annotation<DocsReport | undefined | null>(),
  coverageReport: Annotation<CoverageReport | undefined | null>(),
  finalReport: Annotation<Report | undefined>(),
});

export type WorkflowState = typeof WorkflowAnnotation.State;
