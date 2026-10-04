/**
 * SmartPrint Domain Types: Hardware Cluster Telemetry & Real-Time Event Stream
 */

export interface PrinterDevice {
  id: string;
  name: string;
  model: string;
  type: 'MONO_LASER' | 'COLOR_PRESS' | 'PLOTTER';
  status: 'READY' | 'PRINTING' | 'MAINTENANCE' | 'IDLE';
  speedPpm: number;
  temperatureC: number;
  toner: {
    black: number;   // 0-100%
    cyan?: number;
    magenta?: number;
    yellow?: number;
  };
  trays: {
    tray1Name: string;
    tray1Pct: number;
    tray2Name: string;
    tray2Pct: number;
  };
}

export type EventCategory = 
  | 'QUEUE' 
  | 'PRINT' 
  | 'RACK' 
  | 'KIOSK' 
  | 'ESCROW' 
  | 'HARDWARE' 
  | 'COLOR_SCAN';

export interface SystemEvent {
  id: string;
  timestamp: number;
  category: EventCategory;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ALERT';
  title: string;
  details: string;
}

export interface SystemState {
  orders: import('./order').PrintOrder[];
  rackSlots: Record<string, import('./rack').RackSlot>;
  pricing: import('./finance').PricingRates;
  hubs: import('./finance').CampusHub[];
  activeHubId: string;
  printers: PrinterDevice[];
  events: SystemEvent[];
  activeRole: 'student' | 'vendor' | 'rack' | 'kiosk' | 'admin' | 'architecture';
  activeStudentOrderId: string | null;
  audioMuted: boolean;
}
