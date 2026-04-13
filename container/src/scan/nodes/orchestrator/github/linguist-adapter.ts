import { Injectable } from '@nestjs/common';

export type LanguageBreakdown = Record<string, number>;

@Injectable()
export class LinguistAdapter {
  async getLanguages(repoPath: string): Promise<LanguageBreakdown> {
    const linguist = await import('linguist-js');
    const { languages } = await linguist.default(repoPath);

    const data = Object.entries(languages.results)
      .map((l) => [l[0], l[1].bytes] as const)
      .reduce((acc, [name, bytes]) => {
        acc[name] = (bytes / languages.bytes) * 100;
        return acc;
      }, {});

    return data;
  }
}
