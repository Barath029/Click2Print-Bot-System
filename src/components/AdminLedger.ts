/**
 * SmartPrint UI Component: SuperAdmin Multi-Shop Monitoring & Automated Escrow Split Ledger
 */

import { store } from '../core/store.js';
import { sound } from '../core/audio.js';
import { SystemState } from '../types/index.js';

export class AdminLedgerComponent {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render(store.getState());
    store.subscribe((state) => this.update(state));
  }

  private render(state: SystemState): void {
    const grossTotal = state.orders.reduce((acc, o) => acc + o.totalAmount, 0);
    const platformFee = Math.round(grossTotal * 0.07 * 100) / 100;
    const vendorPayout = Math.round((grossTotal - platformFee) * 100) / 100;

    this.container.innerHTML = `
      <!-- SuperAdmin Executive Metrics -->
      <div class="admin-kpi-grid">
        <div class="cyber-kpi-card">
          <span class="kpi-label">Gross Platform Volume (GMV)</span>
          <div class="kpi-val color-cyan" id="adminGrossGMV">₹${grossTotal.toFixed(2)}</div>
          <span class="kpi-sub">Campus unified transactions</span>
        </div>

        <div class="cyber-kpi-card">
          <span class="kpi-label">Platform Take-Rate (7%)</span>
          <div class="kpi-val color-indigo" id="adminEscrowShare">₹${platformFee.toFixed(2)}</div>
          <span class="kpi-sub">Developer Escrow (T+0 instant hold)</span>
        </div>

        <div class="cyber-kpi-card">
          <span class="kpi-label">Net Vendor Payout (93%)</span>
          <div class="kpi-val color-emerald" id="adminVendorPayout">₹${vendorPayout.toFixed(2)}</div>
          <span class="kpi-sub">T+1 automated bank clearing</span>
        </div>

        <div class="cyber-kpi-card">
          <span class="kpi-label">Campus Outlets Deployed</span>
          <div class="kpi-val color-text">3 Hubs Online</div>
          <span class="kpi-sub">Cashfree / Razorpay Route active</span>
        </div>
      </div>

      <!-- Multi-Tenant Hub Selector Strip -->
      <div class="campus-hubs-strip">
        ${state.hubs.map(hub => `
          <div class="hub-tenant-card ${hub.id === state.activeHubId ? 'active' : ''}" data-hub="${hub.id}">
            <div class="hub-header">
              <span class="hub-code-badge">${hub.code}</span>
              <span class="hub-online-dot"></span>
            </div>
            <div class="hub-name">${hub.name}</div>
            <div class="hub-location">${hub.location}</div>
            <div class="hub-stats-row">
              <span>Printers: ${hub.printersOnline} Online</span>
              <span>Active Orders: ${hub.activeOrders}</span>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Financial Clearing Ledger Table -->
      <div class="cyber-glass-panel">
        <div class="panel-header-split">
          <div>
            <h3 class="panel-title">
              <span>🏛️</span> Automated Split-Settlement & Commission Clearing Ledger
            </h3>
            <p class="panel-sub">Real-time webhook events, 7% escrow take-rate audit trails, and daily disbursement schedules.</p>
          </div>
          <div class="ledger-actions-row">
            <button class="cyber-btn-secondary" id="btnExportLedgerCsv">
              <span>📥 Export CSV</span>
            </button>
            <button class="cyber-btn-primary" id="btnAdminRushSpike">
              <span>⚡ Simulate Concurrency Spike (3 Orders)</span>
            </button>
          </div>
        </div>

        <div class="ledger-table-responsive">
          <table class="cyber-table">
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Order Token</th>
                <th>Student</th>
                <th>Document & Specs</th>
                <th>Gross (₹)</th>
                <th>Platform (7%)</th>
                <th>Vendor (93%)</th>
                <th>Settlement</th>
              </tr>
            </thead>
            <tbody id="ledgerTableBody">
              <!-- Rendered by updateTable -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.updateTable(state);
    this.bindEvents();
  }

  private updateTable(state: SystemState): void {
    const tbody = this.container.querySelector('#ledgerTableBody');
    if (!tbody) return;

    tbody.innerHTML = state.orders.slice().reverse().map((order, idx) => {
      const txnId = `TXN-88${100 + idx}B`;
      const platformFee = Math.round(order.totalAmount * 0.07 * 100) / 100;
      const vendorShare = Math.round((order.totalAmount - platformFee) * 100) / 100;

      return `
        <tr>
          <td class="font-mono color-muted">${txnId}</td>
          <td class="font-mono font-bold color-cyan">${order.token}</td>
          <td>
            <div class="table-student-name">${order.student.name}</div>
            <div class="table-student-roll">${order.student.rollNo}</div>
          </td>
          <td>
            <div class="table-doc-title">${order.fileName}</div>
            <div class="table-doc-meta">${order.pageCount} pgs • ${order.binding.toUpperCase()} • ${order.paper.toUpperCase()}</div>
          </td>
          <td class="font-bold">₹${order.totalAmount.toFixed(2)}</td>
          <td class="color-indigo font-bold">₹${platformFee.toFixed(2)}</td>
          <td class="color-emerald font-bold">₹${vendorShare.toFixed(2)}</td>
          <td>
            <span class="status-pill status-${order.status === 'COLLECTED' ? 'paid' : 'queued'}">
              ${order.status === 'COLLECTED' ? 'SETTLED' : 'ESCROW HELD'}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }

  private bindEvents(): void {
    // Hub switching
    this.container.querySelectorAll('.hub-tenant-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const hubId = (e.currentTarget as HTMLElement).dataset.hub;
        if (hubId) {
          store.setActiveHub(hubId);
          sound.click();
        }
      });
    });

    // Spike
    const btnSpike = this.container.querySelector('#btnAdminRushSpike');
    if (btnSpike) {
      btnSpike.addEventListener('click', () => {
        store.simulateRushOrders(3);
        const toast = document.getElementById('toastContainer');
        if (toast) {
          const div = document.createElement('div');
          div.className = 'toast toast-warn';
          div.innerHTML = `<strong>⚡ Concurrency Spike Injected!</strong> 3 simultaneous rush jobs placed into the FIFO queue.`;
          toast.appendChild(div);
          setTimeout(() => div.remove(), 4000);
        }
      });
    }

    // CSV export
    const btnCsv = this.container.querySelector('#btnExportLedgerCsv');
    if (btnCsv) {
      btnCsv.addEventListener('click', () => {
        alert('Exporting SmartPrint Financial Ledger to CSV: T+1 Automated Clearing Records generated.');
      });
    }
  }

  public update(state: SystemState): void {
    const grossTotal = state.orders.reduce((acc, o) => acc + o.totalAmount, 0);
    const platformFee = Math.round(grossTotal * 0.07 * 100) / 100;
    const vendorPayout = Math.round((grossTotal - platformFee) * 100) / 100;

    const gEl = this.container.querySelector('#adminGrossGMV');
    const pEl = this.container.querySelector('#adminEscrowShare');
    const vEl = this.container.querySelector('#adminVendorPayout');

    if (gEl) gEl.textContent = `₹${grossTotal.toFixed(2)}`;
    if (pEl) pEl.textContent = `₹${platformFee.toFixed(2)}`;
    if (vEl) vEl.textContent = `₹${vendorPayout.toFixed(2)}`;

    this.updateTable(state);
  }
}
