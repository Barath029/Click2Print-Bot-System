/**
 * SmartPrint Application Orchestrator & Lifecycle Bootstrap
 * Pure TypeScript & Clean Architecture
 */

import { store } from './core/store.js';
import { HeaderComponent } from './components/Header.js';
import { TelemetryHUDComponent } from './components/TelemetryHUD.js';
import { StudentStudioComponent } from './components/StudentStudio.js';
import { VendorConsoleComponent } from './components/VendorConsole.js';
import { RackMatrixComponent } from './components/RackMatrix.js';
import { KioskTerminalComponent } from './components/KioskTerminal.js';
import { AdminLedgerComponent } from './components/AdminLedger.js';
import { ArchitectureExplorerComponent } from './components/ArchitectureExplorer.js';
import { ModalsComponent } from './components/Modals.js';
import { SystemState } from './types/index.js';

class SmartPrintApp {
  private headerEl: HTMLElement;
  private hudEl: HTMLElement;
  private studentViewEl: HTMLElement;
  private vendorViewEl: HTMLElement;
  private rackViewEl: HTMLElement;
  private kioskViewEl: HTMLElement;
  private adminViewEl: HTMLElement;
  private archViewEl: HTMLElement;

  private studentStudio!: StudentStudioComponent;

  constructor() {
    this.headerEl = document.getElementById('appHeader')!;
    this.hudEl = document.getElementById('appTelemetryHUD')!;
    this.studentViewEl = document.getElementById('studentSection')!;
    this.vendorViewEl = document.getElementById('vendorSection')!;
    this.rackViewEl = document.getElementById('rackSection')!;
    this.kioskViewEl = document.getElementById('kioskSection')!;
    this.adminViewEl = document.getElementById('adminSection')!;
    this.archViewEl = document.getElementById('architectureSection')!;

    this.init();
  }

  private init(): void {
    console.log('🚀 Initializing SmartPrint Platform Architecture (TypeScript + Node.js)...');

    // Mount Header & Telemetry HUD
    new HeaderComponent(this.headerEl);
    new TelemetryHUDComponent(this.hudEl);

    // Mount Views
    this.studentStudio = new StudentStudioComponent(this.studentViewEl);
    new VendorConsoleComponent(this.vendorViewEl);
    new RackMatrixComponent(this.rackViewEl);
    new KioskTerminalComponent(this.kioskViewEl);
    new AdminLedgerComponent(this.adminViewEl);
    new ArchitectureExplorerComponent(this.archViewEl);

    // Mount Modals
    new ModalsComponent(this.studentStudio);

    // Synchronize view switching
    store.subscribe((state) => this.onStateChange(state));
    this.onStateChange(store.getState());

    console.log('✅ SmartPrint Platform Architecture Mounted Successfully.');
  }

  private onStateChange(state: SystemState): void {
    const role = state.activeRole;

    // Toggle view sections
    this.studentViewEl.classList.toggle('active', role === 'student');
    this.vendorViewEl.classList.toggle('active', role === 'vendor');
    this.rackViewEl.classList.toggle('active', role === 'rack');
    this.kioskViewEl.classList.toggle('active', role === 'kiosk');
    this.adminViewEl.classList.toggle('active', role === 'admin');
    this.archViewEl.classList.toggle('active', role === 'architecture');

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new SmartPrintApp();
});
