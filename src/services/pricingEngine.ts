/**
 * Click2Print Pricing Engine
 * Calculates itemized quote based on owner-configured rates.
 */

import { PricingRates, PriceQuote, PaperGrade, PaperFormat, BindingType, ColorMode } from '../types/index.js';

export const DEFAULT_RATES: PricingRates = {
  bwSingle: 2.00,
  bwDuplex: 3.00, // ₹1.50 per side
  colorSingle: 10.00,
  paper: {
    gsm75: 0.00,
    gsm100: 1.00,
    gsm250: 3.00
  },
  paperFormat: {
    A4: 0.00,
    A3: 5.00,
    Legal: 1.00
  },
  binding: {
    none: 0.00,
    staple: 5.00,
    spiral: 30.00
  }
};

export class PricingEngine {
  private rates: PricingRates;

  constructor(rates: PricingRates = DEFAULT_RATES) {
    this.rates = { ...rates };
  }

  public setRates(rates: PricingRates): void {
    this.rates = { ...rates };
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
    binding: BindingType,
    customRates?: PricingRates
  ): PriceQuote {
    const activeRates = customRates || this.rates;

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
      bwCost = bwSheets * activeRates.bwDuplex;
    } else {
      bwCost = effectiveBw * activeRates.bwSingle;
    }

    const colorCost = effectiveColor * activeRates.colorSingle;
    const paperPerSheet = activeRates.paper[paper] || 0;
    const paperCost = sheetsCount * paperPerSheet;
    const formatPerSheet = activeRates.paperFormat[paperFormat] || 0;
    const formatCost = sheetsCount * formatPerSheet;
    const bindingCost = activeRates.binding[binding] || 0;

    const subtotalPerCopy = bwCost + colorCost + paperCost + formatCost + bindingCost;
    const grandTotal = Math.max(1, Math.round(subtotalPerCopy * copies * 100) / 100);

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
