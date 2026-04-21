import { Injectable, Logger } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { ChatBedrockConverse } from '@langchain/aws';
import { VulnerabilityUnit } from '../security/security-report.type';

type SemgrepResult = {
  path: string;
  check_id: string;
  [key: string]: unknown;
};

type RemediationEntry = {
  id: string;
  remediation: string;
};

@Injectable()
export class RemediationNodeHelper {
  private readonly logger = new Logger(RemediationNodeHelper.name);

  createModel(): ChatBedrockConverse {
    return new ChatBedrockConverse({
      model: process.env.BEDROCK_MODEL_ID ?? 'deepseek.v3.2',
      region: process.env.BEDROCK_AWS_REGION ?? 'eu-north-1',
      temperature: 0,
      maxTokens: 15000,
    });
  }

  groupResultsByFile(results: SemgrepResult[]): Map<string, SemgrepResult[]> {
    const vulnerabilityMap = new Map<string, SemgrepResult[]>();

    for (const result of results) {
      const filePath = result.path;

      if (!vulnerabilityMap.has(filePath)) {
        vulnerabilityMap.set(filePath, []);
      }

      vulnerabilityMap.get(filePath)!.push(result);
    }

    return vulnerabilityMap;
  }

  async readFileContent(filePath: string): Promise<string | null> {
    try {
      return await readFile(filePath, 'utf-8');
    } catch {
      this.logger.warn(`Errore lettura file: ${filePath}`);
      return null;
    }
  }

  async generateRemediations(
      filePath: string,
      results: SemgrepResult[],
      fileContent: string,
      model: ChatBedrockConverse,
  ): Promise<RemediationEntry[]> {
    const response = await model.invoke([
      new SystemMessage(
          `Sei un esperto di sicurezza del software. Analizza le vulnerabilità Semgrep fornite e restituisci un JSON array di oggetti, uno per ogni vulnerabilità:
          [{ "id": "<check_id>", "remediation": "<descrizione>" }]
          Il campo <descrizione> deve essere di tipo STRING e markdown VALIDO e strutturato come segue:\n\n
          - **Esempio:** esempio che può portare alla vulnerabilità rilevata. Dedica massimo 300 caratteri per questo punto.\n\n
          - **Remediation:** le azioni da intraprendere per risolvere la vulnerabilità, se possibile. In caso contrario, come tale vulnerabilità può essere alleviata. Dedica massimo 100 parole per questo punto.\n\n
          - **Conseguenze:** un esempio pratico, di massimo 100 parole, di cosa può succedere in caso di mancata risoluzione della vulnerabilità. Dedica massimo 50 parole per questo punto.

          Tutti e 3 i punti appena citati devono essere il valore associato alla chiave "remediation".

          Rispondi SOLO con il JSON array.
          Assicurati che il markdown all'interno del campo "remediation" sia valido.
          Assicurati che il valore associato al campo "remediation" sia di tipo string.
          Non restituire altro oltre all'array.
          Non commentare il risultato.
          `,
      ),
      new HumanMessage(
          `Vulnerabilità trovate in ${filePath}:\n${JSON.stringify(results, null, 2)}\n\nContenuto del file:\n${fileContent}`,
      ),
    ]);

    const content = (response.content as string)
        .replace(/```json|```/g, '')
        .trim();

    return JSON.parse(content) as RemediationEntry[];
  }

  applyRemediations(
      vulnerabilities: VulnerabilityUnit[],
      remediations: RemediationEntry[],
  ): void {
    for (const fix of remediations) {
      const unit = vulnerabilities.find((u) => u.id === fix.id);
      if (unit) unit.remediation = fix.remediation;
    }
  }
}