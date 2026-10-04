// Master Platform SuperAdmin & Escrow Split Ledger Controller
class AdminPlatform {
  constructor() {
    this.initElements();
    this.render();
    
    window.smartStore.subscribe(() => {
      this.render();
    });
  }

  initElements() {
    this.tableBody = document.getElementById('adminLedgerTableBody');
    this.totalPlatformGross = document.getElementById('adminTotalGross');
    this.totalEscrowEarnings = document.getElementById('adminTotalEscrow');
    this.totalVendorSettled = document.getElementById('adminTotalVendorSettled');
    this.activeCampusHubs = document.getElementById('adminActiveHubs');
    
    // Concurrency simulator button
    this.btnSimulateRush = document.getElementById('btnSimulateRushOrders');
    if (this.btnSimulateRush) {
      this.btnSimulateRush.addEventListener('click', () => {
        this.injectRushOrders();
      });
    }
  }

  render() {
    const state = window.smartStore.state;
    let gross = 0;
    let platformCommission = 0;
    let vendorNet = 0;

    state.orders.forEach(o => {
      gross += o.totalAmount;
      platformCommission += o.platformFee;
      vendorNet += o.vendorShare;
    });

    if (this.totalPlatformGross) this.totalPlatformGross.textContent = `₹${gross.toFixed(2)}`;
    if (this.totalEscrowEarnings) this.totalEscrowEarnings.textContent = `₹${platformCommission.toFixed(2)}`;
    if (this.totalVendorSettled) this.totalVendorSettled.textContent = `₹${vendorNet.toFixed(2)}`;
    if (this.activeCampusHubs) this.activeCampusHubs.textContent = `3 Outlets Online`;

    this.renderTable(state.orders);
  }

  renderTable(orders) {
    if (!this.tableBody) return;
    this.tableBody.innerHTML = '';

    // Show latest orders first
    const sorted = [...orders].reverse();

    sorted.forEach((order, idx) => {
      const tr = document.createElement('tr');
      const timeStr = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const isSettled = order.status === 'COLLECTED';

      tr.innerHTML = `
        <td style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted);">
          TXN-${99200 + idx}
        </td>
        <td style="font-family: var(--font-mono); font-weight: 700; color: var(--cyan);">
          ${order.token}
        </td>
        <td>
          <div style="font-weight: 600;">${order.student.name}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${order.student.rollNo}</div>
        </td>
        <td>
          <div style="font-size: 0.8rem;">${order.fileName}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${order.pageCount} pgs • ${order.binding}</div>
        </td>
        <td style="font-family: var(--font-mono); font-weight: 700;">
          ₹${order.totalAmount.toFixed(2)}
        </td>
        <td style="font-family: var(--font-mono); color: var(--primary-light); font-weight: 700;">
          ₹${order.platformFee.toFixed(2)}
        </td>
        <td style="font-family: var(--font-mono); color: var(--emerald); font-weight: 700;">
          ₹${order.vendorShare.toFixed(2)}
        </td>
        <td>
          <span style="font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 4px; ${isSettled ? 'background: rgba(16, 185, 129, 0.2); color: #34d399;' : 'background: rgba(245, 158, 11, 0.2); color: #fbbf24;'}">
            ${isSettled ? 'SETTLED (T+1)' : 'ESCROW HOLD'}
          </span>
        </td>
      `;
      this.tableBody.appendChild(tr);
    });
  }

  injectRushOrders() {
    window.soundFx.click();
    const students = [
      { name: 'Meera Krishnan', rollNo: '23CH019', doc: 'Fluid_Mechanics_Quiz_Prep.pdf', pages: 18, color: 2, binding: 'staple' },
      { name: 'Varun Somani', rollNo: '21EE092', doc: 'Power_Electronics_Hardware_Doc.pdf', pages: 42, color: 6, binding: 'spiral' },
      { name: 'Sanjana Patel', rollNo: '22CS144', doc: 'Operating_Systems_Kernel_Study.pdf', pages: 26, color: 0, binding: 'staple' }
    ];

    students.forEach((s, idx) => {
      setTimeout(() => {
        const pricing = window.smartStore.calculatePrice({
          bwPages: s.pages - s.color,
          colorPages: s.color,
          duplex: true,
          paper: 'gsm75',
          binding: s.binding,
          priority: true // Rush simulation
        });

        const newOrder = window.smartStore.createOrder({
          student: { name: s.name, rollNo: s.rollNo, phone: '+91 99000 12345' },
          fileName: s.doc,
          pageCount: s.pages,
          bwPages: s.pages - s.color,
          colorPages: s.color,
          colorMode: s.color > 0 ? 'smart' : 'mono',
          duplex: true,
          paper: 'gsm75',
          binding: s.binding,
          priority: true,
          confidential: false,
          pricing: pricing
        });

        window.soundFx.printStart();
        window.showToast(`Simulated Rush Order ${newOrder.token} placed by ${s.name}!`, 'alert');
      }, idx * 400);
    });
  }
}

window.initAdminPlatform = () => {
  window.adminPlatform = new AdminPlatform();
};
