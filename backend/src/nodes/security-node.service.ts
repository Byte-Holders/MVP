import { Injectable, Logger } from '@nestjs/common';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { WorkflowState, VulnerabilitiesReport, VulnerabilityUnit } from '../types';

@Injectable()
export class SecurityNodeService {
    private readonly logger = new Logger(SecurityNodeService.name);

    private buildReportPath(repoName: string): string {
        const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
        return path.resolve(`./reports/${repoName}/scan_${dateStr}.json`);
    }

    //Runna semgrep
    async Scan(state: WorkflowState): Promise<Partial<WorkflowState> & { semgrepReportPath?: string }> {
        const repoName = path.basename(state.repoPath);
        const reportPath = this.buildReportPath(repoName);

        console.log(`[SecurityNode] Starting Semgrep scan on: ${state.repoPath}`);

        // Si assicura che la cartella dell'output esista
        fs.mkdirSync(path.dirname(reportPath), { recursive: true });

        try {
            // Verifica la presenza di semgrep
            const version = execSync('semgrep --version').toString().trim();
            console.log(`[SecurityNode] Semgrep version: ${version}`);
        } catch {
            console.error('[SecurityNode] Semgrep not found in PATH.');
            return { vulnerabilitiesReport: { report: [] } };
        }

        try {
            execSync(
                `semgrep scan ${state.repoPath} --config auto --json --output ${reportPath} ` +
                `--exclude=node_modules --exclude=reports --exclude=dist --quiet --no-git-ignore`,
                { stdio: 'inherit', encoding: 'utf-8' },
            );

            console.log(`[SecurityNode] Report saved to: ${reportPath}`);

            const raw = fs.readFileSync(reportPath, 'utf-8');
            const json = JSON.parse(raw);

            const units: VulnerabilityUnit[] = (json.results ?? []).map((r: any) => ({
                id: r.check_id ?? 'unknown',
                description: r.extra?.message ?? '',
                remediation: '',
                severity: this.parseSeverity(r.extra?.severity),
            }));

            const vulnerabilitiesReport: VulnerabilitiesReport = { report: units };

            console.log(`[SecurityNode] Found ${units.length} vulnerabilities.`);
            return { vulnerabilitiesReport, semgrepReportPath: reportPath } as any;
        } catch (error) {
            console.error('[SecurityNode] Semgrep execution failed.', error);
            return { vulnerabilitiesReport: { report: [] } };
        }
    }

    private parseSeverity(raw?: string): number {
        const map: Record<string, number> = { INFO: 1, WARNING: 2, ERROR: 3 };
        return map[raw?.toUpperCase() ?? ''] ?? 0;
    }
}