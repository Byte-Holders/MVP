import { Injectable } from '@nestjs/common';
import fs from 'fs';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { ChatBedrockConverse } from '@langchain/aws';
import { WorkflowState, VulnerabilityUnit } from '../types';

@Injectable()
export class RemediationNodeService {

    private createModel() {
        return new ChatBedrockConverse({
            model: process.env.BEDROCK_MODEL_ID ?? 'deepseek.v3.2',
            region: process.env.BEDROCK_AWS_REGION ?? 'eu-north-1',
            temperature: 0,
            maxTokens: 15000,
        });
    }

    //Runna la remediation
    async Scan(state: WorkflowState & { semgrepReportPath?: string }): Promise<Partial<WorkflowState>> {
        console.log('[RemediationNode] Generating remediations...');

        const reportPath = (state as any).semgrepReportPath;

        if (!reportPath || !fs.existsSync(reportPath)) {
            console.warn('[RemediationNode] No Semgrep report found, skipping.');
            return {};
        }

        const rawJson = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

        if (!rawJson.results?.length) {
            console.log('[RemediationNode] No vulnerabilities to remediate.');
            return {};
        }

        const model = this.createModel();
        const enrichedUnits: VulnerabilityUnit[] = [...(state.vulnerabilitiesReport?.report ?? [])];

        // Raggruppa i risultati semgrep per file, in poche parole metto in result tutti i file presenti in almeno una vulnerabilita, se un file e' presente in piu di 1 vulnerabilita lo passo cmq 1 sola volta
        const byFile = new Map<string, any[]>();
        for (const result of rawJson.results) {
            const filePath: string = result.path;
            if (!byFile.has(filePath)) byFile.set(filePath, []);
            byFile.get(filePath)!.push(result);
        }

        // Processa ogni file in parallelo
        await Promise.all(
            [...byFile.entries()].map(async ([filePath, results]) => {
                let fileContent: string;
                try {
                    fileContent = fs.readFileSync(filePath, 'utf-8');
                } catch {
                    console.warn(`[RemediationNode] Cannot read file: ${filePath}, skipping.`);
                    return;
                }

                try {
                    const response = await model.invoke([
                        new SystemMessage(
                            `Sei un esperto di sicurezza del software. Analizza le vulnerabilità Semgrep fornite e restituisci un JSON array di oggetti, uno per ogni vulnerabilità:
                        [{ "id": "<check_id>", "remediation": "<spiegazione max 100 parole che prevede un prima e dopo correzione>" }]
                        Rispondi SOLO con il JSON array, senza markdown.`,
                        ),
                        new HumanMessage(
                            `Vulnerabilità trovate in ${filePath}:\n${JSON.stringify(results, null, 2)}\n\nContenuto del file:\n${fileContent}`,
                        ),
                    ]);

                    const content = (response.content as string).replace(/```json|```/g, '').trim();
                    const parsed: { id: string; remediation: string }[] = JSON.parse(content);

                    for (const fix of parsed) {
                        const unit = enrichedUnits.find((u) => u.id === fix.id);
                        if (unit) unit.remediation = fix.remediation;
                    }

                    console.log(`[RemediationNode] Remediated ${parsed.length} vulnerabilities in ${filePath}`);
                } catch (error) {
                    console.error(`[RemediationNode] AI remediation failed for ${filePath}`, error);
                }
            }),
        );

        return {
            vulnerabilitiesReport: { report: enrichedUnits },
        };
    }
}