// Xerox Vendor Operations Console & 50-Slot Rack Logistics Controller
class VendorConsole {
  constructor() {
    this.selectedOrderForStaging = null;
    this.initElements();
    this.render();
    
    // Subscribe to store updates
    window.smartStore.subscribe(() => {
      this.render();
    });
  }

  initElements() {
    this.fifoContainer = document.getElementById('vendorFifoQueueList');
    this.rackGridContainer = document.getElementById('physicalRackGrid');
    
    // KPI elements
    this.kpiQueueCount = document.getElementById('kpiQueueCount');
    this.kpiSlotsOccupied = document.getElementById('kpiSlotsOccupied');
    this.kpiDailyGross = document.getElementById('kpiDailyGross');
    this.kpiPlatformEscrow = document.getElementById('kpiPlatformEscrow');
    this.kpiNetVendorPayout = document.getElementById('kpiNetVendorPayout');

    // Manifest modal
    this.manifestModal = document.getElementById('manifestModal');
    this.manifestBody = document.getElementById('manifestModalBody');

    // Slot details modal
    this.slotModal = document.getElementById('slotDetailsModal');
    this.slotModalBody = document.getElementById('slotModalBody');
  }

  render() {
    const state = window.smartStore.state;
    this.renderKPIs(state);
    this.renderFifoQueue(state);
    this.renderRackMatrix(state);
  }

  renderKPIs(state) {
    const activeQueue = state.orders.filter(o => o.status === 'QUEUED' || o.status === 'PRINTING');
    const occupiedSlots = Object.values(state.rackSlots).filter(s => s.status === 'OCCUPIED');

    let totalGross = 0;
    let totalPlatform = 0;
    let totalVendor = 0;

    state.orders.forEach(o => {
      totalGross += o.totalAmount;
      totalPlatform += o.platformFee;
      totalVendor += o.vendorShare;
    });

    if (this.kpiQueueCount) this.kpiQueueCount.textContent = activeQueue.length;
    if (this.kpiSlotsOccupied) this.kpiSlotsOccupied.textContent = `${occupiedSlots.length} / 50`;
    if (this.kpiDailyGross) this.kpiDailyGross.textContent = `₹${totalGross.toFixed(2)}`;
    if (this.kpiPlatformEscrow) this.kpiPlatformEscrow.textContent = `₹${totalPlatform.toFixed(2)}`;
    if (this.kpiNetVendorPayout) this.kpiNetVendorPayout.textContent = `₹${totalVendor.toFixed(2)}`;
  }

  renderFifoQueue(state) {
    if (!this.fifoContainer) return;
    this.fifoContainer.innerHTML = '';

    const activeOrders = state.orders.filter(o => o.status === 'QUEUED' || o.status === 'PRINTING');

    if (activeOrders.length === 0) {
      this.fifoContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎉</div>
          <h4>FIFO Queue is Empty</h4>
          <p style="font-size: 0.8rem;">All student jobs have been printed and staged in racks!</p>
        </div>
      `;
      return;
    }

    activeOrders.forEach(order => {
      const card = document.createElement('div');
      card.className = `fifo-card ${order.priority ? 'priority-order' : ''} ${order.status === 'PRINTING' ? 'status-printing' : ''}`;
      
      const timeAgo = Math.round((Date.now() - order.createdAt) / 60000);
      const isPrinting = order.status === 'PRINTING';

      card.innerHTML = `
        <div class="fifo-card-header">
          <div>
            <span class="fifo-token-id">${order.token}</span>
            <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: 0.4rem;">${order.student.name} (${order.student.rollNo})</span>
          </div>
          <span class="fifo-status-tag ${isPrinting ? 'tag-printing' : 'tag-queued'}">
            ${isPrinting ? '⚡ PRINTING' : 'QUEUED'}
          </span>
        </div>

        <div style="font-size: 0.85rem; font-weight: 600; color: #f8fafc; margin-bottom: 0.35rem; display: flex; align-items: center; justify-content: space-between;">
          <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 280px;" title="${order.fileName}">
            📄 ${order.fileName}
          </span>
          <span style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--cyan);">₹${order.totalAmount.toFixed(2)}</span>
        </div>

        <div class="fifo-specs-pills">
          <span class="spec-badge spec-highlight">${order.pageCount} Pages (${order.pageRange})</span>
          <span class="spec-badge ${order.duplex ? 'spec-highlight' : ''}">${order.duplex ? 'Duplex (Back-to-Back)' : 'Simplex (Single-Sided)'}</span>
          <span class="spec-badge">${order.colorMode === 'mono' ? 'B&W Only' : (order.colorMode === 'smart' ? `Smart Color (${order.colorPages} col)` : 'Full Color')}</span>
          <span class="spec-badge">${order.binding !== 'none' ? `Binding: ${order.binding.toUpperCase()}` : 'No Binding'}</span>
          ${order.priority ? '<span class="spec-badge" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border-color: rgba(245, 158, 11, 0.4);">⚡ RUSH PRIORITY</span>' : ''}
          ${order.confidential ? '<span class="spec-badge" style="background: rgba(239, 68, 68, 0.2); color: #f87171; border-color: rgba(239, 68, 68, 0.4);">🔒 CONFIDENTIAL EXAM</span>' : ''}
        </div>

        <div style="font-size: 0.72rem; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center;">
          <span>Received: ${timeAgo <= 1 ? 'Just now' : `${timeAgo}m ago`}</span>
          <span>OTP: <strong style="color: var(--text-primary); font-family: var(--font-mono);">${order.pickupOtp}</strong></span>
        </div>

        <div class="fifo-card-actions">
          ${!isPrinting ? `
            <button class="btn-vendor-action" data-action="start-print" data-id="${order.id}">
              ▶ Start Print
            </button>
          ` : `
            <button class="btn-vendor-action btn-stage-rack" data-action="stage-rack" data-id="${order.id}">
              📦 Stage in Rack
            </button>
          `}
          <button class="btn-vendor-action" data-action="print-manifest" data-id="${order.id}">
            📄 Manifest Slip
          </button>
        </div>
      `;

      // Bind card actions
      card.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = btn.dataset.action;
          const id = btn.dataset.id;
          this.handleOrderAction(action, id);
        });
      });

      this.fifoContainer.appendChild(card);
    });
  }

  renderRackMatrix(state) {
    if (!this.rackGridContainer) return;
    this.rackGridContainer.innerHTML = '';

    const rows = ['A', 'B', 'C', 'D', 'E'];

    rows.forEach(r => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'rack-shelf-row';

      // Row label header
      const label = document.createElement('div');
      label.className = 'rack-row-label';
      label.textContent = r;
      rowDiv.appendChild(label);

      // 10 columns per shelf
      for (let c = 1; c <= 10; c++) {
        const code = `${r}-${c < 10 ? '0' + c : c}`;
        const slot = state.rackSlots[code];
        const cell = document.createElement('div');
        
        const isOccupied = slot.status === 'OCCUPIED';
        cell.className = `rack-cell ${isOccupied ? 'slot-staged' : 'slot-empty'}`;
        cell.dataset.slot = code;

        let slotContent = `
          <div class="slot-code-txt">${code}</div>
          <div class="slot-token-txt" style="color: var(--text-muted); font-size: 0.65rem;">EMPTY</div>
          <div class="slot-timer-txt">--</div>
        `;

        if (isOccupied && slot.orderId) {
          const order = state.orders.find(o => o.id === slot.orderId);
          const elapsedMins = Math.round((Date.now() - (slot.stagedTime || Date.now())) / 60000);
          
          slotContent = `
            <div class="slot-code-txt">${code}</div>
            <div class="slot-token-txt" title="${order ? order.student.name : ''}">${order ? order.token : slot.orderId}</div>
            <div class="slot-timer-txt">${elapsedMins}m ago</div>
          `;

          // If waiting > 60m mark as overdue warning
          if (elapsedMins > 60) {
            cell.classList.remove('slot-staged');
            cell.classList.add('slot-overdue');
          }
        }

        cell.innerHTML = slotContent;

        // Click on shelf slot
        cell.addEventListener('click', () => {
          this.handleSlotClick(code, slot);
        });

        rowDiv.appendChild(cell);
      }

      this.rackGridContainer.appendChild(rowDiv);
    });
  }

  handleOrderAction(action, orderId) {
    window.soundFx.click();
    const order = window.smartStore.state.orders.find(o => o.id === orderId);
    if (!order) return;

    if (action === 'start-print') {
      window.soundFx.printStart();
      window.smartStore.updateOrderStatus(orderId, 'PRINTING');
      window.showToast(`Printing initiated for Order ${order.token} on production copier.`, 'success');
      
      // Update student portal if active
      if (window.studentApp && window.smartStore.state.activeStudentOrder && window.smartStore.state.activeStudentOrder.id === orderId) {
        window.studentApp.renderActiveOrderCard(order);
      }
    } else if (action === 'stage-rack') {
      // Find recommended slot
      const targetSlot = window.smartStore.findRecommendedSlot();
      if (!targetSlot) {
        window.showToast('All 50 rack slots are currently occupied! Please clear delivered orders.', 'alert');
        window.soundFx.error();
        return;
      }

      window.smartStore.assignRackSlot(orderId, targetSlot);
      window.soundFx.rackStaged();
      window.showToast(`Order ${order.token} staged in Shelf [${targetSlot}]! Automated SMS/WhatsApp alert sent to ${order.student.name}.`, 'success');

      // Update student active pass if matches
      if (window.studentApp && window.smartStore.state.activeStudentOrder && window.smartStore.state.activeStudentOrder.id === orderId) {
        window.studentApp.renderActiveOrderCard(order);
      }

      // Visual spotlight on target slot
      setTimeout(() => {
        const slotEl = document.querySelector(`[data-slot="${targetSlot}"]`);
        if (slotEl) {
          slotEl.classList.add('slot-highlight-target');
          setTimeout(() => slotEl.classList.remove('slot-highlight-target'), 2500);
        }
      }, 100);

    } else if (action === 'print-manifest') {
      this.openManifestModal(order);
    }
  }

  handleSlotClick(slotCode, slot) {
    window.soundFx.click();
    if (slot.status === 'EMPTY') {
      // If a job is currently printing, allow vendor to stage it into this slot directly
      const printingOrder = window.smartStore.state.orders.find(o => o.status === 'PRINTING');
      if (printingOrder) {
        window.smartStore.assignRackSlot(printingOrder.id, slotCode);
        window.soundFx.rackStaged();
        window.showToast(`Order ${printingOrder.token} manually assigned to Shelf [${slotCode}]!`, 'success');
      } else {
        window.showToast(`Shelf Slot [${slotCode}] is Empty and ready for staging.`, 'info');
      }
      return;
    }

    // Inspect occupied slot
    const order = window.smartStore.state.orders.find(o => o.id === slot.orderId);
    if (!order) return;

    this.openSlotModal(slotCode, order, slot);
  }

  openManifestModal(order) {
    if (!this.manifestModal) return;
    this.manifestBody.innerHTML = `
      <div style="background: white; color: #0f172a; padding: 1.5rem; border-radius: 8px; font-family: monospace;">
        <div style="border-bottom: 2px dashed #0f172a; padding-bottom: 0.8rem; margin-bottom: 0.8rem; text-align: center;">
          <h2 style="font-size: 1.4rem; font-weight: 800; margin: 0;">SMARTPRINT JOB MANIFEST</h2>
          <p style="font-size: 0.8rem; margin: 0;">Main Campus Xerox & Print Hub</p>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <span>ORDER ID: <strong>${order.token}</strong></span>
          <span>DATE: <strong>${new Date(order.createdAt).toLocaleTimeString()}</strong></span>
        </div>
        <div style="margin-bottom: 0.5rem;">
          STUDENT: <strong>${order.student.name}</strong> (${order.student.rollNo})
        </div>
        <div style="margin-bottom: 0.8rem;">
          CONTACT: ${order.student.phone}
        </div>

        <div style="border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; padding: 0.6rem 0; margin-bottom: 0.8rem;">
          <div>DOCUMENT: <strong>${order.fileName}</strong></div>
          <div>PAGES: <strong>${order.pageCount} pgs (${order.pageRange})</strong></div>
          <div>LAYOUT: <strong>${order.duplex ? 'DUPLEX (BACK-TO-BACK)' : 'SIMPLEX'}</strong></div>
          <div>COLOR: <strong>${order.colorMode.toUpperCase()} (${order.colorPages} color pgs)</strong></div>
          <div>FINISHING: <strong>${order.binding.toUpperCase()}</strong></div>
          <div>PAPER: <strong>${order.paper.toUpperCase()}</strong></div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
          <div>
            <div style="font-size: 0.75rem;">PICKUP VERIFICATION OTP:</div>
            <div style="font-size: 1.5rem; font-weight: 900; letter-spacing: 2px;">${order.pickupOtp}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.75rem;">TOTAL PAID:</div>
            <div style="font-size: 1.3rem; font-weight: 800;">₹${order.totalAmount.toFixed(2)}</div>
          </div>
        </div>

        <div style="text-align: center; margin-top: 1.2rem; font-size: 0.75rem; color: #475569;">
          ||| | ||||| || |||||| |||| | ||||| |||| |
          <div>${order.id}-AUTHENTICATED</div>
        </div>
      </div>

      <div style="display: flex; gap: 0.75rem; margin-top: 1.25rem;">
        <button class="btn-primary-cta" onclick="window.print()" style="margin: 0; flex: 1;">
          🖨️ Print Slip (58mm / A5)
        </button>
        <button class="icon-btn" onclick="document.getElementById('manifestModal').classList.remove('open')" style="width: auto; padding: 0 1rem;">
          Close
        </button>
      </div>
    `;

    this.manifestModal.classList.add('open');
  }

  openSlotModal(slotCode, order, slot) {
    if (!this.slotModal) return;
    const elapsedMins = Math.round((Date.now() - (slot.stagedTime || Date.now())) / 60000);

    this.slotModalBody.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div>
          <span style="font-family: var(--font-mono); font-size: 1.5rem; font-weight: 800; color: var(--emerald);">SLOT ${slotCode}</span>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Occupied for ${elapsedMins} mins</div>
        </div>
        <span class="fifo-status-tag tag-staged">STAGED</span>
      </div>

      <div style="background: var(--bg-surface); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-subtle); margin-bottom: 1.25rem;">
        <div style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.25rem;">${order.student.name} (${order.student.rollNo})</div>
        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.5rem;">📄 ${order.fileName}</div>
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-family: var(--font-mono);">
          <span>OTP: <strong style="color: var(--cyan);">${order.pickupOtp}</strong></span>
          <span>Order: <strong>${order.token}</strong></span>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.6rem;">
        <button class="btn-primary-cta" id="btnDeliverFromSlot" style="margin: 0;">
          ✅ Handover Document & Free Slot
        </button>
        <button class="btn-vendor-action" id="btnResendAlert">
          📲 Resend WhatsApp / SMS Pickup Alert
        </button>
      </div>
    `;

    document.getElementById('btnDeliverFromSlot').onclick = () => {
      window.smartStore.updateOrderStatus(order.id, 'COLLECTED');
      window.soundFx.success();
      window.showToast(`Handover confirmed! Shelf [${slotCode}] is now free for next orders.`, 'success');
      this.slotModal.classList.remove('open');
    };

    document.getElementById('btnResendAlert').onclick = () => {
      window.showToast(`WhatsApp reminder dispatched to ${order.student.phone}: "Order ${order.token} is in RACK ${slotCode}"`, 'info');
      this.slotModal.classList.remove('open');
    };

    this.slotModal.classList.add('open');
  }
}

window.initVendorConsole = () => {
  window.vendorConsole = new VendorConsole();
};
