type DocsReportUnit = {
  analysis: string;
};

type CommentDocsUnit = {
  filename: string;
  analysis: string;
};

type ReadmeReport = {
  analysis: DocsReportUnit;
};

export type DocsReport = {
  readmeReport: ReadmeReport;
  commentReport: CommentDocsUnit[];
  mark: number;
};
