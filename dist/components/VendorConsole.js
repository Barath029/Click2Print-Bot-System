/**
 * SmartPrint UI Component: Vendor Operations & FIFO Print Dispatch Console
 */
import { store } from '../core/store.js';
import { rackAllocator } from '../services/rackAllocator.js';
import { sound } from '../core/audio.js';
export class VendorConsoleComponent {
    container;
    constructor(container) {
        this.container = container;
        this.render(store.getState());
        store.subscribe((state) => this.update(state));
    }
    render(state) {
        const stats = rackAllocator.getOccupancyStats(state.rackSlots);
        const grossTotal = state.orders.reduce((acc, o) => acc + o.totalAmount, 0);
        const platformFee = Math.round(grossTotal * 0.07 * 100) / 100;
        const vendorPayout = Math.round((grossTotal - platformFee) * 100) / 100;
        const activeQueue = state.orders.filter(o => o.status === 'QUEUED' || o.status === 'PRINTING');
        this.container.innerHTML = `
      <!-- Operator KPI Strip -->
      <div class="vendor-kpi-grid">
        <div class="cyber-kpi-card">
          <span class="kpi-label">Active FIFO Queue</span>
          <div class="kpi-val color-cyan" id="kpiActiveQueue">${activeQueue.length} Jobs</div>
          <span class="kpi-sub">Priority-ordered queue</span>
        </div>

        <div class="cyber-kpi-card">
          <span class="kpi-label">50-Slot Rack Occupancy</span>
          <div class="kpi-val color-emerald" id="kpiOccupancy">${stats.occupied} / 50 Slots</div>
          <span class="kpi-sub">${stats.empty} slots available for staging</span>
        </div>

        <div class="cyber-kpi-card">
          <span class="kpi-label">Today's Gross GMV</span>
          <div class="kpi-val color-text" id="kpiGrossTotal">₹${grossTotal.toFixed(2)}</div>
          <span class="kpi-sub">Campus unified volume</span>
        </div>

        <div class="cyber-kpi-card">
          <span class="kpi-label">Platform Take-Rate (7%)</span>
          <div class="kpi-val color-indigo" id="kpiPlatformEscrow">₹${platformFee.toFixed(2)}</div>
          <span class="kpi-sub">Developer escrow clearing</span>
        </div>

        <div class="cyber-kpi-card">
          <span class="kpi-label">Net Vendor Payout (93%)</span>
          <div class="kpi-val color-emerald" id="kpiVendorPayout">₹${vendorPayout.toFixed(2)}</div>
          <span class="kpi-sub">Automated T+1 daily settlement</span>
        </div>
      </div>

      <!-- Main Operational Dual-Panel Layout -->
      <div class="vendor-layout-grid">
        <!-- Left: FIFO Queue Kanban -->
        <div class="cyber-glass-panel fifo-panel">
          <div class="panel-header-split">
            <div>
              <h3 class="panel-title">
                <span>📋</span> Chronological FIFO Print Queue
              </h3>
              <p class="panel-sub">Jobs auto-sorted by millisecond priority timestamp.</p>
            </div>
            <div class="queue-sort-badge">FIFO PRIORITY ENGINE</div>
          </div>

          <div class="fifo-cards-container" id="fifoCardsContainer">
            <!-- Dynamic order cards rendered by updateQueue -->
          </div>
        </div>

        <!-- Right: Hardware Cluster Telemetry & Quick Staging Monitor -->
        <div class="vendor-right-column">
          <!-- Printer Cluster Telemetry Card -->
          <div class="cyber-glass-panel">
            <h3 class="panel-title" style="margin-bottom: 0.8rem;">
              <span>🖨️</span> Production Printer Cluster Health
            </h3>

            <div class="printers-telemetry-list">
              ${state.printers.map(printer => `
                <div class="printer-device-card">
                  <div class="device-header">
                    <div>
                      <div class="device-name">${printer.name}</div>
                      <div class="device-model">${printer.model} • ${printer.speedPpm} PPM</div>
                    </div>
                    <span class="device-status-badge ${printer.status.toLowerCase()}">${printer.status}</span>
                  </div>

                  <!-- Toners -->
                  <div class="device-gauges-row">
                    <div class="gauge-item">
                      <span class="gauge-label">K Toner</span>
                      <div class="gauge-bar"><div class="gauge-fill k-fill" style="width: ${printer.toner.black}%;"></div></div>
                      <span class="gauge-pct">${printer.toner.black}%</span>
                    </div>
                    ${printer.toner.cyan !== undefined ? `
                      <div class="gauge-item">
                        <span class="gauge-label">Cyan</span>
                        <div class="gauge-bar"><div class="gauge-fill c-fill" style="width: ${printer.toner.cyan}%;"></div></div>
                        <span class="gauge-pct">${printer.toner.cyan}%</span>
                      </div>
                      <div class="gauge-item">
                        <span class="gauge-label">Magenta</span>
                        <div class="gauge-bar"><div class="gauge-fill m-fill" style="width: ${printer.toner.magenta}%;"></div></div>
                        <span class="gauge-pct">${printer.toner.magenta}%</span>
                      </div>
                      <div class="gauge-item">
                        <span class="gauge-label">Yellow</span>
                        <div class="gauge-bar"><div class="gauge-fill y-fill" style="width: ${printer.toner.yellow}%;"></div></div>
                        <span class="gauge-pct">${printer.toner.yellow}%</span>
                      </div>
                    ` : ''}
                  </div>

                  <!-- Trays -->
                  <div class="device-trays-info">
                    <span class="tray-tag">${printer.trays.tray1Name}: ${printer.trays.tray1Pct}%</span>
                    <span class="tray-tag">${printer.trays.tray2Name}: ${printer.trays.tray2Pct}%</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Staging Quick Actions Card -->
          <div class="cyber-glass-panel">
            <h3 class="panel-title" style="margin-bottom: 0.8rem;">
              <span>⚡</span> Operator Logistics Controls
            </h3>
            <p class="panel-sub" style="margin-bottom: 1rem;">
              Finished documents must be staged into the 50-slot physical shelf. Once staged, an automated WhatsApp alert with the pickup OTP and shelf coordinates is fired to the student.
            </p>

            <div class="operator-actions-list">
              <button class="cyber-btn-secondary" id="btnGoToRackMatrix">
                <span>📦 Open 50-Slot Shelving Matrix View</span>
                <span class="arrow-icon">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
        this.updateQueue(state);
        this.bindEvents();
    }
    updateQueue(state) {
        const container = this.container.querySelector('#fifoCardsContainer');
        if (!container)
            return;
        const queueOrders = state.orders.filter(o => o.status === 'QUEUED' || o.status === 'PRINTING');
        if (queueOrders.length === 0) {
            container.innerHTML = `
        <div class="empty-queue-state">
          <div class="empty-icon">🎉</div>
          <h4>Queue is Clear</h4>
          <p>All student printing jobs have been dispatched and staged in physical shelves.</p>
        </div>
      `;
            return;
        }
        container.innerHTML = queueOrders.map(order => {
            const isPrinting = order.status === 'PRINTING';
            return `
        <div class="fifo-job-card ${order.priority ? 'has-priority' : ''} ${isPrinting ? 'is-printing' : ''}" data-id="${order.id}">
          <div class="job-card-header">
            <div class="job-token-group">
              <span class="job-token">${order.token}</span>
              <span class="format-badge">${order.paperFormat || 'A4'}</span>
              ${order.priority ? '<span class="rush-badge">⚡ RUSH PRIORITY</span>' : ''}
              ${order.confidential ? '<span class="confidential-badge">🔒 CONFIDENTIAL</span>' : ''}
            </div>
            <div class="job-amount">₹${order.totalAmount.toFixed(2)}</div>
          </div>

          <div class="job-student-row">
            <div class="student-meta">
              <span class="student-name">${order.student.name}</span>
              <span class="student-roll">(${order.student.rollNo} • ${order.student.department || 'Eng'})</span>
            </div>
            <div class="student-phone">${order.student.phone}</div>
          </div>

          <div class="job-file-row">
            <span class="file-name">${order.fileName}</span>
            <span class="file-pages-breakdown">
              ${order.pageRange || `${order.pageCount} pgs`} [${order.bwPages} BW, ${order.colorPages} Color]
            </span>
          </div>

          <!-- Spec Tags -->
          <div class="job-tags-row">
            <span class="spec-tag format-tag">FORMAT: ${order.paperFormat || 'A4'}</span>
            <span class="spec-tag">${order.duplex ? 'Double-Sided' : 'Single-Sided'}</span>
            <span class="spec-tag">${order.paper.toUpperCase()}</span>
            <span class="spec-tag">${order.binding.toUpperCase()} BINDING</span>
            <span class="spec-tag">${order.colorMode === 'smart' ? 'Auto-Split' : order.colorMode}</span>
          </div>

          <!-- Customer Instructions / Notes (prominently displayed) -->
          ${order.customerNotes ? `
            <div class="customer-instructions-banner">
              <span class="note-icon">📌</span>
              <div class="note-body">
                <strong>Customer Instructions:</strong> "${order.customerNotes}"
              </div>
            </div>
          ` : ''}

          <!-- Binding Style Notes if present -->
          ${order.bindingNotes ? `
            <div class="binding-instructions-banner">
              <span class="note-icon">🎨</span>
              <div class="note-body">
                <strong>Cover / Binding Spec:</strong> ${order.bindingNotes}
              </div>
            </div>
          ` : ''}

          <!-- Printing progress bar if active -->
          ${isPrinting ? `
            <div class="printing-progress-container">
              <div class="progress-bar-stripes" style="width: ${order.printProgress || 35}%;"></div>
              <span class="printing-label">PRINTING IN PROGRESS (${order.printProgress || 35}%)</span>
            </div>
          ` : ''}

          <!-- Action Buttons -->
          <div class="job-actions-row">
            ${order.status === 'QUEUED' ? `
              <button class="action-btn btn-start-print" data-action="print" data-id="${order.id}">
                <span>▶ Start Print</span>
              </button>
            ` : ''}

            ${order.status === 'PRINTING' ? `
              <button class="action-btn btn-stage-rack" data-action="stage" data-id="${order.id}">
                <span>📦 Stage in Rack</span>
              </button>
            ` : ''}

            <button class="action-btn btn-manifest-slip" data-action="manifest" data-id="${order.id}">
              <span>📄 Manifest Slip</span>
            </button>
          </div>
        </div>
      `;
        }).join('');
        this.bindJobButtons();
    }
    bindJobButtons() {
        this.container.querySelectorAll('[data-action="print"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.currentTarget.dataset.id;
                if (orderId) {
                    store.startPrinting(orderId);
                }
            });
        });
        this.container.querySelectorAll('[data-action="stage"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.currentTarget.dataset.id;
                if (orderId) {
                    const slot = store.stageOrder(orderId);
                    if (slot) {
                        const toast = document.getElementById('toastContainer');
                        if (toast) {
                            const div = document.createElement('div');
                            div.className = 'toast toast-success';
                            div.innerHTML = `<strong>📦 Order Staged!</strong> Placed in [RACK ${slot}]. SMS & WhatsApp alert dispatched to student.`;
                            toast.appendChild(div);
                            setTimeout(() => div.remove(), 4000);
                        }
                    }
                }
            });
        });
        this.container.querySelectorAll('[data-action="manifest"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.currentTarget.dataset.id;
                if (orderId) {
                    const modal = document.getElementById('manifestModal');
                    const body = document.getElementById('manifestModalBody');
                    const order = store.getState().orders.find(o => o.id === orderId);
                    if (modal && body && order) {
                        body.innerHTML = `
              <div class="manifest-slip-document">
                <div class="slip-header">
                  <div class="slip-title">INSTITUTIONAL PRINT MANIFEST</div>
                  <div class="slip-hub">IIT CAMPUS CENTRAL PRINT HUB • STATION #01</div>
                  <div class="slip-token">${order.token}</div>
                </div>

                <div class="slip-grid">
                  <div><strong>Student:</strong> ${order.student.name}</div>
                  <div><strong>Roll No:</strong> ${order.student.rollNo}</div>
                  <div><strong>File:</strong> ${order.fileName}</div>
                  <div><strong>Page Range:</strong> ${order.pageRange || `All (1-${order.pageCount})`}</div>
                  <div><strong>Sides:</strong> ${order.duplex ? 'Double-Sided (Duplex)' : 'Single-Sided'}</div>
                  <div><strong>Paper Format:</strong> ${order.paperFormat || 'A4'} (${order.paper.toUpperCase()})</div>
                  <div><strong>Binding:</strong> ${order.binding.toUpperCase()}</div>
                  <div><strong>Cover Spec:</strong> ${order.bindingNotes || 'Standard'}</div>
                  <div><strong>Total Amount:</strong> ₹${order.totalAmount.toFixed(2)} (PAID)</div>
                  <div><strong>Staging Slot:</strong> ${order.rackSlot || 'PENDING'}</div>
                  <div><strong>Security OTP:</strong> <span style="font-family: var(--font-mono); font-weight:800;">${order.pickupOtp}</span></div>
                </div>

                ${order.customerNotes ? `
                  <div style="background: rgba(245, 158, 11, 0.12); border: 1px dashed var(--amber); padding: 0.65rem 0.85rem; border-radius: 6px; margin: 0.85rem 0; font-size: 0.82rem; color: #fef3c7;">
                    <strong>📌 Customer Special Instructions:</strong> "${order.customerNotes}"
                  </div>
                ` : ''}

                <!-- Barcode representation -->
                <div class="slip-barcode">
                  <div class="barcode-lines"></div>
                  <span class="barcode-text">*${order.token.replace('#', '')}-${order.pickupOtp}*</span>
                </div>

                <button class="cyber-btn-primary" onclick="window.print()" style="margin-top: 1.25rem;">
                  🖨️ Print Manifest Cover Slip
                </button>
              </div>
            `;
                        modal.classList.add('open');
                        sound.click();
                    }
                }
            });
        });
    }
    bindEvents() {
        const btnGoRack = this.container.querySelector('#btnGoToRackMatrix');
        if (btnGoRack) {
            btnGoRack.addEventListener('click', () => {
                store.setActiveRole('rack');
            });
        }
    }
    update(state) {
        const stats = rackAllocator.getOccupancyStats(state.rackSlots);
        const grossTotal = state.orders.reduce((acc, o) => acc + o.totalAmount, 0);
        const platformFee = Math.round(grossTotal * 0.07 * 100) / 100;
        const vendorPayout = Math.round((grossTotal - platformFee) * 100) / 100;
        const activeQueue = state.orders.filter(o => o.status === 'QUEUED' || o.status === 'PRINTING');
        const qEl = this.container.querySelector('#kpiActiveQueue');
        const oEl = this.container.querySelector('#kpiOccupancy');
        const gEl = this.container.querySelector('#kpiGrossTotal');
        const pEl = this.container.querySelector('#kpiPlatformEscrow');
        const vEl = this.container.querySelector('#kpiVendorPayout');
        if (qEl)
            qEl.textContent = `${activeQueue.length} Jobs`;
        if (oEl)
            oEl.textContent = `${stats.occupied} / 50 Slots`;
        if (gEl)
            gEl.textContent = `₹${grossTotal.toFixed(2)}`;
        if (pEl)
            pEl.textContent = `₹${platformFee.toFixed(2)}`;
        if (vEl)
            vEl.textContent = `₹${vendorPayout.toFixed(2)}`;
        this.updateQueue(state);
    }
}
