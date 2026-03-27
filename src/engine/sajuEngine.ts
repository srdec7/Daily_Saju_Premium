import { TOJEONG_DATA } from './tojeongData';

export interface TojeongReport {
  overall: string;
  firstHalf: string;
  secondHalf: string;
  wealth?: string;
  career?: string;
  relationships?: string;
  love?: string;
  family?: string;
  health?: string;
  caution?: string;
  strategy?: string;
  conclusion?: string;
  monthly?: { month: number; monthLabel: string; content: string }[];
}

export class SajuEngine {
  /**
   * Generates a deterministic hash from a given string to seed the selections.
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Picks a paragraph from an array deterministically based on seed and offset
   */
  private pickRandom<T>(arr: T[], seed: number, offset: number): T {
    const safeArr = arr || [];
    if (safeArr.length === 0) return '' as any;
    // Use a prime multiplier to ensure independent shuffling for each category (true combinatorics)
    const hashOffset = Math.abs(seed ^ (offset * 2654435761));
    const index = hashOffset % safeArr.length;
    return safeArr[index];
  }

  /**
   * Generates a Tojeong Bigyeol (Annual Fortune) reading specifically based on the Saju string.
   * Plan determines the scope: 'standard' (only 3 sections) or 'premium' (all 13 sections).
   */
  public generateTojeong(sajuStr: string, lang: 'ko' | 'en', plan: 'standard' | 'premium'): TojeongReport {
    // Generate a secure seed based on the user's Saju
    const seed = this.hashString(sajuStr + "2026"); 
    const data = TOJEONG_DATA[lang];

    // Standard items
    const report: TojeongReport = {
      overall: this.pickRandom(data.overall, seed, 0),
      firstHalf: this.pickRandom(data.firstHalf, seed, 1),
      secondHalf: this.pickRandom(data.secondHalf, seed, 2),
    };

    // Premium items
    if (plan === 'premium') {
      report.wealth = this.pickRandom(data.wealth, seed, 3);
      report.career = this.pickRandom(data.career, seed, 4);
      report.relationships = this.pickRandom(data.relationships, seed, 5);
      report.love = this.pickRandom(data.love, seed, 6);
      report.family = this.pickRandom(data.family, seed, 7);
      report.health = this.pickRandom(data.health, seed, 8);
      report.caution = this.pickRandom(data.caution, seed, 9);
      report.strategy = this.pickRandom(data.strategy, seed, 10);
      report.conclusion = this.pickRandom(data.conclusion, seed, 11);
      
      // We take the complete monthly sequence
      // Randomize the flavor of the monthly data slightly, or keep the order
      // We will keep the default 12 months, but maybe we can pick paragraph sets
      // For now, there's only 1 set of monthly data, so we just pass it as is
      report.monthly = data.monthly;
    }

    return report;
  }
}

export const sajuEngine = new SajuEngine();
