/**
 * SmartPrint Domain Types: Physical 50-Slot Dispatch Rack System
 */

export type RackSlotStatus = 'EMPTY' | 'OCCUPIED' | 'OVERDUE' | 'RESERVED';

export type RackRow = 'A' | 'B' | 'C' | 'D' | 'E';

export interface RackSlot {
  code: string;        // e.g. "B-04"
  row: RackRow;        // "A" through "E"
  col: number;         // 1 through 10
  status: RackSlotStatus;
  orderId: string | null;
  stagedTime: number | null;
  shelfLevelName?: string; // e.g. "Eye-Level", "Upper Tray", "Lower Heavy"
}

export interface RackOccupancyStats {
  total: number;
  empty: number;
  occupied: number;
  overdue: number;
  occupancyPct: number;
}
