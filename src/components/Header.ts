/**
 * Click2Print UI Component: Header & Navigation Bar
 */

import { store } from '../core/store.js';
import { sound } from '../core/audio.js';
import { SystemState } from '../types/index.js';

export class HeaderComponent {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render(store.getState());
    store.subscribe((state) => this.update(state));
  }

  private render(state: SystemState): void {
    const isMuted = sound.isMuted();
    const pendingCount = state.orders.filter(o => o.status === 'PENDING').length;

    this.container.innerHTML = `
      <div class="header-container">
        <!-- Brand Logo -->
        <div class="brand-wrapper" id="btnBrandHome" title="Click2Print">
          <div class="brand-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8" rx="1"></rect>
            </svg>
            <span class="brand-pulse-beacon"></span>
          </div>
          <div class="brand-identity">
            <div class="brand-name-row">
              <span class="brand-title">Click<span class="brand-accent">2</span>Print</span>
              <span class="hub-pill">SAAS</span>
            </div>
            <div class="brand-subtitle">
              <span class="live-dot"></span>
              <span>Smart Print Order Management</span>
            </div>
          </div>
        </div>

        <!-- Role Navigator -->
        <nav class="role-nav-bar" id="roleNavBar">
          <button class="nav-tab-btn ${state.activeRole === 'customer' ? 'active' : ''}" data-role="customer">
            <span class="tab-icon">📄</span>
            <span class="tab-text">Place Order</span>
          </button>
          <button class="nav-tab-btn ${state.activeRole === 'owner' ? 'active' : ''}" data-role="owner">
            <span class="tab-icon">🏪</span>
            <span class="tab-text">Shop Dashboard</span>
            <span class="tab-badge queue-badge ${pendingCount > 0 ? 'visible' : ''}" id="navPendingBadge">${pendingCount}</span>
          </button>
        </nav>

        <!-- Utilities -->
        <div class="header-actions">
          <button class="utility-icon-btn" id="btnSoundToggle" title="Toggle Audio">
            <span id="soundIcon">${isMuted ? '🔇' : '🔊'}</span>
          </button>
          <button class="utility-icon-btn" id="btnResetDemo" title="Reset Demo Data">
            <span>🔄</span>
          </button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    // Role switcher
    this.container.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = (e.currentTarget as HTMLElement).dataset.role as SystemState['activeRole'];
        if (target) {
          store.setActiveRole(target);
        }
      });
    });

    // Brand logo home
    const brandHome = this.container.querySelector('#btnBrandHome');
    if (brandHome) {
      brandHome.addEventListener('click', () => {
        store.setActiveRole('customer');
      });
    }

    // Sound toggle
    const soundBtn = this.container.querySelector('#btnSoundToggle');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const muted = sound.toggleMute();
        const icon = this.container.querySelector('#soundIcon');
        if (icon) icon.textContent = muted ? '🔇' : '🔊';
        if (!muted) sound.click();
      });
    }

    // Reset demo
    const resetBtn = this.container.querySelector('#btnResetDemo');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset Click2Print to default demo data?')) {
          store.resetData();
        }
      });
    }
  }

  public update(state: SystemState): void {
    // Update active tab highlighting
    this.container.querySelectorAll('.nav-tab-btn').forEach(btn => {
      const role = (btn as HTMLElement).dataset.role;
      if (role === state.activeRole) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update pending badge
    const pendingBadge = this.container.querySelector('#navPendingBadge');
    if (pendingBadge) {
      const pendingCount = state.orders.filter(o => o.status === 'PENDING').length;
      pendingBadge.textContent = String(pendingCount);
      pendingBadge.classList.toggle('visible', pendingCount > 0);
    }
  }
}
