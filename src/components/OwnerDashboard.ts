/**
 * Click2Print UI Component: Shop Owner Dashboard
 * Clean order management with sequential order numbers.
 */

import { store } from '../core/store.js';
import { sound } from '../core/audio.js';
import { SystemState, PrintOrder } from '../types/index.js';

export class OwnerDashboardComponent {
  private container: HTMLElement;
  private activeFilter: 'all' | 'pending' | 'active' | 'completed' = 'all';

  constructor(container: HTMLElement) {
    this.container = container;
    this.render(store.getState());
    store.subscribe((state) => this.update(state));
  }

  private render(state: SystemState): void {
    const pendingCount = state.orders.filter(o => o.status === 'PENDING').length;
    const activeCount = state.orders.filter(o => ['APPROVED', 'PRINTING', 'READY'].includes(o.status)).length;
    const completedCount = state.orders.filter(o => o.status === 'COMPLETED').length;
    const totalRevenue = state.orders.filter(o => o.status === 'COMPLETED').reduce((acc, o) => acc + o.totalAmount, 0);
    const todayRevenue = state.orders.filter(o => o.status !== 'PENDING').reduce((acc, o) => acc + o.totalAmount, 0);

    this.container.innerHTML = `
      <!-- KPI Strip -->
      <div class="owner-kpi-grid">
        <div class="cyber-kpi-card">
          <span class="kpi-label">Pending Orders</span>
          <div class="kpi-val color-amber" id="kpiPending">${pendingCount}</div>
          <span class="kpi-sub">Awaiting approval</span>
        </div>

        <div class="cyber-kpi-card">
          <span class="kpi-label">Active Orders</span>
          <div class="kpi-val color-cyan" id="kpiActive">${activeCount}</div>
          <span class="kpi-sub">In progress</span>
        </div>

        <div class="cyber-kpi-card">
          <span class="kpi-label">Completed Today</span>
          <div class="kpi-val color-emerald" id="kpiCompleted">${completedCount}</div>
          <span class="kpi-sub">Orders fulfilled</span>
        </div>

        <div class="cyber-kpi-card">
          <span class="kpi-label">Today's Revenue</span>
          <div class="kpi-val color-text" id="kpiRevenue">₹${todayRevenue.toFixed(2)}</div>
          <span class="kpi-sub">Total order value</span>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="owner-filter-bar">
        <button class="filter-tab ${this.activeFilter === 'all' ? 'active' : ''}" data-filter="all">
          All Orders <span class="filter-count">${state.orders.length}</span>
        </button>
        <button class="filter-tab ${this.activeFilter === 'pending' ? 'active' : ''}" data-filter="pending">
          Pending <span class="filter-count">${pendingCount}</span>
        </button>
        <button class="filter-tab ${this.activeFilter === 'active' ? 'active' : ''}" data-filter="active">
          Active <span class="filter-count">${activeCount}</span>
        </button>
        <button class="filter-tab ${this.activeFilter === 'completed' ? 'active' : ''}" data-filter="completed">
          Completed <span class="filter-count">${completedCount}</span>
        </button>
      </div>

      <!-- Orders List -->
      <div class="owner-orders-container" id="ownerOrdersContainer"></div>
    `;

    this.renderOrders(state);
    this.bindEvents();
  }

  private getFilteredOrders(state: SystemState): PrintOrder[] {
    switch (this.activeFilter) {
      case 'pending':
        return state.orders.filter(o => o.status === 'PENDING');
      case 'active':
        return state.orders.filter(o => ['APPROVED', 'PRINTING', 'READY'].includes(o.status));
      case 'completed':
        return state.orders.filter(o => o.status === 'COMPLETED');
      default:
        return [...state.orders];
    }
  }

  private renderOrders(state: SystemState): void {
    const container = this.container.querySelector('#ownerOrdersContainer');
    if (!container) return;

    const orders = this.getFilteredOrders(state).sort((a, b) => b.createdAt - a.createdAt);

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="empty-queue-state">
          <div class="empty-icon">📭</div>
          <h4>No Orders</h4>
          <p>No orders match the current filter.</p>
        </div>
      `;
      return;
    }

    const statusLabels: Record<string, string> = {
      PENDING: '⏳ Pending',
      APPROVED: '✅ Approved',
      PRINTING: '🖨️ Printing',
      READY: '📦 Ready',
      COMPLETED: '✓ Done'
    };

    const statusColors: Record<string, string> = {
      PENDING: 'pending',
      APPROVED: 'approved',
      PRINTING: 'printing',
      READY: 'ready',
      COMPLETED: 'completed'
    };

    container.innerHTML = orders.map(order => {
      const createdDate = new Date(order.createdAt);
      const timeStr = createdDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

      return `
        <div class="owner-order-card status-border-${statusColors[order.status]}" data-id="${order.id}">
          <div class="order-card-header">
            <div class="order-id-group">
              <span class="order-num-lg">#${order.orderNumber}</span>
              <span class="order-time">${timeStr}</span>
            </div>
            <div class="order-status-amount">
              <span class="status-pill status-${statusColors[order.status]}">${statusLabels[order.status]}</span>
              <span class="order-amount-lg">₹${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div class="order-customer-row">
            <span class="customer-name">${order.customer.name}</span>
            <span class="customer-phone">${order.customer.phone}</span>
          </div>

          <div class="order-file-row">
            <span class="file-name">${order.fileName}</span>
            <span class="file-specs">
              ${order.pageRange} • ${order.copies > 1 ? order.copies + ' copies • ' : ''}${order.duplex ? 'Double-Sided' : 'Single-Sided'} • ${order.paperFormat}
            </span>
          </div>

          <!-- Spec Tags -->
          <div class="order-tags-row">
            <span class="spec-tag">${order.colorMode === 'smart' ? 'Auto-Split' : order.colorMode === 'mono' ? 'B&W' : 'Color'}</span>
            <span class="spec-tag">${order.paper.toUpperCase()}</span>
            <span class="spec-tag">${order.binding.charAt(0).toUpperCase() + order.binding.slice(1)} Binding</span>
            ${order.copies > 1 ? `<span class="spec-tag copies-tag">${order.copies} Copies</span>` : ''}
          </div>

          ${order.customerNotes ? `
            <div class="customer-instructions-banner">
              <span class="note-icon">📌</span>
              <div class="note-body">
                <strong>Notes:</strong> "${order.customerNotes}"
              </div>
            </div>
          ` : ''}

          ${order.status === 'PRINTING' && order.printProgress ? `
            <div class="printing-progress-container">
              <div class="progress-bar-stripes" style="width: ${order.printProgress}%;"></div>
              <span class="printing-label">PRINTING (${order.printProgress}%)</span>
            </div>
          ` : ''}

          <!-- Action Buttons -->
          <div class="order-actions-row">
            ${order.status === 'PENDING' ? `
              <button class="action-btn btn-approve" data-action="approve" data-id="${order.id}">
                ✅ Approve
              </button>
              <button class="action-btn btn-print-direct" data-action="print" data-id="${order.id}">
                🖨️ Approve & Print
              </button>
            ` : ''}

            ${order.status === 'APPROVED' ? `
              <button class="action-btn btn-start-print" data-action="print" data-id="${order.id}">
                🖨️ Start Printing
              </button>
            ` : ''}

            ${order.status === 'PRINTING' && order.printProgress === 100 ? `
              <button class="action-btn btn-mark-ready" data-action="ready" data-id="${order.id}">
                📦 Mark Ready
              </button>
            ` : ''}

            ${order.status === 'READY' ? `
              <button class="action-btn btn-complete" data-action="complete" data-id="${order.id}">
                ✓ Hand Over & Complete
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    this.bindOrderActions();
  }

  private bindOrderActions(): void {
    this.container.querySelectorAll('[data-action="approve"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const orderId = (e.currentTarget as HTMLElement).dataset.id;
        if (orderId) {
          store.approveOrder(orderId);
          this.showToast('Order approved', 'success');
        }
      });
    });

    this.container.querySelectorAll('[data-action="print"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const orderId = (e.currentTarget as HTMLElement).dataset.id;
        if (orderId) {
          store.startPrinting(orderId);
          this.showToast('Printing started', 'info');
        }
      });
    });

    this.container.querySelectorAll('[data-action="ready"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const orderId = (e.currentTarget as HTMLElement).dataset.id;
        if (orderId) {
          store.markReady(orderId);
          this.showToast('Order marked as ready for pickup', 'success');
        }
      });
    });

    this.container.querySelectorAll('[data-action="complete"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const orderId = (e.currentTarget as HTMLElement).dataset.id;
        if (orderId) {
          store.completeOrder(orderId);
          this.showToast('Order completed', 'success');
        }
      });
    });
  }

  private showToast(message: string, type: 'success' | 'info' | 'warn' = 'success'): void {
    const toast = document.getElementById('toastContainer');
    if (toast) {
      const div = document.createElement('div');
      div.className = `toast toast-${type}`;
      div.innerHTML = message;
      toast.appendChild(div);
      setTimeout(() => div.remove(), 3500);
    }
  }

  private bindEvents(): void {
    // Filter tabs
    this.container.querySelectorAll('.filter-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = (e.currentTarget as HTMLElement).dataset.filter as typeof this.activeFilter;
        if (filter) {
          this.activeFilter = filter;
          this.container.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
          (e.currentTarget as HTMLElement).classList.add('active');
          sound.click();
          this.renderOrders(store.getState());
        }
      });
    });
  }

  public update(state: SystemState): void {
    // Update KPI values
    const pendingCount = state.orders.filter(o => o.status === 'PENDING').length;
    const activeCount = state.orders.filter(o => ['APPROVED', 'PRINTING', 'READY'].includes(o.status)).length;
    const completedCount = state.orders.filter(o => o.status === 'COMPLETED').length;
    const todayRevenue = state.orders.filter(o => o.status !== 'PENDING').reduce((acc, o) => acc + o.totalAmount, 0);

    const kp = this.container.querySelector('#kpiPending');
    const ka = this.container.querySelector('#kpiActive');
    const kc = this.container.querySelector('#kpiCompleted');
    const kr = this.container.querySelector('#kpiRevenue');

    if (kp) kp.textContent = String(pendingCount);
    if (ka) ka.textContent = String(activeCount);
    if (kc) kc.textContent = String(completedCount);
    if (kr) kr.textContent = `₹${todayRevenue.toFixed(2)}`;

    // Update filter counts
    this.container.querySelectorAll('.filter-tab').forEach(btn => {
      const filter = (btn as HTMLElement).dataset.filter;
      const countEl = btn.querySelector('.filter-count');
      if (countEl) {
        switch (filter) {
          case 'all': countEl.textContent = String(state.orders.length); break;
          case 'pending': countEl.textContent = String(pendingCount); break;
          case 'active': countEl.textContent = String(activeCount); break;
          case 'completed': countEl.textContent = String(completedCount); break;
        }
      }
    });

    this.renderOrders(state);
  }
}
