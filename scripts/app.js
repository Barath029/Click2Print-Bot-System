// SmartPrint Application Master Orchestrator
document.addEventListener('DOMContentLoaded', () => {
  // Global Toast Dispatcher
  window.showToast = (message, type = 'info') => {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `smart-toast ${type === 'success' ? 'toast-success' : (type === 'alert' ? 'toast-alert' : '')}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'alert') icon = '⚡';

    toast.innerHTML = `
      <span style="font-size: 1.1rem;">${icon}</span>
      <div style="flex: 1; font-weight: 500;">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'all 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  };

  // Role Tab Switching
  const roleTabs = document.querySelectorAll('.role-tab-btn');
  const viewSections = {
    student: document.getElementById('studentSection'),
    vendor: document.getElementById('vendorSection'),
    kiosk: document.getElementById('kioskSection'),
    admin: document.getElementById('adminSection')
  };

  function switchTab(targetRole) {
    window.soundFx.click();
    roleTabs.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.role === targetRole);
    });

    Object.keys(viewSections).forEach(role => {
      if (viewSections[role]) {
        viewSections[role].classList.toggle('active', role === targetRole);
      }
    });

    // Refresh views if needed
    if (targetRole === 'kiosk' && window.pickupKiosk) {
      window.pickupKiosk.renderSampleOtps();
    }
    if (targetRole === 'vendor' && window.vendorConsole) {
      window.vendorConsole.render();
    }
  }

  roleTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.role);
    });
  });

  // Sound toggle button
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      const isMuted = window.soundFx.toggleMute();
      soundToggleBtn.textContent = isMuted ? '🔇' : '🔊';
      soundToggleBtn.title = isMuted ? 'Sound Muted' : 'Sound Enabled';
      window.showToast(isMuted ? 'Audio feedback muted.' : 'Audio feedback unmuted.', 'info');
    });
    // Initial icon state
    if (window.soundFx.muted) {
      soundToggleBtn.textContent = '🔇';
    }
  }

  // Rush order simulation button in header
  const headerRushBtn = document.getElementById('headerRushBtn');
  if (headerRushBtn) {
    headerRushBtn.addEventListener('click', () => {
      window.soundFx.click();
      if (window.adminPlatform) {
        window.adminPlatform.injectRushOrders();
      }
    });
  }

  // Reset demo data button
  const resetDemoBtn = document.getElementById('resetDemoBtn');
  if (resetDemoBtn) {
    resetDemoBtn.addEventListener('click', () => {
      if (confirm('Reset SmartPrint demo state back to default campus seed data?')) {
        window.smartStore.resetToDefaults();
        window.showToast('Demo data successfully reset to campus defaults.', 'success');
        location.reload();
      }
    });
  }

  // Initialize individual role controllers
  if (window.initStudentPortal) window.initStudentPortal();
  if (window.initVendorConsole) window.initVendorConsole();
  if (window.initPickupKiosk) window.initPickupKiosk();
  if (window.initAdminPlatform) window.initAdminPlatform();

  // If there is an active student order already in localStorage, restore its active card
  if (window.smartStore.state.activeStudentOrder && window.studentApp) {
    const matchingOrder = window.smartStore.state.orders.find(o => o.id === window.smartStore.state.activeStudentOrder.id);
    if (matchingOrder) {
      window.studentApp.renderActiveOrderCard(matchingOrder);
    }
  }

  console.log('SmartPrint App initialized successfully.');
});
