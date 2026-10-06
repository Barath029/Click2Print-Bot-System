/**
 * Click2Print Architecture Types
 * Clean, lightweight, fully aligned with product process:
 * 1. Customer Scans QR Code
 * 2. Uploads Document & Selects Options
 * 3. Shop Owner Approves on Dashboard
 * 4. Auto-Print & Auto-Delete
 */

export type OrderStatus = 'PENDING' | 'APPROVED' | 'PRINTING' | 'READY' | 'COMPLETED' | 'REJECTED';

export type ColorMode = 'mono' | 'color';

export type PaperGrade = 'gsm75' | 'gsm100' | 'gsm250';

export type PaperFormat = 'A4' | 'A3' | 'Legal';

export type BindingType = 'none' | 'staple' | 'spiral';

export type PaymentMethod = 'RAZORPAY_UPI' | 'CASH_COUNTER';

export type PaymentStatus = 'PAID' | 'PAY_AT_COUNTER';

export interface PageColorAnalysis {
  pageNumber: number;
  isColor: boolean;
  colorCoveragePct: number;
  description: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
}

export interface PrintOrder {
  id: string;
  orderNumber: number;
  customer: CustomerInfo;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'image';
  isDocxConverted?: boolean;
  fileSizeKb: number;
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
  customerNotes?: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  createdAt: number;
  completedAt: number | null;
  printProgress?: number;
  routedPrinter: 'BW_PRINTER' | 'COLOUR_PRINTER';
  fileErased: boolean;
  fileErasedAt?: number | null;
}

export interface OrderDraft {
  fileName: string;
  fileType: 'pdf' | 'docx' | 'image';
  isDocxConverted?: boolean;
  fileSizeKb: number;
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
  customerNotes?: string;
  customer: CustomerInfo;
  paymentMethod: PaymentMethod;
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

export interface PrinterDevice {
  id: string;
  name: string;
  model: string;
  type: 'BW' | 'COLOUR';
  status: 'ONLINE' | 'OFFLINE' | 'PRINTING';
  paperTrayCount: number;
  inkLevelPct: number;
  ipAddress: string;
  autoRoute: boolean;
  totalJobsPrinted: number;
}

export interface ShopConfig {
  shopName: string;
  shopCode: string;
  tagline: string;
  upiId: string;
  phone: string;
  address: string;
  razorpayKeyId: string;
  autoPrintOnApprove: boolean;
  autoFileCleanup: boolean;
}

export interface MonthlyUsageStats {
  monthName: string;
  totalPagesPrinted: number;
  bwPagesPrinted: number;
  colorPagesPrinted: number;
  totalOrdersFulfilled: number;
  totalRevenue: number;
  duplexSheetsSaved: number;
}

export interface DeletedFileLog {
  id: string;
  orderNumber: number;
  fileName: string;
  deletedAt: number;
  reason: 'PRINT_COMPLETED' | 'ORDER_REJECTED';
}

export type EventCategory = 'ORDER' | 'PRINT' | 'SYSTEM' | 'SECURITY';

export interface SystemEvent {
  id: string;
  timestamp: number;
  category: EventCategory;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ALERT';
  title: string;
  details: string;
}

export type AdminTab = 'orders' | 'printers' | 'usage' | 'how-it-works';

export interface SystemState {
  activeRole: 'customer' | 'admin';
  adminTab: AdminTab;
  shop: ShopConfig;
  bwPrinter: PrinterDevice;
  colorPrinter: PrinterDevice;
  orders: PrintOrder[];
  pricing: PricingRates;
  usage: MonthlyUsageStats;
  deletedFiles: DeletedFileLog[];
  events: SystemEvent[];
  nextOrderNumber: number;
  activeCustomerOrderId?: string;
}
