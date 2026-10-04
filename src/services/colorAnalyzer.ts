/**
 * Click2Print Color Analyzer — Page-by-page color detection simulation
 */

import { PageColorAnalysis } from '../types/index.js';

export class ColorAnalyzer {
  public analyzeDocument(fileName: string, pageCount: number): {
    colorPagesCount: number;
    bwPagesCount: number;
    colorPagesList: number[];
    pageBreakdown: PageColorAnalysis[];
    savingsAmount: number;
  } {
    const pageBreakdown: PageColorAnalysis[] = [];
    const colorPagesList: number[] = [];

    const lowerName = fileName.toLowerCase();

    for (let p = 1; p <= pageCount; p++) {
      let isColor = false;
      let coverage = 0;
      let desc = 'Text only (Monochrome)';

      if (lowerName.includes('thesis') || lowerName.includes('final')) {
        if (p === 1 || p === 7 || p === 14 || p === 21 || p === 35 || p === 48 || p === 55) {
          isColor = true;
          coverage = p === 1 ? 45 : 22;
          desc = p === 1 ? 'Cover Page' : 'Chart / Graph';
        }
      } else if (lowerName.includes('lab') || lowerName.includes('manual')) {
        if (p === 1 || p === 4 || p === 9) {
          isColor = true;
          coverage = 35;
          desc = 'Diagram / Illustration';
        }
      } else if (lowerName.includes('project') || lowerName.includes('report')) {
        if (p === 1 || p === 7 || p === 14 || p === 21) {
          isColor = true;
          coverage = 28;
          desc = p === 1 ? 'Title Page' : 'Diagram';
        }
      } else {
        if (p === 1 || (p % 6 === 0 && p < pageCount)) {
          isColor = true;
          coverage = 18;
          desc = 'Graphics / Infographic';
        }
      }

      if (isColor) {
        colorPagesList.push(p);
      }

      pageBreakdown.push({
        pageNumber: p,
        isColor,
        colorCoveragePct: coverage,
        description: desc
      });
    }

    const colorPagesCount = colorPagesList.length;
    const bwPagesCount = pageCount - colorPagesCount;

    const fullColorCost = pageCount * 8.00;
    const smartCost = (colorPagesCount * 8.00) + (bwPagesCount * 1.50);
    const savingsAmount = Math.max(0, Math.round((fullColorCost - smartCost) * 100) / 100);

    return {
      colorPagesCount,
      bwPagesCount,
      colorPagesList,
      pageBreakdown,
      savingsAmount
    };
  }
}

export const colorAnalyzer = new ColorAnalyzer();
