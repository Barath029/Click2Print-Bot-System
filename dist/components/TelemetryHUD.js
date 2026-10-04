/**
 * SmartPrint UI Component: Global Real-Time Telemetry & Context HUD
 * Keeps the entire operational context visible regardless of current view.
 */
import { store } from '../core/store.js';
import { rackAllocator } from '../services/rackAllocator.js';
import { eventBus } from '../core/events.js';
export class TelemetryHUDComponent {
    container;
    latestEvent = null;
    constructor(container) {
        this.container = container;
        this.render(store.getState());
        store.subscribe((state) => this.update(state));
        eventBus.subscribe((ev) => this.onNewEvent(ev));
    }
    render(state) {
        const stats = rackAllocator.getOccupancyStats(state.rackSlots);
        const activeQueue = state.orders.filter(o => o.status === 'QUEUED' || o.status === 'PRINTING');
        const grossTotal = state.orders.reduce((acc, o) => acc + o.totalAmount, 0);
        const platformFee = Math.round(grossTotal * 0.07 * 100) / 100;
        const vendorPayout = Math.round((grossTotal - platformFee) * 100) / 100;
        const monoPrinter = state.printers.find(p => p.type === 'MONO_LASER');
        const colorPrinter = state.printers.find(p => p.type === 'COLOR_PRESS');
        this.container.innerHTML = `
      <div class="telemetry-hud-strip">
        <div class="hud-item queue-metric">
          <div class="hud-icon">📋</div>
          <div class="hud-meta">
            <span class="hud-label">FIFO Queue</span>
            <span class="hud-value" id="hudQueueVal">
              <strong>${activeQueue.length}</strong> Jobs <span class="hud-sub">(ETA: ~${activeQueue.length * 2.5}m)</span>
            </span>
          </div>
        </div>

        <div class="hud-item rack-metric">
          <div class="hud-icon">📦</div>
          <div class="hud-meta">
            <span class="hud-label">50-Slot Shelving</span>
            <span class="hud-value" id="hudRackVal">
              <strong>${stats.occupied}</strong> / 50 Staged <span class="hud-sub">(${stats.occupancyPct}%)</span>
            </span>
          </div>
          <div class="hud-mini-bar">
            <div class="mini-bar-fill" id="hudRackBar" style="width: ${stats.occupancyPct}%;"></div>
          </div>
        </div>

        <div class="hud-item hardware-metric">
          <div class="hud-icon">🖨️</div>
          <div class="hud-meta">
            <span class="hud-label">Cluster Telemetry</span>
            <span class="hud-value" id="hudPrintersVal">
              <span class="printer-chip ${monoPrinter?.status === 'PRINTING' ? 'active' : ''}">Mono: ${monoPrinter?.toner.black ?? 85}% K</span>
              <span class="printer-chip ${colorPrinter?.status === 'PRINTING' ? 'active' : ''}">Color: ${colorPrinter?.toner.cyan ?? 70}% CMY</span>
            </span>
          </div>
        </div>

        <div class="hud-item escrow-metric">
          <div class="hud-icon">⚖️</div>
          <div class="hud-meta">
            <span class="hud-label">Escrow Split (7% / 93%)</span>
            <span class="hud-value" id="hudEscrowVal">
              Gross: <strong class="color-cyan">₹${grossTotal.toFixed(2)}</strong>
              <span class="escrow-breakdown">
                [Escrow: <span class="color-indigo">₹${platformFee.toFixed(2)}</span> | Vendor: <span class="color-emerald">₹${vendorPayout.toFixed(2)}</span>]
              </span>
            </span>
          </div>
        </div>

        <div class="hud-item live-ticker-metric">
          <div class="ticker-pulse"></div>
          <div class="ticker-content" id="hudTickerContent">
            <span class="ticker-tag" id="hudTickerTag">SYS</span>
            <span class="ticker-text" id="hudTickerText">SmartPrint Core Logistics Engine Active</span>
          </div>
        </div>
      </div>
    `;
    }
    onNewEvent(ev) {
        this.latestEvent = ev;
        const tag = this.container.querySelector('#hudTickerTag');
        const text = this.container.querySelector('#hudTickerText');
        if (tag && text) {
            tag.textContent = ev.category;
            tag.className = `ticker-tag category-${ev.category.toLowerCase()}`;
            text.textContent = `${ev.title}: ${ev.details}`;
        }
    }
    update(state) {
        const stats = rackAllocator.getOccupancyStats(state.rackSlots);
        const activeQueue = state.orders.filter(o => o.status === 'QUEUED' || o.status === 'PRINTING');
        const grossTotal = state.orders.reduce((acc, o) => acc + o.totalAmount, 0);
        const platformFee = Math.round(grossTotal * 0.07 * 100) / 100;
        const vendorPayout = Math.round((grossTotal - platformFee) * 100) / 100;
        const queueVal = this.container.querySelector('#hudQueueVal');
        if (queueVal) {
            queueVal.innerHTML = `<strong>${activeQueue.length}</strong> Jobs <span class="hud-sub">(ETA: ~${Math.max(1, Math.round(activeQueue.length * 2.5))}m)</span>`;
        }
        const rackVal = this.container.querySelector('#hudRackVal');
        const rackBar = this.container.querySelector('#hudRackBar');
        if (rackVal && rackBar) {
            rackVal.innerHTML = `<strong>${stats.occupied}</strong> / 50 Staged <span class="hud-sub">(${stats.occupancyPct}%)</span>`;
            rackBar.style.width = `${stats.occupancyPct}%`;
        }
        const escrowVal = this.container.querySelector('#hudEscrowVal');
        if (escrowVal) {
            escrowVal.innerHTML = `Gross: <strong class="color-cyan">₹${grossTotal.toFixed(2)}</strong> <span class="escrow-breakdown">[Escrow: <span class="color-indigo">₹${platformFee.toFixed(2)}</span> | Vendor: <span class="color-emerald">₹${vendorPayout.toFixed(2)}</span>]</span>`;
        }
    }
}
