import { Injectable, Logger } from '@nestjs/common';
import fs from 'fs';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { ChatBedrockConverse } from '@langchain/aws';
import { WorkflowState, VulnerabilityUnit } from '../types';

@Injectable()
export class RemediationNodeService {
    private readonly logger = new Logger(RemediationNodeService.name);

    private createModel() {
        return new ChatBedrockConverse({
            model: process.env.BEDROCK_MODEL_ID ?? 'deepseek.v3.2',
            region: process.env.BEDROCK_AWS_REGION ?? 'eu-north-1',
            temperature: 0,
            maxTokens: 5000,
        });
    }

    //Runna la remediation
    async Scan(state: WorkflowState & { semgrepReportPath?: string }): Promise<Partial<WorkflowState>> {
        console.log('[RemediationNode] Generating remediations...');

        const reportPath = (state as any).semgrepReportPath;
        //Controlla se c'e un report semgrep di cui fare la remediation
        if (!reportPath || !fs.existsSync(reportPath)) {
            console.warn('[RemediationNode] No Semgrep report found, skipping.');
            return {};
        }

        const rawJson = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
        //Controlla se ci sono vulnerabilita di cui fare la remediation
        if (!rawJson.results?.length) {
            console.log('[RemediationNode] No vulnerabilities to remediate.');
            return {};
        }

        const model = this.createModel();
        const enrichedUnits: VulnerabilityUnit[] = [...(state.vulnerabilitiesReport?.report ?? [])];

        // Al momento processa solo il primo risultato, come nel PoC
        const firstResult = rawJson.results[0];
        const filePath: string = firstResult.path;

        try {
            const fileContent = fs.readFileSync(filePath, 'utf-8');

            const response = await model.invoke([
                new SystemMessage(
                    `Sei un esperto di sicurezza del software. Analizza la vulnerabilità Semgrep fornita e restituisci un JSON array con un singolo oggetto:
          { "id": "<check_id>", "remediation": "<spiegazione max 25 parole>" }
          Rispondi SOLO con il JSON, senza markdown.`,
                ),
                new HumanMessage(
                    `Vulnerabilità: ${JSON.stringify(firstResult)}\n\nFile: ${fileContent}`,
                ),
            ]);

            const content = (response.content as string).replace(/```json|```/g, '').trim();
            const parsed: { id: string; remediation: string }[] = JSON.parse(content);

            for (const fix of parsed) {
                const unit = enrichedUnits.find((u) => u.id === fix.id);
                if (unit) unit.remediation = fix.remediation;
            }
        } catch (error) {
            console.error('[RemediationNode] AI remediation failed.', error);
        }

        return {
            vulnerabilitiesReport: { report: enrichedUnits },
        };
    }
}