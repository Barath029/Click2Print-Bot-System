/**
 * Click2Print Shop Owner & Admin Dashboard
 * Directly implements all sections from the product architecture:
 * 1. Print Order Management (Image 2)
 * 2. Printer Management (Image 1)
 * 3. Usage & Settings (Image 4)
 * 4. How Click2Print Works (Image 3)
 */

import { store } from '../core/store.js';
import { sound } from '../core/audio.js';
import {
  SystemState,
  PrintOrder,
  AdminTab,
  PricingRates
} from '../types/index.js';

export class OwnerDashboardComponent {
  private container: HTMLElement;
  private activeFilter: 'all' | 'pending' | 'printing' | 'ready' | 'completed' | 'rejected' = 'all';

  constructor(container: HTMLElement) {
    this.container = container;
    this.render(store.getState());
    store.subscribe((state) => this.update(state));
  }

  private render(state: SystemState): void {
    const activeTab = state.adminTab;
    const pendingOrders = state.orders.filter(o => o.status === 'PENDING');
    const printingOrders = state.orders.filter(o => o.status === 'PRINTING');
    const readyOrders = state.orders.filter(o => o.status === 'READY');
    const completedOrders = state.orders.filter(o => o.status === 'COMPLETED');

    this.container.innerHTML = `
      <div class="admin-dashboard-view">

        <!-- Admin Navigation Tabs -->
        <div class="admin-tab-nav">
          <button class="admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}" data-tab="orders">
            <span class="tab-btn-icon">📋</span>
            <span class="tab-btn-title">Print Order Management</span>
            ${pendingOrders.length > 0 ? `
              <span class="badge-alert-pill">${pendingOrders.length} Pending</span>
            ` : ''}
          </button>

          <button class="admin-tab-btn ${activeTab === 'printers' ? 'active' : ''}" data-tab="printers">
            <span class="tab-btn-icon">🖨️</span>
            <span class="tab-btn-title">Printer Management</span>
            <span class="badge-status-pill">2 Online</span>
          </button>

          <button class="admin-tab-btn ${activeTab === 'usage' ? 'active' : ''}" data-tab="usage">
            <span class="tab-btn-icon">📊</span>
            <span class="tab-btn-title">Usage & Settings</span>
            <span class="badge-status-pill">₹${state.usage.totalRevenue.toLocaleString()}</span>
          </button>

          <button class="admin-tab-btn ${activeTab === 'how-it-works' ? 'active' : ''}" data-tab="how-it-works">
            <span class="tab-btn-icon">ℹ️</span>
            <span class="tab-btn-title">How Click2Print Works</span>
            <span class="badge-accent-pill">< 60s Flow</span>
          </button>
        </div>

        <!-- TAB CONTENT CONTAINER -->
        <div class="admin-tab-content" id="adminTabContent">
          ${this.renderActiveTab(activeTab, state)}
        </div>

      </div>
    `;

    this.bindEvents(state);
  }

  private renderActiveTab(tab: AdminTab, state: SystemState): string {
    switch (tab) {
      case 'orders':
        return this.renderOrdersManagementTab(state);
      case 'printers':
        return this.renderPrinterManagementTab(state);
      case 'usage':
        return this.renderUsageAndSettingsTab(state);
      case 'how-it-works':
        return this.renderHowItWorksTab(state);
      default:
        return this.renderOrdersManagementTab(state);
    }
  }

  // =========================================================================
  // SECTION 1: PRINT ORDER MANAGEMENT (Image 2)
  // =========================================================================
  private renderOrdersManagementTab(state: SystemState): string {
    const pendingCount = state.orders.filter(o => o.status === 'PENDING').length;
    const printingCount = state.orders.filter(o => o.status === 'PRINTING').length;
    const readyCount = state.orders.filter(o => o.status === 'READY').length;
    const completedCount = state.orders.filter(o => o.status === 'COMPLETED').length;
    const rejectedCount = state.orders.filter(o => o.status === 'REJECTED').length;

    const filtered = this.getFilteredOrders(state);
    const totalRevenueSum = state.orders.filter(o => o.paymentStatus === 'PAID').reduce((acc, o) => acc + o.totalAmount, 0);

    return `
      <div class="orders-management-section">

        <!-- Top Section Header matching Screenshot 2 -->
        <div class="section-title-strip">
          <div class="strip-header">
            <span class="strip-icon">📋</span>
            <div>
              <h2 class="strip-title">Print Order Management</h2>
              <p class="strip-subtitle">Real-time incoming queue, 1-click approvals, and silent background printing</p>
            </div>
          </div>
          <div class="strip-action-buttons">
            <button type="button" class="btn-clean-secondary" id="btnSimulateOrder">
              <span>+ Simulate Incoming Customer Order</span>
            </button>
          </div>
        </div>

        <!-- Executive KPI Stats Bar -->
        <div class="orders-kpi-bar">
          <div class="kpi-stat-card">
            <div class="kpi-icon-pill bg-blue-soft">📋</div>
            <div class="kpi-data">
              <span class="kpi-label">Active Orders</span>
              <strong class="kpi-value">${state.orders.length}</strong>
              <span class="kpi-sub highlight-amber">${pendingCount} Pending Approval</span>
            </div>
          </div>

          <div class="kpi-stat-card">
            <div class="kpi-icon-pill bg-purple-soft">⚡</div>
            <div class="kpi-data">
              <span class="kpi-label">Hardware Queue</span>
              <strong class="kpi-value">${printingCount}</strong>
              <span class="kpi-sub highlight-blue">Auto-Spooling Active</span>
            </div>
          </div>

          <div class="kpi-stat-card">
            <div class="kpi-icon-pill bg-emerald-soft">📦</div>
            <div class="kpi-data">
              <span class="kpi-label">Ready for Pickup</span>
              <strong class="kpi-value">${readyCount}</strong>
              <span class="kpi-sub highlight-emerald">Waiting at Counter</span>
            </div>
          </div>

          <div class="kpi-stat-card">
            <div class="kpi-icon-pill bg-green-soft">💰</div>
            <div class="kpi-data">
              <span class="kpi-label">Today's Revenue</span>
              <strong class="kpi-value">₹${totalRevenueSum.toFixed(2)}</strong>
              <span class="kpi-sub">${completedCount} Completed Fulfilled</span>
            </div>
          </div>
        </div>

        <!-- 7 Feature Cards Strip directly from Screenshot 2 -->
        <div class="feature-strip-accordion">
          <div class="feature-strip-header">
            <div class="feat-header-left">
              <span class="feat-strip-label">⚡ System Automation & Hardware Routing Engine</span>
              <span class="feat-strip-pill">7 Core Features Active</span>
            </div>
            <span class="feat-strip-note">Real-time Zero-Touch Workflow</span>
          </div>
          <div class="feature-cards-grid-7">
          <div class="feature-card">
            <div class="feat-icon-box bg-blue-soft">
              <span class="feat-icon">📡</span>
            </div>
            <div class="feat-content">
              <h4 class="feat-title">Live Order Dashboard</h4>
              <p class="feat-desc">See every pending order in real time as customers submit them — no refresh needed.</p>
              <span class="feat-tag">+ Smart Interface</span>
            </div>
          </div>

          <div class="feature-card">
            <div class="feat-icon-box bg-slate-soft">
              <span class="feat-icon">📄</span>
            </div>
            <div class="feat-content">
              <h4 class="feat-title">Full Order Details</h4>
              <p class="feat-desc">File name, page count, copies, colour mode, and order number — all visible at a glance on each order card.</p>
            </div>
          </div>

          <div class="feature-card">
            <div class="feat-icon-box bg-emerald-soft">
              <span class="feat-icon">✅</span>
            </div>
            <div class="feat-content">
              <h4 class="feat-title">One-Click Approve & Print</h4>
              <p class="feat-desc">Approve an order and it prints automatically and silently — no further action required from you.</p>
            </div>
          </div>

          <div class="feature-card">
            <div class="feat-icon-box bg-rose-soft">
              <span class="feat-icon">❌</span>
            </div>
            <div class="feat-content">
              <h4 class="feat-title">Reject Order</h4>
              <p class="feat-desc">Decline any order with a single click. The customer is notified and the file is immediately deleted.</p>
            </div>
          </div>

          <div class="feature-card">
            <div class="feat-icon-box bg-purple-soft">
              <span class="feat-icon">⚙️</span>
            </div>
            <div class="feat-content">
              <h4 class="feat-title">Auto Print Queue</h4>
              <p class="feat-desc">A background worker prints all approved jobs automatically — no supervision or manual intervention needed.</p>
              <span class="feat-tag">+ Adaptive Layout</span>
            </div>
          </div>

          <div class="feature-card">
            <div class="feat-icon-box bg-pink-soft">
              <span class="feat-icon">🎨</span>
            </div>
            <div class="feat-content">
              <h4 class="feat-title">B&W / Colour Auto-Routing</h4>
              <p class="feat-desc">Connect separate B&W and colour printers — orders automatically route to the correct printer based on customer's selection.</p>
            </div>
          </div>

          <div class="feature-card">
            <div class="feat-icon-box bg-amber-soft">
              <span class="feat-icon">📝</span>
            </div>
            <div class="feat-content">
              <h4 class="feat-title">DOCX Support</h4>
              <p class="feat-desc">Word files (DOCX/DOC) are automatically converted to PDF before printing — no manual conversion needed.</p>
            </div>
          </div>
        </div>
        </div>

        <!-- Filter Bar -->
        <div class="orders-filter-bar">
          <div class="filter-tabs-group">
            <button type="button" class="order-filter-btn ${this.activeFilter === 'all' ? 'active' : ''}" data-filter="all">
              All Orders <span class="filter-count">${state.orders.length}</span>
            </button>

            <button type="button" class="order-filter-btn ${this.activeFilter === 'pending' ? 'active' : ''}" data-filter="pending">
              Pending Approval <span class="filter-count pending-tag">${pendingCount}</span>
            </button>

            <button type="button" class="order-filter-btn ${this.activeFilter === 'printing' ? 'active' : ''}" data-filter="printing">
              Auto Print Queue <span class="filter-count printing-tag">${printingCount}</span>
            </button>

            <button type="button" class="order-filter-btn ${this.activeFilter === 'ready' ? 'active' : ''}" data-filter="ready">
              Ready for Pickup <span class="filter-count ready-tag">${readyCount}</span>
            </button>

            <button type="button" class="order-filter-btn ${this.activeFilter === 'completed' ? 'active' : ''}" data-filter="completed">
              Completed <span class="filter-count">${completedCount}</span>
            </button>

            <button type="button" class="order-filter-btn ${this.activeFilter === 'rejected' ? 'active' : ''}" data-filter="rejected">
              Rejected <span class="filter-count">${rejectedCount}</span>
            </button>
          </div>

          <div class="live-stream-badge">
            <span class="pulse-beacon green"></span>
            <span>Real-time Live Order Stream</span>
          </div>
        </div>

        <!-- Order Cards List -->
        <div class="order-cards-stream">
          ${filtered.length === 0 ? `
            <div class="empty-orders-card">
              <span class="empty-icon">📭</span>
              <h4>No orders in this status category</h4>
              <p>New orders submitted by customers appear here automatically with zero delay.</p>
            </div>
          ` : filtered.map(order => this.renderOrderCard(order, state)).join('')}
        </div>

      </div>
    `;
  }

  private renderOrderCard(order: PrintOrder, state: SystemState): string {
    const isBW = order.routedPrinter === 'BW_PRINTER';
    const printerName = isBW ? state.bwPrinter.name : state.colorPrinter.name;
    const timeAgo = this.formatTimeAgo(order.createdAt);

    return `
      <div class="clean-order-card status-${order.status.toLowerCase()}">
        
        <!-- Order Card Top Bar -->
        <div class="order-card-header">
          <div class="order-id-group">
            <span class="order-number-badge">#${order.orderNumber}</span>
            <div class="order-customer-meta">
              <strong class="customer-name">${order.customer.name}</strong>
              <span class="customer-phone">${order.customer.phone}</span>
            </div>
          </div>

          <div class="order-header-right">
            <span class="order-time-tag">${timeAgo}</span>
            <span class="order-status-badge ${order.status.toLowerCase()}">${order.status}</span>
          </div>
        </div>

        <!-- File Details & Auto-Routing Info -->
        <div class="order-card-body">
          <div class="order-file-row">
            <div class="file-name-block">
              <span class="doc-icon">${order.fileType === 'docx' ? '📝' : '📄'}</span>
              <span class="doc-name">${order.fileName}</span>
            </div>

            ${order.isDocxConverted ? `
              <span class="docx-badge">⚡ Auto-Converted DOCX</span>
            ` : ''}

            <!-- Hardware Auto-Routing Destination Badge -->
            <div class="routing-destination-pill ${isBW ? 'bw' : 'colour'}">
              <span class="pill-dot"></span>
              <span>${isBW ? '⚫ Routes to: B&W Printer' : '🌈 Routes to: Colour Printer'}</span>
              <strong class="pill-model">(${printerName})</strong>
            </div>
          </div>

          <!-- Specs Matrix -->
          <div class="order-specs-matrix">
            <div class="spec-cell">
              <span class="spec-label">Pages</span>
              <strong class="spec-val">${order.pageCount} pgs (${order.pageRange})</strong>
            </div>

            <div class="spec-cell">
              <span class="spec-label">Copies</span>
              <strong class="spec-val">${order.copies} copy</strong>
            </div>

            <div class="spec-cell">
              <span class="spec-label">Mode / Sides</span>
              <strong class="spec-val">${order.colorMode.toUpperCase()} • ${order.duplex ? 'Double-Sided' : 'Single-Sided'}</strong>
            </div>

            <div class="spec-cell">
              <span class="spec-label">Paper & Finishing</span>
              <strong class="spec-val">${order.paperFormat} (${order.paper.toUpperCase()}) • ${order.binding}</strong>
            </div>

            <div class="spec-cell price-cell">
              <span class="spec-label">Total Amount</span>
              <strong class="spec-val price">₹${order.totalAmount.toFixed(2)}</strong>
              <span class="payment-method-tag ${order.paymentStatus === 'PAID' ? 'paid' : 'due'}">
                ${order.paymentStatus === 'PAID' ? '✓ Paid (Razorpay UPI)' : 'Cash on Pickup'}
              </span>
            </div>
          </div>

          ${order.customerNotes ? `
            <div class="order-customer-notes">
              <span class="note-icon">💬</span>
              <span><strong>Note:</strong> "${order.customerNotes}"</span>
            </div>
          ` : ''}

          <!-- Live Progress if Printing -->
          ${order.status === 'PRINTING' ? `
            <div class="card-print-progress">
              <div class="progress-bar-track">
                <div class="progress-bar-fill" style="width: ${order.printProgress || 20}%"></div>
              </div>
              <div class="progress-meta-row">
                <span>⚙️ Background Worker Printing silently...</span>
                <span>${order.printProgress || 20}% completed</span>
              </div>
            </div>
          ` : ''}

          <!-- Privacy Auto-Delete Status Badge -->
          <div class="card-privacy-footer">
            ${order.fileErased ? `
              <span class="privacy-status-text purged">
                🔒 File permanently deleted from server (100% Privacy Enforced • Zero Data Retained)
              </span>
            ` : `
              <span class="privacy-status-text safe">
                🛡️ Zero Data Retention: File will be automatically erased upon print completion.
              </span>
            `}
          </div>
        </div>

        <!-- One-Click Action Buttons -->
        <div class="order-card-actions">
          ${order.status === 'PENDING' ? `
            <!-- Primary Action: One-Click Approve & Print (Image 2) -->
            <button type="button" class="btn-approve-print" data-action="approve" data-id="${order.id}">
              <span class="btn-icon">⚡</span>
              <span>One-Click Approve & Print</span>
            </button>

            <!-- Decline Action: Reject Order (Image 2) -->
            <button type="button" class="btn-reject-order" data-action="reject" data-id="${order.id}">
              <span class="btn-icon">✕</span>
              <span>Reject & Erase File</span>
            </button>
          ` : ''}

          ${order.status === 'APPROVED' ? `
            <button type="button" class="btn-approve-print" data-action="start-print" data-id="${order.id}">
              <span>Send to Auto Print Queue</span>
            </button>
          ` : ''}

          ${order.status === 'READY' ? `
            <button type="button" class="btn-complete-handover" data-action="complete" data-id="${order.id}">
              <span>✓ Mark Collected by Customer</span>
            </button>
          ` : ''}

          ${order.status === 'COMPLETED' ? `
            <div class="completed-check-tag">
              <span>✅ Order Completed & Delivered</span>
            </div>
          ` : ''}

          ${order.status === 'REJECTED' ? `
            <div class="rejected-tag">
              <span>❌ Order Declined • File Purged Immediately</span>
            </div>
          ` : ''}
        </div>

      </div>
    `;
  }

  // =========================================================================
  // SECTION 2: PRINTER MANAGEMENT (Image 1)
  // =========================================================================
  private renderPrinterManagementTab(state: SystemState): string {
    const bw = state.bwPrinter;
    const clr = state.colorPrinter;

    return `
      <div class="printer-management-section">

        <!-- Top Section Header matching Screenshot 1 -->
        <div class="section-title-strip">
          <div class="strip-header">
            <span class="strip-icon">🖨️</span>
            <h2 class="strip-title">Printer Management</h2>
          </div>
          <span class="strip-sub">Configure dedicated B&W and Colour routing, test hardware connections, and print counter QR posters</span>
        </div>

        <!-- 4 Dedicated Cards Strip directly from Screenshot 1 -->
        <div class="printer-cards-grid-4">

          <!-- CARD 1: Dedicated B&W Printer Setup -->
          <div class="printer-action-card">
            <div class="card-icon-header">
              <div class="p-icon-box bg-slate-soft">
                <span class="p-icon">⚫</span>
              </div>
              <div class="p-header-text">
                <h3 class="p-title">Dedicated B&W Printer Setup</h3>
                <p class="p-desc">Configure your black-and-white printer once. All B&W orders route to it automatically from then on.</p>
              </div>
            </div>

            <div class="printer-config-body">
              <div class="p-device-status-box">
                <div class="device-name-row">
                  <strong>${bw.name}</strong>
                  <span class="p-status-badge ${bw.status.toLowerCase()}">🟢 ${bw.status}</span>
                </div>
                <div class="device-sub-row">
                  <span>Model: <strong>${bw.model}</strong></span>
                  <span>IP: <code>${bw.ipAddress}</code></span>
                </div>
                <div class="device-meters-row">
                  <div class="meter-col">
                    <span class="meter-label">Paper Tray</span>
                    <strong class="meter-val">${bw.paperTrayCount} sheets</strong>
                  </div>
                  <div class="meter-col">
                    <span class="meter-label">Toner Level</span>
                    <strong class="meter-val color-emerald">${bw.inkLevelPct}% OK</strong>
                  </div>
                  <div class="meter-col">
                    <span class="meter-label">Total Jobs</span>
                    <strong class="meter-val">${bw.totalJobsPrinted}</strong>
                  </div>
                </div>
              </div>

              <!-- Quick Selection Dropdown -->
              <div class="form-group">
                <label class="form-label" for="selBwPrinterModel">Change B&W Hardware Model:</label>
                <select id="selBwPrinterModel" class="clean-select">
                  <option value="HP LaserJet Pro M404dn (Duplex)" ${bw.model.includes('HP LaserJet') ? 'selected' : ''}>HP LaserJet Pro M404dn (High-Speed Duplex)</option>
                  <option value="Brother HL-L2321D Laser Printer" ${bw.model.includes('Brother') ? 'selected' : ''}>Brother HL-L2321D Compact Laser</option>
                  <option value="Canon imageCLASS LBP2900B" ${bw.model.includes('LBP2900B') ? 'selected' : ''}>Canon imageCLASS LBP2900B Monochrome</option>
                  <option value="Epson EcoTank M200 Mono" ${bw.model.includes('M200') ? 'selected' : ''}>Epson EcoTank M200 All-in-One Mono</option>
                </select>
              </div>

              <div class="auto-route-toggle-box">
                <input type="checkbox" id="chkAutoRouteBW" ${bw.autoRoute ? 'checked' : ''}>
                <label for="chkAutoRouteBW">Auto-Route: Route all B&W customer orders directly to this printer without manual switching.</label>
              </div>

              <button type="button" class="btn-clean-primary" id="btnSaveBWConfig">
                <span>Save B&W Printer Setup</span>
              </button>
            </div>
          </div>

          <!-- CARD 2: Dedicated Colour Printer Setup -->
          <div class="printer-action-card">
            <div class="card-icon-header">
              <div class="p-icon-box bg-rainbow-soft">
                <span class="p-icon">🌈</span>
              </div>
              <div class="p-header-text">
                <h3 class="p-title">Dedicated Colour Printer Setup</h3>
                <p class="p-desc">Configure your colour printer separately — colour orders are routed to it without any manual switching.</p>
              </div>
            </div>

            <div class="printer-config-body">
              <div class="p-device-status-box">
                <div class="device-name-row">
                  <strong>${clr.name}</strong>
                  <span class="p-status-badge ${clr.status.toLowerCase()}">🟢 ${clr.status}</span>
                </div>
                <div class="device-sub-row">
                  <span>Model: <strong>${clr.model}</strong></span>
                  <span>IP: <code>${clr.ipAddress}</code></span>
                </div>
                <div class="device-meters-row">
                  <div class="meter-col">
                    <span class="meter-label">Paper Tray</span>
                    <strong class="meter-val">${clr.paperTrayCount} sheets</strong>
                  </div>
                  <div class="meter-col">
                    <span class="meter-label">4-Color Ink Tank</span>
                    <strong class="meter-val color-indigo">${clr.inkLevelPct}% (CMYK)</strong>
                  </div>
                  <div class="meter-col">
                    <span class="meter-label">Total Jobs</span>
                    <strong class="meter-val">${clr.totalJobsPrinted}</strong>
                  </div>
                </div>
              </div>

              <!-- Quick Selection Dropdown -->
              <div class="form-group">
                <label class="form-label" for="selClrPrinterModel">Change Colour Hardware Model:</label>
                <select id="selClrPrinterModel" class="clean-select">
                  <option value="Canon PIXMA G3010 / Epson EcoTank L3250" ${clr.model.includes('Canon PIXMA') ? 'selected' : ''}>Canon PIXMA G3010 / Epson EcoTank L3250</option>
                  <option value="HP Smart Tank 580 All-in-One Colour" ${clr.model.includes('HP Smart Tank') ? 'selected' : ''}>HP Smart Tank 580 High-Res Colour</option>
                  <option value="Brother DCP-T520W Colour Ink Tank" ${clr.model.includes('DCP-T520W') ? 'selected' : ''}>Brother DCP-T520W Wireless Colour</option>
                  <option value="Epson L8050 6-Color Photo Printer" ${clr.model.includes('L8050') ? 'selected' : ''}>Epson L8050 6-Colour Studio Photo Printer</option>
                </select>
              </div>

              <div class="auto-route-toggle-box">
                <input type="checkbox" id="chkAutoRouteClr" ${clr.autoRoute ? 'checked' : ''}>
                <label for="chkAutoRouteClr">Auto-Route: Route all colour and photo orders directly to this printer without manual switching.</label>
              </div>

              <button type="button" class="btn-clean-primary" id="btnSaveClrConfig">
                <span>Save Colour Printer Setup</span>
              </button>
            </div>
          </div>

          <!-- CARD 3: Test Print Button -->
          <div class="printer-action-card">
            <div class="card-icon-header">
              <div class="p-icon-box bg-emerald-soft">
                <span class="p-icon">🧪</span>
              </div>
              <div class="p-header-text">
                <h3 class="p-title">Test Print Button</h3>
                <p class="p-desc">Instantly confirm any printer is connected and working with a single test-print tap — no guesswork.</p>
              </div>
            </div>

            <div class="test-print-body">
              <p class="test-desc">Sends a calibrated diagnostic test page to verify network connection, paper alignment, and nozzle health.</p>

              <div class="test-btn-group">
                <button type="button" class="btn-test-action" id="btnTestBwPrinter">
                  <span class="t-icon">⚫</span>
                  <div>
                    <strong>Test B&W Printer</strong>
                    <span>${bw.model}</span>
                  </div>
                </button>

                <button type="button" class="btn-test-action" id="btnTestClrPrinter">
                  <span class="t-icon">🌈</span>
                  <div>
                    <strong>Test Colour Printer</strong>
                    <span>${clr.model}</span>
                  </div>
                </button>
              </div>

              <div class="test-hardware-status">
                <span>Hardware Latency: <strong>14ms</strong></span>
                <span>Spooler Queue: <strong>0 jobs pending</strong></span>
              </div>
            </div>
          </div>

          <!-- CARD 4: Print Your Shop QR -->
          <div class="printer-action-card">
            <div class="card-icon-header">
              <div class="p-icon-box bg-purple-soft">
                <span class="p-icon">🔲</span>
              </div>
              <div class="p-header-text">
                <h3 class="p-title">Print Your Shop QR</h3>
                <p class="p-desc">Print a full A4-size QR code poster for your shop counter or wall — customers scan it to start printing.</p>
              </div>
            </div>

            <div class="shop-qr-preview-box">
              <div class="qr-mini-poster">
                <span class="qr-poster-tag">CLICK2PRINT POSTER</span>
                <strong class="qr-poster-shop">${state.shop.shopName}</strong>
                <div class="qr-code-svg-wrap">
                  <svg width="110" height="110" viewBox="0 0 100 100" fill="none">
                    <rect width="100" height="100" fill="white" rx="6"/>
                    <rect x="6" y="6" width="28" height="28" fill="#1e1b4b"/>
                    <rect x="11" y="11" width="18" height="18" fill="white"/>
                    <rect x="15" y="15" width="10" height="10" fill="#1e1b4b"/>
                    <rect x="66" y="6" width="28" height="28" fill="#1e1b4b"/>
                    <rect x="71" y="11" width="18" height="18" fill="white"/>
                    <rect x="75" y="15" width="10" height="10" fill="#1e1b4b"/>
                    <rect x="6" y="66" width="28" height="28" fill="#1e1b4b"/>
                    <rect x="11" y="71" width="18" height="18" fill="white"/>
                    <rect x="15" y="75" width="10" height="10" fill="#1e1b4b"/>
                    <rect x="44" y="10" width="10" height="15" fill="#1e1b4b"/>
                    <rect x="44" y="32" width="12" height="22" fill="#1e1b4b"/>
                    <rect x="62" y="44" width="14" height="12" fill="#1e1b4b"/>
                    <rect x="44" y="64" width="12" height="24" fill="#1e1b4b"/>
                    <rect x="64" y="64" width="24" height="12" fill="#1e1b4b"/>
                    <rect x="76" y="76" width="14" height="14" fill="#1e1b4b"/>
                  </svg>
                </div>
                <span class="qr-mini-instructions">Scan to Print in < 60s</span>
              </div>

              <button type="button" class="btn-clean-primary full-width" id="btnPrintShopQrAction">
                <span class="btn-icon">🖨️</span>
                <span>Open Full A4 Shop QR Poster</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    `;
  }

  // =========================================================================
  // SECTION 3: USAGE & SETTINGS (Image 4)
  // =========================================================================
  private renderUsageAndSettingsTab(state: SystemState): string {
    const u = state.usage;
    const p = state.pricing;

    return `
      <div class="usage-settings-section">

        <!-- Top Section Header matching Screenshot 4 -->
        <div class="section-title-strip">
          <div class="strip-header">
            <span class="strip-icon">📊</span>
            <h2 class="strip-title">Usage & Settings</h2>
          </div>
          <span class="strip-sub">Monthly metrics, dropdown-based printer setup, auto-cleanup logs, payments, and per-page pricing</span>
        </div>

        <!-- 5 Dedicated Feature Cards directly from Screenshot 4 -->
        <div class="usage-cards-grid-5">

          <!-- CARD 1: Monthly Usage Tracking -->
          <div class="usage-card">
            <div class="card-icon-header">
              <div class="p-icon-box bg-blue-soft">
                <span class="p-icon">📈</span>
              </div>
              <div class="p-header-text">
                <h3 class="p-title">Monthly Usage Tracking</h3>
                <p class="p-desc">See the total number of pages printed this month — useful for cost tracking and business insights.</p>
              </div>
            </div>

            <div class="usage-stats-container">
              <div class="stats-metric-strip">
                <div class="metric-box">
                  <span class="metric-caption">Total Pages Printed</span>
                  <div class="metric-big-num">${u.totalPagesPrinted.toLocaleString()}</div>
                  <span class="metric-month">${u.monthName}</span>
                </div>

                <div class="metric-box">
                  <span class="metric-caption">Total Revenue Tracked</span>
                  <div class="metric-big-num color-emerald">₹${u.totalRevenue.toLocaleString()}</div>
                  <span class="metric-sub">${u.totalOrdersFulfilled} orders fulfilled</span>
                </div>
              </div>

              <!-- Page Breakdown Bar -->
              <div class="usage-progress-bar-wrap">
                <div class="bar-labels">
                  <span>B&W Pages: <strong>${u.bwPagesPrinted.toLocaleString()}</strong> (${Math.round((u.bwPagesPrinted / u.totalPagesPrinted) * 100)}%)</span>
                  <span>Colour Pages: <strong>${u.colorPagesPrinted.toLocaleString()}</strong> (${Math.round((u.colorPagesPrinted / u.totalPagesPrinted) * 100)}%)</span>
                </div>
                <div class="stacked-bar">
                  <div class="bar-segment bw" style="width: ${(u.bwPagesPrinted / u.totalPagesPrinted) * 100}%"></div>
                  <div class="bar-segment color" style="width: ${(u.colorPagesPrinted / u.totalPagesPrinted) * 100}%"></div>
                </div>
              </div>

              <div class="paper-savings-pill">
                <span>🌱 Duplex Printing Saved: <strong>${u.duplexSheetsSaved.toLocaleString()} paper sheets</strong> this month!</span>
              </div>
            </div>
          </div>

          <!-- CARD 2: Easy Printer Settings -->
          <div class="usage-card">
            <div class="card-icon-header">
              <div class="p-icon-box bg-blue-soft">
                <span class="p-icon">🔧</span>
              </div>
              <div class="p-header-text">
                <h3 class="p-title">Easy Printer Settings</h3>
                <p class="p-desc">Simple dropdown-based printer configuration — no technical knowledge required to set up or change printers.</p>
              </div>
            </div>

            <div class="printer-settings-container">
              <div class="form-group">
                <label class="form-label" for="cfgShopName">Shop Counter Name:</label>
                <input type="text" id="cfgShopName" class="clean-input" value="${state.shop.shopName}">
              </div>

              <div class="form-group">
                <label class="form-label" for="cfgShopAddress">Shop Physical Address:</label>
                <input type="text" id="cfgShopAddress" class="clean-input" value="${state.shop.address}">
              </div>

              <div class="toggles-list">
                <label class="toggle-row">
                  <input type="checkbox" id="cfgAutoApprove" ${state.shop.autoPrintOnApprove ? 'checked' : ''}>
                  <div>
                    <strong>Auto-Print on Approval</strong>
                    <span>Background worker immediately spools approved jobs to printer</span>
                  </div>
                </label>

                <label class="toggle-row">
                  <input type="checkbox" id="cfgAutoCleanup" ${state.shop.autoFileCleanup ? 'checked' : ''}>
                  <div>
                    <strong>Enforce 100% Privacy Auto-Cleanup</strong>
                    <span>Permanently wipe uploaded document from disk immediately after printing</span>
                  </div>
                </label>
              </div>

              <button type="button" class="btn-clean-primary" id="btnSaveShopConfig">
                <span>Save General Settings</span>
              </button>
            </div>
          </div>

          <!-- CARD 3: Auto File Cleanup -->
          <div class="usage-card">
            <div class="card-icon-header">
              <div class="p-icon-box bg-cyan-soft">
                <span class="p-icon">🗑️</span>
              </div>
              <div class="p-header-text">
                <h3 class="p-title">Auto File Cleanup</h3>
                <p class="p-desc">Uploaded files are deleted automatically after printing — 100% secure customer privacy, no data stored on the server.</p>
              </div>
            </div>

            <div class="auto-cleanup-container">
              <div class="privacy-status-box">
                <span class="shield-green">🛡️</span>
                <div>
                  <strong>Zero-Retention Privacy Engine: ACTIVE</strong>
                  <span>Customer documents are automatically destroyed post-print. No copies or caches retained.</span>
                </div>
              </div>

              <h5 class="purge-log-title">Recent Auto-Purge Audit Trail:</h5>
              <div class="purge-log-list">
                ${state.deletedFiles.length === 0 ? `
                  <div class="empty-purge">No files purged yet.</div>
                ` : state.deletedFiles.slice(0, 6).map(log => `
                  <div class="purge-log-item">
                    <span class="purge-item-icon">🗑️</span>
                    <div class="purge-item-meta">
                      <strong class="purge-name">${log.fileName}</strong>
                      <span class="purge-sub">Order #${log.orderNumber} • ${log.reason} • ${this.formatTimeAgo(log.deletedAt)}</span>
                    </div>
                    <span class="purged-badge">Permanently Erased</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- CARD 4: Razorpay Online Payments -->
          <div class="usage-card">
            <div class="card-icon-header">
              <div class="p-icon-box bg-blue-soft">
                <span class="p-icon">💳</span>
              </div>
              <div class="p-header-text">
                <h3 class="p-title">Razorpay Online Payments</h3>
                <p class="p-desc">Built-in Razorpay integration lets customers pay online and place their order instantly — available on both plans, no separate setup needed.</p>
              </div>
            </div>

            <div class="razorpay-settings-container">
              <div class="gateway-live-banner">
                <span class="live-dot-green"></span>
                <div>
                  <strong>Razorpay Gateway: CONNECTED & READY</strong>
                  <span>Supports UPI (GPay, PhonePe, Paytm, BHIM), Debit/Credit Cards & Netbanking</span>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="cfgRazorpayKey">Razorpay Key ID (Live / Sandbox):</label>
                <input type="text" id="cfgRazorpayKey" class="clean-input" value="${state.shop.razorpayKeyId}">
              </div>

              <div class="form-group">
                <label class="form-label" for="cfgRazorpaySecret">Razorpay Merchant Key Secret:</label>
                <input type="password" id="cfgRazorpaySecret" class="clean-input" value="${state.shop.razorpayKeySecret || ''}" placeholder="rzp_secret_...">
              </div>

              <div class="form-group">
                <label class="form-label" for="cfgRazorpayMode">Gateway Operating Mode:</label>
                <select id="cfgRazorpayMode" class="clean-select">
                  <option value="test" ${state.shop.razorpayMode === 'test' ? 'selected' : ''}>Test / Sandbox Mode (Simulated Payments)</option>
                  <option value="live" ${state.shop.razorpayMode === 'live' ? 'selected' : ''}>Live Production Merchant Mode</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="cfgUpiId">Counter Merchant UPI VPA:</label>
                <input type="text" id="cfgUpiId" class="clean-input" value="${state.shop.upiId}">
              </div>

              <div class="payment-features-list">
                <div class="p-feat-item">✓ Instant payment confirmation hook with auto-print trigger</div>
                <div class="p-feat-item">✓ Real-time QR code display for mobile customers</div>
                <div class="p-feat-item">✓ Automatic refund trigger if order is rejected</div>
              </div>

              <button type="button" class="btn-clean-primary" id="btnSavePayments">
                <span>Save Payment Integration & Merchant Key</span>
              </button>
            </div>
          </div>

          <!-- CARD 5: Custom Per-Page Pricing -->
          <div class="usage-card">
            <div class="card-icon-header">
              <div class="p-icon-box bg-amber-soft">
                <span class="p-icon">📋</span>
              </div>
              <div class="p-header-text">
                <h3 class="p-title">Custom Per-Page Pricing</h3>
                <p class="p-desc">Set your own price per page for B&W and colour prints separately, right from the software. Change rates anytime — fast, easy, and applies instantly to new orders.</p>
              </div>
            </div>

            <div class="pricing-settings-container">
              <div class="pricing-inputs-grid">
                
                <div class="form-group">
                  <label class="form-label" for="rateBwSingle">B&W Single-Sided (₹/pg):</label>
                  <div class="input-prefix-wrap">
                    <span class="currency-prefix">₹</span>
                    <input type="number" step="0.5" min="0.5" id="rateBwSingle" class="clean-input with-prefix" value="${p.bwSingle}">
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="rateBwDuplex">B&W Duplex Rate (₹/sheet):</label>
                  <div class="input-prefix-wrap">
                    <span class="currency-prefix">₹</span>
                    <input type="number" step="0.5" min="0.5" id="rateBwDuplex" class="clean-input with-prefix" value="${p.bwDuplex}">
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="rateColorSingle">Colour Single-Sided (₹/pg):</label>
                  <div class="input-prefix-wrap">
                    <span class="currency-prefix">₹</span>
                    <input type="number" step="1" min="1" id="rateColorSingle" class="clean-input with-prefix" value="${p.colorSingle}">
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="ratePaperGsm100">100 GSM Paper Upgrade (+₹):</label>
                  <div class="input-prefix-wrap">
                    <span class="currency-prefix">₹</span>
                    <input type="number" step="0.5" min="0" id="ratePaperGsm100" class="clean-input with-prefix" value="${p.paper.gsm100}">
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="rateBindingSpiral">Spiral Binding Rate (+₹):</label>
                  <div class="input-prefix-wrap">
                    <span class="currency-prefix">₹</span>
                    <input type="number" step="5" min="0" id="rateBindingSpiral" class="clean-input with-prefix" value="${p.binding.spiral}">
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="rateBindingStaple">Corner Staple Rate (+₹):</label>
                  <div class="input-prefix-wrap">
                    <span class="currency-prefix">₹</span>
                    <input type="number" step="1" min="0" id="rateBindingStaple" class="clean-input with-prefix" value="${p.binding.staple}">
                  </div>
                </div>

              </div>

              <button type="button" class="btn-clean-primary" id="btnSavePricingRates">
                <span>Save & Apply Pricing Instantly</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    `;
  }

  // =========================================================================
  // SECTION 4: HOW CLICK2PRINT WORKS (Image 3)
  // =========================================================================
  private renderHowItWorksTab(state: SystemState): string {
    return `
      <div class="how-it-works-section">
        
        <!-- Header from Screenshot 3 -->
        <div class="how-header-block">
          <h2 class="how-main-title">How Click2Print Works</h2>
          <p class="how-main-sub">From QR scan to printed document — fully automated in under 60 seconds.</p>
        </div>

        <!-- 4-Step Pipeline directly from Screenshot 3 -->
        <div class="how-steps-pipeline-4">

          <!-- Step 1 -->
          <div class="how-step-card">
            <div class="step-badge-circle">
              <span class="step-number-text">1</span>
            </div>
            <h3 class="how-step-title">Customer Scans QR Code</h3>
            <p class="how-step-desc">
              Scanning the shop's QR code opens the upload page instantly in the customer's browser — no app download or login required.
            </p>
          </div>

          <!-- Step 2 -->
          <div class="how-step-card">
            <div class="step-badge-circle">
              <span class="step-number-text">2</span>
            </div>
            <h3 class="how-step-title">Uploads Document & Selects Options</h3>
            <p class="how-step-desc">
              Customer picks copies, B&W or colour, and page range, then submits. The smart interface auto-detects document or image mode instantly.
            </p>
          </div>

          <!-- Step 3 -->
          <div class="how-step-card">
            <div class="step-badge-circle">
              <span class="step-number-text">3</span>
            </div>
            <h3 class="how-step-title">Shop Owner Approves on Dashboard</h3>
            <p class="how-step-desc">
              The order appears live on the owner's desktop dashboard. One click to Approve — or Reject — with all order details visible at a glance.
            </p>
          </div>

          <!-- Step 4 -->
          <div class="how-step-card">
            <div class="step-badge-circle">
              <span class="step-number-text">4</span>
            </div>
            <h3 class="how-step-title">Auto-Print & Auto-Delete</h3>
            <p class="how-step-desc">
              The file prints automatically and is permanently deleted from the server the moment it's done — 100% private, zero data retained.
            </p>
          </div>

        </div>

        <!-- Interactive Simulation Box -->
        <div class="simulation-showcase-box">
          <div class="showcase-content">
            <h3>Experience the Full 60-Second Flow</h3>
            <p>Click below to simulate an incoming customer order, observe hardware auto-routing, 1-click approval, silent background printing, and the privacy auto-delete log.</p>
          </div>
          <button type="button" class="btn-primary-action" id="btnRunFullSimulation">
            <span>⚡ Run 30-Second End-to-End Simulation</span>
          </button>
        </div>

      </div>
    `;
  }

  // =========================================================================
  // EVENT BINDINGS
  // =========================================================================
  private bindEvents(state: SystemState): void {
    // Navigation Tabs
    this.container.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = (btn as HTMLElement).dataset.tab as AdminTab;
        store.setAdminTab(tab);
      });
    });

    // Orders Filter Buttons
    this.container.querySelectorAll('.order-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeFilter = (btn as HTMLElement).dataset.filter as typeof this.activeFilter;
        sound.click();
        this.render(store.getState());
      });
    });

    // One-Click Action Buttons
    this.container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = (btn as HTMLElement).dataset.action;
        const id = (btn as HTMLElement).dataset.id;
        if (!id) return;

        if (action === 'approve') {
          store.approveAndPrint(id);
        } else if (action === 'reject') {
          if (confirm(`Reject order ${id} and permanently delete customer file?`)) {
            store.rejectOrder(id, 'Declined by shop operator');
          }
        } else if (action === 'start-print') {
          store.startBackgroundPrinting(id);
        } else if (action === 'complete') {
          store.markOrderCompleted(id);
        }
      });
    });

    // Simulate New Order
    const btnSimulateOrder = this.container.querySelector('#btnSimulateOrder');
    btnSimulateOrder?.addEventListener('click', () => {
      this.simulateCustomerOrder();
    });

    // Hardware Test Print Buttons (Image 1)
    const btnTestBw = this.container.querySelector('#btnTestBwPrinter');
    btnTestBw?.addEventListener('click', () => {
      const res = store.triggerTestPrint('BW');
      window.dispatchEvent(new CustomEvent('open-test-print-modal', { detail: res }));
    });

    const btnTestClr = this.container.querySelector('#btnTestClrPrinter');
    btnTestClr?.addEventListener('click', () => {
      const res = store.triggerTestPrint('COLOUR');
      window.dispatchEvent(new CustomEvent('open-test-print-modal', { detail: res }));
    });

    // Save B&W config
    const btnSaveBW = this.container.querySelector('#btnSaveBWConfig');
    btnSaveBW?.addEventListener('click', () => {
      const sel = this.container.querySelector('#selBwPrinterModel') as HTMLSelectElement;
      const chk = this.container.querySelector('#chkAutoRouteBW') as HTMLInputElement;
      store.updatePrinterConfig('BW', {
        model: sel.value,
        autoRoute: chk.checked
      });
      alert('Dedicated B&W Printer configuration saved successfully!');
    });

    // Save Colour config
    const btnSaveClr = this.container.querySelector('#btnSaveClrConfig');
    btnSaveClr?.addEventListener('click', () => {
      const sel = this.container.querySelector('#selClrPrinterModel') as HTMLSelectElement;
      const chk = this.container.querySelector('#chkAutoRouteClr') as HTMLInputElement;
      store.updatePrinterConfig('COLOUR', {
        model: sel.value,
        autoRoute: chk.checked
      });
      alert('Dedicated Colour Printer configuration saved successfully!');
    });

    // Print Shop QR Poster (Image 1)
    const btnPrintQR = this.container.querySelector('#btnPrintShopQrAction');
    btnPrintQR?.addEventListener('click', () => {
      sound.click();
      window.dispatchEvent(new CustomEvent('open-shop-qr-modal'));
    });

    // Save Pricing Rates (Image 4)
    const btnSavePricing = this.container.querySelector('#btnSavePricingRates');
    btnSavePricing?.addEventListener('click', () => {
      const bwSingle = parseFloat((this.container.querySelector('#rateBwSingle') as HTMLInputElement)?.value) || 2.0;
      const bwDuplex = parseFloat((this.container.querySelector('#rateBwDuplex') as HTMLInputElement)?.value) || 3.0;
      const colorSingle = parseFloat((this.container.querySelector('#rateColorSingle') as HTMLInputElement)?.value) || 10.0;
      const gsm100 = parseFloat((this.container.querySelector('#ratePaperGsm100') as HTMLInputElement)?.value) || 1.0;
      const spiral = parseFloat((this.container.querySelector('#rateBindingSpiral') as HTMLInputElement)?.value) || 30.0;
      const staple = parseFloat((this.container.querySelector('#rateBindingStaple') as HTMLInputElement)?.value) || 5.0;

      const newRates: PricingRates = {
        ...state.pricing,
        bwSingle,
        bwDuplex,
        colorSingle,
        paper: {
          ...state.pricing.paper,
          gsm100
        },
        binding: {
          ...state.pricing.binding,
          spiral,
          staple
        }
      };

      store.updatePricing(newRates);
      alert('Custom per-page pricing saved! Applies instantly to all incoming customer orders.');
    });

    // Save Shop Config (Image 4)
    const btnSaveShop = this.container.querySelector('#btnSaveShopConfig');
    btnSaveShop?.addEventListener('click', () => {
      const shopName = (this.container.querySelector('#cfgShopName') as HTMLInputElement)?.value;
      const address = (this.container.querySelector('#cfgShopAddress') as HTMLInputElement)?.value;
      const autoPrint = (this.container.querySelector('#cfgAutoApprove') as HTMLInputElement)?.checked;
      const autoCleanup = (this.container.querySelector('#cfgAutoCleanup') as HTMLInputElement)?.checked;

      store.updateShopConfig({
        shopName,
        address,
        autoPrintOnApprove: autoPrint,
        autoFileCleanup: autoCleanup
      });
      alert('Shop settings updated!');
    });

    // Save Payments
    const btnSavePay = this.container.querySelector('#btnSavePayments');
    btnSavePay?.addEventListener('click', () => {
      const key = (this.container.querySelector('#cfgRazorpayKey') as HTMLInputElement)?.value;
      const secret = (this.container.querySelector('#cfgRazorpaySecret') as HTMLInputElement)?.value;
      const mode = (this.container.querySelector('#cfgRazorpayMode') as HTMLSelectElement)?.value as 'live' | 'test';
      const upi = (this.container.querySelector('#cfgUpiId') as HTMLInputElement)?.value;

      store.updateRazorpayConfig(key, secret, mode);
      store.updateShopConfig({ upiId: upi });
      alert('Razorpay payments & merchant credentials configuration saved successfully!');
    });

    // Run Full Simulation (Image 3)
    const btnRunSim = this.container.querySelector('#btnRunFullSimulation');
    btnRunSim?.addEventListener('click', () => {
      this.runFullSimulation();
    });
  }

  private simulateCustomerOrder(): void {
    const names = ['Meera Nair', 'Siddharth Roy', 'Harish Babu', 'Kavitha S.', 'Tanvi Gupta'];
    const docs = [
      { name: 'Semester_Project_Presentation.docx', type: 'docx' as const, pages: 18, mode: 'color' as const },
      { name: 'Internship_Certificate.pdf', type: 'pdf' as const, pages: 1, mode: 'color' as const },
      { name: 'Assignment_Unit_4.docx', type: 'docx' as const, pages: 12, mode: 'mono' as const },
      { name: 'Research_Paper_Draft.pdf', type: 'pdf' as const, pages: 24, mode: 'mono' as const }
    ];

    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomDoc = docs[Math.floor(Math.random() * docs.length)];

    store.createOrder({
      fileName: randomDoc.name,
      fileType: randomDoc.type,
      isDocxConverted: randomDoc.type === 'docx',
      fileSizeKb: Math.floor(Math.random() * 4000) + 800,
      pageCount: randomDoc.pages,
      rangeMode: 'all',
      fromPage: 1,
      toPage: randomDoc.pages,
      pageRange: `All Pages (1-${randomDoc.pages})`,
      bwPages: randomDoc.mode === 'mono' ? randomDoc.pages : 0,
      colorPages: randomDoc.mode === 'color' ? randomDoc.pages : 0,
      colorMode: randomDoc.mode,
      duplex: true,
      copies: 1,
      paper: 'gsm75',
      paperFormat: 'A4',
      binding: 'none',
      customerNotes: 'Simulated customer walk-in submission',
      customer: {
        name: randomName,
        phone: `+91 9840${Math.floor(Math.random() * 89999 + 10000)}`
      },
      paymentMethod: 'RAZORPAY_UPI'
    });
  }

  private runFullSimulation(): void {
    sound.success();
    // Step 1 & 2: Simulate customer scanning and submitting order
    const order = store.createOrder({
      fileName: 'Campus_Thesis_Submission_Final.docx',
      fileType: 'docx',
      isDocxConverted: true,
      fileSizeKb: 5400,
      pageCount: 22,
      rangeMode: 'all',
      fromPage: 1,
      toPage: 22,
      pageRange: 'All Pages (1-22)',
      bwPages: 22,
      colorPages: 0,
      colorMode: 'mono',
      duplex: true,
      copies: 1,
      paper: 'gsm75',
      paperFormat: 'A4',
      binding: 'staple',
      customerNotes: 'Automated 30-second live demonstration order',
      customer: {
        name: 'Arjun Das',
        phone: '+91 98401 55667'
      },
      paymentMethod: 'RAZORPAY_UPI'
    });

    // Switch to orders tab
    store.setAdminTab('orders');

    // Step 3: Automatically trigger One-Click Approve & Print after 2 seconds
    setTimeout(() => {
      store.approveAndPrint(order.id);
    }, 2000);
  }

  private getFilteredOrders(state: SystemState): PrintOrder[] {
    switch (this.activeFilter) {
      case 'pending':
        return state.orders.filter(o => o.status === 'PENDING');
      case 'printing':
        return state.orders.filter(o => o.status === 'PRINTING');
      case 'ready':
        return state.orders.filter(o => o.status === 'READY');
      case 'completed':
        return state.orders.filter(o => o.status === 'COMPLETED');
      case 'rejected':
        return state.orders.filter(o => o.status === 'REJECTED');
      default:
        return [...state.orders];
    }
  }

  private formatTimeAgo(ts: number): string {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  }

  private update(state: SystemState): void {
    this.render(state);
  }
}
