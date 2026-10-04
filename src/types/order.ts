/**
 * Click2Print Domain Types: Order & Print Specifications
 */

export type OrderStatus = 'PENDING' | 'APPROVED' | 'PRINTING' | 'READY' | 'COMPLETED';

export type ColorMode = 'smart' | 'mono' | 'color';

export type PaperGrade = 'gsm75' | 'gsm100' | 'gsm250';

export type PaperFormat = 'A4' | 'A3' | 'Legal' | 'Letter';

export type BindingType = 'none' | 'staple' | 'spiral' | 'thermal' | 'hardcover';

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
}

export interface PageColorAnalysis {
  pageNumber: number;
  isColor: boolean;
  colorCoveragePct: number;
  description: string;
}

export interface PrintOrder {
  id: string;
  orderNumber: number;
  customer: CustomerInfo;
  fileName: string;
  fileSizeKb?: number;
  pageCount: number;
  rangeMode: 'all' | 'custom';
  fromPage?: number;
  toPage?: number;
  pageRange: string;
  bwPages: number;
  colorPages: number;
  colorMode: ColorMode;
  duplex: boolean;
  copies: number;
  paper: PaperGrade;
  paperFormat: PaperFormat;
  binding: BindingType;
  bindingNotes?: string;
  customerNotes?: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: number;
  completedAt: number | null;
  printProgress?: number;
}

export interface OrderDraft {
  fileName: string;
  pageCount: number;
  rangeMode: 'all' | 'custom';
  fromPage: number;
  toPage: number;
  pageRange: string;
  bwPages: number;
  colorPages: number;
  colorMode: ColorMode;
  duplex: boolean;
  copies: number;
  paper: PaperGrade;
  paperFormat: PaperFormat;
  binding: BindingType;
  bindingNotes?: string;
  customerNotes?: string;
  customer: CustomerInfo;
}

export interface PricingRates {
  bwSingle: number;
  bwDuplex: number;
  colorSingle: number;
  paper: Record<PaperGrade, number>;
  paperFormat: Record<PaperFormat, number>;
  binding: Record<BindingType, number>;
}

export interface PriceQuote {
  bwCost: number;
  bwCount: number;
  colorCost: number;
  colorCount: number;
  paperCost: number;
  formatCost: number;
  bindingCost: number;
  grandTotal: number;
  sheetsCount: number;
  sheetsSaved: number;
}

export type EventCategory = 'ORDER' | 'PRINT' | 'SYSTEM';

export interface SystemEvent {
  id: string;
  timestamp: number;
  category: EventCategory;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ALERT';
  title: string;
  details: string;
}

export interface SystemState {
  orders: PrintOrder[];
  pricing: PricingRates;
  events: SystemEvent[];
  activeRole: 'customer' | 'owner';
  nextOrderNumber: number;
}
