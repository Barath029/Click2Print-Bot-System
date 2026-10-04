/**
 * SmartPrint Domain Types: Automated Split-Revenue Escrow & Campus Economics
 */

export interface PricingRates {
  bwSingle: number;      // ₹1.50
  bwDuplex: number;      // ₹2.00 (sheet basis)
  colorSingle: number;   // ₹8.00
  paper: {
    gsm75: number;       // ₹0.00
    gsm100: number;      // ₹0.50
    gsm250: number;      // ₹2.00
  };
  paperFormat: {
    A4: number;          // ₹0.00 (Standard)
    A3: number;          // ₹3.00 (Large ledger / blueprint sheet)
    Legal: number;       // ₹0.50
    Letter: number;      // ₹0.00
  };
  binding: {
    none: number;        // ₹0.00
    staple: number;      // ₹0.00
    spiral: number;      // ₹30.00
    thermal: number;     // ₹60.00
    hardcover: number;   // ₹150.00
  };
  priorityToken: number; // ₹20.00
  platformFeePct: number; // 0.07 (7%)
}

export interface PriceQuote {
  bwCost: number;
  bwCount: number;
  colorCost: number;
  colorCount: number;
  paperCost: number;
  formatCost: number;
  bindingCost: number;
  priorityCost: number;
  grandTotal: number;
  vendorShare: number;
  platformFee: number;
  sheetsCount: number;
  sheetsSaved: number;
  waterSavedMl: number;
}

export interface EscrowTransaction {
  txnId: string;
  orderId: string;
  orderToken: string;
  studentName: string;
  specsSummary: string;
  timestamp: number;
  grossAmount: number;
  platformFee: number;
  vendorPayout: number;
  settlementStatus: 'SETTLED' | 'ESCROW_HELD' | 'DISBURSED';
  hubId: string;
}

export interface CampusHub {
  id: string;
  name: string;
  code: string;
  location: string;
  activeOrders: number;
  printersOnline: number;
  status: 'ONLINE' | 'STANDBY' | 'BUSY';
}
