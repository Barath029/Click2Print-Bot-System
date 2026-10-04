/**
 * SmartPrint Business Service: Hardware Cluster Telemetry & Machine Health
 */

import { PrinterDevice } from '../types/index.js';

export class TelemetryService {
  private printers: PrinterDevice[] = [
    {
      id: 'PRN-01',
      name: 'Canon ImageRUNNER 2645',
      model: 'Heavy-Duty Production Duplex',
      type: 'MONO_LASER',
      status: 'READY',
      speedPpm: 65,
      temperatureC: 42,
      toner: { black: 88 },
      trays: {
        tray1Name: 'Tray 1: A4 Standard (75 GSM)',
        tray1Pct: 76,
        tray2Name: 'Tray 2: A4 Executive (100 GSM)',
        tray2Pct: 92
      }
    },
    {
      id: 'PRN-02',
      name: 'Xerox VersaLink C7020',
      model: 'Color Digital Graphic Press',
      type: 'COLOR_PRESS',
      status: 'READY',
      speedPpm: 35,
      temperatureC: 48,
      toner: {
        black: 82,
        cyan: 74,
        magenta: 69,
        yellow: 91
      },
      trays: {
        tray1Name: 'Tray 1: A4 Glossy Card (250 GSM)',
        tray1Pct: 64,
        tray2Name: 'Tray 2: A4 Bond (100 GSM)',
        tray2Pct: 85
      }
    }
  ];

  public getPrinters(): PrinterDevice[] {
    return this.printers;
  }

  public recordJobPrint(bwSheets: number, colorSheets: number): void {
    // Deplete toner slightly
    const mono = this.printers.find(p => p.type === 'MONO_LASER');
    if (mono) {
      mono.toner.black = Math.max(5, mono.toner.black - Math.max(1, Math.floor(bwSheets / 50)));
      mono.trays.tray1Pct = Math.max(4, mono.trays.tray1Pct - Math.max(1, Math.floor(bwSheets / 30)));
    }

    const color = this.printers.find(p => p.type === 'COLOR_PRESS');
    if (color && colorSheets > 0) {
      if (color.toner.cyan) color.toner.cyan = Math.max(5, color.toner.cyan - 1);
      if (color.toner.magenta) color.toner.magenta = Math.max(5, color.toner.magenta - 1);
      if (color.toner.yellow) color.toner.yellow = Math.max(5, color.toner.yellow - 1);
      color.trays.tray1Pct = Math.max(5, color.trays.tray1Pct - 1);
    }
  }
}

export const telemetryService = new TelemetryService();
