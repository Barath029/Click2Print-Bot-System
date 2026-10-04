/**
 * Click2Print Pricing Engine
 */

import { PricingRates, PriceQuote, PaperGrade, PaperFormat, BindingType, ColorMode } from '../types/index.js';

export const DEFAULT_RATES: PricingRates = {
  bwSingle: 1.50,
  bwDuplex: 2.00,
  colorSingle: 8.00,
  paper: {
    gsm75: 0.00,
    gsm100: 0.50,
    gsm250: 2.00
  },
  paperFormat: {
    A4: 0.00,
    A3: 3.00,
    Legal: 0.50,
    Letter: 0.00
  },
  binding: {
    none: 0.00,
    staple: 0.00,
    spiral: 30.00,
    thermal: 60.00,
    hardcover: 150.00
  }
};

export class PricingEngine {
  private rates: PricingRates;

  constructor(rates: PricingRates = DEFAULT_RATES) {
    this.rates = rates;
  }

  public calculate(
    totalPages: number,
    colorPages: number,
    bwPages: number,
    colorMode: ColorMode,
    duplex: boolean,
    copies: number,
    paper: PaperGrade,
    paperFormat: PaperFormat = 'A4',
    binding: BindingType
  ): PriceQuote {
    let effectiveBw = bwPages;
    let effectiveColor = colorPages;

    if (colorMode === 'mono') {
      effectiveBw = totalPages;
      effectiveColor = 0;
    } else if (colorMode === 'color') {
      effectiveBw = 0;
      effectiveColor = totalPages;
    }

    const sheetsCount = duplex ? Math.ceil(totalPages / 2) : totalPages;
    const sheetsSaved = duplex ? Math.max(0, totalPages - sheetsCount) : 0;

    let bwCost = 0;
    if (duplex) {
      const bwSheets = Math.ceil(effectiveBw / 2);
      bwCost = bwSheets * this.rates.bwDuplex;
    } else {
      bwCost = effectiveBw * this.rates.bwSingle;
    }

    const colorCost = effectiveColor * this.rates.colorSingle;
    const paperPerSheet = this.rates.paper[paper] || 0;
    const paperCost = sheetsCount * paperPerSheet;
    const formatPerSheet = this.rates.paperFormat[paperFormat] || 0;
    const formatCost = sheetsCount * formatPerSheet;
    const bindingCost = this.rates.binding[binding] || 0;

    const subtotalPerCopy = bwCost + colorCost + paperCost + formatCost + bindingCost;
    const grandTotal = Math.round(subtotalPerCopy * copies * 100) / 100;

    return {
      bwCost: Math.round(bwCost * copies * 100) / 100,
      bwCount: effectiveBw,
      colorCost: Math.round(colorCost * copies * 100) / 100,
      colorCount: effectiveColor,
      paperCost: Math.round(paperCost * copies * 100) / 100,
      formatCost: Math.round(formatCost * copies * 100) / 100,
      bindingCost: Math.round(bindingCost * copies * 100) / 100,
      grandTotal,
      sheetsCount: sheetsCount * copies,
      sheetsSaved: sheetsSaved * copies
    };
  }

  public getRates(): PricingRates {
    return { ...this.rates };
  }
}

export const pricingEngine = new PricingEngine();
