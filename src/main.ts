/**
 * Click2Print Application Orchestrator & Lifecycle Bootstrap
 * Pure TypeScript & Clean Architecture
 * Complete product flow:
 * 1. Customer Scans QR Code
 * 2. Uploads Document & Selects Options
 * 3. Shop Owner Approves on Dashboard
 * 4. Auto-Print & Auto-Delete
 */

import { store } from './core/store.js';
import { HeaderComponent } from './components/Header.js';
import { CustomerOrderComponent } from './components/CustomerOrder.js';
import { OwnerDashboardComponent } from './components/OwnerDashboard.js';
import { ModalsComponent } from './components/Modals.js';
import { SystemState } from './types/index.js';

class Click2PrintApp {
  private headerEl: HTMLElement;
  private customerViewEl: HTMLElement;
  private adminViewEl: HTMLElement;

  constructor() {
    this.headerEl = document.getElementById('appHeader')!;
    this.customerViewEl = document.getElementById('customerSection')!;
    this.adminViewEl = document.getElementById('adminSection')!;

    this.init();
  }

  private init(): void {
    console.log('🚀 Initializing Click2Print Cloud Automation System (TypeScript + Node.js)...');

    // Mount Header
    new HeaderComponent(this.headerEl);

    // Mount Customer & Admin views
    new CustomerOrderComponent(this.customerViewEl);
    new OwnerDashboardComponent(this.adminViewEl);

    // Mount Modals
    new ModalsComponent();

    // Setup global modal close buttons
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const overlay = (e.target as HTMLElement).closest('.modal-overlay');
        overlay?.classList.remove('active');
      });
    });

    // Close on clicking backdrop
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
        }
      });
    });

    // Synchronize view switching between Customer and Admin
    store.subscribe((state) => this.onStateChange(state));

    // Route detection on initial load (/admin vs /)
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/admin')) {
      store.setActiveRole('admin');
    } else {
      this.onStateChange(store.getState());
    }

    // Handle browser navigation (Back / Forward)
    window.addEventListener('popstate', () => {
      const path = window.location.pathname;
      if (path.startsWith('/admin')) {
        store.setActiveRole('admin');
      } else {
        store.setActiveRole('customer');
      }
    });

    console.log('✅ Click2Print Platform Mounted Successfully.');
  }

  private onStateChange(state: SystemState): void {
    const isCustomer = state.activeRole === 'customer';

    // Toggle active view sections
    this.customerViewEl.classList.toggle('active', isCustomer);
    this.adminViewEl.classList.toggle('active', !isCustomer);

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new Click2PrintApp();
});
