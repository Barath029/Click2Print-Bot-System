/**
 * SmartPrint Business Service: Pricing, Escrow Split, and GreenPrint ESG Engine
 */
export const DEFAULT_RATES = {
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
    },
    priorityToken: 20.00,
    platformFeePct: 0.07 // 7% Developer/Platform Escrow
};
export class PricingEngine {
    rates;
    constructor(rates = DEFAULT_RATES) {
        this.rates = rates;
    }
    calculate(totalPages, colorPages, bwPages, colorMode, duplex, paper, paperFormat = 'A4', binding, priority) {
        let effectiveBw = bwPages;
        let effectiveColor = colorPages;
        if (colorMode === 'mono') {
            effectiveBw = totalPages;
            effectiveColor = 0;
        }
        else if (colorMode === 'color') {
            effectiveBw = 0;
            effectiveColor = totalPages;
        }
        // Physical sheets calculation
        const sheetsCount = duplex ? Math.ceil(totalPages / 2) : totalPages;
        const sheetsSaved = duplex ? Math.max(0, totalPages - sheetsCount) : 0;
        const waterSavedMl = sheetsSaved * 10; // Approx 10ml water consumed per sheet of paper in pulp production
        // Base printing charges
        let bwCost = 0;
        if (duplex) {
            // Duplex sheet basis
            const bwSheets = Math.ceil(effectiveBw / 2);
            bwCost = bwSheets * this.rates.bwDuplex;
        }
        else {
            bwCost = effectiveBw * this.rates.bwSingle;
        }
        const colorCost = effectiveColor * this.rates.colorSingle;
        // Paper grade surcharge
        const paperPerSheet = this.rates.paper[paper] || 0;
        const paperCost = sheetsCount * paperPerSheet;
        // Paper format surcharge (A4 is standard 0, A3 has surcharge, Legal has surcharge)
        const formatPerSheet = this.rates.paperFormat[paperFormat] || 0;
        const formatCost = sheetsCount * formatPerSheet;
        // Binding surcharge
        const bindingCost = this.rates.binding[binding] || 0;
        // Priority token
        const priorityCost = priority ? this.rates.priorityToken : 0;
        // Subtotal and Grand Total
        const subtotal = bwCost + colorCost + paperCost + formatCost + bindingCost + priorityCost;
        const grandTotal = Math.round(subtotal * 100) / 100;
        // 7% Platform Escrow, 93% Vendor Net
        const platformFee = Math.round(grandTotal * this.rates.platformFeePct * 100) / 100;
        const vendorShare = Math.round((grandTotal - platformFee) * 100) / 100;
        return {
            bwCost,
            bwCount: effectiveBw,
            colorCost,
            colorCount: effectiveColor,
            paperCost,
            formatCost,
            bindingCost,
            priorityCost,
            grandTotal,
            vendorShare,
            platformFee,
            sheetsCount,
            sheetsSaved,
            waterSavedMl
        };
    }
    getRates() {
        return { ...this.rates };
    }
}
export const pricingEngine = new PricingEngine();
