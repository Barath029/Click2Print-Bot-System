/**
 * Click2Print Header Component
 * Clean top navigation bar with role switching, shop status, and quick QR poster trigger.
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
    const isCustomer = state.activeRole === 'customer';
    const isMuted = sound.isMuted();

    this.container.innerHTML = `
      <div class="c2p-header-inner">
        <!-- Brand Identity -->
        <div class="header-brand">
          <div class="brand-logo-mark">
            <span class="printer-icon">🖨️</span>
          </div>
          <div class="brand-text">
            <div class="brand-title-row">
              <h1 class="brand-name">Click2Print</h1>
              <span class="brand-badge">PRO STATION</span>
            </div>
            <p class="brand-sub">${state.shop.shopName}</p>
          </div>
        </div>

        <!-- Role & View Switcher -->
        <nav class="header-nav-tabs" role="tablist">
          <button
            class="nav-tab-btn ${isCustomer ? 'active' : ''}"
            id="btnRoleCustomer"
            type="button"
            role="tab"
            aria-selected="${isCustomer}">
            <span class="tab-icon">📱</span>
            <span class="tab-label">Customer Portal</span>
            <span class="tab-sub">Scan & Print (<60s)</span>
          </button>

          <button
            class="nav-tab-btn ${!isCustomer ? 'active' : ''}"
            id="btnRoleAdmin"
            type="button"
            role="tab"
            aria-selected="${!isCustomer}">
            <span class="tab-icon">🖥️</span>
            <span class="tab-label">Shop Owner Dashboard</span>
            <span class="tab-sub">Live Orders & Setup</span>
            ${state.orders.filter(o => o.status === 'PENDING').length > 0 ? `
              <span class="tab-counter-pill">${state.orders.filter(o => o.status === 'PENDING').length}</span>
            ` : ''}
          </button>
        </nav>

        <!-- Right Quick Actions -->
        <div class="header-actions">
          <!-- Status Pill -->
          <div class="shop-live-pill" title="Hardware auto-routing active: B&W -> LaserJet, Colour -> PIXMA">
            <span class="live-dot pulse"></span>
            <span class="live-text">Shop Online</span>
          </div>

          ${state.isAdminAuthenticated ? `
            <div class="admin-session-badge" style="display: flex; align-items: center; gap: 8px; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 4px 10px; border-radius: 20px; font-size: 0.8125rem; font-weight: 600; color: #047857;">
              <span>🛡️ Admin (${state.adminUser || 'admin'})</span>
              <button id="btnAdminLogout" type="button" title="Sign Out of Admin" style="background: transparent; border: none; cursor: pointer; color: #065f46; font-weight: 700; font-size: 0.8125rem; padding: 0 4px;">Sign Out</button>
            </div>
          ` : ''}

          <!-- Print Shop QR Button -->
          <button class="btn-clean-secondary" id="btnHeaderShopQR" type="button" title="Print Shop QR Poster for Counter">
            <span class="btn-icon">🔲</span>
            <span class="btn-text">Shop QR Poster</span>
          </button>

          <!-- Audio Mute Toggle -->
          <button class="icon-toggle-btn" id="btnAudioToggle" type="button" title="${isMuted ? 'Unmute Audio' : 'Mute Audio'}">
            ${isMuted ? '🔇' : '🔔'}
          </button>

          <!-- Reset Demo Data -->
          <button class="icon-toggle-btn" id="btnResetData" type="button" title="Reset Demo Data">
            🔄
          </button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    const btnCustomer = this.container.querySelector('#btnRoleCustomer');
    const btnAdmin = this.container.querySelector('#btnRoleAdmin');
    const btnLogout = this.container.querySelector('#btnAdminLogout');
    const btnQR = this.container.querySelector('#btnHeaderShopQR');
    const btnAudio = this.container.querySelector('#btnAudioToggle');
    const btnReset = this.container.querySelector('#btnResetData');

    btnCustomer?.addEventListener('click', () => {
      store.setActiveRole('customer');
    });

    btnAdmin?.addEventListener('click', () => {
      store.setActiveRole('admin');
    });

    btnLogout?.addEventListener('click', () => {
      sound.click();
      store.logoutAdmin();
    });

    btnQR?.addEventListener('click', () => {
      sound.click();
      window.dispatchEvent(new CustomEvent('open-shop-qr-modal'));
    });

    btnAudio?.addEventListener('click', () => {
      sound.toggleMute();
      this.update(store.getState());
    });

    btnReset?.addEventListener('click', () => {
      if (confirm('Reset all demo orders and counters to initial state?')) {
        store.resetData();
      }
    });
  }

  private update(state: SystemState): void {
    this.render(state);
  }
}
