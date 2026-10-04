/**
 * SmartPrint UI Component: Physical 50-Slot Dispatch Rack Matrix
 */

import { store } from '../core/store.js';
import { rackAllocator } from '../services/rackAllocator.js';
import { sound } from '../core/audio.js';
import { SystemState, RackSlot, RackRow } from '../types/index.js';

export class RackMatrixComponent {
  private container: HTMLElement;
  private currentFilter: 'ALL' | 'OCCUPIED' | 'OVERDUE' = 'ALL';
  private searchQuery: string = '';

  constructor(container: HTMLElement) {
    this.container = container;
    this.render(store.getState());
    store.subscribe((state) => this.update(state));
  }

  private render(state: SystemState): void {
    const stats = rackAllocator.getOccupancyStats(state.rackSlots);

    this.container.innerHTML = `
      <div class="cyber-glass-panel">
        <div class="rack-header-bar">
          <div>
            <h3 class="panel-title" style="margin-bottom: 0.2rem;">
              <span>📦</span> Modular 50-Slot Physical Staging Shelving (Rows A–E, Columns 01–10)
            </h3>
            <p class="panel-sub">
              Tactile digital twin of the physical campus locker rack. Click any compartment to inspect order details, trigger WhatsApp pickup alerts, or release slots.
            </p>
          </div>

          <!-- Legend -->
          <div class="rack-status-legend">
            <div class="legend-chip">
              <span class="dot-legend dot-empty"></span>
              <span>Available (${stats.empty})</span>
            </div>
            <div class="legend-chip">
              <span class="dot-legend dot-staged"></span>
              <span>Staged (${stats.occupied - stats.overdue})</span>
            </div>
            <div class="legend-chip">
              <span class="dot-legend dot-overdue"></span>
              <span>Overdue &gt;1h (${stats.overdue})</span>
            </div>
          </div>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="rack-toolbar">
          <div class="filter-pills-row">
            <button class="filter-pill ${this.currentFilter === 'ALL' ? 'active' : ''}" data-filter="ALL">All Slots (50)</button>
            <button class="filter-pill ${this.currentFilter === 'OCCUPIED' ? 'active' : ''}" data-filter="OCCUPIED">Staged Only (${stats.occupied})</button>
            <button class="filter-pill ${this.currentFilter === 'OVERDUE' ? 'active' : ''}" data-filter="OVERDUE">Overdue Only (${stats.overdue})</button>
          </div>

          <div class="rack-search-box">
            <span class="search-icon">🔍</span>
            <input type="text" id="rackSearchInput" placeholder="Search by student, roll no, or slot code..." value="${this.searchQuery}">
          </div>
        </div>

        <!-- 50-Compartment Shelf Matrix Grid -->
        <div class="physical-rack-wrapper">
          <!-- Column headers 01 to 10 -->
          <div class="rack-cols-ruler">
            <div class="corner-cell">ROW</div>
            <div>01</div><div>02</div><div>03</div><div>04</div><div>05</div>
            <div>06</div><div>07</div><div>08</div><div>09</div><div>10</div>
          </div>

          <div class="rack-rows-container" id="rackRowsContainer">
            <!-- Rendered by renderRackGrid -->
          </div>
        </div>
      </div>
    `;

    this.renderRackGrid(state);
    this.bindEvents();
  }

  private renderRackGrid(state: SystemState): void {
    const container = this.container.querySelector('#rackRowsContainer');
    if (!container) return;

    const rows: RackRow[] = ['A', 'B', 'C', 'D', 'E'];
    const rowLabels: Record<RackRow, { label: string; desc: string }> = {
      'A': { label: 'ROW A', desc: 'Top Shelf' },
      'B': { label: 'ROW B', desc: 'Eye-Level (Prime)' },
      'C': { label: 'ROW C', desc: 'Chest-Level' },
      'D': { label: 'ROW D', desc: 'Lower Shelf' },
      'E': { label: 'ROW E', desc: 'Base Storage' }
    };

    container.innerHTML = rows.map(r => {
      const rowSlots: RackSlot[] = [];
      for (let c = 1; c <= 10; c++) {
        const code = `${r}-${c < 10 ? '0' + c : c}`;
        const slot = state.rackSlots[code];
        if (slot) rowSlots.push(slot);
      }

      return `
        <div class="rack-row-shelf">
          <div class="row-header-tag">
            <div class="row-letter">${r}</div>
            <div class="row-desc">${rowLabels[r].desc}</div>
          </div>

          <div class="row-slots-strip">
            ${rowSlots.map(slot => {
              const order = slot.orderId ? state.orders.find(o => o.id === slot.orderId) : null;
              const isOverdue = slot.status === 'OVERDUE';
              const isOccupied = slot.status === 'OCCUPIED' || isOverdue;

              // Filter matching
              if (this.currentFilter === 'OCCUPIED' && !isOccupied) return `<div class="rack-cell-empty-dim"></div>`;
              if (this.currentFilter === 'OVERDUE' && !isOverdue) return `<div class="rack-cell-empty-dim"></div>`;

              // Search matching
              if (this.searchQuery) {
                const q = this.searchQuery.toLowerCase();
                const matches = slot.code.toLowerCase().includes(q) ||
                  (order && (order.student.name.toLowerCase().includes(q) || order.student.rollNo.toLowerCase().includes(q) || order.token.toLowerCase().includes(q)));
                if (!matches) return `<div class="rack-cell-empty-dim"></div>`;
              }

              return `
                <div class="rack-compartment-box status-${slot.status.toLowerCase()} ${isOverdue ? 'pulse-overdue' : ''}" 
                     data-slot="${slot.code}" 
                     title="Slot ${slot.code}: ${isOccupied ? (order ? `${order.student.name} (${order.student.rollNo})` : 'Occupied') : 'Available'}">
                  <div class="compartment-lid"></div>
                  <div class="compartment-interior">
                    <div class="slot-code-label">${slot.code}</div>
                    
                    ${isOccupied && order ? `
                      <div class="slot-parcel-preview">
                        <div class="parcel-icon">📑</div>
                        <div class="parcel-roll">${order.student.rollNo}</div>
                        <div class="parcel-otp">OTP: ${order.pickupOtp}</div>
                      </div>
                    ` : `
                      <div class="slot-available-indicator">
                        <span class="pulse-green-dot"></span>
                        <span class="slot-avail-text">READY</span>
                      </div>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');

    this.bindCellClicks();
  }

  private bindCellClicks(): void {
    this.container.querySelectorAll('.rack-compartment-box').forEach(cell => {
      cell.addEventListener('click', (e) => {
        const slotCode = (e.currentTarget as HTMLElement).dataset.slot;
        if (!slotCode) return;

        const state = store.getState();
        const slot = state.rackSlots[slotCode];
        if (!slot) return;

        sound.click();

        const modal = document.getElementById('slotDetailsModal');
        const body = document.getElementById('slotModalBody');
        if (!modal || !body) return;

        const order = slot.orderId ? state.orders.find(o => o.id === slot.orderId) : null;

        if (order) {
          const stagedAgo = slot.stagedTime ? Math.round((Date.now() - slot.stagedTime) / 60000) : 0;
          body.innerHTML = `
            <div class="slot-modal-content">
              <div class="slot-modal-badge-row">
                <div class="giant-slot-title">RACK ${slot.code}</div>
                <div class="status-pill status-${slot.status.toLowerCase()}">${slot.status}</div>
              </div>

              <div class="slot-student-card">
                <div class="student-header">
                  <div>
                    <h4 style="font-size:1.15rem; font-weight:800; color:white;">${order.student.name}</h4>
                    <p style="font-size:0.85rem; color:var(--text-secondary);">${order.student.rollNo} • ${order.student.department || 'Campus Department'}</p>
                  </div>
                  <div style="text-align:right;">
                    <div style="font-size:0.75rem; color:var(--text-muted);">SECURITY OTP</div>
                    <div style="font-family:var(--font-mono); font-size:1.3rem; font-weight:900; color:var(--cyan);">${order.pickupOtp}</div>
                  </div>
                </div>

                <div class="student-details-list">
                  <div><strong>Document:</strong> ${order.fileName}</div>
                  <div><strong>Pages:</strong> ${order.pageCount} pgs (${order.bwPages} BW, ${order.colorPages} Color)</div>
                  <div><strong>Binding:</strong> ${order.binding.toUpperCase()}</div>
                  <div><strong>Staged Duration:</strong> ${stagedAgo} mins ago</div>
                  <div><strong>Student Phone:</strong> ${order.student.phone}</div>
                </div>
              </div>

              <div class="slot-modal-actions">
                <button class="cyber-btn-primary" id="btnReleaseOrderDirect" data-id="${order.id}">
                  ✓ Confirm Manual Handover (Clear Slot)
                </button>
                <button class="cyber-btn-secondary" id="btnResendWhatsApp" data-phone="${order.student.phone}" data-otp="${order.pickupOtp}" data-slot="${slot.code}">
                  💬 Resend WhatsApp Pickup Alert
                </button>
              </div>
            </div>
          `;

          // Bind release
          const btnRelease = body.querySelector('#btnReleaseOrderDirect');
          if (btnRelease) {
            btnRelease.addEventListener('click', () => {
              store.completePickup(order.id);
              modal.classList.remove('open');
            });
          }

          // Bind WhatsApp simulation
          const btnWa = body.querySelector('#btnResendWhatsApp');
          if (btnWa) {
            btnWa.addEventListener('click', () => {
              alert(`WhatsApp message dispatched to ${order.student.phone}:\n"Hello ${order.student.name}, your print order ${order.token} is ready for express pickup at RACK ${slot.code}. Use OTP: ${order.pickupOtp}"`);
            });
          }
        } else {
          body.innerHTML = `
            <div class="slot-modal-content" style="text-align: center; padding: 2rem 1rem;">
              <div class="giant-slot-title" style="margin-bottom: 0.5rem;">RACK ${slot.code}</div>
              <div style="color: var(--emerald); font-weight: 700; font-size: 1.1rem; margin-bottom: 0.5rem;">🟢 Slot is Available</div>
              <p style="color: var(--text-secondary); font-size: 0.9rem; max-width: 360px; margin: 0 auto 1.5rem;">
                This compartment in ${slot.shelfLevelName || 'the dispatch shelf'} is empty and ready to receive an assembled document bundle.
              </p>
              <button class="cyber-btn-secondary" onclick="document.getElementById('slotDetailsModal').classList.remove('open')">
                Close
              </button>
            </div>
          `;
        }

        modal.classList.add('open');
      });
    });
  }

  private bindEvents(): void {
    // Filter pills
    this.container.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        this.container.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        const target = e.currentTarget as HTMLElement;
        target.classList.add('active');
        this.currentFilter = target.dataset.filter as 'ALL' | 'OCCUPIED' | 'OVERDUE';
        sound.click();
        this.renderRackGrid(store.getState());
      });
    });

    // Search input
    const searchInput = this.container.querySelector('#rackSearchInput') as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        this.searchQuery = searchInput.value;
        this.renderRackGrid(store.getState());
      });
    }
  }

  public update(state: SystemState): void {
    this.renderRackGrid(state);
  }
}
