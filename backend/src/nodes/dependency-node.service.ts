import { Injectable, Logger } from '@nestjs/common';
import { execSync } from 'child_process';
import { WorkflowState, DepsReport, DepsReportUnit } from '../types';

@Injectable()
export class DepsNodeService {
    private readonly logger = new Logger(DepsNodeService.name);

    //Runna syft
    async Scan(state: WorkflowState): Promise<Partial<WorkflowState>> {
        console.log(`[DepsNode] Analyzing dependencies in: ${state.repoPath}`);

        try {
            const raw = execSync(`syft dir:${state.repoPath} -o json -q`).toString().trim();
            const syftJson = JSON.parse(raw);

            const units: DepsReportUnit[] = (syftJson.artifacts ?? [])
                .slice(0, 300) // Al momento come nel PoC prende solo i primi 300 artefatti, ma questo limite si puo gia togliere volendo
                .map((a: any) => ({
                    name: a.name,
                    version: a.version,
                }));

            const depsReport: DepsReport = { report: units };

            console.log(`[DepsNode] Found ${units.length} dependencies.`);
            return { depsReport };
        } catch (error) {
            console.error('[DepsNode] Syft analysis failed.', error);
            return { depsReport: { report: [] } };
        }
    }
}